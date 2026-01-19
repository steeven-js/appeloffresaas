"use client";

import { LayoutDashboard, MessageSquare, FileText, Columns } from "lucide-react";
import { cn } from "~/lib/utils";

export type ViewMode = "overview" | "chat" | "preview" | "split" | "edit";

interface ZoneModeToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  className?: string;
}

const modes: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
  {
    id: "overview",
    label: "Vue d'ensemble",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    id: "chat",
    label: "Chat",
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    id: "preview",
    label: "Preview",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: "split",
    label: "Split",
    icon: <Columns className="h-4 w-4" />,
  },
];

export function ZoneModeToggle({
  mode,
  onModeChange,
  className,
}: ZoneModeToggleProps) {
  return (
    <div className={cn("flex items-center gap-1 bg-muted rounded-lg p-1", className)}>
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => onModeChange(m.id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            mode === m.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {m.icon}
          <span className="hidden sm:inline">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
