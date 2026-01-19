"use client";

import { useEffect, useRef } from "react";
import { Sparkles, RefreshCw, Plus, Check, Loader2, PenLine } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { useGuidedChoices } from "~/hooks/use-guided-choices";

import { ChoiceChip } from "./choice-chip";

interface GuidedChoicesPanelProps {
  projectId: string;
  moduleId: string;
  questionId: string;
  questionLabel: string;
  previousAnswers?: Record<string, { questionLabel: string; value: string }>;
  onTextGenerated: (text: string) => void;
  onComplete: () => void;
}

export function GuidedChoicesPanel({
  projectId,
  moduleId,
  questionId,
  questionLabel,
  previousAnswers,
  onTextGenerated,
  onComplete,
}: GuidedChoicesPanelProps) {
  const hasInitialized = useRef(false);

  const {
    choices,
    selectedIds,
    freeInputValue,
    generationCount,
    maxGenerations,
    generatedText,
    isGeneratingChoices,
    isGeneratingAnswer,
    canGenerateMore,
    hasSelections,
    selectedChoicesLabels,
    generateInitialChoices,
    generateMoreChoices,
    toggleChoice,
    setFreeInput,
    addFreeInputAsChoice,
    generateAnswer,
  } = useGuidedChoices({
    projectId,
    moduleId,
    questionId,
    questionLabel,
    previousAnswers,
  });

  // Generate initial choices on mount
  useEffect(() => {
    if (!hasInitialized.current && choices.length === 0) {
      hasInitialized.current = true;
      void generateInitialChoices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notify parent when text is generated
  useEffect(() => {
    if (generatedText) {
      onTextGenerated(generatedText);
    }
  }, [generatedText, onTextGenerated]);

  // Handle generate answer
  const handleGenerateAnswer = async () => {
    try {
      const text = await generateAnswer();
      if (text) {
        // Call onTextGenerated to save the answer, then onComplete to navigate
        // The save is async, but handleNext in wizard-container has a delay to wait for it
        onTextGenerated(text);
        onComplete();
      } else {
        console.warn("generateAnswer returned null - no selections?");
      }
    } catch (error) {
      console.error("Error in handleGenerateAnswer:", error);
    }
  };

  // Handle add free input
  const handleAddFreeInput = () => {
    if (freeInputValue.trim()) {
      addFreeInputAsChoice();
    }
  };

  // Handle key press in free input
  const handleFreeInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddFreeInput();
    }
  };

  const remainingGenerations = maxGenerations - generationCount;
  const isLoading = isGeneratingChoices || isGeneratingAnswer;

  return (
    <div className="flex flex-col h-full min-h-0 bg-background rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-medium">Choix guidés</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}
        </div>
      </div>

      {/* Choices Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {isGeneratingChoices && choices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>Génération des suggestions...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Instruction */}
            <p className="text-sm text-muted-foreground">
              Sélectionnez un ou plusieurs éléments qui correspondent à votre situation :
            </p>

            {/* Choices grid */}
            <div className="grid gap-2">
              {choices.map((choice) => (
                <ChoiceChip
                  key={choice.id}
                  label={choice.label}
                  isSelected={selectedIds.has(choice.id)}
                  source={choice.source}
                  onClick={() => toggleChoice(choice.id)}
                  disabled={isLoading}
                />
              ))}
            </div>

            {/* Generate more button */}
            {canGenerateMore && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void generateMoreChoices()}
                disabled={isLoading}
                className="w-full gap-2"
              >
                {isGeneratingChoices ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Autres suggestions ({remainingGenerations} restante{remainingGenerations > 1 ? "s" : ""})
              </Button>
            )}

            {!canGenerateMore && generationCount > 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                Nombre maximum de suggestions atteint
              </p>
            )}

            {/* Free input section */}
            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <PenLine className="h-4 w-4" />
                <span>Ajouter votre propre élément :</span>
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={freeInputValue}
                  onChange={(e) => setFreeInput(e.target.value)}
                  onKeyDown={handleFreeInputKeyDown}
                  placeholder="Saisissez un élément personnalisé..."
                  className="min-h-[60px] max-h-[100px] resize-none text-sm"
                  disabled={isLoading}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddFreeInput}
                  disabled={!freeInputValue.trim() || isLoading}
                  className="h-[60px] w-[60px] flex-shrink-0"
                  title="Ajouter"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Selection summary */}
            {selectedChoicesLabels.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Vos sélections ({selectedChoicesLabels.length}) :
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedChoicesLabels.map((label, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
                    >
                      {label.length > 40 ? label.substring(0, 40) + "..." : label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - Validate button */}
      <div className="p-4 border-t bg-muted/10 flex-shrink-0">
        <Button
          onClick={() => void handleGenerateAnswer()}
          disabled={!hasSelections || isLoading}
          className={cn(
            "w-full gap-2",
            !hasSelections && "opacity-50"
          )}
        >
          {isGeneratingAnswer ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Valider et générer la réponse
            </>
          )}
        </Button>
        {!hasSelections && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Sélectionnez au moins un élément pour continuer
          </p>
        )}
      </div>
    </div>
  );
}
