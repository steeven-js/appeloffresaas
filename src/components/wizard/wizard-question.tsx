"use client";

import { useState, useEffect, useCallback } from "react";
import { Bot, ChevronLeft, ChevronRight, Info, Sparkles } from "lucide-react";

import { Button } from "~/components/ui/button";
import type { WizardQuestion as WizardQuestionType, AnswerValue } from "~/lib/wizard/wizard-types";

import {
  QuestionText,
  QuestionTextarea,
  QuestionRadio,
  QuestionCheckbox,
  QuestionSelect,
  QuestionNumber,
  QuestionDate,
} from "./questions";
import { AIChatPanel, GuidedChoicesPanel } from "./ai-assistant";

interface WizardQuestionProps {
  question: WizardQuestionType;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isSaving: boolean;
  // AI Assistant context
  projectId?: string;
  moduleId?: string;
  hasAIAssistant?: boolean;
  // Guided choices mode
  useGuidedMode?: boolean;
  previousAnswers?: Record<string, { questionLabel: string; value: string }>;
}

export function WizardQuestion({
  question,
  value,
  onChange,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isSaving,
  projectId,
  moduleId,
  hasAIAssistant = false,
  useGuidedMode = false,
  previousAnswers,
}: WizardQuestionProps) {
  // Check if this question has showAIByDefault flag (textarea or checkbox)
  const showAIByDefaultFlag = (question.type === "textarea" || question.type === "checkbox")
    ? (question as unknown as { showAIByDefault?: boolean }).showAIByDefault
    : false;
  const shouldShowAIByDefault = showAIByDefaultFlag
    && hasAIAssistant
    && projectId
    && moduleId;

  // Helper to extract clean text from value (handles legacy checkbox format with __detail__ prefix)
  const extractTextValue = useCallback((val: AnswerValue | undefined): string | undefined => {
    if (val === undefined) return undefined;
    if (typeof val === "string") {
      // Remove __detail__: prefix if present in string
      if (val.startsWith("__detail__:")) {
        return val.replace("__detail__:", "");
      }
      return val;
    }
    if (Array.isArray(val)) {
      // Look for __detail__: prefixed item first (legacy format)
      const detailItem = val.find(v => typeof v === "string" && v.startsWith("__detail__:"));
      if (detailItem && typeof detailItem === "string") {
        return detailItem.replace("__detail__:", "");
      }
      // Otherwise join non-prefixed items
      return val.filter(v => typeof v !== "string" || !v.startsWith("__detail__:")).join(", ");
    }
    return String(val);
  }, []);

  // Get initial clean value for textarea questions
  const initialCleanValue = question.type === "textarea" ? extractTextValue(value) : value;

  const [localValue, setLocalValue] = useState<AnswerValue | undefined>(initialCleanValue);
  const [showAIPanel, setShowAIPanel] = useState(shouldShowAIByDefault && !value);
  const [detailText, setDetailText] = useState("");

  // Determine if this question should show AI assistant option
  const isTextareaWithAI = question.type === "textarea" && hasAIAssistant && !!projectId && !!moduleId;
  const isCheckboxWithAI = question.type === "checkbox" && hasAIAssistant && !!projectId && !!moduleId;

  // Extract detail text from checkbox value if stored
  useEffect(() => {
    if (Array.isArray(value)) {
      const detailItem = value.find(v => v.startsWith("__detail__:"));
      if (detailItem) {
        setDetailText(detailItem.replace("__detail__:", ""));
      }
    }
  }, [value]);

  // Sync local value with prop (clean for textarea questions)
  useEffect(() => {
    const cleanValue = question.type === "textarea" ? extractTextValue(value) : value;
    setLocalValue(cleanValue);
  }, [value, question.type, extractTextValue]);

  // Reset AI panel state when question changes
  useEffect(() => {
    // Show AI panel by default for questions with the flag
    const aiByDefault = (question.type === "textarea" || question.type === "checkbox")
      ? (question as unknown as { showAIByDefault?: boolean }).showAIByDefault
      : false;
    // For textarea: show AI if no value
    // For checkbox: always show AI if flag is set (checkboxes + AI panel shown together)
    const hasExistingValue = question.type === "checkbox"
      ? false // Always show AI panel for checkbox with flag
      : !!value;
    const shouldShow = aiByDefault
      && hasAIAssistant
      && projectId
      && moduleId
      && !hasExistingValue;
    setShowAIPanel(!!shouldShow);
  }, [question, hasAIAssistant, projectId, moduleId, value]);

  // Handle change with local state update
  const handleChange = useCallback(
    (newValue: AnswerValue) => {
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  // Handle AI-generated text for textarea
  const handleAITextGenerated = useCallback(
    (text: string) => {
      setLocalValue(text);
      onChange(text);
    },
    [onChange]
  );

  // Handle AI-generated text for checkbox (stores with prefix)
  const handleCheckboxAITextGenerated = useCallback(
    (text: string) => {
      setDetailText(text);
      // Update the checkbox array with the detail text
      const currentValues = Array.isArray(localValue) ? localValue : [];
      const filteredValues = currentValues.filter(v => !v.startsWith("__detail__:"));
      const newValues = [...filteredValues, `__detail__:${text}`];
      setLocalValue(newValues);
      onChange(newValues);
    },
    [onChange, localValue]
  );

  // Handle AI completion
  const handleAIComplete = useCallback(() => {
    setShowAIPanel(false);
    // Move to next question after AI completion
    onNext();
  }, [onNext]);

  // Check if current answer is valid
  const isAnswerValid = useCallback(() => {
    if (!question.required) return true;

    switch (question.type) {
      case "text":
      case "textarea": {
        if (typeof localValue !== "string") return false;
        return localValue.trim().length > 0;
      }

      case "radio":
      case "select_or_text":
        return localValue !== undefined && localValue !== "";

      case "checkbox": {
        if (!Array.isArray(localValue)) return false;
        const minSelect = question.minSelect ?? 1;
        // Exclude __detail__ entry from count
        const actualSelections = localValue.filter(v => !v.startsWith("__detail__:"));
        return actualSelections.length >= minSelect;
      }

      case "number":
        return localValue !== undefined && localValue !== "";

      case "date":
        return typeof localValue === "string" && localValue !== "";

      default:
        return true;
    }
  }, [question, localValue]);

  // Render question based on type
  const renderInput = () => {
    switch (question.type) {
      case "text":
        return (
          <QuestionText
            question={question}
            value={localValue as string | undefined}
            onChange={handleChange}
          />
        );

      case "textarea":
        // Show AI panel if enabled and toggled
        if (isTextareaWithAI && showAIPanel) {
          // Use guided choices panel if in guided mode
          if (useGuidedMode && projectId && moduleId) {
            return (
              <div className="h-full">
                <GuidedChoicesPanel
                  projectId={projectId}
                  moduleId={moduleId}
                  questionId={question.id}
                  questionLabel={question.label}
                  previousAnswers={previousAnswers}
                  onTextGenerated={handleAITextGenerated}
                  onComplete={handleAIComplete}
                />
              </div>
            );
          }
          return (
            <div className="h-full">
              <AIChatPanel
                projectId={projectId}
                moduleId={moduleId}
                questionId={question.id}
                questionLabel={question.label}
                onTextGenerated={handleAITextGenerated}
                onComplete={handleAIComplete}
              />
            </div>
          );
        }
        return (
          <div className="space-y-3">
            <QuestionTextarea
              question={question}
              value={localValue as string | undefined}
              onChange={handleChange}
            />
            {isTextareaWithAI && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAIPanel(true)}
                className="gap-2 text-primary border-primary/30 hover:bg-primary/10"
              >
                <Sparkles className="h-4 w-4" />
                Utiliser l&apos;assistant IA
              </Button>
            )}
          </div>
        );

      case "radio":
        return (
          <QuestionRadio
            question={question}
            value={localValue as string | undefined}
            onChange={handleChange}
          />
        );

      case "checkbox": {
        // Ensure localValue is an array for checkbox questions
        const checkboxValues = Array.isArray(localValue) ? localValue : [];
        const filteredValues = checkboxValues.filter(v => typeof v === "string" && !v.startsWith("__detail__:"));

        // Check if this checkbox should show AI by default
        const checkboxShowAIByDefault = (question as unknown as { showAIByDefault?: boolean }).showAIByDefault;

        // Get option labels for AI context
        const optionLabels = question.options.map(opt => opt.label);

        // Show only AI panel when showAIByDefault is true (options sent to AI as context)
        if (isCheckboxWithAI && showAIPanel && checkboxShowAIByDefault) {
          // Use guided choices panel if in guided mode
          if (useGuidedMode && projectId && moduleId) {
            return (
              <div className="h-full">
                <GuidedChoicesPanel
                  projectId={projectId}
                  moduleId={moduleId}
                  questionId={question.id}
                  questionLabel={question.label}
                  previousAnswers={previousAnswers}
                  onTextGenerated={handleCheckboxAITextGenerated}
                  onComplete={handleAIComplete}
                />
              </div>
            );
          }
          return (
            <div className="h-full">
              <AIChatPanel
                projectId={projectId}
                moduleId={moduleId}
                questionId={question.id}
                questionLabel={question.label}
                onTextGenerated={handleCheckboxAITextGenerated}
                onComplete={handleAIComplete}
                suggestedOptions={optionLabels}
              />
            </div>
          );
        }

        // Show AI panel for checkbox (old mode - just summary + AI)
        if (isCheckboxWithAI && showAIPanel) {
          return (
            <div className="h-full flex flex-col gap-3">
              {/* Selected options summary */}
              <div className="p-3 bg-muted/50 rounded-lg flex-shrink-0">
                <p className="text-sm font-medium text-muted-foreground mb-2">Options sélectionnées :</p>
                <div className="flex flex-wrap gap-2">
                  {filteredValues.map(v => {
                    const opt = question.options.find(o => o.value === v);
                    return (
                      <span key={v} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {opt?.label ?? v}
                      </span>
                    );
                  })}
                </div>
              </div>
              {/* AI Panel */}
              <div className="flex-1 min-h-0">
                <AIChatPanel
                  projectId={projectId}
                  moduleId={moduleId}
                  questionId={question.id}
                  questionLabel={question.label}
                  onTextGenerated={handleCheckboxAITextGenerated}
                  onComplete={handleAIComplete}
                />
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <QuestionCheckbox
              question={question}
              value={filteredValues}
              onChange={(newValue) => {
                // Preserve detail text when changing checkbox selections
                const newArray = newValue as string[];
                if (detailText) {
                  handleChange([...newArray, `__detail__:${detailText}`]);
                } else {
                  handleChange(newArray);
                }
              }}
            />
            {/* Show detail text preview if exists */}
            {detailText && !showAIPanel && (
              <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                  Description détaillée :
                </p>
                <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
                  {detailText}
                </p>
              </div>
            )}
            {/* AI Assistant button */}
            {isCheckboxWithAI && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAIPanel(true)}
                className="gap-2 text-primary border-primary/30 hover:bg-primary/10"
              >
                <Sparkles className="h-4 w-4" />
                {detailText ? "Modifier avec l'assistant IA" : "Décrire en détail avec l'assistant IA"}
              </Button>
            )}
          </div>
        );
      }

      case "select_or_text":
        return (
          <QuestionSelect
            question={question}
            value={localValue as string | undefined}
            onChange={handleChange}
          />
        );

      case "number":
        return (
          <QuestionNumber
            question={question}
            value={localValue as number | undefined}
            onChange={handleChange}
          />
        );

      case "date":
        return (
          <QuestionDate
            question={question}
            value={localValue as string | undefined}
            onChange={handleChange}
          />
        );

      default:
        return null;
    }
  };

  // Check if we're showing AI panel (needs full height layout)
  const isShowingAIPanel = showAIPanel && (isTextareaWithAI || isCheckboxWithAI);

  return (
    <div className="flex flex-col h-full">
      {/* Question Content */}
      <div className={`flex-1 flex flex-col overflow-hidden p-6 ${isShowingAIPanel ? "pb-2" : ""}`}>
        {/* Question Label */}
        <div className="flex items-start gap-3 mb-4 flex-shrink-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-foreground">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </h2>
          </div>
        </div>

        {/* Input Area - flex-1 when showing AI panel */}
        <div className={isShowingAIPanel ? "flex-1 min-h-0" : "mb-6 overflow-y-auto"}>
          {renderInput()}
        </div>

        {/* Hint - only show when not in AI panel mode */}
        {question.hint && !isShowingAIPanel && (
          <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg flex-shrink-0">
            <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">{question.hint}</p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between p-6 border-t bg-background">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </Button>

        <Button
          onClick={onNext}
          disabled={!canGoNext || !isAnswerValid() || isSaving}
          className="gap-2"
        >
          {isSaving ? "Enregistrement..." : "Suivant"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
