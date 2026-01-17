import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, desc, and, isNull } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { tenderProjects, TENDER_STATUS } from "~/server/db/schema";

/**
 * Tender project input schema
 */
const tenderProjectSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255),
  reference: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  buyerName: z.string().max(255).optional().nullable(),
  buyerType: z.enum(["public", "private"]).optional().nullable(),
  estimatedAmount: z.number().int().min(0).optional().nullable(),
  lotNumber: z.string().max(50).optional().nullable(),
  publicationDate: z.string().optional().nullable(), // ISO date string
  submissionDeadline: z.string().optional().nullable(), // ISO datetime string
  sourceUrl: z.string().url().max(500).optional().nullable().or(z.literal("")),
  sourcePlatform: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * Helper to convert empty string to null
 */
const emptyToNull = (value: string | undefined | null) =>
  value && value.trim() !== "" ? value : null;

/**
 * Get deadline status
 */
function getDeadlineStatus(deadline: Date | null): "upcoming" | "urgent" | "passed" | "none" {
  if (!deadline) return "none";

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  if (deadlineDate < now) return "passed";
  if (deadlineDate < threeDaysFromNow) return "urgent";
  return "upcoming";
}

/**
 * Tender Projects router (Epic 3)
 */
export const tenderProjectsRouter = createTRPCRouter({
  /**
   * Get all tender projects for the current user (Story 3.4)
   */
  list: protectedProcedure
    .input(
      z.object({
        includeArchived: z.boolean().optional().default(false),
        includeTemplates: z.boolean().optional().default(false),
        status: z.enum(["draft", "in_progress", "submitted", "won", "lost", "archived"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { includeArchived = false, includeTemplates = false, status } = input ?? {};

      // Build conditions
      const conditions = [eq(tenderProjects.userId, ctx.session.user.id)];

      // Exclude archived unless requested
      if (!includeArchived) {
        conditions.push(isNull(tenderProjects.archivedAt));
      }

      // Exclude templates unless requested
      if (!includeTemplates) {
        conditions.push(eq(tenderProjects.isTemplate, 0));
      }

      // Filter by status if provided
      if (status) {
        conditions.push(eq(tenderProjects.status, status));
      }

      const projects = await ctx.db.query.tenderProjects.findMany({
        where: and(...conditions),
        orderBy: [desc(tenderProjects.submissionDeadline), desc(tenderProjects.createdAt)],
      });

      // Add deadline status to each project
      const projectsWithStatus = projects.map((project) => ({
        ...project,
        deadlineStatus: getDeadlineStatus(project.submissionDeadline),
      }));

      return {
        projects: projectsWithStatus,
        counts: {
          total: projectsWithStatus.length,
          draft: projectsWithStatus.filter((p) => p.status === "draft").length,
          inProgress: projectsWithStatus.filter((p) => p.status === "in_progress").length,
          submitted: projectsWithStatus.filter((p) => p.status === "submitted").length,
          urgent: projectsWithStatus.filter((p) => p.deadlineStatus === "urgent").length,
        },
      };
    }),

  /**
   * Get templates only (Story 3.6)
   */
  listTemplates: protectedProcedure.query(async ({ ctx }) => {
    const templates = await ctx.db.query.tenderProjects.findMany({
      where: and(
        eq(tenderProjects.userId, ctx.session.user.id),
        eq(tenderProjects.isTemplate, 1)
      ),
      orderBy: [desc(tenderProjects.createdAt)],
    });

    return { templates };
  }),

  /**
   * Get a single tender project by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.query.tenderProjects.findFirst({
        where: eq(tenderProjects.id, input.id),
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Projet non trouvé",
        });
      }

      // Verify ownership
      if (project.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      return {
        ...project,
        deadlineStatus: getDeadlineStatus(project.submissionDeadline),
      };
    }),

  /**
   * Create a new tender project (Story 3.1)
   */
  create: protectedProcedure
    .input(tenderProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(tenderProjects)
        .values({
          userId: ctx.session.user.id,
          title: input.title,
          reference: emptyToNull(input.reference),
          description: emptyToNull(input.description),
          buyerName: emptyToNull(input.buyerName),
          buyerType: input.buyerType ?? null,
          estimatedAmount: input.estimatedAmount ?? null,
          lotNumber: emptyToNull(input.lotNumber),
          publicationDate: emptyToNull(input.publicationDate),
          submissionDeadline: input.submissionDeadline ? new Date(input.submissionDeadline) : null,
          sourceUrl: emptyToNull(input.sourceUrl),
          sourcePlatform: emptyToNull(input.sourcePlatform),
          notes: emptyToNull(input.notes),
          status: TENDER_STATUS.DRAFT,
        })
        .returning();

      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la création du projet",
        });
      }

      return {
        ...created,
        deadlineStatus: getDeadlineStatus(created.submissionDeadline),
      };
    }),

  /**
   * Update an existing tender project
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: tenderProjectSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.tenderProjects.findFirst({
        where: eq(tenderProjects.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Projet non trouvé",
        });
      }

      if (existing.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      const [updated] = await ctx.db
        .update(tenderProjects)
        .set({
          title: input.data.title,
          reference: emptyToNull(input.data.reference),
          description: emptyToNull(input.data.description),
          buyerName: emptyToNull(input.data.buyerName),
          buyerType: input.data.buyerType ?? null,
          estimatedAmount: input.data.estimatedAmount ?? null,
          lotNumber: emptyToNull(input.data.lotNumber),
          publicationDate: emptyToNull(input.data.publicationDate),
          submissionDeadline: input.data.submissionDeadline
            ? new Date(input.data.submissionDeadline)
            : null,
          sourceUrl: emptyToNull(input.data.sourceUrl),
          sourcePlatform: emptyToNull(input.data.sourcePlatform),
          notes: emptyToNull(input.data.notes),
          updatedAt: new Date(),
        })
        .where(eq(tenderProjects.id, input.id))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la mise à jour du projet",
        });
      }

      return {
        ...updated,
        deadlineStatus: getDeadlineStatus(updated.submissionDeadline),
      };
    }),

  /**
   * Update project status
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["draft", "in_progress", "submitted", "won", "lost"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.tenderProjects.findFirst({
        where: eq(tenderProjects.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Projet non trouvé",
        });
      }

      if (existing.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      const [updated] = await ctx.db
        .update(tenderProjects)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(tenderProjects.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Archive a tender project (Story 3.5)
   */
  archive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.tenderProjects.findFirst({
        where: eq(tenderProjects.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Projet non trouvé",
        });
      }

      if (existing.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      const [updated] = await ctx.db
        .update(tenderProjects)
        .set({
          status: TENDER_STATUS.ARCHIVED,
          archivedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(tenderProjects.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Unarchive a tender project
   */
  unarchive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.tenderProjects.findFirst({
        where: eq(tenderProjects.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Projet non trouvé",
        });
      }

      if (existing.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      const [updated] = await ctx.db
        .update(tenderProjects)
        .set({
          status: TENDER_STATUS.DRAFT, // Reset to draft
          archivedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(tenderProjects.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Duplicate a project as template or new project (Story 3.6)
   */
  duplicate: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        asTemplate: z.boolean().optional().default(false),
        templateName: z.string().max(255).optional(),
        newTitle: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the source project
      const source = await ctx.db.query.tenderProjects.findFirst({
        where: eq(tenderProjects.id, input.id),
      });

      if (!source) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Projet source non trouvé",
        });
      }

      if (source.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Create the duplicate
      const [created] = await ctx.db
        .insert(tenderProjects)
        .values({
          userId: ctx.session.user.id,
          title: input.newTitle ?? `${source.title} (copie)`,
          reference: null, // Don't copy reference
          description: source.description,
          buyerName: input.asTemplate ? null : source.buyerName,
          buyerType: source.buyerType,
          estimatedAmount: input.asTemplate ? null : source.estimatedAmount,
          lotNumber: null,
          publicationDate: null,
          submissionDeadline: null, // Don't copy deadline
          sourceUrl: input.asTemplate ? null : source.sourceUrl,
          sourcePlatform: source.sourcePlatform,
          notes: source.notes,
          status: TENDER_STATUS.DRAFT,
          isTemplate: input.asTemplate ? 1 : 0,
          templateName: input.asTemplate ? (input.templateName ?? source.title) : null,
        })
        .returning();

      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la duplication du projet",
        });
      }

      return created;
    }),

  /**
   * Delete a tender project (Story 3.7)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.tenderProjects.findFirst({
        where: eq(tenderProjects.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Projet non trouvé",
        });
      }

      if (existing.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      await ctx.db
        .delete(tenderProjects)
        .where(eq(tenderProjects.id, input.id));

      return { success: true };
    }),
});
