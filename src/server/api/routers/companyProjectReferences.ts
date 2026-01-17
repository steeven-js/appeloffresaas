import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { companyProfiles, companyProjectReferences } from "~/server/db/schema";

/**
 * Project reference input schema
 */
const projectReferenceSchema = z.object({
  projectName: z.string().min(1, "Le nom du projet est requis").max(255),
  clientName: z.string().min(1, "Le nom du client est requis").max(255),
  clientType: z.enum(["public", "private"]).optional().nullable(),
  sector: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  amount: z.number().int().min(0).optional().nullable(),
  startDate: z.string().optional().nullable(), // ISO date string
  endDate: z.string().optional().nullable(), // ISO date string
  location: z.string().max(255).optional().nullable(),
  contactName: z.string().max(255).optional().nullable(),
  contactEmail: z.string().email("Email invalide").max(255).optional().nullable().or(z.literal("")),
  contactPhone: z.string().max(20).optional().nullable(),
  isHighlight: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().nullable(),
});

/**
 * Common sectors for project references
 */
export const PROJECT_SECTORS = [
  "BTP",
  "IT / Numérique",
  "Services",
  "Conseil",
  "Industrie",
  "Transport",
  "Énergie",
  "Santé",
  "Éducation",
  "Finance",
  "Commerce",
  "Autre",
] as const;

/**
 * Helper to convert empty string to null
 */
const emptyToNull = (value: string | undefined | null) =>
  value && value.trim() !== "" ? value : null;

/**
 * Company Project References router (Story 2.6)
 */
export const companyProjectReferencesRouter = createTRPCRouter({
  /**
   * Get all project references for the current user's company
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    // First, get the company profile
    const profile = await ctx.db.query.companyProfiles.findFirst({
      where: eq(companyProfiles.userId, ctx.session.user.id),
      columns: { id: true },
    });

    if (!profile) {
      return {
        projectReferences: [],
        hasProfile: false,
      };
    }

    // Get all project references for this company
    const projectReferences = await ctx.db.query.companyProjectReferences.findMany({
      where: eq(companyProjectReferences.companyProfileId, profile.id),
      orderBy: [desc(companyProjectReferences.isHighlight), desc(companyProjectReferences.endDate)],
    });

    // Parse JSON fields
    const referencesWithParsedFields = projectReferences.map((ref) => ({
      ...ref,
      tags: ref.tags ? (JSON.parse(ref.tags) as string[]) : [],
    }));

    return {
      projectReferences: referencesWithParsedFields,
      hasProfile: true,
    };
  }),

  /**
   * Get a single project reference by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const projectReference = await ctx.db.query.companyProjectReferences.findFirst({
        where: eq(companyProjectReferences.id, input.id),
        with: {
          companyProfile: {
            columns: { userId: true },
          },
        },
      });

      if (!projectReference) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Référence projet non trouvée",
        });
      }

      // Verify ownership
      if (projectReference.companyProfile.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      return {
        ...projectReference,
        tags: projectReference.tags ? (JSON.parse(projectReference.tags) as string[]) : [],
      };
    }),

  /**
   * Create a new project reference
   */
  create: protectedProcedure
    .input(projectReferenceSchema)
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

      // Create the project reference
      const [created] = await ctx.db
        .insert(companyProjectReferences)
        .values({
          companyProfileId: profile.id,
          projectName: input.projectName,
          clientName: input.clientName,
          clientType: input.clientType ?? null,
          sector: input.sector ?? null,
          description: input.description ?? null,
          amount: input.amount ?? null,
          startDate: input.startDate ?? null,
          endDate: input.endDate ?? null,
          location: input.location ?? null,
          contactName: input.contactName ?? null,
          contactEmail: emptyToNull(input.contactEmail),
          contactPhone: input.contactPhone ?? null,
          isHighlight: input.isHighlight ? 1 : 0,
          tags: input.tags ? JSON.stringify(input.tags) : null,
        })
        .returning();

      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la création de la référence projet",
        });
      }

      return {
        ...created,
        tags: created.tags ? (JSON.parse(created.tags) as string[]) : [],
      };
    }),

  /**
   * Update an existing project reference
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: projectReferenceSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.companyProjectReferences.findFirst({
        where: eq(companyProjectReferences.id, input.id),
        with: {
          companyProfile: {
            columns: { userId: true },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Référence projet non trouvée",
        });
      }

      if (existing.companyProfile.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Update the project reference
      const [updated] = await ctx.db
        .update(companyProjectReferences)
        .set({
          projectName: input.data.projectName,
          clientName: input.data.clientName,
          clientType: input.data.clientType ?? null,
          sector: input.data.sector ?? null,
          description: input.data.description ?? null,
          amount: input.data.amount ?? null,
          startDate: input.data.startDate ?? null,
          endDate: input.data.endDate ?? null,
          location: input.data.location ?? null,
          contactName: input.data.contactName ?? null,
          contactEmail: emptyToNull(input.data.contactEmail),
          contactPhone: input.data.contactPhone ?? null,
          isHighlight: input.data.isHighlight ? 1 : 0,
          tags: input.data.tags ? JSON.stringify(input.data.tags) : null,
          updatedAt: new Date(),
        })
        .where(eq(companyProjectReferences.id, input.id))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la mise à jour de la référence projet",
        });
      }

      return {
        ...updated,
        tags: updated.tags ? (JSON.parse(updated.tags) as string[]) : [],
      };
    }),

  /**
   * Delete a project reference
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.companyProjectReferences.findFirst({
        where: eq(companyProjectReferences.id, input.id),
        with: {
          companyProfile: {
            columns: { userId: true },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Référence projet non trouvée",
        });
      }

      if (existing.companyProfile.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Delete the project reference
      await ctx.db
        .delete(companyProjectReferences)
        .where(eq(companyProjectReferences.id, input.id));

      return { success: true };
    }),

  /**
   * Toggle highlight status
   */
  toggleHighlight: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.companyProjectReferences.findFirst({
        where: eq(companyProjectReferences.id, input.id),
        with: {
          companyProfile: {
            columns: { userId: true },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Référence projet non trouvée",
        });
      }

      if (existing.companyProfile.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Toggle the highlight status
      const [updated] = await ctx.db
        .update(companyProjectReferences)
        .set({
          isHighlight: existing.isHighlight === 1 ? 0 : 1,
          updatedAt: new Date(),
        })
        .where(eq(companyProjectReferences.id, input.id))
        .returning();

      return { isHighlight: updated?.isHighlight === 1 };
    }),
});
