import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { companyProfiles, companyFinancialData } from "~/server/db/schema";

/**
 * Financial data input schema for a single year
 */
const financialDataYearSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  revenue: z.number().int().nullable().optional(), // CA in euros
  netIncome: z.number().int().nullable().optional(), // Résultat net in euros
  employeeCount: z.number().int().positive().nullable().optional(),
});

/**
 * Get the current year
 */
function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Check if data is potentially stale (older than 1 year from current year)
 */
function isDataStale(dataYear: number): boolean {
  const currentYear = getCurrentYear();
  // Data is stale if it's from more than 1 year ago
  // e.g., if current year is 2026, data from 2024 or earlier is stale
  return dataYear < currentYear - 1;
}

/**
 * Company Financial Data router (Story 2.3)
 */
export const companyFinancialRouter = createTRPCRouter({
  /**
   * Get financial data for the current user's company
   * Returns data for the last 3 years with staleness indicator
   */
  getFinancialData: protectedProcedure.query(async ({ ctx }) => {
    // First, get the company profile
    const profile = await ctx.db.query.companyProfiles.findFirst({
      where: eq(companyProfiles.userId, ctx.session.user.id),
      columns: { id: true },
    });

    if (!profile) {
      return {
        data: [],
        hasProfile: false,
      };
    }

    // Get all financial data for this company, sorted by year descending
    const financialData = await ctx.db.query.companyFinancialData.findMany({
      where: eq(companyFinancialData.companyProfileId, profile.id),
      orderBy: [desc(companyFinancialData.year)],
    });

    // Add staleness indicator to each record
    const dataWithStaleness = financialData.map((record) => ({
      ...record,
      isStale: isDataStale(record.year),
    }));

    return {
      data: dataWithStaleness,
      hasProfile: true,
    };
  }),

  /**
   * Upsert financial data for a specific year
   * Creates or updates the record for the given year
   */
  upsertFinancialYear: protectedProcedure
    .input(financialDataYearSchema)
    .mutation(async ({ ctx, input }) => {
      // First, get or create the company profile
      let profile = await ctx.db.query.companyProfiles.findFirst({
        where: eq(companyProfiles.userId, ctx.session.user.id),
        columns: { id: true },
      });

      // Create profile if it doesn't exist
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

      // Check if record exists for this year
      const existingRecord = await ctx.db.query.companyFinancialData.findFirst({
        where: and(
          eq(companyFinancialData.companyProfileId, profile.id),
          eq(companyFinancialData.year, input.year)
        ),
        columns: { id: true },
      });

      if (existingRecord) {
        // Update existing record
        const [updated] = await ctx.db
          .update(companyFinancialData)
          .set({
            revenue: input.revenue ?? null,
            netIncome: input.netIncome ?? null,
            employeeCount: input.employeeCount ?? null,
            updatedAt: new Date(),
          })
          .where(eq(companyFinancialData.id, existingRecord.id))
          .returning();

        if (!updated) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur lors de la mise à jour des données financières",
          });
        }

        return {
          ...updated,
          isStale: isDataStale(updated.year),
        };
      } else {
        // Create new record
        const [created] = await ctx.db
          .insert(companyFinancialData)
          .values({
            companyProfileId: profile.id,
            year: input.year,
            revenue: input.revenue ?? null,
            netIncome: input.netIncome ?? null,
            employeeCount: input.employeeCount ?? null,
          })
          .returning();

        if (!created) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur lors de la création des données financières",
          });
        }

        return {
          ...created,
          isStale: isDataStale(created.year),
        };
      }
    }),

  /**
   * Delete financial data for a specific year
   */
  deleteFinancialYear: protectedProcedure
    .input(z.object({ year: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      // Get the company profile
      const profile = await ctx.db.query.companyProfiles.findFirst({
        where: eq(companyProfiles.userId, ctx.session.user.id),
        columns: { id: true },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profil entreprise non trouvé",
        });
      }

      // Delete the record
      await ctx.db
        .delete(companyFinancialData)
        .where(
          and(
            eq(companyFinancialData.companyProfileId, profile.id),
            eq(companyFinancialData.year, input.year)
          )
        );

      return { success: true };
    }),

  /**
   * Get suggested years for data entry (current year and 2 previous years)
   */
  getSuggestedYears: protectedProcedure.query(() => {
    const currentYear = getCurrentYear();
    return {
      years: [currentYear - 1, currentYear - 2, currentYear - 3],
      currentYear,
    };
  }),
});
