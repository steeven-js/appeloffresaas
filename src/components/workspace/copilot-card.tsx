"use client";

import { Lightbulb, Check, AlertTriangle, XCircle, Sparkles, Loader2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";

export type CopilotCardType = "suggestion" | "generation" | "alert" | "error" | "improvement";

export interface CopilotAction {
  id: string;
  label: string;
  type: "generate" | "reformulate" | "navigate" | "complete";
  targetSection?: string;
}

export interface CopilotCardProps {
  type: CopilotCardType;
  title: string;
  content: string;
  actions?: CopilotAction[];
  confidence?: number;
  priority?: "high" | "medium" | "low";
  isLoading?: boolean;
  onAction?: (action: CopilotAction) => void;
  className?: string;
}

const cardConfig = {
  suggestion: { icon: Lightbulb, color: "border-l-primary", bgColor: "bg-primary/5" },
  generation: { icon: Sparkles, color: "border-l-green-500", bgColor: "bg-green-500/5" },
  alert: { icon: AlertTriangle, color: "border-l-yellow-500", bgColor: "bg-yellow-500/5" },
  error: { icon: XCircle, color: "border-l-destructive", bgColor: "bg-destructive/5" },
  improvement: { icon: Check, color: "border-l-blue-500", bgColor: "bg-blue-500/5" },
};

export function CopilotCard({
  type,
  title,
  content,
  actions,
  confidence,
  priority,
  isLoading,
  onAction,
  className,
}: CopilotCardProps) {
  const { icon: Icon, color, bgColor } = cardConfig[type];

  return (
    <Card className={cn("border-l-4", color, bgColor, className)}>
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{title}</span>
          {priority === "high" && (
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-normal">
              Important
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm px-3 pb-3">
        <p className="text-muted-foreground text-xs leading-relaxed">{content}</p>
        {confidence !== undefined && (
          <p className="text-[10px] text-muted-foreground mt-1">
            Confiance : {Math.round(confidence * 100)}%
          </p>
        )}
        {actions && actions.length > 0 && onAction && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {actions.map((action) => (
              <Button
                key={action.id}
                size="sm"
                variant={action.type === "generate" ? "default" : "outline"}
                className="h-7 text-xs px-2"
                onClick={() => onAction(action)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : null}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
