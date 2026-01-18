"use client";

import { Check, Sparkles, User } from "lucide-react";
import { cn } from "~/lib/utils";

interface ChoiceChipProps {
  label: string;
  isSelected: boolean;
  source: "ai" | "user";
  onClick: () => void;
  disabled?: boolean;
}

export function ChoiceChip({
  label,
  isSelected,
  source,
  onClick,
  disabled = false,
}: ChoiceChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
        "hover:border-primary/50 hover:bg-primary/5",
        isSelected
          ? "border-primary bg-primary/10 ring-1 ring-primary/30"
          : "border-border bg-background",
        disabled && "opacity-50 cursor-not-allowed hover:border-border hover:bg-background"
      )}
    >
      {/* Checkbox indicator */}
      <div
        className={cn(
          "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mt-0.5",
          isSelected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30 group-hover:border-primary/50"
        )}
      >
        {isSelected && <Check className="h-3 w-3" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm leading-relaxed",
          isSelected ? "text-foreground font-medium" : "text-foreground/80"
        )}>
          {label}
        </p>
      </div>

      {/* Source indicator */}
      <div
        className={cn(
          "flex-shrink-0 p-1 rounded-full",
          source === "ai"
            ? "text-primary/60"
            : "text-green-600/60"
        )}
        title={source === "ai" ? "Suggestion IA" : "Votre saisie"}
      >
        {source === "ai" ? (
          <Sparkles className="h-3 w-3" />
        ) : (
          <User className="h-3 w-3" />
        )}
      </div>
    </button>
  );
}
