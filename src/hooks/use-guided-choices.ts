"use client";

import { useState, useCallback, useMemo, useRef } from "react";
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
  const [isGeneratingChoices, setIsGeneratingChoices] = useState(false);
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);

  // Mutations
  const generateChoicesMutation = api.aiAssistant.generateChoices.useMutation();
  const generateAnswerMutation = api.aiAssistant.generateAnswerFromChoices.useMutation();

  // Refs for stable callbacks
  const paramsRef = useRef({ projectId, moduleId, questionId, questionLabel, previousAnswers });
  paramsRef.current = { projectId, moduleId, questionId, questionLabel, previousAnswers };

  const mutationsRef = useRef({ generateChoicesMutation, generateAnswerMutation });
  mutationsRef.current = { generateChoicesMutation, generateAnswerMutation };

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
    const params = paramsRef.current;
    console.log("[GuidedChoices] Generating initial choices for:", params.questionLabel);
    setIsGeneratingChoices(true);
    try {
      const result = await mutationsRef.current.generateChoicesMutation.mutateAsync({
        projectId: params.projectId,
        moduleId: params.moduleId,
        questionId: params.questionId,
        questionLabel: params.questionLabel,
        previousAnswers: params.previousAnswers,
      });

      console.log("[GuidedChoices] Got choices:", result.choices);

      const newChoices: GeneratedChoice[] = result.choices.map((label, index) => ({
        id: `choice_0_${index}`,
        label,
        source: "ai" as const,
        generationRound: 0,
      }));

      setChoices(newChoices);
      setGenerationCount(1);
    } catch (error) {
      console.error("[GuidedChoices] Error generating initial choices:", error);
      throw error;
    } finally {
      setIsGeneratingChoices(false);
    }
  }, []);

  // Generate more choices
  const generateMoreChoices = useCallback(async () => {
    if (!canGenerateMore) return;

    const params = paramsRef.current;
    setIsGeneratingChoices(true);
    try {
      const result = await mutationsRef.current.generateChoicesMutation.mutateAsync({
        projectId: params.projectId,
        moduleId: params.moduleId,
        questionId: params.questionId,
        questionLabel: params.questionLabel,
        existingChoices: existingChoiceLabels,
        previousAnswers: params.previousAnswers,
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
    } finally {
      setIsGeneratingChoices(false);
    }
  }, [
    canGenerateMore,
    existingChoiceLabels,
    generationCount,
  ]);

  // Toggle choice selection
  const toggleChoice = useCallback((choiceId: string) => {
    console.log("[GuidedChoices] toggleChoice:", choiceId);
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(choiceId)) {
        newSet.delete(choiceId);
        console.log("[GuidedChoices] Deselected:", choiceId);
      } else {
        newSet.add(choiceId);
        console.log("[GuidedChoices] Selected:", choiceId);
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

    console.log("[GuidedChoices] generateAnswer called with:", { allSelectedLabels, freeInput });

    if (allSelectedLabels.length === 0 && !freeInput) {
      console.warn("[GuidedChoices] No selections or free input, returning null");
      return null;
    }

    const params = paramsRef.current;
    setIsGeneratingAnswer(true);
    try {
      console.log("[GuidedChoices] Calling generateAnswerFromChoices mutation...");
      const result = await mutationsRef.current.generateAnswerMutation.mutateAsync({
        projectId: params.projectId,
        moduleId: params.moduleId,
        questionId: params.questionId,
        questionLabel: params.questionLabel,
        selectedChoices: allSelectedLabels,
        freeInput,
        previousAnswers: params.previousAnswers,
      });

      console.log("[GuidedChoices] Generated text:", result.generatedText?.substring(0, 100) + "...");
      setGeneratedText(result.generatedText);
      return result.generatedText;
    } catch (error) {
      console.error("[GuidedChoices] Error generating answer:", error);
      throw error;
    } finally {
      setIsGeneratingAnswer(false);
    }
  }, [
    selectedChoicesLabels,
    freeInputValue,
  ]);

  // Reset state
  const reset = useCallback(() => {
    setChoices([]);
    setSelectedIds(new Set());
    setFreeInputValue("");
    setGenerationCount(0);
    setGeneratedText(null);
    setIsGeneratingChoices(false);
    setIsGeneratingAnswer(false);
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
    isGeneratingChoices,
    isGeneratingAnswer,

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
