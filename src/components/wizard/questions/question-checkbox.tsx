"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";
import type { CheckboxQuestion, AnswerValue } from "~/lib/wizard/wizard-types";

interface QuestionCheckboxProps {
  question: CheckboxQuestion;
  value: string[] | undefined;
  onChange: (value: AnswerValue) => void;
}

export function QuestionCheckbox({ question, value, onChange }: QuestionCheckboxProps) {
  const [otherValue, setOtherValue] = useState("");
  const selectedValues = value ?? [];

  return (
    <div className="space-y-3">
      {question.options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
            selectedValues.includes(option.value)
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-muted/50"
          )}
        >
          <Checkbox
            checked={selectedValues.includes(option.value)}
            onCheckedChange={(checked) => {
              const newValues = checked
                ? [...selectedValues, option.value]
                : selectedValues.filter((v) => v !== option.value);
              onChange(newValues);
            }}
            className="mt-0.5"
          />
          <div className="flex-1">
            <div className="font-medium">{option.label}</div>
          </div>
        </label>
      ))}
      {question.allowOther && (
        <label
          className={cn(
            "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
            selectedValues.includes("__other__")
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-muted/50"
          )}
        >
          <Checkbox
            checked={selectedValues.includes("__other__")}
            onCheckedChange={(checked) => {
              const newValues = checked
                ? [...selectedValues, "__other__"]
                : selectedValues.filter((v) => v !== "__other__");
              onChange(newValues);
            }}
            className="mt-0.5"
          />
          <div className="flex-1">
            <div className="font-medium">Autre</div>
            {selectedValues.includes("__other__") && (
              <Input
                value={otherValue}
                onChange={(e) => setOtherValue(e.target.value)}
                placeholder="Précisez..."
                className="mt-2"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </label>
      )}
      {question.minSelect && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Sélectionnez au moins {question.minSelect} élément(s)</span>
          <span>{selectedValues.length} sélectionné(s)</span>
        </div>
      )}
    </div>
  );
}
