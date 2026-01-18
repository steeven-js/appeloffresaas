"use client";

import { useState, useCallback, useMemo } from "react";
import { api } from "~/trpc/react";

interface GeneratedChoice {
  id: string;
  label: string;
  source: "ai" | "user";
  generationRound: number;
}

interface UseGuidedChoicesOptions {
  projectId: string;
  moduleId: string;
  questionId: string;
  questionLabel: string;
  previousAnswers?: Record<string, { questionLabel: string; value: string }>;
  maxGenerations?: number;
}

interface UseGuidedChoicesReturn {
  // State
  choices: GeneratedChoice[];
  selectedIds: Set<string>;
  freeInputValue: string;
  generationCount: number;
  maxGenerations: number;
  generatedText: string | null;

  // Loading states
  isGeneratingChoices: boolean;
  isGeneratingAnswer: boolean;

  // Computed
  canGenerateMore: boolean;
  hasSelections: boolean;
  selectedChoicesLabels: string[];

  // Actions
  generateInitialChoices: () => Promise<void>;
  generateMoreChoices: () => Promise<void>;
  toggleChoice: (choiceId: string) => void;
  setFreeInput: (value: string) => void;
  addFreeInputAsChoice: () => void;
  generateAnswer: () => Promise<string | null>;
  reset: () => void;
}

export function useGuidedChoices({
  projectId,
  moduleId,
  questionId,
  questionLabel,
  previousAnswers,
  maxGenerations = 5,
}: UseGuidedChoicesOptions): UseGuidedChoicesReturn {
  // State
  const [choices, setChoices] = useState<GeneratedChoice[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [freeInputValue, setFreeInputValue] = useState("");
  const [generationCount, setGenerationCount] = useState(0);
  const [generatedText, setGeneratedText] = useState<string | null>(null);

  // Mutations
  const generateChoicesMutation = api.aiAssistant.generateChoices.useMutation();
  const generateAnswerMutation = api.aiAssistant.generateAnswerFromChoices.useMutation();

  // Computed values
  const canGenerateMore = generationCount < maxGenerations;
  const hasSelections = selectedIds.size > 0 || freeInputValue.trim().length > 0;

  const selectedChoicesLabels = useMemo(() => {
    return choices
      .filter((c) => selectedIds.has(c.id))
      .map((c) => c.label);
  }, [choices, selectedIds]);

  // Get existing choice labels to avoid duplicates
  const existingChoiceLabels = useMemo(() => {
    return choices.map((c) => c.label);
  }, [choices]);

  // Generate initial choices
  const generateInitialChoices = useCallback(async () => {
    try {
      const result = await generateChoicesMutation.mutateAsync({
        projectId,
        moduleId,
        questionId,
        questionLabel,
        previousAnswers,
      });

      const newChoices: GeneratedChoice[] = result.choices.map((label, index) => ({
        id: `choice_0_${index}`,
        label,
        source: "ai" as const,
        generationRound: 0,
      }));

      setChoices(newChoices);
      setGenerationCount(1);
    } catch (error) {
      console.error("Error generating initial choices:", error);
      throw error;
    }
  }, [generateChoicesMutation, projectId, moduleId, questionId, questionLabel, previousAnswers]);

  // Generate more choices
  const generateMoreChoices = useCallback(async () => {
    if (!canGenerateMore) return;

    try {
      const result = await generateChoicesMutation.mutateAsync({
        projectId,
        moduleId,
        questionId,
        questionLabel,
        existingChoices: existingChoiceLabels,
        previousAnswers,
      });

      const newChoices: GeneratedChoice[] = result.choices.map((label, index) => ({
        id: `choice_${generationCount}_${index}`,
        label,
        source: "ai" as const,
        generationRound: generationCount,
      }));

      setChoices((prev) => [...prev, ...newChoices]);
      setGenerationCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error generating more choices:", error);
      throw error;
    }
  }, [
    canGenerateMore,
    generateChoicesMutation,
    projectId,
    moduleId,
    questionId,
    questionLabel,
    existingChoiceLabels,
    generationCount,
    previousAnswers,
  ]);

  // Toggle choice selection
  const toggleChoice = useCallback((choiceId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(choiceId)) {
        newSet.delete(choiceId);
      } else {
        newSet.add(choiceId);
      }
      return newSet;
    });
  }, []);

  // Set free input value
  const setFreeInput = useCallback((value: string) => {
    setFreeInputValue(value);
  }, []);

  // Add free input as a choice
  const addFreeInputAsChoice = useCallback(() => {
    if (!freeInputValue.trim()) return;

    const newChoice: GeneratedChoice = {
      id: `user_${Date.now()}`,
      label: freeInputValue.trim(),
      source: "user",
      generationRound: -1, // User input
    };

    setChoices((prev) => [...prev, newChoice]);
    setSelectedIds((prev) => new Set(prev).add(newChoice.id));
    setFreeInputValue("");
  }, [freeInputValue]);

  // Generate answer from selected choices
  const generateAnswer = useCallback(async (): Promise<string | null> => {
    // Collect all selected choices + free input if any
    const allSelectedLabels = [...selectedChoicesLabels];
    const freeInput = freeInputValue.trim() || undefined;

    if (allSelectedLabels.length === 0 && !freeInput) {
      return null;
    }

    try {
      const result = await generateAnswerMutation.mutateAsync({
        projectId,
        moduleId,
        questionId,
        questionLabel,
        selectedChoices: allSelectedLabels,
        freeInput,
        previousAnswers,
      });

      setGeneratedText(result.generatedText);
      return result.generatedText;
    } catch (error) {
      console.error("Error generating answer:", error);
      throw error;
    }
  }, [
    generateAnswerMutation,
    projectId,
    moduleId,
    questionId,
    questionLabel,
    selectedChoicesLabels,
    freeInputValue,
    previousAnswers,
  ]);

  // Reset state
  const reset = useCallback(() => {
    setChoices([]);
    setSelectedIds(new Set());
    setFreeInputValue("");
    setGenerationCount(0);
    setGeneratedText(null);
  }, []);

  return {
    // State
    choices,
    selectedIds,
    freeInputValue,
    generationCount,
    maxGenerations,
    generatedText,

    // Loading states
    isGeneratingChoices: generateChoicesMutation.isPending,
    isGeneratingAnswer: generateAnswerMutation.isPending,

    // Computed
    canGenerateMore,
    hasSelections,
    selectedChoicesLabels,

    // Actions
    generateInitialChoices,
    generateMoreChoices,
    toggleChoice,
    setFreeInput,
    addFreeInputAsChoice,
    generateAnswer,
    reset,
  };
}
