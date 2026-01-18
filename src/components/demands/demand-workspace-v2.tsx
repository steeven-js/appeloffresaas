"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  MessageSquare,
  ClipboardList,
  AlertTriangle,
  Banknote,
  Paperclip,
  Pen,
} from "lucide-react";

import { api } from "~/trpc/react";
import {
  WorkspaceLayout,
  ModuleSidebar,
  CentralZone,
  CopilotPanel,
  type ModuleStatus,
} from "~/components/workspace";
import type { DemandSection } from "~/server/db/schema";
import { getDefaultSections } from "./section-editor";

interface DemandWorkspaceV2Props {
  projectId: string;
}

type ModuleId = "info" | "context" | "description" | "constraints" | "budget" | "documents";

interface ModuleDefinition {
  id: ModuleId;
  label: string;
  icon: typeof FileText;
  category?: "module" | "section";
}

const baseModules: ModuleDefinition[] = [
  { id: "info", label: "Informations", icon: FileText },
  { id: "context", label: "Contexte", icon: MessageSquare },
  { id: "description", label: "Description", icon: ClipboardList },
  { id: "constraints", label: "Contraintes", icon: AlertTriangle },
  { id: "budget", label: "Budget & Délais", icon: Banknote },
  { id: "documents", label: "Documents", icon: Paperclip },
];

export function DemandWorkspaceV2({ projectId }: DemandWorkspaceV2Props) {
  const router = useRouter();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [sections, setSections] = useState<DemandSection[]>([]);

  // Fetch project data
  const { data: project, isLoading, error } = api.demandProjects.get.useQuery({ id: projectId });

  // Initialize sections when project is loaded
  const initializeSections = useCallback(() => {
    if (project) {
      const existingSections = project.sections ?? [];
      if (existingSections.length === 0) {
        // Create default sections
        const defaults = getDefaultSections(projectId);
        setSections(defaults);
      } else {
        setSections(existingSections);
      }
    }
  }, [project, projectId]);

  // Run on mount and when project changes
  useState(() => {
    initializeSections();
  });

  // Calculate module status based on project data
  const getModuleStatus = (moduleId: ModuleId): ModuleStatus => {
    if (!project) return "empty";

    switch (moduleId) {
      case "info":
        return project.title && project.departmentName ? "complete" :
               project.title ? "in_progress" : "empty";
      case "context":
        return project.context ? "complete" : "empty";
      case "description":
        return project.description ? "complete" : "empty";
      case "constraints":
        return project.constraints ? "complete" : "empty";
      case "budget":
        return project.budgetRange || project.estimatedAmount ? "complete" :
               project.desiredDeliveryDate ? "in_progress" : "empty";
      case "documents":
        // Documents status will be updated when annexes are loaded
        return "empty";
      default:
        return "empty";
    }
  };

  // Build modules with status
  const modules = baseModules.map((m) => ({
    ...m,
    status: getModuleStatus(m.id),
  }));

  // Add section modules
  const sectionModules = sections.map((section) => ({
    id: `section-${section.id}`,
    label: section.title,
    icon: Pen,
    status: (section.content ? "complete" : "empty") as ModuleStatus,
    category: "section" as const,
  }));

  const allModules = [...modules, ...sectionModules];

  // Calculate completion
  const calculateCompletion = () => {
    const completed = modules.filter((m) => m.status === "complete").length +
                      sectionModules.filter((m) => m.status === "complete").length;
    const total = allModules.length;
    return {
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      completedItems: completed,
      totalItems: total,
    };
  };

  // Export handlers
  const handleExportPdf = async () => {
    try {
      const response = await fetch(`/api/export/pdf/${projectId}`);
      if (!response.ok) throw new Error("Erreur lors de l'export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") ?? "demande.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const handleExportDocx = async () => {
    try {
      const response = await fetch(`/api/export/docx/${projectId}`);
      if (!response.ok) throw new Error("Erreur lors de l'export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") ?? "demande.docx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export DOCX error:", error);
    }
  };

  const handleExportZip = async () => {
    try {
      const response = await fetch(`/api/export/zip/${projectId}`);
      if (!response.ok) throw new Error("Erreur lors de l'export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") ?? "demande.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export ZIP error:", error);
    }
  };

  // Handle module click
  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId);
  };

  // Handle back navigation
  const handleBack = () => {
    router.push("/demandes");
  };

  // Handle add section
  const handleAddSection = () => {
    // TODO: Implement add section dialog
    console.log("Add section clicked");
  };

  // Copilot action handlers - these set the active module
  // CentralZone will switch to chat mode when module changes
  const handleCopilotNavigate = (section: string) => {
    handleModuleClick(section);
  };

  const handleCopilotGenerate = (section: string) => {
    handleModuleClick(section);
    // TODO: Trigger generation in chat panel
  };

  const handleCopilotReformulate = (section: string) => {
    handleModuleClick(section);
    // TODO: Trigger reformulation in chat panel
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-destructive">
          Erreur lors du chargement du projet
        </div>
      </div>
    );
  }

  const completion = calculateCompletion();

  return (
    <WorkspaceLayout
      sidebar={
        <ModuleSidebar
          modules={allModules}
          activeModule={activeModule}
          onModuleClick={handleModuleClick}
          completion={completion}
          onBack={handleBack}
          onAddSection={handleAddSection}
        />
      }
      main={
        <CentralZone
          projectId={projectId}
          project={{
            title: project.title,
            reference: project.reference,
            departmentName: project.departmentName,
            contactName: project.contactName,
            contactEmail: project.contactEmail,
            needType: project.needType,
            urgencyLevel: project.urgencyLevel,
            budgetRange: project.budgetRange,
            estimatedAmount: project.estimatedAmount,
            desiredDeliveryDate: project.desiredDeliveryDate,
            budgetValidated: project.budgetValidated,
            urgencyJustification: project.urgencyJustification,
            context: project.context,
            description: project.description,
            constraints: project.constraints,
            notes: project.notes,
            status: project.status,
            createdAt: project.createdAt,
          }}
          sections={sections}
          activeModule={activeModule}
          onModuleClick={handleModuleClick}
        />
      }
      copilot={
        <CopilotPanel
          projectId={projectId}
          project={{
            title: project.title,
            reference: project.reference,
            departmentName: project.departmentName,
            contactName: project.contactName,
            needType: project.needType,
            urgencyLevel: project.urgencyLevel,
            budgetRange: project.budgetRange,
            context: project.context,
            description: project.description,
            constraints: project.constraints,
          }}
          onExportPdf={handleExportPdf}
          onExportDocx={handleExportDocx}
          onExportZip={handleExportZip}
          onNavigate={handleCopilotNavigate}
          onGenerate={handleCopilotGenerate}
          onReformulate={handleCopilotReformulate}
        />
      }
    />
  );
}
