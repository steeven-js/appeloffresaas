"use client";

import { Check, Edit2 } from "lucide-react";
import { cn } from "~/lib/utils";
import type { WizardAnswer } from "~/server/db/schema/demands";

interface WizardAnswerCardProps {
  answer: WizardAnswer;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function WizardAnswerCard({
  answer,
  isActive = false,
  onClick,
  className,
}: WizardAnswerCardProps) {
  // Format answer value for display
  const formatValue = (value: WizardAnswer["value"]): string => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "boolean") {
      return value ? "Oui" : "Non";
    }
    if (typeof value === "string" && value.length > 150) {
      return value.substring(0, 150) + "...";
    }
    return String(value);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border transition-colors",
        isActive
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-muted/30",
        onClick && "cursor-pointer hover:bg-muted/50",
        className
      )}
    >
      {/* Check Icon */}
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
        <Check className="h-3 w-3 text-green-600" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">
            {answer.questionLabel}
          </span>
          {onClick && (
            <Edit2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1 break-words">
          {formatValue(answer.value)}
        </p>
      </div>
    </div>
  );
}
