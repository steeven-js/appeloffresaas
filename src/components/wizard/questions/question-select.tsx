"use client";

import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { SelectOrTextQuestion, AnswerValue } from "~/lib/wizard/wizard-types";

interface QuestionSelectProps {
  question: SelectOrTextQuestion;
  value: string | undefined;
  onChange: (value: AnswerValue) => void;
}

export function QuestionSelect({ question, value, onChange }: QuestionSelectProps) {
  const isCustomValue = value && !question.options.includes(value);

  return (
    <div className="space-y-3">
      <Select
        value={isCustomValue ? "__custom__" : (value ?? "")}
        onValueChange={(val) => {
          if (val === "__custom__") {
            onChange("");
          } else {
            onChange(val);
          }
        }}
      >
        <SelectTrigger className="text-base">
          <SelectValue placeholder={question.placeholder ?? "Sélectionnez..."} />
        </SelectTrigger>
        <SelectContent>
          {question.options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
          <SelectItem value="__custom__">Autre (saisir)</SelectItem>
        </SelectContent>
      </Select>
      {isCustomValue && (
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Saisissez votre réponse..."
          className="text-base"
        />
      )}
    </div>
  );
}
