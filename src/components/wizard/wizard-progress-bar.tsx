"use client";

import { cn } from "~/lib/utils";
import { Progress } from "~/components/ui/progress";

interface WizardProgressBarProps {
  moduleTitle: string;
  moduleIndex: number;
  totalModules: number;
  questionIndex: number;
  totalQuestions: number;
  className?: string;
}

export function WizardProgressBar({
  moduleTitle,
  moduleIndex,
  totalModules,
  questionIndex,
  totalQuestions,
  className,
}: WizardProgressBarProps) {
  const questionProgress = totalQuestions > 0
    ? Math.round(((questionIndex + 1) / totalQuestions) * 100)
    : 0;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Module indicator */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          MODULE {moduleIndex + 1}/{totalModules} : {moduleTitle}
        </span>
        <span className="text-muted-foreground">
          Question {questionIndex + 1}/{totalQuestions}
        </span>
      </div>

      {/* Progress bar */}
      <Progress value={questionProgress} className="h-2" />
    </div>
  );
}
