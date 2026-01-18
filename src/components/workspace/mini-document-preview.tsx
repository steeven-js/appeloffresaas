"use client";

import { cn } from "~/lib/utils";

interface MiniDocumentPreviewProps {
  title: string;
  reference?: string | null;
  departmentName?: string | null;
  contactName?: string | null;
  needType?: string | null;
  urgencyLevel?: string | null;
  budgetRange?: string | null;
  context?: string | null;
  description?: string | null;
  constraints?: string | null;
  className?: string;
  onClick?: () => void;
}

const needTypeLabels: Record<string, string> = {
  fourniture: "Fourniture",
  service: "Service",
  travaux: "Travaux",
  formation: "Formation",
  logiciel: "Logiciel",
  maintenance: "Maintenance",
  autre: "Autre",
};

const urgencyLabels: Record<string, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Urgent",
  critical: "Critique",
};

export function MiniDocumentPreview({
  title,
  reference,
  departmentName,
  contactName,
  needType,
  urgencyLevel,
  budgetRange,
  context,
  description,
  constraints,
  className,
  onClick,
}: MiniDocumentPreviewProps) {
  // Truncate text for mini preview
  const truncate = (text: string | null | undefined, length: number) => {
    if (!text) return null;
    return text.length > length ? text.slice(0, length) + "..." : text;
  };

  return (
    <div
      className={cn(
        "aspect-[210/297] bg-white rounded border shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
        className
      )}
      onClick={onClick}
      style={{ fontSize: "3px" }}
    >
      <div className="h-full flex flex-col p-[3px]">
        {/* Header */}
        <div className="border-b border-primary/30 pb-[2px] mb-[2px]">
          <div className="font-bold text-primary leading-tight truncate" style={{ fontSize: "4px" }}>
            {title || "Sans titre"}
          </div>
          {reference && (
            <div className="text-muted-foreground truncate" style={{ fontSize: "2.5px" }}>
              Réf: {reference}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-[1px] mb-[2px] text-muted-foreground" style={{ fontSize: "2.5px" }}>
          {departmentName && (
            <div className="truncate">
              <span className="font-medium">Service:</span> {truncate(departmentName, 15)}
            </div>
          )}
          {contactName && (
            <div className="truncate">
              <span className="font-medium">Contact:</span> {truncate(contactName, 15)}
            </div>
          )}
          {needType && (
            <div className="truncate">
              <span className="font-medium">Type:</span> {needTypeLabels[needType] ?? needType}
            </div>
          )}
          {urgencyLevel && (
            <div className="truncate">
              <span className="font-medium">Urgence:</span> {urgencyLabels[urgencyLevel] ?? urgencyLevel}
            </div>
          )}
          {budgetRange && (
            <div className="truncate col-span-2">
              <span className="font-medium">Budget:</span> {truncate(budgetRange, 25)}
            </div>
          )}
        </div>

        {/* Sections Preview */}
        <div className="flex-1 space-y-[2px] overflow-hidden">
          {context && (
            <div>
              <div className="font-semibold text-primary border-b border-muted pb-[0.5px] mb-[0.5px]" style={{ fontSize: "3px" }}>
                1. Contexte
              </div>
              <div className="text-muted-foreground line-clamp-2" style={{ fontSize: "2.5px" }}>
                {truncate(context, 80)}
              </div>
            </div>
          )}
          {description && (
            <div>
              <div className="font-semibold text-primary border-b border-muted pb-[0.5px] mb-[0.5px]" style={{ fontSize: "3px" }}>
                2. Description
              </div>
              <div className="text-muted-foreground line-clamp-2" style={{ fontSize: "2.5px" }}>
                {truncate(description, 80)}
              </div>
            </div>
          )}
          {constraints && (
            <div>
              <div className="font-semibold text-primary border-b border-muted pb-[0.5px] mb-[0.5px]" style={{ fontSize: "3px" }}>
                3. Contraintes
              </div>
              <div className="text-muted-foreground line-clamp-2" style={{ fontSize: "2.5px" }}>
                {truncate(constraints, 60)}
              </div>
            </div>
          )}
          {!context && !description && !constraints && (
            <div className="flex items-center justify-center h-full text-muted-foreground" style={{ fontSize: "3px" }}>
              Aucun contenu
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-[1px] border-t text-muted-foreground text-center" style={{ fontSize: "2px" }}>
          Document de demande
        </div>
      </div>
    </div>
  );
}
