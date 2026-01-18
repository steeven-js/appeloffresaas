"use client";

import { Input } from "~/components/ui/input";
import type { NumberQuestion, AnswerValue } from "~/lib/wizard/wizard-types";

interface QuestionNumberProps {
  question: NumberQuestion;
  value: number | undefined;
  onChange: (value: AnswerValue) => void;
}

export function QuestionNumber({ question, value, onChange }: QuestionNumberProps) {
  return (
    <div className="flex items-center gap-3">
      <Input
        type="number"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : "")
        }
        min={question.min}
        max={question.max}
        step={question.step}
        className="text-base max-w-[200px]"
      />
      {question.unit && (
        <span className="text-muted-foreground">{question.unit}</span>
      )}
    </div>
  );
}
