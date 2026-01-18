"use client";

import { useState } from "react";

import { ZoneModeToggle, type ViewMode } from "./zone-mode-toggle";
import { OverviewDashboard } from "./overview-dashboard";
import { DemandChatPanel } from "~/components/demands/demand-chat-panel";
import { DocumentPreview } from "~/components/demands/document-preview";
import type { DemandSection } from "~/server/db/schema";
import { cn } from "~/lib/utils";

export type { ViewMode };

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
  className?: string;
}

export function CentralZone({
  projectId,
  project,
  sections,
  activeModule,
  onModuleClick,
  className,
}: CentralZoneProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");

  // When clicking a card in overview, switch to chat mode
  const handleCardClick = (moduleId: string) => {
    onModuleClick(moduleId);
    setViewMode("chat");
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <ZoneModeToggle mode={viewMode} onModeChange={setViewMode} />
        {activeModule && viewMode !== "overview" && (
          <span className="text-sm text-muted-foreground">
            Module : <strong className="text-foreground">{activeModule}</strong>
          </span>
        )}
      </div>

      {/* Content based on view mode */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "overview" && (
          <OverviewDashboard
            project={project}
            onCardClick={handleCardClick}
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
                  💬 Conversation
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
                  📄 Aperçu en direct
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
