"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { AnnexesManager } from "~/components/demands/annexes-manager";
import { cn } from "~/lib/utils";

interface DocumentsViewProps {
  projectId: string;
  onBack?: () => void;
  className?: string;
}

/**
 * Documents view for managing annexes and attachments
 */
export function DocumentsView({ projectId, onBack, className }: DocumentsViewProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/30">
        {onBack && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div className="h-4 w-px bg-border" />
          </>
        )}
        <h2 className="font-semibold text-foreground">Documents & Annexes</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnnexesManager demandProjectId={projectId} />
      </div>
    </div>
  );
}
