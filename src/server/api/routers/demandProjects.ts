import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, desc, and, isNull, sql } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { demandProjects, demandDocuments, DEMAND_STATUS } from "~/server/db/schema";

/**
 * Section schema for flexible document structure
 */
const sectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  isDefault: z.boolean(),
  isRequired: z.boolean(),
  order: z.number(),
});

/**
 * Demand project input schema
 */
const demandProjectSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255),
  reference: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  // New demand-specific fields
  departmentName: z.string().max(255).optional().nullable(),
  contactName: z.string().max(255).optional().nullable(),
  contactEmail: z.string().email().max(255).optional().nullable().or(z.literal("")),
  context: z.string().optional().nullable(),
  constraints: z.string().optional().nullable(),
  urgencyLevel: z.enum(["low", "medium", "high", "critical"]).optional().nullable(),
  needType: z.enum(["fourniture", "service", "travaux", "formation", "logiciel", "maintenance", "autre"]).optional().nullable(),
  budgetRange: z.string().max(100).optional().nullable(),
  budgetValidated: z.boolean().optional().nullable(),
  desiredDeliveryDate: z.string().optional().nullable(), // ISO date string
  urgencyJustification: z.string().optional().nullable(),
  // Flexible sections
  sections: z.array(sectionSchema).optional().nullable(),
  // Legacy fields (kept for compatibility)
  buyerName: z.string().max(255).optional().nullable(),
  buyerType: z.enum(["public", "private"]).optional().nullable(),
  estimatedAmount: z.number().int().min(0).optional().nullable(),
  lotNumber: z.string().max(50).optional().nullable(),
  publicationDate: z.string().optional().nullable(),
  submissionDeadline: z.string().optional().nullable(),
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
 * Calculate project completion percentage
 * Based on key fields for demand projects
 */
interface ProjectForCompletion {
  title: string;
  description: string | null;
  departmentName: string | null;
  contactName: string | null;
  context: string | null;
  budgetRange: string | null;
  desiredDeliveryDate: string | null;
}

function calculateCompletion(project: ProjectForCompletion, hasDocuments: boolean): number {
  let score = 0;
  const maxScore = 7;

  // Title is always present (required), counts as 1
  score += 1;

  // Description set
  if (project.description) score += 1;

  // Department name set
  if (project.departmentName) score += 1;

  // Contact name set
  if (project.contactName) score += 1;

  // Context/needs defined
  if (project.context) score += 1;

  // Budget range set
  if (project.budgetRange) score += 1;

  // Has supporting documents
  if (hasDocuments) score += 1;

  return Math.round((score / maxScore) * 100);
}

/**
 * Demand Projects router (Dossier de Demande)
 */
