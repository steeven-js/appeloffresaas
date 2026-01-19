"use client";

import { ArrowLeft, Plus, Wand2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { ModuleItem, type ModuleStatus } from "./module-item";
import { CompletionGauge } from "./completion-gauge";
import { cn } from "~/lib/utils";

export interface ModuleDefinition {
  id: string;
  label: string;
  icon: LucideIcon;
  status: ModuleStatus;
  category?: "module" | "section";
}

interface CompletionData {
  percentage: number;
  completedItems: number;
  totalItems: number;
}

interface ModuleSidebarProps {
  modules: ModuleDefinition[];
  activeModule: string | null;
  onModuleClick: (moduleId: string) => void;
  completion: CompletionData;
  onBack: () => void;
  onAddSection?: () => void;
  onWizard?: () => void;
  className?: string;
}

export function ModuleSidebar({
  modules,
  activeModule,
  onModuleClick,
  completion,
  onBack,
  onAddSection,
  onWizard,
  className,
}: ModuleSidebarProps) {
  // Split modules by category
  const mainModules = modules.filter((m) => m.category !== "section");
  const sectionModules = modules.filter((m) => m.category === "section");

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

      {/* Completion Gauge */}
      <CompletionGauge
        percentage={completion.percentage}
        completedItems={completion.completedItems}
        totalItems={completion.totalItems}
        className="border-b"
      />

      {/* Modules List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          {/* Main Modules */}
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
            Modules
          </div>
          <div className="space-y-1">
            {mainModules.map((module) => (
              <ModuleItem
                key={module.id}
                id={module.id}
                label={module.label}
                icon={module.icon}
                status={module.status}
                isActive={activeModule === module.id}
                onClick={() => onModuleClick(module.id)}
              />
            ))}
          </div>

          {/* Section Modules */}
          {sectionModules.length > 0 && (
            <>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-2 px-2">
                Sections Rédaction
              </div>
              <div className="space-y-1">
                {sectionModules.map((module) => (
                  <ModuleItem
                    key={module.id}
                    id={module.id}
                    label={module.label}
                    icon={module.icon}
                    status={module.status}
                    isActive={activeModule === module.id}
                    onClick={() => onModuleClick(module.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t space-y-2">
        {/* Wizard Button */}
        {onWizard && (
          <Button
            variant="outline"
            size="sm"
            onClick={onWizard}
            className="w-full gap-2 text-primary border-primary/30 hover:bg-primary/10"
          >
            <Wand2 className="h-4 w-4" />
            Modifier via wizard
          </Button>
        )}

        {/* Add Section Button */}
        {onAddSection && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddSection}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter section
          </Button>
        )}
      </div>
    </div>
  );
}
