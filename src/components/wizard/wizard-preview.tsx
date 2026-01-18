"use client";

import { FileText, Clock } from "lucide-react";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";
import type { WizardAnswer, DemandSection } from "~/server/db/schema/demands";

interface WizardPreviewProps {
  moduleId: string;
  moduleTitle: string;
  answers: WizardAnswer[];
  sections: DemandSection[];
  currentQuestionId: string;
  hasAssemblePrompt: boolean;
  className?: string;
}

export function WizardPreview({
  moduleId,
  moduleTitle,
  answers,
  sections,
  currentQuestionId,
  hasAssemblePrompt,
  className,
}: WizardPreviewProps) {
  // Find the section for this module
  const section = sections.find((s) => s.id === moduleId);
  const hasValidatedContent = section?.content && section.content.trim().length > 0;

  // Calculate completion percentage for this module
  const completionPercentage = answers.length > 0 ? Math.min(100, answers.length * 20) : 0;

  // Format answer value for display
  const formatAnswerValue = (value: WizardAnswer["value"]): { selections: string; detail?: string } => {
    if (Array.isArray(value)) {
      // Separate detail text from checkbox selections
      const detailItem = value.find(v => typeof v === "string" && v.startsWith("__detail__:"));
      const selections = value.filter(v => typeof v !== "string" || !v.startsWith("__detail__:"));
      const detail = detailItem && typeof detailItem === "string"
        ? detailItem.replace("__detail__:", "")
        : undefined;
      return { selections: selections.join(", "), detail };
    }
    if (typeof value === "boolean") {
      return { selections: value ? "Oui" : "Non" };
    }
    return { selections: String(value) };
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4" />
          APERÇU - {moduleTitle}
        </div>
        <Progress value={completionPercentage} className="h-1.5 mt-2" />
        <div className="text-xs text-muted-foreground mt-1">
          {completionPercentage}% complet
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hasValidatedContent ? (
          // Show validated content
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-sm">{section?.content}</p>
          </div>
        ) : answers.length > 0 ? (
          // Show answers summary
          <>
            <div className="space-y-3">
              {answers.map((answer) => {
                const formatted = formatAnswerValue(answer.value);
                return (
                  <div
                    key={answer.questionId}
                    className={cn(
                      "p-3 rounded-lg border text-sm",
                      answer.questionId === currentQuestionId
                        ? "border-primary/50 bg-primary/5"
                        : "border-border bg-muted/30"
                    )}
                  >
                    <div className="font-medium text-foreground mb-1">
                      {answer.questionLabel}
                    </div>
                    {formatted.selections && (
                      <div className="text-muted-foreground">
                        {formatted.selections}
                      </div>
                    )}
                    {formatted.detail && (
                      <div className="text-muted-foreground mt-2 pt-2 border-t border-border/50 whitespace-pre-wrap">
                        {formatted.detail}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {hasAssemblePrompt && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-700 font-medium">
                      Texte en cours de construction
                    </p>
                    <p className="text-amber-600/80 text-xs mt-1">
                      Le texte final sera généré et proposé à validation à la fin du
                      module.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Répondez aux questions pour voir l&apos;aperçu de cette section.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {hasAssemblePrompt && !hasValidatedContent && (
        <div className="p-4 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Ce texte sera finalisé et proposé à validation à la fin du module.
          </p>
        </div>
      )}
    </div>
  );
}
