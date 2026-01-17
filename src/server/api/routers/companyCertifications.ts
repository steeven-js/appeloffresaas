import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { companyProfiles, companyCertifications } from "~/server/db/schema";

/**
 * Certification input schema
 */
const certificationSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(255),
  issuer: z.string().max(255).optional().nullable(),
  certificationNumber: z.string().max(100).optional().nullable(),
  obtainedDate: z.string().optional().nullable(), // ISO date string
  expiryDate: z.string().optional().nullable(), // ISO date string
  description: z.string().optional().nullable(),
});

/**
 * Check expiration status
 */
function getExpirationStatus(expiryDate: string | null): "valid" | "expiring" | "expired" | "unknown" {
  if (!expiryDate) return "unknown";

  const today = new Date();
  const expiry = new Date(expiryDate);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  if (expiry < today) return "expired";
  if (expiry < thirtyDaysFromNow) return "expiring";
  return "valid";
}

/**
 * Company Certifications router (Story 2.4)
 */
export const companyCertificationsRouter = createTRPCRouter({
  /**
   * Get all certifications for the current user's company
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    // First, get the company profile
    const profile = await ctx.db.query.companyProfiles.findFirst({
      where: eq(companyProfiles.userId, ctx.session.user.id),
      columns: { id: true },
    });

    if (!profile) {
      return {
        certifications: [],
        hasProfile: false,
      };
    }

    // Get all certifications for this company
    const certifications = await ctx.db.query.companyCertifications.findMany({
      where: eq(companyCertifications.companyProfileId, profile.id),
      orderBy: [desc(companyCertifications.createdAt)],
    });

    // Add expiration status to each certification
    const certificationsWithStatus = certifications.map((cert) => ({
      ...cert,
      expirationStatus: getExpirationStatus(cert.expiryDate),
    }));

    return {
      certifications: certificationsWithStatus,
      hasProfile: true,
    };
  }),

  /**
   * Get a single certification by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const certification = await ctx.db.query.companyCertifications.findFirst({
        where: eq(companyCertifications.id, input.id),
        with: {
          companyProfile: {
            columns: { userId: true },
          },
        },
      });

      if (!certification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Certification non trouvée",
        });
      }

      // Verify ownership
      if (certification.companyProfile.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      return {
        ...certification,
        expirationStatus: getExpirationStatus(certification.expiryDate),
      };
    }),

  /**
   * Create a new certification
   */
  create: protectedProcedure
    .input(certificationSchema)
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

      // Create the certification
      const [created] = await ctx.db
        .insert(companyCertifications)
        .values({
          companyProfileId: profile.id,
          name: input.name,
          issuer: input.issuer ?? null,
          certificationNumber: input.certificationNumber ?? null,
          obtainedDate: input.obtainedDate ?? null,
          expiryDate: input.expiryDate ?? null,
          description: input.description ?? null,
        })
        .returning();

      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la création de la certification",
        });
      }

      return {
        ...created,
        expirationStatus: getExpirationStatus(created.expiryDate),
      };
    }),

  /**
   * Update an existing certification
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: certificationSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.companyCertifications.findFirst({
        where: eq(companyCertifications.id, input.id),
        with: {
          companyProfile: {
            columns: { userId: true },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Certification non trouvée",
        });
      }

      if (existing.companyProfile.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Update the certification
      const [updated] = await ctx.db
        .update(companyCertifications)
        .set({
          name: input.data.name,
          issuer: input.data.issuer ?? null,
          certificationNumber: input.data.certificationNumber ?? null,
          obtainedDate: input.data.obtainedDate ?? null,
          expiryDate: input.data.expiryDate ?? null,
          description: input.data.description ?? null,
          updatedAt: new Date(),
        })
        .where(eq(companyCertifications.id, input.id))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la mise à jour de la certification",
        });
      }

      return {
        ...updated,
        expirationStatus: getExpirationStatus(updated.expiryDate),
      };
    }),

  /**
   * Delete a certification
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.companyCertifications.findFirst({
        where: eq(companyCertifications.id, input.id),
        with: {
          companyProfile: {
            columns: { userId: true },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Certification non trouvée",
        });
      }

      if (existing.companyProfile.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Delete the certification
      await ctx.db
        .delete(companyCertifications)
        .where(eq(companyCertifications.id, input.id));

      return { success: true };
    }),
});
