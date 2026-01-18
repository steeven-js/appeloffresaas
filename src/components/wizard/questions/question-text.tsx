"use client";

import { Input } from "~/components/ui/input";
import type { TextQuestion, AnswerValue } from "~/lib/wizard/wizard-types";

interface QuestionTextProps {
  question: TextQuestion;
  value: string | undefined;
  onChange: (value: AnswerValue) => void;
}

export function QuestionText({ question, value, onChange }: QuestionTextProps) {
  return (
    <Input
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder}
      maxLength={question.maxLength}
      className="text-base"
    />
  );
}
