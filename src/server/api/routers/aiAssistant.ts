/**
 * AI Assistant Router - tRPC procedures for the wizard AI assistant
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  demandProjects,
  aiAssistantConversations,
  type AIAssistantMessage,
} from "~/server/db/schema";
import { createCompletion, isAIConfigured } from "~/server/services/ai/ai-provider";
import {
  buildInitialPrompt,
  buildResponsePrompt,
  buildCompletionPrompt,
  buildAnalysisPrompt,
  buildSuggestionPrompt,
  buildUserQuestionPrompt,
  buildChoicesPrompt,
  buildAnswerFromChoicesPrompt,
  type PromptContext,
} from "~/lib/ai/assistant-prompts";

/**
 * Parse JSON response from AI, handling potential markdown code blocks
 */
function parseAIResponse<T>(content: string): T {
  // Remove markdown code blocks if present
  let cleaned = content.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erreur lors de l'analyse de la réponse IA",
    });
  }
}

/**
 * AI Assistant Router
 */
export const aiAssistantRouter = createTRPCRouter({
  /**
   * Get or create conversation for a module/question
   */
  getConversation: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      moduleId: z.string(),
      questionId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.projectId),
      });

      if (project?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Projet non trouvé",
        });
      }

      // Find existing conversation
      const conversation = await ctx.db.query.aiAssistantConversations.findFirst({
        where: and(
          eq(aiAssistantConversations.demandProjectId, input.projectId),
          eq(aiAssistantConversations.moduleId, input.moduleId),
          eq(aiAssistantConversations.questionId, input.questionId)
        ),
      });

      // Return null instead of undefined to satisfy React Query
      return conversation ?? null;
    }),

  /**
   * Initialize conversation with first AI question
   */
  initConversation: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      moduleId: z.string(),
      questionId: z.string(),
      questionLabel: z.string(),
      mode: z.enum(["guided", "expert"]).default("guided"),
      suggestedOptions: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!isAIConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "L'assistant IA n'est pas configuré",
        });
      }

      // Get project data
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.projectId),
      });

      if (project?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Projet non trouvé",
        });
      }

      // Check for existing conversation
      const existing = await ctx.db.query.aiAssistantConversations.findFirst({
        where: and(
          eq(aiAssistantConversations.demandProjectId, input.projectId),
          eq(aiAssistantConversations.moduleId, input.moduleId),
          eq(aiAssistantConversations.questionId, input.questionId)
        ),
      });

      // Delete existing conversation to start fresh (user clicked "Recommencer" or first init)
      if (existing) {
        await ctx.db
          .delete(aiAssistantConversations)
          .where(eq(aiAssistantConversations.id, existing.id));
      }

      // Build context for prompt
      const promptContext: PromptContext = {
        title: project.title,
        departmentName: project.departmentName ?? undefined,
        needType: project.needType ?? undefined,
        urgencyLevel: project.urgencyLevel ?? undefined,
        moduleId: input.moduleId,
        questionId: input.questionId,
        questionLabel: input.questionLabel,
        suggestedOptions: input.suggestedOptions,
      };

      // Generate first question
      const prompt = buildInitialPrompt(promptContext);
      const response = await createCompletion(
        [{ role: "system", content: prompt }],
        { maxTokens: 500, temperature: 0.7, jsonMode: true }
      );

      const parsed = parseAIResponse<{
        question: string;
        options: string[] | null;
        example: string;
        inputType: string;
      }>(response.content);

      // Create first message
      const firstMessage: AIAssistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: parsed.question,
        type: "question",
        options: parsed.options?.map((opt, i) => ({
          id: `opt_${i}`,
          label: opt,
          value: opt,
        })),
        example: parsed.example,
        timestamp: new Date().toISOString(),
      };

      // Create or update conversation
      if (existing) {
        const [updated] = await ctx.db
          .update(aiAssistantConversations)
          .set({
            messages: [firstMessage],
            mode: input.mode,
            status: "active",
            updatedAt: new Date(),
          })
          .where(eq(aiAssistantConversations.id, existing.id))
          .returning();
        return updated;
      }

      const [created] = await ctx.db
        .insert(aiAssistantConversations)
        .values({
          demandProjectId: input.projectId,
          moduleId: input.moduleId,
          questionId: input.questionId,
          mode: input.mode,
          status: "active",
          messages: [firstMessage],
        })
        .returning();

      return created;
    }),

  /**
   * Process user response and generate next question
   */
  processResponse: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      userResponse: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!isAIConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "L'assistant IA n'est pas configuré",
        });
      }

      // Get conversation
      const conversation = await ctx.db.query.aiAssistantConversations.findFirst({
        where: eq(aiAssistantConversations.id, input.conversationId),
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation non trouvée",
        });
      }

      // Get project
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, conversation.demandProjectId),
      });

      if (project?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Add user message
      const userMessage: AIAssistantMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: input.userResponse,
        type: "response",
        timestamp: new Date().toISOString(),
      };

      const messages = [...(conversation.messages ?? []), userMessage];

      // Build context
      const promptContext: PromptContext = {
        title: project.title,
        departmentName: project.departmentName ?? undefined,
        needType: project.needType ?? undefined,
        urgencyLevel: project.urgencyLevel ?? undefined,
        moduleId: conversation.moduleId,
        questionId: conversation.questionId,
        questionLabel: "", // Will be fetched from config if needed
        conversationHistory: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        currentText: conversation.generatedText ?? undefined,
      };

      // Generate response
      const prompt = buildResponsePrompt(promptContext);
      const response = await createCompletion(
        [{ role: "system", content: prompt }],
        { maxTokens: 1000, temperature: 0.7, jsonMode: true }
      );

      const parsed = parseAIResponse<{
        integratedText: string;
        question: string | null;
        options: string[] | null;
        example: string | null;
        inputType: string;
        isComplete: boolean;
      }>(response.content);

      // Create assistant message
      const assistantMessage: AIAssistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: parsed.question ?? "Votre texte est prêt !",
        type: parsed.isComplete ? "final" : "validation",
        options: parsed.options?.map((opt, i) => ({
          id: `opt_${i}`,
          label: opt,
          value: opt,
        })),
        example: parsed.example ?? undefined,
        generatedText: parsed.integratedText,
        timestamp: new Date().toISOString(),
      };

      messages.push(assistantMessage);

      // Update conversation
      const [updated] = await ctx.db
        .update(aiAssistantConversations)
        .set({
          messages,
          generatedText: parsed.integratedText,
          status: parsed.isComplete ? "completed" : "active",
          updatedAt: new Date(),
          completedAt: parsed.isComplete ? new Date() : null,
        })
        .where(eq(aiAssistantConversations.id, conversation.id))
        .returning();

      return {
        conversation: updated,
        integratedText: parsed.integratedText,
        nextQuestion: parsed.question,
        options: parsed.options,
        example: parsed.example,
        isComplete: parsed.isComplete,
      };
    }),

  /**
   * Validate user response (mark as validated and continue)
   */
  validateResponse: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const conversation = await ctx.db.query.aiAssistantConversations.findFirst({
        where: eq(aiAssistantConversations.id, input.conversationId),
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation non trouvée",
        });
      }

      // Verify ownership
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, conversation.demandProjectId),
      });

      if (project?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Mark last assistant message as validated
      const messages: AIAssistantMessage[] = [...(conversation.messages ?? [])];
      // Find last assistant message index (ES5 compatible)
      let lastAssistantIndex = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i]?.role === "assistant") {
          lastAssistantIndex = i;
          break;
        }
      }
      const lastMsg = messages[lastAssistantIndex];
      if (lastAssistantIndex >= 0 && lastMsg) {
        messages[lastAssistantIndex] = {
          id: lastMsg.id,
          role: lastMsg.role,
          content: lastMsg.content,
          type: "validation",
          options: lastMsg.options,
          generatedText: lastMsg.generatedText,
          example: lastMsg.example,
          timestamp: lastMsg.timestamp,
        };
      }

      const [updated] = await ctx.db
        .update(aiAssistantConversations)
        .set({
          messages,
          updatedAt: new Date(),
        })
        .where(eq(aiAssistantConversations.id, conversation.id))
        .returning();

      return updated;
    }),

  /**
   * Complete conversation and get final suggestions
   */
  completeConversation: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!isAIConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "L'assistant IA n'est pas configuré",
        });
      }

      const conversation = await ctx.db.query.aiAssistantConversations.findFirst({
        where: eq(aiAssistantConversations.id, input.conversationId),
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation non trouvée",
        });
      }

      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, conversation.demandProjectId),
      });

      if (project?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Build prompt for completion suggestions
      const promptContext: PromptContext = {
        title: project.title,
        departmentName: project.departmentName ?? undefined,
        needType: project.needType ?? undefined,
        urgencyLevel: project.urgencyLevel ?? undefined,
        moduleId: conversation.moduleId,
        questionId: conversation.questionId,
        questionLabel: "",
        currentText: conversation.generatedText ?? undefined,
      };

      const prompt = buildCompletionPrompt(promptContext);
      const response = await createCompletion(
        [{ role: "system", content: prompt }],
        { maxTokens: 500, temperature: 0.7, jsonMode: true }
      );

      const parsed = parseAIResponse<{
        textIsComplete: boolean;
        suggestions: Array<{
          id: string;
          label: string;
          preview: string;
        }>;
      }>(response.content);

      return {
        textIsComplete: parsed.textIsComplete,
        suggestions: parsed.suggestions,
        generatedText: conversation.generatedText,
      };
    }),

  /**
   * Apply a suggestion to the text
   */
  applySuggestion: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      suggestionId: z.string(),
      suggestionPreview: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const conversation = await ctx.db.query.aiAssistantConversations.findFirst({
        where: eq(aiAssistantConversations.id, input.conversationId),
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation non trouvée",
        });
      }

      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, conversation.demandProjectId),
      });

      if (project?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Append suggestion to text
      const currentText = conversation.generatedText ?? "";
      const newText = currentText + " " + input.suggestionPreview;

      const [updated] = await ctx.db
        .update(aiAssistantConversations)
        .set({
          generatedText: newText.trim(),
          updatedAt: new Date(),
        })
        .where(eq(aiAssistantConversations.id, conversation.id))
        .returning();

      return {
        generatedText: updated?.generatedText,
      };
    }),

  /**
   * Analyze text (Expert mode)
   */
  analyzeText: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      moduleId: z.string(),
      questionId: z.string(),
      currentText: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!isAIConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "L'assistant IA n'est pas configuré",
        });
      }

      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.projectId),
      });

      if (project?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Projet non trouvé",
        });
      }

      const promptContext: PromptContext = {
        title: project.title,
        departmentName: project.departmentName ?? undefined,
        needType: project.needType ?? undefined,
        urgencyLevel: project.urgencyLevel ?? undefined,
        moduleId: input.moduleId,
        questionId: input.questionId,
        questionLabel: "",
        currentText: input.currentText,
      };

      const prompt = buildAnalysisPrompt(promptContext);
      const response = await createCompletion(
        [{ role: "system", content: prompt }],
        { maxTokens: 500, temperature: 0.5, jsonMode: true }
      );

      const parsed = parseAIResponse<{
        strengths: string[];
        suggestions: Array<{
          id: string;
          type: string;
          label: string;
          priority: string;
          preview: string;
        }>;
        missingPoints: string[];
        completenessScore: number;
      }>(response.content);

      return parsed;
    }),

  /**
   * Generate suggestion text (Expert mode)
   */
  generateSuggestion: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      moduleId: z.string(),
      suggestionType: z.string(),
      currentText: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!isAIConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "L'assistant IA n'est pas configuré",
        });
      }

      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.projectId),
      });

      if (project?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Projet non trouvé",
        });
      }

      const promptContext: PromptContext = {
        title: project.title,
        departmentName: project.departmentName ?? undefined,
        needType: project.needType ?? undefined,
        urgencyLevel: project.urgencyLevel ?? undefined,
        moduleId: input.moduleId,
        questionId: "",
        questionLabel: "",
        currentText: input.currentText,
      };

      const prompt = buildSuggestionPrompt(promptContext, input.suggestionType);
      const response = await createCompletion(
        [{ role: "system", content: prompt }],
        { maxTokens: 300, temperature: 0.7, jsonMode: true }
      );

      const parsed = parseAIResponse<{
        action: string;
        text: string;
        position: string | null;
      }>(response.content);

      return parsed;
    }),

  /**
   * User asks a question to the AI
   */
  askQuestion: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      moduleId: z.string(),
      question: z.string(),
      currentText: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!isAIConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "L'assistant IA n'est pas configuré",
        });
      }

      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.projectId),
      });

      if (project?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Projet non trouvé",
        });
      }

      const promptContext: PromptContext = {
        title: project.title,
        departmentName: project.departmentName ?? undefined,
        needType: project.needType ?? undefined,
        urgencyLevel: project.urgencyLevel ?? undefined,
        moduleId: input.moduleId,
        questionId: "",
        questionLabel: "",
        currentText: input.currentText,
      };

      const prompt = buildUserQuestionPrompt(promptContext, input.question);
      const response = await createCompletion(
        [{ role: "system", content: prompt }],
        { maxTokens: 500, temperature: 0.7, jsonMode: true }
      );

      const parsed = parseAIResponse<{
        answer: string;
        suggestion: {
          label: string | null;
          text: string | null;
        };
      }>(response.content);

      return parsed;
    }),

  /**
   * Update conversation mode
   */
  setMode: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      mode: z.enum(["guided", "expert"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const conversation = await ctx.db.query.aiAssistantConversations.findFirst({
        where: eq(aiAssistantConversations.id, input.conversationId),
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation non trouvée",
        });
      }

      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, conversation.demandProjectId),
      });

      if (project?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      const [updated] = await ctx.db
        .update(aiAssistantConversations)
        .set({
          mode: input.mode,
          updatedAt: new Date(),
        })
        .where(eq(aiAssistantConversations.id, conversation.id))
        .returning();

      return updated;
    }),

  /**
   * Save generated text to section
   */
  saveToSection: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const conversation = await ctx.db.query.aiAssistantConversations.findFirst({
        where: eq(aiAssistantConversations.id, input.conversationId),
      });

      if (!conversation?.generatedText) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation ou texte non trouvé",
        });
      }

      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, conversation.demandProjectId),
      });

      if (project?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès non autorisé",
        });
      }

      // Update the section with generated text
      const sections = project.sections ?? [];
      const sectionIndex = sections.findIndex(s => s.id === conversation.moduleId);

      if (sectionIndex >= 0) {
        sections[sectionIndex]!.content = conversation.generatedText;
      }

      // Also update legacy fields if applicable
      const updateData: Record<string, unknown> = {
        sections,
        updatedAt: new Date(),
      };

      if (conversation.moduleId === "context") {
        updateData.context = conversation.generatedText;
      } else if (conversation.moduleId === "description") {
        updateData.description = conversation.generatedText;
      } else if (conversation.moduleId === "constraints") {
        updateData.constraints = conversation.generatedText;
      }

      await ctx.db
        .update(demandProjects)
        .set(updateData)
        .where(eq(demandProjects.id, project.id));

      // Mark conversation as completed
      await ctx.db
        .update(aiAssistantConversations)
        .set({
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(aiAssistantConversations.id, conversation.id));

      return { success: true, text: conversation.generatedText };
    }),

  /**
   * Generate dynamic choices for guided mode
   * Returns 5 contextual suggestions based on project data and previous answers
   */
  generateChoices: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      moduleId: z.string(),
      questionId: z.string(),
      questionLabel: z.string(),
      existingChoices: z.array(z.string()).optional(),
      previousAnswers: z.record(z.object({
        questionLabel: z.string(),
        value: z.string(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!isAIConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "L'assistant IA n'est pas configuré",
        });
      }

      // Get project data
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.projectId),
      });

      if (project?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Projet non trouvé",
        });
      }

      // Build context for prompt
      const promptContext: PromptContext = {
        title: project.title,
        departmentName: project.departmentName ?? undefined,
        needType: project.needType ?? undefined,
        urgencyLevel: project.urgencyLevel ?? undefined,
        moduleId: input.moduleId,
        questionId: input.questionId,
        questionLabel: input.questionLabel,
        previousAnswers: input.previousAnswers,
      };

      // Generate choices
      const prompt = buildChoicesPrompt(promptContext, input.existingChoices);
      const response = await createCompletion(
        [{ role: "system", content: prompt }],
        { maxTokens: 500, temperature: 0.8, jsonMode: true }
      );

      const parsed = parseAIResponse<{
        choices: string[];
      }>(response.content);

      return {
        choices: parsed.choices,
      };
    }),

  /**
   * Generate final answer from selected choices
   * Creates a well-structured professional text from user's selections
   */
  generateAnswerFromChoices: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      moduleId: z.string(),
      questionId: z.string(),
      questionLabel: z.string(),
      selectedChoices: z.array(z.string()),
      freeInput: z.string().optional(),
      previousAnswers: z.record(z.object({
        questionLabel: z.string(),
        value: z.string(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!isAIConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "L'assistant IA n'est pas configuré",
        });
      }

      // Validate that at least one choice is selected
      if (input.selectedChoices.length === 0 && !input.freeInput) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Veuillez sélectionner au moins un choix ou saisir du texte libre",
        });
      }

      // Get project data
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.projectId),
      });

      if (project?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Projet non trouvé",
        });
      }

      // Build context for prompt
      const promptContext: PromptContext = {
        title: project.title,
        departmentName: project.departmentName ?? undefined,
        needType: project.needType ?? undefined,
        urgencyLevel: project.urgencyLevel ?? undefined,
        moduleId: input.moduleId,
        questionId: input.questionId,
        questionLabel: input.questionLabel,
        previousAnswers: input.previousAnswers,
      };

      // Generate answer from choices
      const prompt = buildAnswerFromChoicesPrompt(
        promptContext,
        input.selectedChoices,
        input.freeInput
      );
      const response = await createCompletion(
        [{ role: "system", content: prompt }],
        { maxTokens: 800, temperature: 0.7, jsonMode: true }
      );

      const parsed = parseAIResponse<{
        generatedText: string;
      }>(response.content);

      return {
        generatedText: parsed.generatedText,
      };
    }),
});
