"use client";

import { Sparkles, Download, FileText, Archive, FileType, RefreshCw, Loader2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { CopilotCard, type CopilotAction } from "./copilot-card";
import { Progress } from "~/components/ui/progress";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

interface CopilotPanelProps {
  projectId: string;
  projectTitle: string;
  onExportPdf?: () => void;
  onExportDocx?: () => void;
  onExportZip?: () => void;
  onNavigate?: (section: string) => void;
  onGenerate?: (section: string) => void;
  onReformulate?: (section: string) => void;
  className?: string;
}

export function CopilotPanel({
  projectId,
  projectTitle,
  onExportPdf,
  onExportDocx,
  onExportZip,
  onNavigate,
  onGenerate,
  onReformulate,
  className,
}: CopilotPanelProps) {
  // Fetch copilot suggestions
  const {
    data: analysis,
    isLoading,
    refetch,
    isRefetching,
  } = api.demandChat.getCopilotSuggestions.useQuery(
    { demandProjectId: projectId },
    {
      refetchInterval: 60000, // Refresh every minute
      staleTime: 30000, // Consider data stale after 30 seconds
    }
  );

  // Handle action clicks
  const handleAction = (action: CopilotAction) => {
    switch (action.type) {
      case "navigate":
        if (action.targetSection && onNavigate) {
          onNavigate(action.targetSection);
        }
        break;
      case "generate":
        if (action.targetSection && onGenerate) {
          onGenerate(action.targetSection);
        }
        break;
      case "reformulate":
        if (action.targetSection && onReformulate) {
          onReformulate(action.targetSection);
        }
        break;
      default:
        break;
    }
  };

  const suggestions = analysis?.suggestions ?? [];
  const completionScore = analysis?.completionScore ?? 0;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Co-pilote
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isRefetching && "animate-spin")} />
        </Button>
      </div>

      {/* Completion Score */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium">Complétude du dossier</span>
          <span className="text-xs text-muted-foreground">{completionScore}%</span>
        </div>
        <Progress value={completionScore} className="h-1.5" />
      </div>

      {/* Suggestions */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.map((suggestion) => (
            <CopilotCard
              key={suggestion.id}
              type={suggestion.type}
              title={suggestion.title}
              content={suggestion.content}
              priority={suggestion.priority}
              actions={suggestion.actions}
              confidence={suggestion.confidence}
              onAction={handleAction}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-xs">Aucune suggestion pour le moment</p>
          </div>
        )}
      </div>

      {/* Aperçu miniature */}
      <div className="p-3 border-t">
        <h3 className="text-xs font-medium mb-2 flex items-center gap-2">
          <FileType className="h-3.5 w-3.5" />
          Aperçu document
        </h3>
        <div className="aspect-[210/297] bg-white rounded border shadow-sm overflow-hidden p-1.5 max-h-32">
          <div className="h-full flex flex-col">
            <div className="text-[5px] font-bold text-center border-b pb-0.5 mb-0.5 truncate">
              {projectTitle}
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="h-0.5 bg-muted rounded w-3/4" />
              <div className="h-0.5 bg-muted rounded w-full" />
              <div className="h-0.5 bg-muted rounded w-5/6" />
              <div className="h-0.5 bg-muted rounded w-2/3" />
              <div className="h-0.5 bg-muted rounded w-full mt-1" />
              <div className="h-0.5 bg-muted rounded w-4/5" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="p-3 border-t space-y-1.5">
        <h3 className="text-xs font-medium mb-2">Actions rapides</h3>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start h-8 text-xs"
          onClick={onExportPdf}
        >
          <Download className="mr-2 h-3.5 w-3.5" />
          Exporter PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start h-8 text-xs"
          onClick={onExportDocx}
        >
          <FileText className="mr-2 h-3.5 w-3.5" />
          Exporter Word
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start h-8 text-xs"
          onClick={onExportZip}
        >
          <Archive className="mr-2 h-3.5 w-3.5" />
          Exporter ZIP
        </Button>
      </div>
    </div>
  );
}
