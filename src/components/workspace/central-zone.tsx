"use client";

import { useState, useEffect, useCallback } from "react";

import { ZoneModeToggle, type ViewMode } from "./zone-mode-toggle";
import { OverviewDashboard } from "./overview-dashboard";
import { ModuleEditor } from "./module-editor";
import { DemandChatPanel } from "~/components/demands/demand-chat-panel";
import { DocumentPreview } from "~/components/demands/document-preview";
import type { DemandSection } from "~/server/db/schema";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

export type { ViewMode };

// Module titles mapping
const MODULE_TITLES: Record<string, string> = {
  context: "Contexte & Justification",
  description: "Description du Besoin",
  constraints: "Contraintes",
  budget: "Budget & Délais",
  documents: "Documents",
};

interface CentralZoneProps {
  projectId: string;
  project: {
    title: string;
    reference: string | null;
    departmentName: string | null;
    contactName: string | null;
    contactEmail: string | null;
    needType: string | null;
    urgencyLevel: string | null;
    budgetRange: string | null;
    estimatedAmount: number | null;
    desiredDeliveryDate: string | null;
    budgetValidated: number | null;
    urgencyJustification: string | null;
    context: string | null;
    description: string | null;
    constraints: string | null;
    notes: string | null;
    status: string;
    createdAt: Date;
  };
  sections: DemandSection[];
  activeModule: string | null;
  onModuleClick: (moduleId: string) => void;
  onViewModeChange?: (mode: ViewMode) => void;
  className?: string;
}

export function CentralZone({
  projectId,
  project,
  sections,
  activeModule,
  onModuleClick,
  onViewModeChange,
  className,
}: CentralZoneProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");

  // Notify parent of view mode changes
  useEffect(() => {
    onViewModeChange?.(viewMode);
  }, [viewMode, onViewModeChange]);

  // Mutation for saving section content
  const utils = api.useUtils();
  const saveSection = api.demandProjects.saveAIContent.useMutation({
    onSuccess: () => {
      void utils.demandProjects.get.invalidate({ id: projectId });
    },
  });

  // Handle module selection - switch view mode based on module
  useEffect(() => {
    if (activeModule === "documents") {
      // Documents show overview (no editor for documents yet)
      setViewMode("overview");
    } else if (activeModule) {
      // Other modules switch to edit mode
      setViewMode("edit");
    }
  }, [activeModule]);

  // Get content for the active module
  const getModuleContent = useCallback((moduleId: string): string => {
    switch (moduleId) {
      case "context":
        return project.context ?? "";
      case "description":
        return project.description ?? "";
      case "constraints":
        return project.constraints ?? "";
      case "budget": {
        // Budget can have its own section content
        const budgetSection = sections.find((s) => s.id === "budget");
        return budgetSection?.content ?? "";
      }
      default:
        return "";
    }
  }, [project, sections]);

  // Save module content
  const handleSaveModule = useCallback(async (content: string) => {
    if (!activeModule) return;
    // Only save for supported sections
    if (!["context", "description", "constraints", "budget"].includes(activeModule)) return;

    await saveSection.mutateAsync({
      id: projectId,
      section: activeModule as "context" | "description" | "constraints" | "budget",
      content,
    });
  }, [activeModule, projectId, saveSection]);

  // When clicking a card in overview, switch to edit mode for that module
  const handleCardClick = (moduleId: string) => {
    onModuleClick(moduleId);
    if (moduleId !== "documents") {
      setViewMode("edit");
    }
  };

  // Back from edit mode to overview
  const handleBackFromEdit = () => {
    setViewMode("overview");
    onModuleClick(""); // Clear active module
  };

  // Handle mode change from toggle
  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === "overview") {
      onModuleClick(""); // Clear active module when going to overview
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with mode toggle - hide in edit mode */}
      {viewMode !== "edit" && (
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <ZoneModeToggle mode={viewMode} onModeChange={handleModeChange} />
          {activeModule && viewMode !== "overview" && (
            <span className="text-sm text-muted-foreground">
              Module : <strong className="text-foreground">{MODULE_TITLES[activeModule] ?? activeModule}</strong>
            </span>
          )}
        </div>
      )}

      {/* Content based on view mode */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "overview" && (
          <OverviewDashboard
            project={project}
            onCardClick={handleCardClick}
          />
        )}

        {viewMode === "edit" && activeModule && (
          <ModuleEditor
            moduleId={activeModule}
            moduleTitle={MODULE_TITLES[activeModule] ?? activeModule}
            content={getModuleContent(activeModule)}
            onSave={handleSaveModule}
            onBack={handleBackFromEdit}
            isSaving={saveSection.isPending}
          />
        )}

        {viewMode === "chat" && (
          <div className="h-full">
            <DemandChatPanel projectId={projectId} />
          </div>
        )}

        {viewMode === "preview" && (
          <div className="h-full overflow-y-auto bg-muted/30 p-4">
            <DocumentPreview
              title={project.title}
              reference={project.reference}
              departmentName={project.departmentName}
              contactName={project.contactName}
              contactEmail={project.contactEmail}
              needType={project.needType}
              urgencyLevel={project.urgencyLevel}
              budgetRange={project.budgetRange}
              desiredDeliveryDate={project.desiredDeliveryDate}
              sections={sections}
            />
          </div>
        )}

        {viewMode === "split" && (
          <div className="flex h-full">
            {/* Chat side */}
            <div className="w-1/2 border-r flex flex-col">
              <div className="px-3 py-2 border-b bg-muted/50">
                <span className="text-sm font-medium text-muted-foreground">
                  Conversation
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <DemandChatPanel projectId={projectId} />
              </div>
            </div>

            {/* Preview side */}
            <div className="w-1/2 flex flex-col bg-muted/30">
              <div className="px-3 py-2 border-b bg-muted/50 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Aperçu en direct
                </span>
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Synchronisé
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <DocumentPreview
                  title={project.title}
                  reference={project.reference}
                  departmentName={project.departmentName}
                  contactName={project.contactName}
                  contactEmail={project.contactEmail}
                  needType={project.needType}
                  urgencyLevel={project.urgencyLevel}
                  budgetRange={project.budgetRange}
                  desiredDeliveryDate={project.desiredDeliveryDate}
                  sections={sections}
                  className="shadow-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
