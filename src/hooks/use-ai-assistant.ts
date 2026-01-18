"use client";

import { useState, useCallback, useMemo } from "react";
import { api } from "~/trpc/react";
import type { AIAssistantMessage, AIAssistantMode } from "~/server/db/schema/demands";

interface UseAIAssistantOptions {
  projectId: string;
  moduleId: string;
  questionId: string;
  questionLabel: string;
  /** Suggested options to include in AI context (e.g., checkbox options) */
  suggestedOptions?: string[];
}

interface AnalysisResult {
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
}

interface CompletionSuggestion {
  id: string;
  label: string;
  preview: string;
}

interface UseAIAssistantReturn {
  // State
  conversation: ReturnType<typeof api.aiAssistant.getConversation.useQuery>["data"];
  messages: AIAssistantMessage[];
  generatedText: string;
  mode: AIAssistantMode;
  isComplete: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Analysis (Expert mode)
  analysis: AnalysisResult | null;
  completionSuggestions: CompletionSuggestion[];

  // Actions
  initConversation: (mode?: AIAssistantMode) => Promise<void>;
  sendResponse: (response: string) => Promise<{
    integratedText: string;
    nextQuestion: string | null;
    options: string[] | null;
    example: string | null;
    isComplete: boolean;
  }>;
  validateResponse: () => Promise<void>;
  completeConversation: () => Promise<void>;
  applySuggestion: (suggestionId: string, preview: string) => Promise<void>;
  analyzeText: (text: string) => Promise<AnalysisResult>;
  generateSuggestion: (suggestionType: string, currentText: string) => Promise<{
    action: string;
    text: string;
    position: string | null;
  }>;
  askQuestion: (question: string, currentText: string) => Promise<{
    answer: string;
    suggestion: { label: string | null; text: string | null };
  }>;
  setMode: (mode: AIAssistantMode) => Promise<void>;
  saveToSection: () => Promise<{ success: boolean; text: string }>;
  resetConversation: () => void;

  // Mutation states
  isInitializing: boolean;
  isSending: boolean;
  isAnalyzing: boolean;
  isSaving: boolean;
}

