"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useWizard } from "~/hooks/use-wizard";
import { WizardSidebar } from "./wizard-sidebar";
import { WizardProgressBar } from "./wizard-progress-bar";
import { WizardQuestion } from "./wizard-question";
import { WizardPreview } from "./wizard-preview";
import { WizardModuleComplete } from "./wizard-module-complete";
import type { AnswerValue } from "~/lib/wizard/wizard-types";

interface WizardContainerProps {
  projectId: string;
  onSwitchToDashboard?: () => void;
}

export function WizardContainer({ projectId, onSwitchToDashboard }: WizardContainerProps) {
  const router = useRouter();
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");

  const {
    config,
    wizardState,
    sections,
    currentModuleIndex,
    currentQuestionIndex,
    currentModule,
    moduleProgress,
    overallProgress,
    isLoading,
    saveAnswer,
    generateContent,
    validateModule,
    navigateToModule,
    goToNextQuestion,
    goToPreviousQuestion,
    goToNextModule,
    initializeWizard,
    getAnswerValue,
    getModuleAnswers,
    getPreviousAnswers,
    isSaving,
    isGenerating,
    isValidating,
    isInitializing,
  } = useWizard({ projectId });

  // Initialize wizard if not already initialized
  useEffect(() => {
    if (!isLoading && !wizardState && config) {
      void initializeWizard();
    }
  }, [isLoading, wizardState, config, initializeWizard]);

  const currentQuestion = currentModule?.questions[currentQuestionIndex];
  const isLastQuestionOfModule =
    currentModule && currentQuestionIndex === currentModule.questions.length - 1;

  // Memoize previous answers for AI context
  const previousAnswers = useMemo(() => getPreviousAnswers(), [getPreviousAnswers]);
  const isLastModule = config && currentModuleIndex === config.modules.length - 1;
  const isExportEnabled = overallProgress === 100;

  // Handle answer change with auto-save
  const handleAnswerChange = useCallback(
    async (value: AnswerValue) => {
      if (!currentModule || !currentQuestion) return;

      await saveAnswer(
        currentModule.id,
        currentQuestion.id,
        currentQuestion.label,
        value
      );
    },
    [currentModule, currentQuestion, saveAnswer]
  );

  // Handle next button
  const handleNext = useCallback(async () => {
    if (!currentModule || !currentQuestion) return;

    if (isLastQuestionOfModule) {
      // Check if module has content generation
      if (currentModule.assemblePrompt) {
        // Wait for any pending save to complete before generating content
        // This delay ensures the async save from AI assistant completes
        // before we try to generate content from the answers
        await new Promise(resolve => setTimeout(resolve, 600));

        // Generate content and show validation modal
        try {
          const result = await generateContent(currentModule.id);
          setGeneratedContent(result.content);
          setShowValidationModal(true);
        } catch (error) {
          console.error("Failed to generate content:", error);
          // TODO: Show error toast
        }
      } else {
        // No content generation for this module (e.g., info module)
        // Just move to next module
        goToNextModule();
      }
    } else {
      goToNextQuestion();
    }
  }, [
    currentModule,
    currentQuestion,
    isLastQuestionOfModule,
    generateContent,
    goToNextModule,
    goToNextQuestion,
  ]);

  // Handle module validation
  const handleValidateModule = useCallback(
    async (content: string) => {
      if (!currentModule) return;

      await validateModule(currentModule.id, content);
      setShowValidationModal(false);

      // Move to next module or redirect to export if last module
      if (!isLastModule) {
        goToNextModule();
      } else {
        // Last module completed - redirect to export
        router.push(`/demandes/${projectId}?export=true`);
      }
    },
    [currentModule, validateModule, isLastModule, goToNextModule, router, projectId]
  );

  // Handle regenerate
  const handleRegenerate = useCallback(async () => {
    if (!currentModule) return;

    try {
      const result = await generateContent(currentModule.id);
      setGeneratedContent(result.content);
    } catch (error) {
      console.error("Failed to regenerate content:", error);
    }
  }, [currentModule, generateContent]);

  // Handle export
  const handleExport = useCallback(() => {
    if (isExportEnabled) {
      router.push(`/demandes/${projectId}?export=true`);
    }
  }, [router, projectId, isExportEnabled]);

  // Handle back
  const handleBack = useCallback(() => {
    router.push("/demandes");
  }, [router]);

  if (isLoading || isInitializing) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!config || !currentModule || !currentQuestion) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Chargement de la configuration...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full w-full overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-[260px] flex-col border-r bg-muted/30 overflow-hidden">
          <WizardSidebar
            modules={config.modules}
            activeModuleIndex={currentModuleIndex}
            moduleProgress={moduleProgress}
            overallProgress={overallProgress}
            onModuleClick={navigateToModule}
            onBack={handleBack}
            onExport={handleExport}
            onDashboard={onSwitchToDashboard}
            isExportEnabled={isExportEnabled}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Progress Bar */}
          <div className="p-4 border-b bg-background">
            <WizardProgressBar
              moduleTitle={currentModule.title}
              moduleIndex={currentModuleIndex}
              totalModules={config.modules.length}
              questionIndex={currentQuestionIndex}
              totalQuestions={currentModule.questions.length}
            />
          </div>

          {/* Question */}
          <div className="flex-1 overflow-hidden">
            <WizardQuestion
              question={currentQuestion}
              value={getAnswerValue(currentModule.id, currentQuestion.id)}
              onChange={handleAnswerChange}
              onNext={handleNext}
              onPrevious={goToPreviousQuestion}
              canGoNext={true}
              canGoPrevious={currentQuestionIndex > 0 || currentModuleIndex > 0}
              isSaving={isSaving}
              projectId={projectId}
              moduleId={currentModule.id}
              hasAIAssistant={!!currentModule.assemblePrompt}
              useGuidedMode={!!currentModule.assemblePrompt}
              previousAnswers={previousAnswers}
            />
          </div>
        </main>

        {/* Preview Panel */}
        <aside className="hidden xl:flex w-[350px] flex-col border-l bg-muted/10 overflow-hidden">
          <WizardPreview
            moduleId={currentModule.id}
            moduleTitle={currentModule.title}
            answers={getModuleAnswers(currentModule.id)}
            sections={sections}
            currentQuestionId={currentQuestion.id}
            hasAssemblePrompt={!!currentModule.assemblePrompt}
          />
        </aside>
      </div>

      {/* Validation Modal */}
      <WizardModuleComplete
        isOpen={showValidationModal}
        onOpenChange={setShowValidationModal}
        moduleTitle={currentModule.title}
        generatedContent={generatedContent}
        onValidate={handleValidateModule}
        onRegenerate={handleRegenerate}
        isValidating={isValidating}
        isRegenerating={isGenerating}
      />
    </>
  );
}
