"use client";

import { useState, useCallback, useMemo } from "react";
import { api } from "~/trpc/react";
import type { WizardModule, WizardConfig, ModuleProgress, AnswerValue } from "~/lib/wizard/wizard-types";
import type { DemandSection, WizardState, WizardAnswer } from "~/server/db/schema/demands";

interface UseWizardOptions {
  projectId: string;
}

interface UseWizardReturn {
  // Data
  config: WizardConfig | undefined;
  project: ReturnType<typeof api.demandProjects.get.useQuery>["data"];
  wizardState: WizardState | null;
  sections: DemandSection[];
  currentModuleIndex: number;
  currentQuestionIndex: number;
  currentModule: WizardModule | undefined;
  moduleProgress: Record<string, ModuleProgress>;
  overallProgress: number;
  isLoading: boolean;

  // Actions
  saveAnswer: (
    moduleId: string,
    questionId: string,
    questionLabel: string,
    value: AnswerValue
  ) => Promise<void>;
  generateContent: (moduleId: string) => Promise<{ content: string }>;
  validateModule: (moduleId: string, content: string) => Promise<void>;
  navigateToModule: (moduleIndex: number) => void;
  navigateToQuestion: (questionIndex: number) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  goToNextModule: () => void;
  initializeWizard: () => Promise<void>;
  getModuleAnswers: (moduleId: string) => WizardAnswer[];
  getAnswerValue: (moduleId: string, questionId: string) => AnswerValue | undefined;
  getPreviousAnswers: () => Record<string, { questionLabel: string; value: string }>;

  // Mutation states
  isSaving: boolean;
  isGenerating: boolean;
  isValidating: boolean;
  isInitializing: boolean;
}

