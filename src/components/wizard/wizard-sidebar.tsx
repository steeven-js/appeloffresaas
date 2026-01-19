"use client";

import { ArrowLeft, Check, Download, LayoutDashboard } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";
import type { ModuleProgress } from "~/lib/wizard/wizard-types";

interface WizardModule {
  id: string;
  title: string;
  icon?: string;
}

interface WizardSidebarProps {
  modules: WizardModule[];
  activeModuleIndex: number;
  moduleProgress: Record<string, ModuleProgress>;
  overallProgress: number;
  onModuleClick: (index: number) => void;
  onBack: () => void;
  onExport?: () => void;
  onDashboard?: () => void;
  isExportEnabled: boolean;
  className?: string;
}

export function WizardSidebar({
  modules,
  activeModuleIndex,
  moduleProgress,
  overallProgress,
  onModuleClick,
  onBack,
  onExport,
  onDashboard,
  isExportEnabled,
  className,
}: WizardSidebarProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Back Button */}
      <div className="p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux dossiers
        </Button>
      </div>

      {/* Modules List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
          Modules
        </div>
        <div className="space-y-1">
          {modules.map((wizardModule, index) => {
            const progress = moduleProgress[wizardModule.id];
            const isActive = index === activeModuleIndex;
            const isCompleted = progress?.status === "completed";
            const isInProgress = progress?.status === "in_progress";

            return (
              <button
                key={wizardModule.id}
                onClick={() => onModuleClick(index)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                  isActive
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-muted/50",
                  isCompleted && !isActive && "opacity-90"
                )}
              >
                {/* Status Icon */}
                <div
                  className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                    isCompleted
                      ? "bg-green-500/20 text-green-600"
                      : isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Module Info */}
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "text-sm font-medium truncate",
                      isActive ? "text-primary" : "text-foreground"
                    )}
                  >
                    {wizardModule.title}
                  </div>

                  {/* Progress bar for in-progress modules */}
                  {isInProgress && !isCompleted && progress && (
                    <div className="mt-1.5">
                      <Progress value={progress.progress} className="h-1" />
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {progress.progress}%
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Separator */}
        <div className="my-4 border-t" />

        {/* Export Button */}
        <button
          onClick={onExport}
          disabled={!isExportEnabled}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
            isExportEnabled
              ? "hover:bg-muted/50 cursor-pointer"
              : "opacity-50 cursor-not-allowed"
          )}
        >
          <div
            className={cn(
              "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
              isExportEnabled
                ? "bg-green-500/20 text-green-600"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Download className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div
              className={cn(
                "text-sm font-medium",
                isExportEnabled ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Export
            </div>
            {!isExportEnabled && (
              <span className="text-xs text-muted-foreground">
                (disponible à 100%)
              </span>
            )}
          </div>
        </button>

        {/* Dashboard Button */}
        {onDashboard && (
          <button
            onClick={onDashboard}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:bg-muted/50 cursor-pointer mt-1"
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-blue-500/20 text-blue-600">
              <LayoutDashboard className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">
                Tableau de bord
              </div>
              <span className="text-xs text-muted-foreground">
                Vue d&apos;ensemble
              </span>
            </div>
          </button>
        )}

      </div>

      {/* Overall Progress */}
      <div className="p-4 border-t">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Progression globale
        </div>
        <Progress value={overallProgress} className="h-2" />
        <div className="text-right text-xs text-muted-foreground mt-1">
          {overallProgress}%
        </div>
      </div>
    </div>
  );
}
