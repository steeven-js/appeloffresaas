"use client";

import { cn } from "~/lib/utils";

interface CompletionGaugeProps {
  percentage: number;
  completedItems: number;
  totalItems: number;
  className?: string;
}

export function CompletionGauge({
  percentage,
  completedItems,
  totalItems,
  className,
}: CompletionGaugeProps) {
  // Determine color based on percentage
  const getBarColor = () => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className={cn("p-4", className)}>
      <div className="text-sm font-medium text-foreground mb-2">Complétude</div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", getBarColor())}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>{Math.round(percentage)}% complet</span>
        <span>
          {completedItems} / {totalItems}
        </span>
      </div>
    </div>
  );
}
