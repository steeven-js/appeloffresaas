/**
 * Wizard Router - tRPC procedures for the guided wizard
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { demandProjects } from "~/server/db/schema";
import type { DemandSection, WizardState, WizardAnswer } from "~/server/db/schema/demands";
import { getWizardConfig, getModuleById } from "~/lib/wizard/wizard-config";
import { createCompletion, isAIConfigured } from "~/server/services/ai/ai-provider";

/**
 * Answer value schema
 */
const answerValueSchema = z.union([
  z.string(),
  z.array(z.string()),
  z.number(),
  z.boolean(),
]);

/**
 * Wizard Router
 */
export const wizardRouter = createTRPCRouter({
  /**
   * Get wizard configuration (modules, questions)
   */
  getConfig: protectedProcedure
    .input(
      z.object({
        needType: z.string().optional(),
      }).optional()
    )
    .query(({ input }) => {
      return getWizardConfig(input?.needType);
    }),

  /**
   * Get current wizard state for a project
   */
  getState: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.projectId),
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

      return {
        wizardState: project.wizardState,
        sections: project.sections ?? [],
        interactionMode: project.interactionMode,
      };
    }),

  /**
   * Initialize wizard state for a project
   */
  initialize: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.projectId),
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

      // Build initial answers from existing project data (from creation form)
      const now = new Date().toISOString();
      const infoAnswers: WizardAnswer[] = [];

      // Map existing project fields to wizard answers
      if (project.title) {
        infoAnswers.push({
          questionId: "title",
          questionLabel: "Quel est le titre de votre demande ?",
          value: project.title,
          answeredAt: now,
        });
      }
      if (project.departmentName) {
        infoAnswers.push({
          questionId: "department",
          questionLabel: "Quel est le service demandeur ?",
          value: project.departmentName,
          answeredAt: now,
        });
      }
      if (project.contactName) {
        infoAnswers.push({
          questionId: "contact_name",
          questionLabel: "Qui est le responsable de cette demande ?",
          value: project.contactName,
          answeredAt: now,
        });
      }
      if (project.contactEmail) {
        infoAnswers.push({
          questionId: "contact_email",
          questionLabel: "Quel est l'email de contact ?",
          value: project.contactEmail,
          answeredAt: now,
        });
      }
      if (project.needType) {
        infoAnswers.push({
          questionId: "need_type",
          questionLabel: "Quel type de besoin souhaitez-vous exprimer ?",
          value: project.needType,
          answeredAt: now,
        });
      }
      if (project.urgencyLevel) {
        infoAnswers.push({
          questionId: "urgency",
          questionLabel: "Quel est le niveau d'urgence ?",
          value: project.urgencyLevel,
          answeredAt: now,
        });
      }

      // Build budget answers if available
      const budgetAnswers: WizardAnswer[] = [];
      if (project.budgetRange) {
        budgetAnswers.push({
          questionId: "budget_range",
          questionLabel: "Quelle est votre fourchette budgétaire ?",
          value: project.budgetRange,
          answeredAt: now,
        });
      }

      // Create initial wizard state
      const config = getWizardConfig();
      const infoModule = config.modules.find(m => m.id === "info");
      const infoQuestionsCount = infoModule?.questions.length ?? 6;

      const wizardState: WizardState = {
        currentModule: 0,
        currentQuestion: Math.min(infoAnswers.length, infoQuestionsCount - 1),
        startedAt: now,
        lastActivityAt: now,
        modules: {
          info: {
            status: infoAnswers.length >= infoQuestionsCount ? "completed" : infoAnswers.length > 0 ? "in_progress" : "pending",
            startedAt: infoAnswers.length > 0 ? now : undefined,
            answeredQuestions: infoAnswers.map(a => a.questionId),
          },
          ...(budgetAnswers.length > 0 && {
            budget: {
              status: "in_progress" as const,
              startedAt: now,
              answeredQuestions: budgetAnswers.map(a => a.questionId),
            },
          }),
        },
      };

      // Create initial sections based on modules
      const sections: DemandSection[] = config.modules.map((wizardModule, index) => {
        let answers: WizardAnswer[] = [];
        if (wizardModule.id === "info") {
          answers = infoAnswers;
        } else if (wizardModule.id === "budget") {
          answers = budgetAnswers;
        }

        return {
          id: wizardModule.id,
          title: wizardModule.title,
          content: "",
          isDefault: true,
          isRequired: ["context", "description"].includes(wizardModule.id),
          order: index,
          answers,
          generationCount: 0,
        };
      });

      const [updated] = await ctx.db
        .update(demandProjects)
        .set({
          wizardState,
          sections,
          interactionMode: "wizard",
          updatedAt: new Date(),
        })
        .where(eq(demandProjects.id, input.projectId))
        .returning();

      return updated;
    }),

  /**
   * Save an answer to a question
   */
  saveAnswer: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        moduleId: z.string(),
        questionId: z.string(),
        questionLabel: z.string(),
        value: answerValueSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.projectId),
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

      // Update sections with the new answer
      const sections = (project.sections ?? []).map((s) => ({ ...s }));
      let sectionIndex = sections.findIndex((s) => s.id === input.moduleId);

      const newAnswer: WizardAnswer = {
        questionId: input.questionId,
        questionLabel: input.questionLabel,
        value: input.value,
        answeredAt: new Date().toISOString(),
      };

      if (sectionIndex >= 0) {
        const section = sections[sectionIndex]!;
        const answers = [...(section.answers ?? [])];
        const answerIndex = answers.findIndex((a) => a.questionId === input.questionId);

        if (answerIndex >= 0) {
          answers[answerIndex] = newAnswer;
        } else {
          answers.push(newAnswer);
        }

        sections[sectionIndex] = { ...section, answers };
      } else {
        // Create section if it doesn't exist
        const wizardModule = getModuleById(input.moduleId);
        sections.push({
          id: input.moduleId,
          title: wizardModule?.title ?? input.moduleId,
          content: "",
          isDefault: true,
          isRequired: ["context", "description"].includes(input.moduleId),
          order: sections.length,
          answers: [newAnswer],
          generationCount: 0,
        });
        sectionIndex = sections.length - 1;
      }

      // Update wizard state
      const wizardState: WizardState = project.wizardState ?? {
        currentModule: 0,
        currentQuestion: 0,
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        modules: {},
      };

      wizardState.modules[input.moduleId] ??= {
        status: "in_progress",
        startedAt: new Date().toISOString(),
        answeredQuestions: [],
      };

      const moduleState = wizardState.modules[input.moduleId]!;

      // Only count as answered if value is meaningful (non-empty)
      const isAnswerMeaningful = Array.isArray(input.value)
        ? input.value.length > 0
        : input.value !== undefined && input.value !== "";

      if (isAnswerMeaningful && !moduleState.answeredQuestions.includes(input.questionId)) {
        moduleState.answeredQuestions.push(input.questionId);
      } else if (!isAnswerMeaningful && moduleState.answeredQuestions.includes(input.questionId)) {
        // Remove from answered if value becomes empty (user cleared their answer)
        moduleState.answeredQuestions = moduleState.answeredQuestions.filter(q => q !== input.questionId);
      }

      wizardState.lastActivityAt = new Date().toISOString();

      // Also update legacy fields if applicable
      const updateData: Record<string, unknown> = {
        sections,
        wizardState,
        updatedAt: new Date(),
      };

      // Map wizard answers to legacy fields
      if (input.moduleId === "info") {
        if (input.questionId === "title" && typeof input.value === "string") {
          updateData.title = input.value;
        }
        if (input.questionId === "department" && typeof input.value === "string") {
          updateData.departmentName = input.value;
        }
        if (input.questionId === "contact_name" && typeof input.value === "string") {
          updateData.contactName = input.value;
        }
        if (input.questionId === "contact_email" && typeof input.value === "string") {
          updateData.contactEmail = input.value;
        }
        if (input.questionId === "need_type" && typeof input.value === "string") {
          updateData.needType = input.value;
        }
        if (input.questionId === "urgency" && typeof input.value === "string") {
          updateData.urgencyLevel = input.value;
        }
      }

      if (input.moduleId === "budget") {
        if (input.questionId === "budget_range" && typeof input.value === "string") {
          updateData.budgetRange = input.value;
        }
        if (input.questionId === "budget_precise" && typeof input.value === "number") {
          updateData.estimatedAmount = input.value;
        }
        if (input.questionId === "budget_validated" && typeof input.value === "string") {
          updateData.budgetValidated = input.value === "yes" ? 1 : 0;
        }
        if (input.questionId === "delivery_date" && typeof input.value === "string") {
          updateData.desiredDeliveryDate = input.value;
        }
        if (input.questionId === "date_justification" && typeof input.value === "string") {
          updateData.urgencyJustification = input.value;
        }
      }

      const [updated] = await ctx.db
        .update(demandProjects)
        .set(updateData)
        .where(eq(demandProjects.id, input.projectId))
        .returning();

      return updated;
    }),

  /**
   * Generate content for a module using AI
   */
  generateContent: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        moduleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.projectId),
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

      const sections = project.sections ?? [];
      const section = sections.find((s) => s.id === input.moduleId);

      if (!section?.answers?.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Aucune réponse à assembler",
        });
      }

      // Get module config for the prompt
      const wizardModule = getModuleById(input.moduleId);
      if (!wizardModule?.assemblePrompt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ce module ne supporte pas la génération de contenu",
        });
      }

      // Build prompt with answers
      let prompt = wizardModule.assemblePrompt;
      for (const answer of section.answers) {
        const placeholder = `{${answer.questionId}}`;
        let valueStr: string;

        if (Array.isArray(answer.value)) {
          valueStr = answer.value.join(", ");
        } else if (typeof answer.value === "boolean") {
          valueStr = answer.value ? "Oui" : "Non";
        } else {
          valueStr = String(answer.value);
        }

        prompt = prompt.replace(placeholder, valueStr);
      }

      // Handle conditional answers placeholder
      prompt = prompt.replace("{conditional_answers}", "");

      // Add context about the project
      prompt = prompt
        .replace("{need_type}", project.needType ?? "autre")
        .replace("{department}", project.departmentName ?? "Non spécifié")
        .replace("{urgency}", project.urgencyLevel ?? "medium");

      // Check if AI is configured
      if (!isAIConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "L'IA n'est pas configurée. Veuillez configurer les clés API.",
        });
      }

      // Call AI to generate content
      const result = await createCompletion(
        [
          {
            role: "system",
            content: "Tu es un expert en rédaction de dossiers de marchés publics français. Tu rédiges de manière professionnelle, claire et structurée.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        { maxTokens: 1000 }
      );

      return { content: result.content };
    }),

  /**
   * Validate a module (save final content)
   */
  validateModule: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        moduleId: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.projectId),
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

      // Update section with validated content
      const sections = (project.sections ?? []).map((s) => ({ ...s }));
      const sectionIndex = sections.findIndex((s) => s.id === input.moduleId);

      if (sectionIndex >= 0) {
        const currentSection = sections[sectionIndex]!;
        sections[sectionIndex] = {
          ...currentSection,
          content: input.content,
          validatedAt: new Date().toISOString(),
          generationCount: (currentSection.generationCount ?? 0) + 1,
        };
      }

      // Update wizard state
      const wizardState: WizardState = project.wizardState ?? {
        currentModule: 0,
        currentQuestion: 0,
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        modules: {},
      };

      wizardState.modules[input.moduleId] = {
        ...wizardState.modules[input.moduleId],
        status: "completed",
        completedAt: new Date().toISOString(),
        validatedAt: new Date().toISOString(),
        answeredQuestions: wizardState.modules[input.moduleId]?.answeredQuestions ?? [],
      };

      // Build update data with legacy field mapping
      const updateData: Record<string, unknown> = {
        sections,
        wizardState,
        updatedAt: new Date(),
      };

      // Map to legacy fields
      const legacyFieldMap: Record<string, string> = {
        context: "context",
        description: "description",
        constraints: "constraints",
      };

      const legacyField = legacyFieldMap[input.moduleId];
      if (legacyField) {
        updateData[legacyField] = input.content;
      }

      const [updated] = await ctx.db
        .update(demandProjects)
        .set(updateData)
        .where(eq(demandProjects.id, input.projectId))
        .returning();

      return updated;
    }),

  /**
   * Update wizard navigation state
   */
  navigate: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        moduleIndex: z.number(),
        questionIndex: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.projectId),
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

      const wizardState: WizardState = project.wizardState ?? {
        currentModule: 0,
        currentQuestion: 0,
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        modules: {},
      };

      wizardState.currentModule = input.moduleIndex;
      if (input.questionIndex !== undefined) {
        wizardState.currentQuestion = input.questionIndex;
      }
      wizardState.lastActivityAt = new Date().toISOString();

      const [updated] = await ctx.db
        .update(demandProjects)
        .set({
          wizardState,
          updatedAt: new Date(),
        })
        .where(eq(demandProjects.id, input.projectId))
        .returning();

      return updated;
    }),

  /**
   * Switch interaction mode
   */
  setInteractionMode: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        mode: z.enum(["wizard", "chat", "manual"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.projectId),
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

      const [updated] = await ctx.db
        .update(demandProjects)
        .set({
          interactionMode: input.mode,
          updatedAt: new Date(),
        })
        .where(eq(demandProjects.id, input.projectId))
        .returning();

      return updated;
    }),
});