export function useWizard({ projectId }: UseWizardOptions): UseWizardReturn {
  const utils = api.useUtils();
  const [localModuleIndex, setLocalModuleIndex] = useState(0);
  const [localQuestionIndex, setLocalQuestionIndex] = useState(0);

  // Fetch configuration
  const { data: config } = api.wizard.getConfig.useQuery({});

  // Fetch project data
  const { data: project, isLoading: isProjectLoading } = api.demandProjects.get.useQuery(
    { id: projectId },
    { enabled: !!projectId }
  );

  // Fetch wizard state
  const { data: wizardData, isLoading: isStateLoading } = api.wizard.getState.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  // Mutations
  const initializeMutation = api.wizard.initialize.useMutation({
    onSuccess: () => {
      void utils.wizard.getState.invalidate({ projectId });
      void utils.demandProjects.get.invalidate({ id: projectId });
    },
  });

  const saveAnswerMutation = api.wizard.saveAnswer.useMutation({
    onSuccess: () => {
      void utils.wizard.getState.invalidate({ projectId });
      void utils.demandProjects.get.invalidate({ id: projectId });
    },
  });

  const generateContentMutation = api.wizard.generateContent.useMutation();

  const validateModuleMutation = api.wizard.validateModule.useMutation({
    onSuccess: () => {
      void utils.wizard.getState.invalidate({ projectId });
      void utils.demandProjects.get.invalidate({ id: projectId });
    },
  });

  const navigateMutation = api.wizard.navigate.useMutation({
    onSuccess: () => {
      void utils.wizard.getState.invalidate({ projectId });
    },
  });

  // Derived state
  const wizardState = wizardData?.wizardState ?? null;
  const sections = useMemo(() => wizardData?.sections ?? [], [wizardData?.sections]);

  // Use server state for module/question if available, otherwise local state
  const currentModuleIndex = wizardState?.currentModule ?? localModuleIndex;
  const currentQuestionIndex = wizardState?.currentQuestion ?? localQuestionIndex;
  const currentModule = config?.modules[currentModuleIndex];

  // Calculate module progress
  const moduleProgress = useMemo(() => {
    if (!config || !wizardState) {
      return config?.modules.reduce((acc, mod) => {
        acc[mod.id] = {
          status: "pending",
          progress: 0,
          answered: 0,
          total: mod.questions.length,
        };
        return acc;
      }, {} as Record<string, ModuleProgress>) ?? {};
    }

    return config.modules.reduce((acc, mod) => {
      const moduleState = wizardState.modules[mod.id];
      const section = sections.find(s => s.id === mod.id);
      const totalQuestions = mod.questions.length;

      // Count only questions with meaningful answers
      // Cross-reference answeredQuestions with actual answer values
      const answeredQuestionIds = moduleState?.answeredQuestions ?? [];
      const validAnsweredCount = answeredQuestionIds.filter(qId => {
        const answer = section?.answers?.find(a => a.questionId === qId);
        if (!answer) return false;
        // Check if the answer value is meaningful (non-empty)
        if (Array.isArray(answer.value)) {
          // Exclude __detail__ entries from counting
          const actualValues = answer.value.filter(v =>
            typeof v !== "string" || !v.startsWith("__detail__:")
          );
          return actualValues.length > 0;
        }
        return answer.value !== undefined && answer.value !== "";
      }).length;

      acc[mod.id] = {
        status: moduleState?.status ?? "pending",
        progress: totalQuestions > 0 ? Math.round((validAnsweredCount / totalQuestions) * 100) : 0,
        answered: validAnsweredCount,
        total: totalQuestions,
      };

      return acc;
    }, {} as Record<string, ModuleProgress>);
  }, [config, wizardState, sections]);

  // Calculate overall progress as average of all module progress
  const overallProgress = useMemo(() => {
    if (!config) return 0;
    const progressValues = Object.values(moduleProgress);
    if (progressValues.length === 0) return 0;
    const totalProgress = progressValues.reduce((sum, m) => sum + m.progress, 0);
    return Math.round(totalProgress / progressValues.length);
  }, [config, moduleProgress]);

  // Actions
  const initializeWizard = useCallback(async () => {
    await initializeMutation.mutateAsync({ projectId });
  }, [initializeMutation, projectId]);

  const saveAnswer = useCallback(
    async (
      moduleId: string,
      questionId: string,
      questionLabel: string,
      value: AnswerValue
    ) => {
      await saveAnswerMutation.mutateAsync({
        projectId,
        moduleId,
        questionId,
        questionLabel,
        value,
      });
    },
    [saveAnswerMutation, projectId]
  );

  const generateContent = useCallback(
    async (moduleId: string) => {
      return generateContentMutation.mutateAsync({
        projectId,
        moduleId,
      });
    },
    [generateContentMutation, projectId]
  );

  const validateModule = useCallback(
    async (moduleId: string, content: string) => {
      await validateModuleMutation.mutateAsync({
        projectId,
        moduleId,
        content,
      });
    },
    [validateModuleMutation, projectId]
  );

  const navigateToModule = useCallback(
    (moduleIndex: number) => {
      setLocalModuleIndex(moduleIndex);
      setLocalQuestionIndex(0);
      // Fire and forget - don't await
      navigateMutation.mutate({
        projectId,
        moduleIndex,
        questionIndex: 0,
      });
    },
    [navigateMutation, projectId]
  );

  const navigateToQuestion = useCallback(
    (questionIndex: number) => {
      setLocalQuestionIndex(questionIndex);
      navigateMutation.mutate({
        projectId,
        moduleIndex: currentModuleIndex,
        questionIndex,
      });
    },
    [navigateMutation, projectId, currentModuleIndex]
  );

  const goToNextQuestion = useCallback(() => {
    if (!currentModule) return;

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < currentModule.questions.length) {
      navigateToQuestion(nextIndex);
    }
  }, [currentModule, currentQuestionIndex, navigateToQuestion]);

  const goToPreviousQuestion = useCallback(() => {
    const prevIndex = currentQuestionIndex - 1;
    if (prevIndex >= 0) {
      navigateToQuestion(prevIndex);
    }
  }, [currentQuestionIndex, navigateToQuestion]);

  const goToNextModule = useCallback(() => {
    if (!config) return;

    const nextIndex = currentModuleIndex + 1;
    if (nextIndex < config.modules.length) {
      navigateToModule(nextIndex);
    }
  }, [config, currentModuleIndex, navigateToModule]);

  const getModuleAnswers = useCallback(
    (moduleId: string): WizardAnswer[] => {
      const section = sections.find((s) => s.id === moduleId);
      return section?.answers ?? [];
    },
    [sections]
  );

  const getAnswerValue = useCallback(
    (moduleId: string, questionId: string): AnswerValue | undefined => {
      const answers = getModuleAnswers(moduleId);
      const answer = answers.find((a) => a.questionId === questionId);
      return answer?.value;
    },
    [getModuleAnswers]
  );

  // Get all previous answers as a flat record for AI context
  const getPreviousAnswers = useCallback((): Record<string, { questionLabel: string; value: string }> => {
    const result: Record<string, { questionLabel: string; value: string }> = {};

    for (const section of sections) {
      if (!section.answers) continue;

      for (const answer of section.answers) {
        // Convert value to string for AI context
        let valueStr = "";
        if (Array.isArray(answer.value)) {
          // Filter out __detail__ entries and join
          const actualValues = answer.value.filter(
            (v) => typeof v !== "string" || !v.startsWith("__detail__:")
          );
          valueStr = actualValues.join(", ");
        } else if (answer.value !== undefined) {
          valueStr = String(answer.value);
        }

        // Only include non-empty answers
        if (valueStr) {
          result[answer.questionId] = {
            questionLabel: answer.questionLabel,
            value: valueStr,
          };
        }
      }
    }

    return result;
  }, [sections]);

  return {
    // Data
    config,
    project,
    wizardState,
    sections,
    currentModuleIndex,
    currentQuestionIndex,
    currentModule,
    moduleProgress,
    overallProgress,
    isLoading: isProjectLoading || isStateLoading,

    // Actions
    saveAnswer,
    generateContent,
    validateModule,
    navigateToModule,
    navigateToQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    goToNextModule,
    initializeWizard,
    getModuleAnswers,
    getAnswerValue,
    getPreviousAnswers,

    // Mutation states
    isSaving: saveAnswerMutation.isPending,
    isGenerating: generateContentMutation.isPending,
    isValidating: validateModuleMutation.isPending,
    isInitializing: initializeMutation.isPending,
  };
}
