import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { demandProjects, demandDocuments, DEMAND_DOCUMENT_TYPES } from "~/server/db/schema";
import { r2Client, R2_BUCKET } from "~/server/services/storage";

/**
 * Maximum file size (10 MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Demand Documents router (Dossier de Demande)
 */
export const demandDocumentsRouter = createTRPCRouter({
  /**
   * Get all documents for a demand project
   */
  list: protectedProcedure
    .input(
      z.object({
        demandProjectId: z.string(),
        documentType: z.enum(DEMAND_DOCUMENT_TYPES).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.demandProjectId),
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
      const conditions = [eq(demandDocuments.demandProjectId, input.demandProjectId)];

      if (input.documentType) {
        conditions.push(eq(demandDocuments.documentType, input.documentType));
      }

      const documents = await ctx.db.query.demandDocuments.findMany({
        where: and(...conditions),
        orderBy: [asc(demandDocuments.displayOrder), desc(demandDocuments.createdAt)],
      });

      return { documents };
    }),

  /**
   * Get a single document by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const document = await ctx.db.query.demandDocuments.findFirst({
        where: eq(demandDocuments.id, input.id),
        with: {
          demandProject: {
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
      if (document.demandProject.userId !== ctx.session.user.id) {
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
        demandProjectId: z.string(),
        documentType: z.enum(DEMAND_DOCUMENT_TYPES),
        fileName: z.string().min(1).max(255),
        originalName: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(100),
        fileSize: z.number().int().min(1).max(MAX_FILE_SIZE),
        storageKey: z.string().min(1).max(500),
        displayOrder: z.number().int().optional(),
        description: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.demandProjectId),
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

      // Get max displayOrder for this project and document type to auto-increment
      let displayOrder = input.displayOrder;
      if (displayOrder === undefined) {
        const maxOrderResult = await ctx.db
          .select({ maxOrder: sql<number>`COALESCE(MAX(${demandDocuments.displayOrder}), 0)` })
          .from(demandDocuments)
          .where(
            and(
              eq(demandDocuments.demandProjectId, input.demandProjectId),
              eq(demandDocuments.documentType, input.documentType)
            )
          );
        displayOrder = (maxOrderResult[0]?.maxOrder ?? 0) + 1;
      }

      // Create the document record
      const [created] = await ctx.db
        .insert(demandDocuments)
        .values({
          demandProjectId: input.demandProjectId,
          documentType: input.documentType,
          fileName: input.fileName,
          originalName: input.originalName,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          storageKey: input.storageKey,
          displayOrder,
          description: input.description,
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
      const document = await ctx.db.query.demandDocuments.findFirst({
        where: eq(demandDocuments.id, input.id),
        with: {
          demandProject: {
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
      if (document.demandProject.userId !== ctx.session.user.id) {
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
        .delete(demandDocuments)
        .where(eq(demandDocuments.id, input.id));

      return { success: true };
    }),

  /**
   * Get a signed preview URL for a document (inline display)
   */
  getPreviewUrl: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get the document with project info
      const document = await ctx.db.query.demandDocuments.findFirst({
        where: eq(demandDocuments.id, input.id),
        with: {
          demandProject: {
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
      if (document.demandProject.userId !== ctx.session.user.id) {
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
      const document = await ctx.db.query.demandDocuments.findFirst({
        where: eq(demandDocuments.id, input.id),
        with: {
          demandProject: {
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
      if (document.demandProject.userId !== ctx.session.user.id) {
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
   * Update display order for multiple documents (reordering)
   */
  updateOrder: protectedProcedure
    .input(
      z.object({
        demandProjectId: z.string(),
        documentIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.demandProjectId),
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

      // Update display order for each document
      await Promise.all(
        input.documentIds.map((id, index) =>
          ctx.db
            .update(demandDocuments)
            .set({ displayOrder: index + 1, updatedAt: new Date() })
            .where(
              and(
                eq(demandDocuments.id, id),
                eq(demandDocuments.demandProjectId, input.demandProjectId)
              )
            )
        )
      );

      return { success: true };
    }),

  /**
   * Update document description
   */
  updateDescription: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        description: z.string().max(500).nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the document with project info
      const document = await ctx.db.query.demandDocuments.findFirst({
        where: eq(demandDocuments.id, input.id),
        with: {
          demandProject: {
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
      if (document.demandProject.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Update description
      const [updated] = await ctx.db
        .update(demandDocuments)
        .set({ description: input.description, updatedAt: new Date() })
        .where(eq(demandDocuments.id, input.id))
        .returning();

      return updated;
    }),
});
