"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { cn } from "~/lib/utils";
import type { RadioQuestion, AnswerValue } from "~/lib/wizard/wizard-types";

interface QuestionRadioProps {
  question: RadioQuestion;
  value: string | undefined;
  onChange: (value: AnswerValue) => void;
}

export function QuestionRadio({ question, value, onChange }: QuestionRadioProps) {
  const [otherValue, setOtherValue] = useState("");

  return (
    <RadioGroup
      value={value ?? ""}
      onValueChange={onChange}
      className="space-y-3"
    >
      {question.options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
            value === option.value
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-muted/50"
          )}
        >
          <RadioGroupItem value={option.value} className="mt-0.5" />
          <div className="flex-1">
            <div className="font-medium">{option.label}</div>
            {option.description && (
              <div className="text-sm text-muted-foreground mt-0.5">
                {option.description}
              </div>
            )}
          </div>
        </label>
      ))}
      {question.allowOther && (
        <label
          className={cn(
            "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
            value === "__other__"
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-muted/50"
          )}
        >
          <RadioGroupItem value="__other__" className="mt-0.5" />
          <div className="flex-1">
            <div className="font-medium">Autre</div>
            {value === "__other__" && (
              <Input
                value={otherValue}
                onChange={(e) => {
                  setOtherValue(e.target.value);
                  onChange(`autre: ${e.target.value}`);
                }}
                placeholder="Précisez..."
                className="mt-2"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </label>
      )}
    </RadioGroup>
  );
}