export function useAIAssistant({
  projectId,
  moduleId,
  questionId,
  questionLabel,
  suggestedOptions,
}: UseAIAssistantOptions): UseAIAssistantReturn {
  const utils = api.useUtils();

  // Local state
  const [localMode, setLocalMode] = useState<AIAssistantMode>("guided");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [completionSuggestions, setCompletionSuggestions] = useState<CompletionSuggestion[]>([]);

  // Query existing conversation
  const { data: conversation, isLoading: isConversationLoading } =
    api.aiAssistant.getConversation.useQuery(
      { projectId, moduleId, questionId },
      { enabled: !!projectId && !!moduleId && !!questionId }
    );

  // Mutations
  const initMutation = api.aiAssistant.initConversation.useMutation({
    onSuccess: () => {
      void utils.aiAssistant.getConversation.invalidate({ projectId, moduleId, questionId });
    },
  });

  const processResponseMutation = api.aiAssistant.processResponse.useMutation({
    onSuccess: () => {
      void utils.aiAssistant.getConversation.invalidate({ projectId, moduleId, questionId });
    },
  });

  const validateMutation = api.aiAssistant.validateResponse.useMutation({
    onSuccess: () => {
      void utils.aiAssistant.getConversation.invalidate({ projectId, moduleId, questionId });
    },
  });

  const completeMutation = api.aiAssistant.completeConversation.useMutation();

  const applySuggestionMutation = api.aiAssistant.applySuggestion.useMutation({
    onSuccess: () => {
      void utils.aiAssistant.getConversation.invalidate({ projectId, moduleId, questionId });
    },
  });

  const analyzeMutation = api.aiAssistant.analyzeText.useMutation();

  const generateSuggestionMutation = api.aiAssistant.generateSuggestion.useMutation();

  const askQuestionMutation = api.aiAssistant.askQuestion.useMutation();

  const setModeMutation = api.aiAssistant.setMode.useMutation({
    onSuccess: () => {
      void utils.aiAssistant.getConversation.invalidate({ projectId, moduleId, questionId });
    },
  });

  const saveToSectionMutation = api.aiAssistant.saveToSection.useMutation({
    onSuccess: () => {
      void utils.aiAssistant.getConversation.invalidate({ projectId, moduleId, questionId });
      void utils.demandProjects.get.invalidate({ id: projectId });
    },
  });

  // Derived state
  const messages = useMemo(
    () => conversation?.messages ?? [],
    [conversation?.messages]
  );

  const generatedText = conversation?.generatedText ?? "";

  const mode = (conversation?.mode ?? localMode) as AIAssistantMode;

  const isComplete = conversation?.status === "completed";

  const isInitialized = !!conversation && messages.length > 0;

  // Actions
  const initConversation = useCallback(
    async (initMode: AIAssistantMode = "guided") => {
      setLocalMode(initMode);
      await initMutation.mutateAsync({
        projectId,
        moduleId,
        questionId,
        questionLabel,
        mode: initMode,
        suggestedOptions,
      });
    },
    [initMutation, projectId, moduleId, questionId, questionLabel, suggestedOptions]
  );

  const sendResponse = useCallback(
    async (response: string) => {
      if (!conversation?.id) {
        throw new Error("Conversation non initialisée");
      }

      const result = await processResponseMutation.mutateAsync({
        conversationId: conversation.id,
        userResponse: response,
      });

      return {
        integratedText: result.integratedText,
        nextQuestion: result.nextQuestion,
        options: result.options,
        example: result.example,
        isComplete: result.isComplete,
      };
    },
    [processResponseMutation, conversation?.id]
  );

  const validateResponse = useCallback(async () => {
    if (!conversation?.id) return;

    await validateMutation.mutateAsync({
      conversationId: conversation.id,
    });
  }, [validateMutation, conversation?.id]);

  const completeConversation = useCallback(async () => {
    if (!conversation?.id) return;

    const result = await completeMutation.mutateAsync({
      conversationId: conversation.id,
    });

    setCompletionSuggestions(result.suggestions);
  }, [completeMutation, conversation?.id]);

  const applySuggestion = useCallback(
    async (suggestionId: string, preview: string) => {
      if (!conversation?.id) return;

      await applySuggestionMutation.mutateAsync({
        conversationId: conversation.id,
        suggestionId,
        suggestionPreview: preview,
      });

      // Remove applied suggestion from list
      setCompletionSuggestions((prev) =>
        prev.filter((s) => s.id !== suggestionId)
      );
    },
    [applySuggestionMutation, conversation?.id]
  );

  const analyzeText = useCallback(
    async (text: string) => {
      const result = await analyzeMutation.mutateAsync({
        projectId,
        moduleId,
        questionId,
        currentText: text,
      });

      setAnalysis(result);
      return result;
    },
    [analyzeMutation, projectId, moduleId, questionId]
  );

  const generateSuggestion = useCallback(
    async (suggestionType: string, currentText: string) => {
      return generateSuggestionMutation.mutateAsync({
        projectId,
        moduleId,
        suggestionType,
        currentText,
      });
    },
    [generateSuggestionMutation, projectId, moduleId]
  );

  const askQuestion = useCallback(
    async (question: string, currentText: string) => {
      return askQuestionMutation.mutateAsync({
        projectId,
        moduleId,
        question,
        currentText,
      });
    },
    [askQuestionMutation, projectId, moduleId]
  );

  const setModeAction = useCallback(
    async (newMode: AIAssistantMode) => {
      setLocalMode(newMode);
      if (conversation?.id) {
        await setModeMutation.mutateAsync({
          conversationId: conversation.id,
          mode: newMode,
        });
      }
    },
    [setModeMutation, conversation?.id]
  );

  const saveToSection = useCallback(async () => {
    if (!conversation?.id) {
      throw new Error("Conversation non initialisée");
    }

    return saveToSectionMutation.mutateAsync({
      conversationId: conversation.id,
    });
  }, [saveToSectionMutation, conversation?.id]);

  const resetConversation = useCallback(() => {
    setAnalysis(null);
    setCompletionSuggestions([]);
    void utils.aiAssistant.getConversation.invalidate({ projectId, moduleId, questionId });
  }, [utils, projectId, moduleId, questionId]);

  return {
    // State
    conversation,
    messages,
    generatedText,
    mode,
    isComplete,
    isLoading: isConversationLoading,
    isInitialized,

    // Analysis
    analysis,
    completionSuggestions,

    // Actions
    initConversation,
    sendResponse,
    validateResponse,
    completeConversation,
    applySuggestion,
    analyzeText,
    generateSuggestion,
    askQuestion,
    setMode: setModeAction,
    saveToSection,
    resetConversation,

    // Mutation states
    isInitializing: initMutation.isPending,
    isSending: processResponseMutation.isPending,
    isAnalyzing: analyzeMutation.isPending,
    isSaving: saveToSectionMutation.isPending,
  };
}
