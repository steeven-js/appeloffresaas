"use client";

import { MarkdownEditor } from "~/components/ui/markdown-editor";
import type { TextareaQuestion, AnswerValue } from "~/lib/wizard/wizard-types";

interface QuestionTextareaProps {
  question: TextareaQuestion;
  value: string | undefined;
  onChange: (value: AnswerValue) => void;
}

export function QuestionTextarea({ question, value, onChange }: QuestionTextareaProps) {
  // Calculate min height based on rows prop (default 8 rows, ~40px per row)
  const minHeight = Math.max(300, (question.rows ?? 8) * 40);

  return (
    <MarkdownEditor
      value={value ?? ""}
      onChange={(val) => onChange(val)}
      placeholder={question.placeholder}
      maxLength={question.maxLength}
      minHeight={minHeight}
      preview="edit"
    />
  );
}
