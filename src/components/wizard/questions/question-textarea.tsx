"use client";

import { Textarea } from "~/components/ui/textarea";
import type { TextareaQuestion, AnswerValue } from "~/lib/wizard/wizard-types";

interface QuestionTextareaProps {
  question: TextareaQuestion;
  value: string | undefined;
  onChange: (value: AnswerValue) => void;
}

export function QuestionTextarea({ question, value, onChange }: QuestionTextareaProps) {
  return (
    <div className="space-y-2">
      <Textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        maxLength={question.maxLength}
        rows={question.rows ?? 4}
        className="text-base resize-none"
      />
      {question.maxLength && (
        <div className="text-xs text-muted-foreground text-right">
          {(value ?? "").length} / {question.maxLength}
        </div>
      )}
    </div>
  );
}
