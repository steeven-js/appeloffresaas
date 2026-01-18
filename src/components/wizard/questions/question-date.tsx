"use client";

import { Input } from "~/components/ui/input";
import type { DateQuestion, AnswerValue } from "~/lib/wizard/wizard-types";

interface QuestionDateProps {
  question: DateQuestion;
  value: string | undefined;
  onChange: (value: AnswerValue) => void;
}

export function QuestionDate({ question, value, onChange }: QuestionDateProps) {
  const minDate = question.minDate === "today"
    ? new Date().toISOString().split("T")[0]
    : question.minDate;

  return (
    <Input
      type="date"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      min={minDate}
      max={question.maxDate}
      className="text-base max-w-[200px]"
    />
  );
}
