import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { tenderProjects, tenderDocuments, TENDER_DOCUMENT_TYPES } from "~/server/db/schema";
import { r2Client, R2_BUCKET } from "~/server/services/storage";

/**
 * Maximum file size (10 MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Tender Documents router (Story 3.2)
 */
export const tenderDocumentsRouter = createTRPCRouter({
  /**
   * Get all documents for a tender project
   */
  list: protectedProcedure
    .input(
      z.object({
        tenderProjectId: z.string(),
        documentType: z.enum(TENDER_DOCUMENT_TYPES).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await ctx.db.query.tenderProjects.findFirst({
        where: eq(tenderProjects.id, input.tenderProjectId),
        columns: { userId: true },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Projet non trouvé",
        });
      }

      if (project.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Build conditions
      const conditions = [eq(tenderDocuments.tenderProjectId, input.tenderProjectId)];

      if (input.documentType) {
        conditions.push(eq(tenderDocuments.documentType, input.documentType));
      }

      const documents = await ctx.db.query.tenderDocuments.findMany({
        where: and(...conditions),
        orderBy: [desc(tenderDocuments.createdAt)],
      });

      return { documents };
    }),

  /**
   * Get a single document by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const document = await ctx.db.query.tenderDocuments.findFirst({
        where: eq(tenderDocuments.id, input.id),
        with: {
          tenderProject: {
            columns: { userId: true },
          },
        },
      });

      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document non trouvé",
        });
      }

      // Verify ownership
      if (document.tenderProject.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      return document;
    }),

  /**
   * Create a document record (called after successful upload)
   */
  create: protectedProcedure
    .input(
      z.object({
        tenderProjectId: z.string(),
        documentType: z.enum(TENDER_DOCUMENT_TYPES),
        fileName: z.string().min(1).max(255),
        originalName: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(100),
        fileSize: z.number().int().min(1).max(MAX_FILE_SIZE),
        storageKey: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await ctx.db.query.tenderProjects.findFirst({
        where: eq(tenderProjects.id, input.tenderProjectId),
        columns: { userId: true },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Projet non trouvé",
        });
      }

      if (project.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // For RC documents, check if one already exists
      if (input.documentType === "rc") {
        const existingRC = await ctx.db.query.tenderDocuments.findFirst({
          where: and(
            eq(tenderDocuments.tenderProjectId, input.tenderProjectId),
            eq(tenderDocuments.documentType, "rc")
          ),
        });

        if (existingRC) {
          // Delete the old RC from R2
          try {
            await r2Client.send(
              new DeleteObjectCommand({
                Bucket: R2_BUCKET,
                Key: existingRC.storageKey,
              })
            );
          } catch (error) {
            console.error("Failed to delete old RC from R2:", error);
          }

          // Delete the old RC record
          await ctx.db
            .delete(tenderDocuments)
            .where(eq(tenderDocuments.id, existingRC.id));
        }
      }

      // Create the document record
      const [created] = await ctx.db
        .insert(tenderDocuments)
        .values({
          tenderProjectId: input.tenderProjectId,
          documentType: input.documentType,
          fileName: input.fileName,
          originalName: input.originalName,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          storageKey: input.storageKey,
          parsingStatus: "pending",
        })
        .returning();

      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de l'enregistrement du document",
        });
      }

      return created;
    }),

  /**
   * Delete a document
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get the document with project info
      const document = await ctx.db.query.tenderDocuments.findFirst({
        where: eq(tenderDocuments.id, input.id),
        with: {
          tenderProject: {
            columns: { userId: true },
          },
        },
      });

      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document non trouvé",
        });
      }

      // Verify ownership
      if (document.tenderProject.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Delete from R2 storage
      try {
        await r2Client.send(
          new DeleteObjectCommand({
            Bucket: R2_BUCKET,
            Key: document.storageKey,
          })
        );
      } catch (error) {
        console.error("Failed to delete file from R2:", error);
      }

      // Delete from database
      await ctx.db
        .delete(tenderDocuments)
        .where(eq(tenderDocuments.id, input.id));

      return { success: true };
    }),

  /**
   * Get a signed preview URL for a document (inline display)
   */
  getPreviewUrl: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get the document with project info
      const document = await ctx.db.query.tenderDocuments.findFirst({
        where: eq(tenderDocuments.id, input.id),
        with: {
          tenderProject: {
            columns: { userId: true },
          },
        },
      });

      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document non trouvé",
        });
      }

      // Verify ownership
      if (document.tenderProject.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Generate signed URL for inline viewing (valid for 1 hour)
      const signedUrl = await getSignedUrl(
        r2Client,
        new GetObjectCommand({
          Bucket: R2_BUCKET,
          Key: document.storageKey,
          ResponseContentDisposition: `inline; filename="${document.originalName}"`,
          ResponseContentType: document.mimeType,
        }),
        { expiresIn: 3600 }
      );

      return {
        url: signedUrl,
        mimeType: document.mimeType,
        originalName: document.originalName,
      };
    }),

  /**
   * Get a signed download URL for a document
   */
  getDownloadUrl: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get the document with project info
      const document = await ctx.db.query.tenderDocuments.findFirst({
        where: eq(tenderDocuments.id, input.id),
        with: {
          tenderProject: {
            columns: { userId: true },
          },
        },
      });

      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document non trouvé",
        });
      }

      // Verify ownership
      if (document.tenderProject.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Generate signed URL (valid for 1 hour)
      const signedUrl = await getSignedUrl(
        r2Client,
        new GetObjectCommand({
          Bucket: R2_BUCKET,
          Key: document.storageKey,
          ResponseContentDisposition: `attachment; filename="${document.originalName}"`,
        }),
        { expiresIn: 3600 }
      );

      return { url: signedUrl };
    }),

  /**
   * Get the RC document for a project (if exists)
   */
  getRC: protectedProcedure
    .input(z.object({ tenderProjectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await ctx.db.query.tenderProjects.findFirst({
        where: eq(tenderProjects.id, input.tenderProjectId),
        columns: { userId: true },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Projet non trouvé",
        });
      }

      if (project.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      const rcDocument = await ctx.db.query.tenderDocuments.findFirst({
        where: and(
          eq(tenderDocuments.tenderProjectId, input.tenderProjectId),
          eq(tenderDocuments.documentType, "rc")
        ),
      });

      return { rcDocument };
    }),
});
