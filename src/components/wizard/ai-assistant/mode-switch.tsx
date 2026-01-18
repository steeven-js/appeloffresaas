"use client";

import { MessageSquare, FileEdit } from "lucide-react";
import { cn } from "~/lib/utils";
import type { AIAssistantMode } from "~/server/db/schema/demands";

interface ModeSwitchProps {
  mode: AIAssistantMode;
  onModeChange: (mode: AIAssistantMode) => void;
  disabled?: boolean;
}

export function ModeSwitch({ mode, onModeChange, disabled }: ModeSwitchProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      <button
        type="button"
        onClick={() => onModeChange("guided")}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
          mode === "guided"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <MessageSquare className="h-4 w-4" />
        <span>Guidé</span>
      </button>
      <button
        type="button"
        onClick={() => onModeChange("expert")}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
          mode === "expert"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <FileEdit className="h-4 w-4" />
        <span>Expert</span>
      </button>
    </div>
  );
}
