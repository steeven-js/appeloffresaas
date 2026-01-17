import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  companyProfiles,
  companyFinancialData,
  companyCertifications,
  companyTeamMembers,
  companyProjectReferences,
} from "~/server/db/schema";

/**
 * SIRET validation regex - exactly 14 digits
 */
const siretSchema = z
  .string()
  .regex(/^\d{14}$/, "Le SIRET doit contenir exactement 14 chiffres")
  .optional()
  .or(z.literal(""));

/**
 * NAF code validation regex - format like 6201Z
 */
const nafCodeSchema = z
  .string()
  .regex(/^(\d{4}[A-Z])?$/, "Le code NAF doit être au format 1234A")
  .optional()
  .or(z.literal(""));

/**
 * Company profile input schema
 */
const companyProfileSchema = z.object({
  name: z.string().max(255).optional(),
  siret: siretSchema,
  // Legal information (Story 2.2)
  legalForm: z.string().max(50).optional(),
  capitalSocial: z.number().int().positive().optional().nullable(),
  nafCode: nafCodeSchema,
  creationDate: z.string().optional().nullable(), // ISO date string
  rcsCity: z.string().max(255).optional(),
  // Address
  address: z.string().optional(),
  city: z.string().max(255).optional(),
  postalCode: z.string().max(10).optional(),
  country: z.string().max(255).optional(),
  // Contact
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
  legalForm?: string | null;
  capitalSocial?: number | null;
  nafCode?: string | null;
  creationDate?: string | null;
  rcsCity?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
}): number {
  let score = 0;
  const weights = {
    name: 15,
    siret: 15,
    legalInfo: 20, // legalForm + capitalSocial + nafCode + creationDate
    addressComplete: 25, // address + city + postalCode
    contact: 15, // phone or email
    website: 10,
  };

  if (profile.name?.trim()) {
    score += weights.name;
  }

  if (profile.siret?.trim()) {
    score += weights.siret;
  }

  // Legal info completeness (Story 2.2)
  const legalFields = [
    profile.legalForm,
    profile.capitalSocial != null ? String(profile.capitalSocial) : null,
    profile.nafCode,
    profile.creationDate,
  ];
  const filledLegalFields = legalFields.filter((f) => f && String(f).trim()).length;
  score += Math.round((filledLegalFields / 4) * weights.legalInfo);

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
 * Profile section definition for completeness tracking
 */
interface ProfileSection {
  id: string;
  name: string;
  weight: number;
  complete: boolean;
  suggestions: string[];
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
   * Get comprehensive profile completeness (Story 2.7)
   * Includes all related data: financial, certifications, team, references
   */
  getCompleteness: protectedProcedure.query(async ({ ctx }) => {
    // Get the company profile
    const profile = await ctx.db.query.companyProfiles.findFirst({
      where: eq(companyProfiles.userId, ctx.session.user.id),
    });

    if (!profile) {
      return {
        totalScore: 0,
        sections: [] as ProfileSection[],
        suggestions: [
          "Créez votre profil entreprise",
          "Ajoutez vos informations de base (nom, SIRET)",
        ],
      };
    }

    // Fetch related data in parallel
    const [financialData, certifications, teamMembers, projectRefs] = await Promise.all([
      ctx.db.query.companyFinancialData.findMany({
        where: eq(companyFinancialData.companyProfileId, profile.id),
      }),
      ctx.db.query.companyCertifications.findMany({
        where: eq(companyCertifications.companyProfileId, profile.id),
      }),
      ctx.db.query.companyTeamMembers.findMany({
        where: eq(companyTeamMembers.companyProfileId, profile.id),
      }),
      ctx.db.query.companyProjectReferences.findMany({
        where: eq(companyProjectReferences.companyProfileId, profile.id),
      }),
    ]);

    // Calculate section scores
    const sections: ProfileSection[] = [];

    // 1. Basic info (20%)
    const hasBasicInfo = !!(profile.name && profile.siret);
    const basicSuggestions: string[] = [];
    if (!profile.name) basicSuggestions.push("Ajoutez le nom de votre entreprise");
    if (!profile.siret) basicSuggestions.push("Ajoutez votre numéro SIRET");
    sections.push({
      id: "basic",
      name: "Informations de base",
      weight: 20,
      complete: hasBasicInfo,
      suggestions: basicSuggestions,
    });

    // 2. Legal info (15%)
    const legalFields = [profile.legalForm, profile.capitalSocial, profile.nafCode, profile.creationDate];
    const legalComplete = legalFields.filter(Boolean).length;
    const hasLegalInfo = legalComplete >= 3;
    const legalSuggestions: string[] = [];
    if (!profile.legalForm) legalSuggestions.push("Ajoutez la forme juridique");
    if (!profile.capitalSocial) legalSuggestions.push("Ajoutez le capital social");
    if (!profile.nafCode) legalSuggestions.push("Ajoutez le code NAF");
    if (!profile.creationDate) legalSuggestions.push("Ajoutez la date de création");
    sections.push({
      id: "legal",
      name: "Informations légales",
      weight: 15,
      complete: hasLegalInfo,
      suggestions: legalSuggestions,
    });

    // 3. Address (10%)
    const hasAddress = !!(profile.address && profile.city && profile.postalCode);
    const addressSuggestions: string[] = [];
    if (!profile.address) addressSuggestions.push("Ajoutez l'adresse");
    if (!profile.city) addressSuggestions.push("Ajoutez la ville");
    if (!profile.postalCode) addressSuggestions.push("Ajoutez le code postal");
    sections.push({
      id: "address",
      name: "Adresse",
      weight: 10,
      complete: hasAddress,
      suggestions: addressSuggestions,
    });

    // 4. Contact (10%)
    const hasContact = !!(profile.phone ?? profile.email);
    const contactSuggestions: string[] = [];
    if (!profile.phone && !profile.email) contactSuggestions.push("Ajoutez un téléphone ou email de contact");
    sections.push({
      id: "contact",
      name: "Contact",
      weight: 10,
      complete: hasContact,
      suggestions: contactSuggestions,
    });

    // 5. Financial data (15%)
    const hasFinancialData = financialData.length >= 1;
    const financialSuggestions: string[] = [];
    if (financialData.length === 0) {
      financialSuggestions.push("Ajoutez vos données financières (CA, effectif)");
    } else if (financialData.length < 3) {
      financialSuggestions.push("Complétez les données financières des 3 dernières années");
    }
    sections.push({
      id: "financial",
      name: "Données financières",
      weight: 15,
      complete: hasFinancialData,
      suggestions: financialSuggestions,
    });

    // 6. Certifications (10%)
    const hasCertifications = certifications.length >= 1;
    const certSuggestions: string[] = [];
    if (certifications.length === 0) {
      certSuggestions.push("Ajoutez vos certifications et qualifications");
    }
    sections.push({
      id: "certifications",
      name: "Certifications",
      weight: 10,
      complete: hasCertifications,
      suggestions: certSuggestions,
    });

    // 7. Team members (10%)
    const hasTeamMembers = teamMembers.length >= 1;
    const teamSuggestions: string[] = [];
    if (teamMembers.length === 0) {
      teamSuggestions.push("Ajoutez les membres clés de votre équipe");
    }
    sections.push({
      id: "team",
      name: "Équipe",
      weight: 10,
      complete: hasTeamMembers,
      suggestions: teamSuggestions,
    });

    // 8. Project references (10%)
    const hasProjectRefs = projectRefs.length >= 1;
    const refSuggestions: string[] = [];
    if (projectRefs.length === 0) {
      refSuggestions.push("Ajoutez vos références de projets");
    } else if (projectRefs.length < 3) {
      refSuggestions.push("Ajoutez plus de références pour renforcer votre profil");
    }
    sections.push({
      id: "references",
      name: "Références projets",
      weight: 10,
      complete: hasProjectRefs,
      suggestions: refSuggestions,
    });

    // Calculate total score
    const totalScore = sections.reduce((sum, section) => {
      return sum + (section.complete ? section.weight : 0);
    }, 0);

    // Collect all suggestions (prioritize incomplete sections)
    const allSuggestions = sections
      .filter((s) => !s.complete)
      .flatMap((s) => s.suggestions)
      .slice(0, 5); // Limit to 5 suggestions

    return {
      totalScore,
      sections,
      suggestions: allSuggestions,
      counts: {
        financialYears: financialData.length,
        certifications: certifications.length,
        teamMembers: teamMembers.length,
        projectReferences: projectRefs.length,
      },
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
        // Legal information (Story 2.2)
        legalForm: input.legalForm?.trim() ? input.legalForm.trim() : null,
        capitalSocial: input.capitalSocial ?? null,
        nafCode: input.nafCode?.trim() ? input.nafCode.trim() : null,
        creationDate: input.creationDate ?? null,
        rcsCity: input.rcsCity?.trim() ? input.rcsCity.trim() : null,
        // Address
        address: input.address?.trim() ? input.address.trim() : null,
        city: input.city?.trim() ? input.city.trim() : null,
        postalCode: input.postalCode?.trim() ? input.postalCode.trim() : null,
        country: input.country?.trim() ? input.country.trim() : null,
        // Contact
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
