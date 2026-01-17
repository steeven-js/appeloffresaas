import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { companyProfiles, companyDocuments, DOCUMENT_CATEGORIES } from "~/server/db/schema";
import { r2Client, R2_BUCKET } from "~/server/services/storage";
import { isOpenAIConfigured, analyzeDocumentForExpiryDate } from "~/server/services/ai";

/**
 * Accepted MIME types for document uploads
 */
export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/**
 * Maximum file size (10 MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Company Documents router (Story 2.8)
 */
export const companyDocumentsRouter = createTRPCRouter({
  /**
   * Get all documents for the current user's company
   */
  list: protectedProcedure
    .input(
      z.object({
        category: z.enum(DOCUMENT_CATEGORIES).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      // First, get the company profile
      const profile = await ctx.db.query.companyProfiles.findFirst({
        where: eq(companyProfiles.userId, ctx.session.user.id),
        columns: { id: true },
      });

      if (!profile) {
        return {
          documents: [],
          hasProfile: false,
        };
      }

      // Get all documents for this company
      const documents = await ctx.db.query.companyDocuments.findMany({
        where: eq(companyDocuments.companyProfileId, profile.id),
        orderBy: [desc(companyDocuments.createdAt)],
      });

      // Filter by category if provided
      const filteredDocs = input?.category
        ? documents.filter((doc) => doc.category === input.category)
        : documents;

      // Parse tags JSON
      const documentsWithParsedTags = filteredDocs.map((doc) => ({
        ...doc,
        tags: doc.tags ? (JSON.parse(doc.tags) as string[]) : [],
      }));

      return {
        documents: documentsWithParsedTags,
        hasProfile: true,
      };
    }),

  /**
   * Get a single document by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const document = await ctx.db.query.companyDocuments.findFirst({
        where: eq(companyDocuments.id, input.id),
        with: {
          companyProfile: {
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
      if (document.companyProfile.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      return {
        ...document,
        tags: document.tags ? (JSON.parse(document.tags) as string[]) : [],
      };
    }),

  /**
   * Create a document record (called after successful upload)
   */
  create: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1).max(255),
        originalName: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(100),
        fileSize: z.number().int().min(1).max(MAX_FILE_SIZE),
        storageKey: z.string().min(1).max(500),
        category: z.enum(DOCUMENT_CATEGORIES).optional().nullable(),
        description: z.string().optional().nullable(),
        tags: z.array(z.string()).optional().nullable(),
        expiryDate: z.string().optional().nullable(), // ISO date string
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get or create the company profile
      let profile = await ctx.db.query.companyProfiles.findFirst({
        where: eq(companyProfiles.userId, ctx.session.user.id),
        columns: { id: true },
      });

      if (!profile) {
        const [newProfile] = await ctx.db
          .insert(companyProfiles)
          .values({
            userId: ctx.session.user.id,
          })
          .returning({ id: companyProfiles.id });

        if (!newProfile) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur lors de la création du profil entreprise",
          });
        }
        profile = newProfile;
      }

      // Create the document record
      const [created] = await ctx.db
        .insert(companyDocuments)
        .values({
          companyProfileId: profile.id,
          fileName: input.fileName,
          originalName: input.originalName,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          storageKey: input.storageKey,
          category: input.category ?? null,
          description: input.description ?? null,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          expiryDate: input.expiryDate ?? null,
        })
        .returning();

      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de l'enregistrement du document",
        });
      }

      return {
        ...created,
        tags: created.tags ? (JSON.parse(created.tags) as string[]) : [],
      };
    }),

  /**
   * Update document metadata
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          category: z.enum(DOCUMENT_CATEGORIES).optional().nullable(),
          description: z.string().optional().nullable(),
          tags: z.array(z.string()).optional().nullable(),
          expiryDate: z.string().optional().nullable(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.companyDocuments.findFirst({
        where: eq(companyDocuments.id, input.id),
        with: {
          companyProfile: {
            columns: { userId: true },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document non trouvé",
        });
      }

      if (existing.companyProfile.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Update the document
      const [updated] = await ctx.db
        .update(companyDocuments)
        .set({
          category: input.data.category ?? null,
          description: input.data.description ?? null,
          tags: input.data.tags ? JSON.stringify(input.data.tags) : null,
          expiryDate: input.data.expiryDate ?? null,
          updatedAt: new Date(),
        })
        .where(eq(companyDocuments.id, input.id))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la mise à jour du document",
        });
      }

      return {
        ...updated,
        tags: updated.tags ? (JSON.parse(updated.tags) as string[]) : [],
      };
    }),

  /**
   * Delete a document (also removes from R2 storage)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.companyDocuments.findFirst({
        where: eq(companyDocuments.id, input.id),
        with: {
          companyProfile: {
            columns: { userId: true },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document non trouvé",
        });
      }

      if (existing.companyProfile.userId !== ctx.session.user.id) {
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
            Key: existing.storageKey,
          })
        );
      } catch (error) {
        console.error("Failed to delete file from R2:", error);
        // Continue with database deletion even if R2 delete fails
      }

      // Delete from database
      await ctx.db
        .delete(companyDocuments)
        .where(eq(companyDocuments.id, input.id));

      return { success: true };
    }),

  /**
   * Get a signed download URL for a document
   */
  getDownloadUrl: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const document = await ctx.db.query.companyDocuments.findFirst({
        where: eq(companyDocuments.id, input.id),
        with: {
          companyProfile: {
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

      if (document.companyProfile.userId !== ctx.session.user.id) {
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
   * Get a signed preview URL for a document (inline display)
   * Used for viewing documents in the browser (Story 2.12)
   */
  getPreviewUrl: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const document = await ctx.db.query.companyDocuments.findFirst({
        where: eq(companyDocuments.id, input.id),
        with: {
          companyProfile: {
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

      if (document.companyProfile.userId !== ctx.session.user.id) {
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
   * Get document categories with counts
   */
  getCategoryCounts: protectedProcedure.query(async ({ ctx }) => {
    // Get the company profile
    const profile = await ctx.db.query.companyProfiles.findFirst({
      where: eq(companyProfiles.userId, ctx.session.user.id),
      columns: { id: true },
    });

    if (!profile) {
      return { categories: [] };
    }

    // Get all documents
    const documents = await ctx.db.query.companyDocuments.findMany({
      where: eq(companyDocuments.companyProfileId, profile.id),
      columns: { category: true },
    });

    // Count by category
    const counts = new Map<string | null, number>();
    for (const doc of documents) {
      const cat = doc.category;
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }

    // Convert to array
    const categories = DOCUMENT_CATEGORIES.map((cat) => ({
      category: cat,
      count: counts.get(cat) ?? 0,
    }));

    // Add uncategorized count
    const uncategorized = counts.get(null) ?? 0;

    return {
      categories,
      uncategorized,
      total: documents.length,
    };
  }),

  /**
   * Check if AI analysis is available
   */
  isAnalysisAvailable: protectedProcedure.query(() => {
    return { available: isOpenAIConfigured() };
  }),

  /**
   * Analyze a document to detect expiration date (Story 2.11)
   * Uses OpenAI Vision to extract dates from document images
   */
  analyzeForExpiryDate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!isOpenAIConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "L'analyse AI n'est pas configurée",
        });
      }

      // Get the document
      const document = await ctx.db.query.companyDocuments.findFirst({
        where: eq(companyDocuments.id, input.id),
        with: {
          companyProfile: {
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
      if (document.companyProfile.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Only analyze images and PDFs
      const supportedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
      if (!supportedTypes.includes(document.mimeType)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Seuls les images et PDFs peuvent être analysés",
        });
      }

      // Fetch the document from R2
      const getCommand = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: document.storageKey,
      });

      const response = await r2Client.send(getCommand);
      if (!response.Body) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Impossible de récupérer le document",
        });
      }

      // Convert to base64
      const chunks: Uint8Array[] = [];
      const reader = response.Body.transformToWebStream().getReader();

      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) {
          chunks.push(result.value as Uint8Array);
        }
      }

      const buffer = Buffer.concat(chunks);
      const base64 = buffer.toString("base64");

      // For PDFs, we'd need to convert to image first
      // For now, only support images directly
      if (document.mimeType === "application/pdf") {
        // PDF analysis would require additional processing
        // Return a message indicating this limitation
        return {
          expiryDate: null,
          confidence: "low" as const,
          documentType: null,
          message: "L'analyse des PDFs nécessite une conversion en image. Fonctionnalité à venir.",
        };
      }

      // Analyze the image
      const result = await analyzeDocumentForExpiryDate(base64, document.mimeType);

      return {
        ...result,
        message: result.expiryDate
          ? `Date d'expiration détectée avec une confiance ${result.confidence === "high" ? "élevée" : result.confidence === "medium" ? "moyenne" : "faible"}`
          : "Aucune date d'expiration détectée",
      };
    }),
});
