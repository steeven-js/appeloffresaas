import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { companyProfiles, companyTeamMembers } from "~/server/db/schema";

/**
 * Team member input schema
 */
const teamMemberSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis").max(100),
  lastName: z.string().min(1, "Le nom est requis").max(100),
  email: z.string().email("Email invalide").max(255).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  role: z.string().min(1, "Le poste est requis").max(255),
  department: z.string().max(100).optional().nullable(),
  yearsOfExperience: z.number().int().min(0).max(60).optional().nullable(),
  skills: z.array(z.string()).optional().nullable(), // Array of skills
  education: z.string().optional().nullable(),
  personalCertifications: z.array(z.string()).optional().nullable(), // Array of certifications
  bio: z.string().optional().nullable(),
  isKeyPerson: z.boolean().optional().default(false),
});

/**
 * Company Team Members router (Story 2.5)
 */
export const companyTeamMembersRouter = createTRPCRouter({
  /**
   * Get all team members for the current user's company
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    // First, get the company profile
    const profile = await ctx.db.query.companyProfiles.findFirst({
      where: eq(companyProfiles.userId, ctx.session.user.id),
      columns: { id: true },
    });

    if (!profile) {
      return {
        teamMembers: [],
        hasProfile: false,
      };
    }

    // Get all team members for this company
    const teamMembers = await ctx.db.query.companyTeamMembers.findMany({
      where: eq(companyTeamMembers.companyProfileId, profile.id),
      orderBy: [desc(companyTeamMembers.isKeyPerson), desc(companyTeamMembers.createdAt)],
    });

    // Parse JSON fields
    const teamMembersWithParsedFields = teamMembers.map((member) => ({
      ...member,
      skills: member.skills ? (JSON.parse(member.skills) as string[]) : [],
      personalCertifications: member.personalCertifications
        ? (JSON.parse(member.personalCertifications) as string[])
        : [],
    }));

    return {
      teamMembers: teamMembersWithParsedFields,
      hasProfile: true,
    };
  }),

  /**
   * Get a single team member by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const teamMember = await ctx.db.query.companyTeamMembers.findFirst({
        where: eq(companyTeamMembers.id, input.id),
        with: {
          companyProfile: {
            columns: { userId: true },
          },
        },
      });

      if (!teamMember) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Membre d'équipe non trouvé",
        });
      }

      // Verify ownership
      if (teamMember.companyProfile.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      return {
        ...teamMember,
        skills: teamMember.skills ? (JSON.parse(teamMember.skills) as string[]) : [],
        personalCertifications: teamMember.personalCertifications
          ? (JSON.parse(teamMember.personalCertifications) as string[])
          : [],
      };
    }),

  /**
   * Create a new team member
   */
  create: protectedProcedure
    .input(teamMemberSchema)
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

      // Create the team member
      const [created] = await ctx.db
        .insert(companyTeamMembers)
        .values({
          companyProfileId: profile.id,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email ?? null,
          phone: input.phone ?? null,
          role: input.role,
          department: input.department ?? null,
          yearsOfExperience: input.yearsOfExperience ?? null,
          skills: input.skills ? JSON.stringify(input.skills) : null,
          education: input.education ?? null,
          personalCertifications: input.personalCertifications
            ? JSON.stringify(input.personalCertifications)
            : null,
          bio: input.bio ?? null,
          isKeyPerson: input.isKeyPerson ? 1 : 0,
        })
        .returning();

      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la création du membre d'équipe",
        });
      }

      return {
        ...created,
        skills: created.skills ? (JSON.parse(created.skills) as string[]) : [],
        personalCertifications: created.personalCertifications
          ? (JSON.parse(created.personalCertifications) as string[])
          : [],
      };
    }),

  /**
   * Update an existing team member
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: teamMemberSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.companyTeamMembers.findFirst({
        where: eq(companyTeamMembers.id, input.id),
        with: {
          companyProfile: {
            columns: { userId: true },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Membre d'équipe non trouvé",
        });
      }

      if (existing.companyProfile.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Update the team member
      const [updated] = await ctx.db
        .update(companyTeamMembers)
        .set({
          firstName: input.data.firstName,
          lastName: input.data.lastName,
          email: input.data.email ?? null,
          phone: input.data.phone ?? null,
          role: input.data.role,
          department: input.data.department ?? null,
          yearsOfExperience: input.data.yearsOfExperience ?? null,
          skills: input.data.skills ? JSON.stringify(input.data.skills) : null,
          education: input.data.education ?? null,
          personalCertifications: input.data.personalCertifications
            ? JSON.stringify(input.data.personalCertifications)
            : null,
          bio: input.data.bio ?? null,
          isKeyPerson: input.data.isKeyPerson ? 1 : 0,
          updatedAt: new Date(),
        })
        .where(eq(companyTeamMembers.id, input.id))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la mise à jour du membre d'équipe",
        });
      }

      return {
        ...updated,
        skills: updated.skills ? (JSON.parse(updated.skills) as string[]) : [],
        personalCertifications: updated.personalCertifications
          ? (JSON.parse(updated.personalCertifications) as string[])
          : [],
      };
    }),

  /**
   * Delete a team member
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.companyTeamMembers.findFirst({
        where: eq(companyTeamMembers.id, input.id),
        with: {
          companyProfile: {
            columns: { userId: true },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Membre d'équipe non trouvé",
        });
      }

      if (existing.companyProfile.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Delete the team member
      await ctx.db
        .delete(companyTeamMembers)
        .where(eq(companyTeamMembers.id, input.id));

      return { success: true };
    }),

  /**
   * Toggle key person status
   */
  toggleKeyPerson: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.companyTeamMembers.findFirst({
        where: eq(companyTeamMembers.id, input.id),
        with: {
          companyProfile: {
            columns: { userId: true },
          },
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Membre d'équipe non trouvé",
        });
      }

      if (existing.companyProfile.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Toggle the key person status
      const [updated] = await ctx.db
        .update(companyTeamMembers)
        .set({
          isKeyPerson: existing.isKeyPerson === 1 ? 0 : 1,
          updatedAt: new Date(),
        })
        .where(eq(companyTeamMembers.id, input.id))
        .returning();

      return { isKeyPerson: updated?.isKeyPerson === 1 };
    }),
});
