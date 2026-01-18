"use client";

import { useState, useEffect, useCallback } from "react";
import { Bot, ChevronLeft, ChevronRight, Info } from "lucide-react";

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

interface WizardQuestionProps {
  question: WizardQuestionType;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isSaving: boolean;
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
}: WizardQuestionProps) {
  const [localValue, setLocalValue] = useState<AnswerValue | undefined>(value);

  // Sync local value with prop
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Handle change with local state update
  const handleChange = useCallback(
    (newValue: AnswerValue) => {
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

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
        return localValue.length >= minSelect;
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
        return (
          <QuestionTextarea
            question={question}
            value={localValue as string | undefined}
            onChange={handleChange}
          />
        );

      case "radio":
        return (
          <QuestionRadio
            question={question}
            value={localValue as string | undefined}
            onChange={handleChange}
          />
        );

      case "checkbox":
        return (
          <QuestionCheckbox
            question={question}
            value={localValue as string[] | undefined}
            onChange={handleChange}
          />
        );

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

  return (
    <div className="flex flex-col h-full">
      {/* Question Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Question Label */}
        <div className="flex items-start gap-3 mb-6">
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

        {/* Input Area */}
        <div className="mb-6">{renderInput()}</div>

        {/* Hint */}
        {question.hint && (
          <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg">
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
