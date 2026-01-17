import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { companyProfiles } from "~/server/db/schema";

/**
 * SIRET validation regex - exactly 14 digits
 */
const siretSchema = z
  .string()
  .regex(/^\d{14}$/, "Le SIRET doit contenir exactement 14 chiffres")
  .optional()
  .or(z.literal(""));

/**
 * Company profile input schema
 */
const companyProfileSchema = z.object({
  name: z.string().max(255).optional(),
  siret: siretSchema,
  address: z.string().optional(),
  city: z.string().max(255).optional(),
  postalCode: z.string().max(10).optional(),
  country: z.string().max(255).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email("Email invalide").max(255).optional().or(z.literal("")),
  website: z.string().url("URL invalide").max(255).optional().or(z.literal("")),
});

/**
 * Calculate profile completeness score (0-100)
 */
function calculateCompleteness(profile: {
  name?: string | null;
  siret?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
}): number {
  let score = 0;
  const weights = {
    name: 20,
    siret: 20,
    addressComplete: 30, // address + city + postalCode
    contact: 15, // phone or email
    website: 15,
  };

  if (profile.name?.trim()) {
    score += weights.name;
  }

  if (profile.siret?.trim()) {
    score += weights.siret;
  }

  // Address completeness (all three fields required for full points)
  const addressFields = [profile.address, profile.city, profile.postalCode];
  const filledAddressFields = addressFields.filter((f) => f?.trim()).length;
  score += Math.round((filledAddressFields / 3) * weights.addressComplete);

  // Contact (phone OR email gives full points)
  if (profile.phone?.trim() ?? profile.email?.trim()) {
    score += weights.contact;
  }

  if (profile.website?.trim()) {
    score += weights.website;
  }

  return score;
}

/**
 * Company Profile router
 */
export const companyProfileRouter = createTRPCRouter({
  /**
   * Get current user's company profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.query.companyProfiles.findFirst({
      where: eq(companyProfiles.userId, ctx.session.user.id),
    });

    if (!profile) {
      return {
        profile: null,
        completeness: 0,
      };
    }

    return {
      profile,
      completeness: calculateCompleteness(profile),
    };
  }),

  /**
   * Create or update company profile (upsert)
   */
  upsertProfile: protectedProcedure
    .input(companyProfileSchema)
    .mutation(async ({ ctx, input }) => {
      // Clean up empty strings to null (empty string becomes null)
      const cleanInput = {
        name: input.name?.trim() ? input.name.trim() : null,
        siret: input.siret?.trim() ? input.siret.trim() : null,
        address: input.address?.trim() ? input.address.trim() : null,
        city: input.city?.trim() ? input.city.trim() : null,
        postalCode: input.postalCode?.trim() ? input.postalCode.trim() : null,
        country: input.country?.trim() ? input.country.trim() : null,
        phone: input.phone?.trim() ? input.phone.trim() : null,
        email: input.email?.trim() ? input.email.trim() : null,
        website: input.website?.trim() ? input.website.trim() : null,
      };

      // Check if profile exists
      const existingProfile = await ctx.db.query.companyProfiles.findFirst({
        where: eq(companyProfiles.userId, ctx.session.user.id),
        columns: { id: true },
      });

      if (existingProfile) {
        // Update existing profile
        const [updated] = await ctx.db
          .update(companyProfiles)
          .set({
            ...cleanInput,
            updatedAt: new Date(),
          })
          .where(eq(companyProfiles.id, existingProfile.id))
          .returning();

        if (!updated) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur lors de la mise à jour du profil",
          });
        }

        return {
          profile: updated,
          completeness: calculateCompleteness(updated),
        };
      } else {
        // Create new profile
        const [created] = await ctx.db
          .insert(companyProfiles)
          .values({
            userId: ctx.session.user.id,
            ...cleanInput,
          })
          .returning();

        if (!created) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur lors de la création du profil",
          });
        }

        return {
          profile: created,
          completeness: calculateCompleteness(created),
        };
      }
    }),
});
