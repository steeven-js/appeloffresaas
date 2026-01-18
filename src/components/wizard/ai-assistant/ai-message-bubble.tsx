"use client";

import { Bot, User, Check, Lightbulb } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import type { AIAssistantMessage } from "~/server/db/schema/demands";

interface AIMessageBubbleProps {
  message: AIAssistantMessage;
  onOptionSelect?: (option: string) => void;
  showOptions?: boolean;
}

export function AIMessageBubble({
  message,
  onOptionSelect,
  showOptions = true,
}: AIMessageBubbleProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-3",
        isAssistant ? "flex-row" : "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isAssistant ? "bg-primary/10" : "bg-secondary"
        )}
      >
        {isAssistant ? (
          <Bot className="h-4 w-4 text-primary" />
        ) : (
          <User className="h-4 w-4 text-secondary-foreground" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex flex-col max-w-[80%]",
          isAssistant ? "items-start" : "items-end"
        )}
      >
        {/* Message Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5",
            isAssistant
              ? "bg-muted rounded-tl-none"
              : "bg-primary text-primary-foreground rounded-tr-none"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          {/* Validation indicator */}
          {message.type === "validation" && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Check className="h-3 w-3" />
              <span>Validé</span>
            </div>
          )}
        </div>

        {/* Example */}
        {isAssistant && message.example && (
          <div className="mt-2 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              {message.example}
            </p>
          </div>
        )}

        {/* Quick Options */}
        {isAssistant &&
          showOptions &&
          message.options &&
          message.options.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {message.options.map((option) => (
                <Button
                  key={option.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onOptionSelect?.(option.value)}
                  className="text-xs h-7 px-3 hover:bg-primary/10 hover:border-primary/30"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}

        {/* Generated Text Preview */}
        {isAssistant && message.generatedText && message.type === "validation" && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 max-w-full">
            <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
              Texte mis à jour :
            </p>
            <p className="text-xs text-green-800 dark:text-green-200 whitespace-pre-wrap">
              {message.generatedText}
            </p>
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground mt-1">
          {new Date(message.timestamp).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
