"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";

export type ModuleStatus = "complete" | "in_progress" | "empty";

interface ModuleItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  status: ModuleStatus;
  isActive: boolean;
  onClick: () => void;
}

const statusConfig: Record<ModuleStatus, { icon: string; className: string }> = {
  complete: {
    icon: "●",
    className: "text-green-500",
  },
  in_progress: {
    icon: "◐",
    className: "text-yellow-500",
  },
  empty: {
    icon: "○",
    className: "text-muted-foreground",
  },
};

export function ModuleItem({
  id,
  label,
  icon: Icon,
  status,
  isActive,
  onClick,
}: ModuleItemProps) {
  const { icon: statusIcon, className: statusClassName } = statusConfig[status];

  return (
    <button
      onClick={onClick}
      data-module-id={id}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
        "hover:bg-muted",
        isActive && "bg-primary/10 border-l-2 border-l-primary -ml-[2px] pl-[14px]"
      )}
    >
      <span className={cn("text-sm", statusClassName)}>{statusIcon}</span>
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1 text-left truncate">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
