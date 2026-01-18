import { TRPCError } from "@trpc/server";
import { eq, asc, and } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { demandChatMessages, demandProjects } from "~/server/db/schema/demands";
import {
  sendMessageToAssistant,
  generateGreetingMessage,
  generateSectionDraft,
  reformulateText,
  generateFollowUpQuestions,
  extractDocumentInfo,
  generateSuggestedCriteria,
  generateCopilotSuggestions,
  isAssistantConfigured,
  type ChatMessage,
  type GeneratableSection,
  type ExtractedDocumentInfo,
  type SuggestedCriterion,
  type CopilotAnalysis,
} from "~/server/services/ai/demand-assistant";
import {
  parseDocument,
  validateDocumentSize,
  isSupportedDocumentType,
} from "~/server/services/document/document-parser";

export const demandChatRouter = createTRPCRouter({
  /**
   * Get all messages for a demand project
   */
  getMessages: protectedProcedure
    .input(z.object({ demandProjectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify the user owns this project
      const project = await ctx.db.query.demandProjects.findFirst({
        where: and(
          eq(demandProjects.id, input.demandProjectId),
          eq(demandProjects.userId, ctx.session.user.id)
        ),
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dossier non trouvé",
        });
      }

      const messages = await ctx.db.query.demandChatMessages.findMany({
        where: eq(demandChatMessages.demandProjectId, input.demandProjectId),
        orderBy: asc(demandChatMessages.createdAt),
      });

      return messages;
    }),

  /**
   * Send a message and get an AI response
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        demandProjectId: z.string(),
        content: z.string().min(1).max(10000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the user owns this project
      const project = await ctx.db.query.demandProjects.findFirst({
        where: and(
          eq(demandProjects.id, input.demandProjectId),
          eq(demandProjects.userId, ctx.session.user.id)
        ),
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dossier non trouvé",
        });
      }

      // Check if AI is configured
      if (!isAssistantConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "L'assistant IA n'est pas configuré",
        });
      }

      // Get existing chat history
      const existingMessages = await ctx.db.query.demandChatMessages.findMany({
        where: eq(demandChatMessages.demandProjectId, input.demandProjectId),
        orderBy: asc(demandChatMessages.createdAt),
      });

      // Build chat history for the AI
      const chatHistory: ChatMessage[] = existingMessages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      // Save the user's message
      const [userMessage] = await ctx.db
        .insert(demandChatMessages)
        .values({
          demandProjectId: input.demandProjectId,
          role: "user",
          content: input.content,
        })
        .returning();

      try {
        // Get AI response
        const response = await sendMessageToAssistant(
          input.content,
          chatHistory,
          project
        );

        // Save the assistant's response
        const [assistantMessage] = await ctx.db
          .insert(demandChatMessages)
          .values({
            demandProjectId: input.demandProjectId,
            role: "assistant",
            content: response.content,
            metadata: {
              tokenCount: response.tokenCount,
              model: response.model,
            },
          })
          .returning();

        return {
          userMessage,
          assistantMessage,
        };
      } catch (error) {
        // If AI fails, still return the user message but with an error
        console.error("AI Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Erreur lors de la communication avec l'assistant",
        });
      }
    }),

  /**
   * Clear chat history for a demand project
   */
  clearHistory: protectedProcedure
    .input(z.object({ demandProjectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify the user owns this project
      const project = await ctx.db.query.demandProjects.findFirst({
        where: and(
          eq(demandProjects.id, input.demandProjectId),
          eq(demandProjects.userId, ctx.session.user.id)
        ),
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dossier non trouvé",
        });
      }

      await ctx.db
        .delete(demandChatMessages)
        .where(eq(demandChatMessages.demandProjectId, input.demandProjectId));

      return { success: true };
    }),

  /**
   * Check if AI assistant is available
   */
  isAvailable: protectedProcedure.query(() => {
    return { available: isAssistantConfigured() };
  }),

  /**
   * Get a greeting message based on the project state
   */
  getGreeting: protectedProcedure
    .input(z.object({ demandProjectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.query.demandProjects.findFirst({
        where: and(
          eq(demandProjects.id, input.demandProjectId),
          eq(demandProjects.userId, ctx.session.user.id)
        ),
      });

      return {
        message: generateGreetingMessage(project ?? null),
      };
    }),

  /**
   * Generate a draft for a specific section
   */
  generateDraft: protectedProcedure
    .input(
      z.object({
        demandProjectId: z.string(),
        section: z.enum(["context", "description", "constraints"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the user owns this project
      const project = await ctx.db.query.demandProjects.findFirst({
        where: and(
          eq(demandProjects.id, input.demandProjectId),
          eq(demandProjects.userId, ctx.session.user.id)
        ),
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dossier non trouvé",
        });
      }

      // Check if AI is configured
      if (!isAssistantConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "L'assistant IA n'est pas configuré",
        });
      }

      try {
        const response = await generateSectionDraft(
          input.section as GeneratableSection,
          project
        );

        return {
          content: response.content,
          section: input.section,
          tokenCount: response.tokenCount,
        };
      } catch (error) {
        console.error("Draft generation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Erreur lors de la génération du brouillon",
        });
      }
    }),

  /**
   * Reformulate text to make it more professional
   */
  reformulate: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(10000),
      })
    )
    .mutation(async ({ input }) => {
      // Check if AI is configured
      if (!isAssistantConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "L'assistant IA n'est pas configuré",
        });
      }

      try {
        const response = await reformulateText(input.text);

        return {
          original: input.text,
          reformulated: response.content,
          tokenCount: response.tokenCount,
        };
      } catch (error) {
        console.error("Reformulation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Erreur lors de la reformulation du texte",
        });
      }
    }),

  /**
   * Get follow-up questions based on project state
   */
  getFollowUpQuestions: protectedProcedure
    .input(z.object({ demandProjectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify the user owns this project
      const project = await ctx.db.query.demandProjects.findFirst({
        where: and(
          eq(demandProjects.id, input.demandProjectId),
          eq(demandProjects.userId, ctx.session.user.id)
        ),
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dossier non trouvé",
        });
      }

      // Check if AI is configured
      if (!isAssistantConfigured()) {
        return { questions: [], available: false };
      }

      try {
        const questions = await generateFollowUpQuestions(project);
        return { questions, available: true };
      } catch (error) {
        console.error("Follow-up questions error:", error);
        return { questions: [], available: true, error: "Erreur lors de la génération" };
      }
    }),

  /**
   * Import document and extract information using AI
   */
  importDocument: protectedProcedure
    .input(
      z.object({
        fileData: z.string(), // Base64 encoded file
        fileName: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }): Promise<{
      success: boolean;
      extracted: ExtractedDocumentInfo;
      documentInfo: { fileName: string; format: string; wordCount: number };
    }> => {
      // Validate mime type
      if (!isSupportedDocumentType(input.mimeType)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Type de fichier non supporté. Formats acceptés: PDF, Word (.docx, .doc)",
        });
      }

      // Check if AI is configured
      if (!isAssistantConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "L'assistant IA n'est pas configuré",
        });
      }

      // Decode base64 to buffer
      const buffer = Buffer.from(input.fileData, "base64");

      // Validate file size (max 10MB)
      if (!validateDocumentSize(buffer.length, 10)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Le fichier est trop volumineux. Taille maximum: 10 Mo",
        });
      }

      try {
        // Parse document to extract text
        const parseResult = await parseDocument(buffer, input.mimeType);

        if (!parseResult.text.trim()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Le document ne contient pas de texte extractible",
          });
        }

        // Use AI to extract structured information
        const extracted = await extractDocumentInfo(parseResult.text, parseResult.format);

        return {
          success: true,
          extracted,
          documentInfo: {
            fileName: input.fileName,
            format: parseResult.format.toUpperCase(),
            wordCount: parseResult.wordCount,
          },
        };
      } catch (error) {
        console.error("Document import error:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Erreur lors de l'import du document",
        });
      }
    }),

  /**
   * Generate suggested criteria based on project
   */
  generateCriteria: protectedProcedure
    .input(z.object({ demandProjectId: z.string() }))
    .mutation(async ({ ctx, input }): Promise<{
      criteria: SuggestedCriterion[];
      totalWeight: number;
      recommendations?: string[];
    }> => {
      // Verify the user owns this project
      const project = await ctx.db.query.demandProjects.findFirst({
        where: and(
          eq(demandProjects.id, input.demandProjectId),
          eq(demandProjects.userId, ctx.session.user.id)
        ),
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dossier non trouvé",
        });
      }

      // Check if AI is configured
      if (!isAssistantConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "L'assistant IA n'est pas configuré",
        });
      }

      try {
        const result = await generateSuggestedCriteria(project);
        return result;
      } catch (error) {
        console.error("Criteria generation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Erreur lors de la génération des critères",
        });
      }
    }),

  /**
   * Save criteria to project
   */
  saveCriteria: protectedProcedure
    .input(
      z.object({
        demandProjectId: z.string(),
        criteria: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
            weight: z.number().min(0).max(100),
            category: z.enum(["technical", "quality", "price", "other"]),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the user owns this project
      const project = await ctx.db.query.demandProjects.findFirst({
        where: and(
          eq(demandProjects.id, input.demandProjectId),
          eq(demandProjects.userId, ctx.session.user.id)
        ),
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dossier non trouvé",
        });
      }

      // Convert criteria array to SuggestedCriteria format for storage
      const suggestedCriteria = {
        technicalCriteria: input.criteria
          .filter((c) => c.category === "technical")
          .map((c) => `${c.name} (${c.weight}%): ${c.description}`),
        qualityCriteria: input.criteria
          .filter((c) => c.category === "quality")
          .map((c) => `${c.name} (${c.weight}%): ${c.description}`),
        priceCriteria: input.criteria
          .filter((c) => c.category === "price")
          .map((c) => `${c.name} (${c.weight}%): ${c.description}`),
        otherCriteria: input.criteria
          .filter((c) => c.category === "other")
          .map((c) => `${c.name} (${c.weight}%): ${c.description}`),
      };

      await ctx.db
        .update(demandProjects)
        .set({
          suggestedCriteria,
          updatedAt: new Date(),
        })
        .where(eq(demandProjects.id, input.demandProjectId));

      return { success: true };
    }),

  /**
   * Get copilot suggestions for a demand project
   */
  getCopilotSuggestions: protectedProcedure
    .input(z.object({ demandProjectId: z.string() }))
    .query(async ({ ctx, input }): Promise<CopilotAnalysis> => {
      // Verify the user owns this project
      const project = await ctx.db.query.demandProjects.findFirst({
        where: and(
          eq(demandProjects.id, input.demandProjectId),
          eq(demandProjects.userId, ctx.session.user.id)
        ),
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dossier non trouvé",
        });
      }

      try {
        const analysis = await generateCopilotSuggestions(project);
        return analysis;
      } catch (error) {
        console.error("Copilot suggestions error:", error);
        // Return empty suggestions on error instead of throwing
        return {
          suggestions: [],
          completionScore: 0,
          missingFields: [],
          incompleteFields: [],
        };
      }
    }),
});