export const demandProjectsRouter = createTRPCRouter({
  /**
   * Get all demand projects for the current user
   */
  list: protectedProcedure
    .input(
      z.object({
        includeArchived: z.boolean().optional().default(false),
        includeTemplates: z.boolean().optional().default(false),
        status: z.enum(["draft", "in_review", "approved", "sent_to_admin", "converted_to_ao", "archived"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { includeArchived = false, includeTemplates = false, status } = input ?? {};

      // Build conditions
      const conditions = [eq(demandProjects.userId, ctx.session.user.id)];

      // Exclude archived unless requested
      if (!includeArchived) {
        conditions.push(isNull(demandProjects.archivedAt));
      }

      // Exclude templates unless requested
      if (!includeTemplates) {
        conditions.push(eq(demandProjects.isTemplate, 0));
      }

      // Filter by status if provided
      if (status) {
        conditions.push(eq(demandProjects.status, status));
      }

      // Sort by updatedAt (most recent first)
      const projects = await ctx.db.query.demandProjects.findMany({
        where: and(...conditions),
        orderBy: [desc(demandProjects.updatedAt)],
      });

      // Get document count for each project (for completion calculation)
      const projectIds = projects.map((p) => p.id);
      const documents = projectIds.length > 0
        ? await ctx.db.query.demandDocuments.findMany({
            where: sql`${demandDocuments.demandProjectId} IN (${sql.join(projectIds.map(id => sql`${id}`), sql`, `)})`,
            columns: { demandProjectId: true },
          })
        : [];

      const projectsWithDocs = new Set(documents.map((d) => d.demandProjectId));

      // Add deadline status and completion percentage to each project
      const projectsWithStatus = projects.map((project) => ({
        ...project,
        deadlineStatus: getDeadlineStatus(project.submissionDeadline),
        completionPercentage: calculateCompletion(project, projectsWithDocs.has(project.id)),
      }));

      return {
        projects: projectsWithStatus,
        counts: {
          total: projectsWithStatus.length,
          draft: projectsWithStatus.filter((p) => p.status === "draft").length,
          inReview: projectsWithStatus.filter((p) => p.status === "in_review").length,
          approved: projectsWithStatus.filter((p) => p.status === "approved").length,
          sentToAdmin: projectsWithStatus.filter((p) => p.status === "sent_to_admin").length,
        },
      };
    }),

  /**
   * Get templates only
   */
  listTemplates: protectedProcedure.query(async ({ ctx }) => {
    const templates = await ctx.db.query.demandProjects.findMany({
      where: and(
        eq(demandProjects.userId, ctx.session.user.id),
        eq(demandProjects.isTemplate, 1)
      ),
      orderBy: [desc(demandProjects.createdAt)],
    });

    return { templates };
  }),

  /**
   * Get a single demand project by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.id),
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
   * Create a new demand project
   */
  create: protectedProcedure
    .input(demandProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(demandProjects)
        .values({
          userId: ctx.session.user.id,
          title: input.title,
          reference: emptyToNull(input.reference),
          description: emptyToNull(input.description),
          // New demand fields
          departmentName: emptyToNull(input.departmentName),
          contactName: emptyToNull(input.contactName),
          contactEmail: emptyToNull(input.contactEmail),
          context: emptyToNull(input.context),
          constraints: emptyToNull(input.constraints),
          urgencyLevel: input.urgencyLevel ?? "medium",
          needType: input.needType ?? "autre",
          budgetRange: emptyToNull(input.budgetRange),
          budgetValidated: input.budgetValidated ? 1 : 0,
          desiredDeliveryDate: emptyToNull(input.desiredDeliveryDate),
          urgencyJustification: emptyToNull(input.urgencyJustification),
          // Legacy fields
          buyerName: emptyToNull(input.buyerName),
          buyerType: input.buyerType ?? null,
          estimatedAmount: input.estimatedAmount ?? null,
          lotNumber: emptyToNull(input.lotNumber),
          publicationDate: emptyToNull(input.publicationDate),
          submissionDeadline: input.submissionDeadline ? new Date(input.submissionDeadline) : null,
          sourceUrl: emptyToNull(input.sourceUrl),
          sourcePlatform: emptyToNull(input.sourcePlatform),
          notes: emptyToNull(input.notes),
          status: DEMAND_STATUS.DRAFT,
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
   * Update an existing demand project
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: demandProjectSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.id),
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
        .update(demandProjects)
        .set({
          title: input.data.title,
          reference: emptyToNull(input.data.reference),
          description: emptyToNull(input.data.description),
          // New demand fields
          departmentName: emptyToNull(input.data.departmentName),
          contactName: emptyToNull(input.data.contactName),
          contactEmail: emptyToNull(input.data.contactEmail),
          context: emptyToNull(input.data.context),
          constraints: emptyToNull(input.data.constraints),
          urgencyLevel: input.data.urgencyLevel ?? "medium",
          needType: input.data.needType ?? "autre",
          budgetRange: emptyToNull(input.data.budgetRange),
          budgetValidated: input.data.budgetValidated ? 1 : 0,
          desiredDeliveryDate: emptyToNull(input.data.desiredDeliveryDate),
          urgencyJustification: emptyToNull(input.data.urgencyJustification),
          // Flexible sections
          sections: input.data.sections ?? null,
          // Legacy fields
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
        .where(eq(demandProjects.id, input.id))
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
        status: z.enum(["draft", "in_review", "approved", "sent_to_admin", "converted_to_ao"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.id),
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
        .update(demandProjects)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(demandProjects.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Update project sections only (optimized for autosave)
   */
  updateSections: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        sections: z.array(sectionSchema),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.id),
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

      // Also update the legacy context, description, constraints fields for compatibility
      const contextSection = input.sections.find((s) => s.id === "context");
      const descriptionSection = input.sections.find((s) => s.id === "description");
      const constraintsSection = input.sections.find((s) => s.id === "constraints");

      const [updated] = await ctx.db
        .update(demandProjects)
        .set({
          sections: input.sections,
          context: contextSection?.content ?? existing.context,
          description: descriptionSection?.content ?? existing.description,
          constraints: constraintsSection?.content ?? existing.constraints,
          updatedAt: new Date(),
        })
        .where(eq(demandProjects.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Archive a demand project
   */
  archive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.id),
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
        .update(demandProjects)
        .set({
          status: DEMAND_STATUS.ARCHIVED,
          archivedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(demandProjects.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Unarchive a demand project
   */
  unarchive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.id),
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
        .update(demandProjects)
        .set({
          status: DEMAND_STATUS.DRAFT,
          archivedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(demandProjects.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Duplicate a project as template or new project
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
      const source = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.id),
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
        .insert(demandProjects)
        .values({
          userId: ctx.session.user.id,
          title: input.newTitle ?? `${source.title} (copie)`,
          reference: null,
          description: source.description,
          // New demand fields
          departmentName: source.departmentName,
          contactName: input.asTemplate ? null : source.contactName,
          contactEmail: input.asTemplate ? null : source.contactEmail,
          context: source.context,
          constraints: source.constraints,
          urgencyLevel: source.urgencyLevel,
          needType: source.needType,
          budgetRange: input.asTemplate ? null : source.budgetRange,
          budgetValidated: 0, // Reset budget validation status
          desiredDeliveryDate: null,
          urgencyJustification: source.urgencyJustification,
          // Legacy fields
          buyerName: input.asTemplate ? null : source.buyerName,
          buyerType: source.buyerType,
          estimatedAmount: input.asTemplate ? null : source.estimatedAmount,
          lotNumber: null,
          publicationDate: null,
          submissionDeadline: null,
          sourceUrl: input.asTemplate ? null : source.sourceUrl,
          sourcePlatform: source.sourcePlatform,
          notes: source.notes,
          status: DEMAND_STATUS.DRAFT,
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
   * Delete a demand project
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.id),
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

      // Cannot delete if already sent to admin or converted to AO
      if (existing.status === "sent_to_admin" || existing.status === "converted_to_ao") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Impossible de supprimer un dossier déjà envoyé à l'administration",
        });
      }

      await ctx.db
        .delete(demandProjects)
        .where(eq(demandProjects.id, input.id));

      return { success: true };
    }),
});
