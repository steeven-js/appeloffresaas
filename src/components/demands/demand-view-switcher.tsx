"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { api } from "~/trpc/react";
import { WizardContainer } from "~/components/wizard";
import { DemandWorkspaceV2 } from "./demand-workspace-v2";

interface DemandViewSwitcherProps {
  projectId: string;
  initialView?: "wizard" | "dashboard";
}

// Content modules that need to be validated (have real content)
const CONTENT_MODULES = ["context", "description", "constraints", "budget"];

/**
 * DemandViewSwitcher - Intelligent view switching between Wizard and Dashboard
 *
 * Logic:
 * - If all 4 content modules are validated (have content) → default to dashboard
 * - If any content module is missing → default to wizard
 * - User can switch views via URL param ?view=wizard or ?view=dashboard
 * - Export param (?export=true) is treated as dashboard view for backwards compatibility
 */
export function DemandViewSwitcher({ projectId, initialView }: DemandViewSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState<"wizard" | "dashboard" | null>(null);

  // Fetch wizard state to determine completion
  const { data: wizardData, isLoading } = api.wizard.getState.useQuery(
    { projectId },
    { staleTime: 30000 } // Cache for 30 seconds
  );

  // Check if all content modules have been validated with real content
  const areAllModulesComplete = (): boolean => {
    if (!wizardData?.sections) return false;

    // Check each content module has been validated
    return CONTENT_MODULES.every((moduleId) => {
      const section = wizardData.sections.find((s) => s.id === moduleId);
      // Module is complete if it has validatedAt timestamp (means user validated the generated content)
      return section?.validatedAt;
    });
  };

  // Determine initial view based on URL params and completion status
  useEffect(() => {
    if (isLoading) return;

    // Check URL params first (explicit user choice)
    const viewParam = searchParams.get("view");
    const exportParam = searchParams.get("export");

    if (viewParam === "wizard" || viewParam === "dashboard") {
      setCurrentView(viewParam);
      return;
    }

    // Backwards compatibility: export=true means dashboard
    if (exportParam === "true") {
      setCurrentView("dashboard");
      return;
    }

    // Use initialView prop if provided
    if (initialView) {
      setCurrentView(initialView);
      return;
    }

    // Auto-detect: show dashboard if all 4 content modules are validated
    if (areAllModulesComplete()) {
      setCurrentView("dashboard");
    } else {
      setCurrentView("wizard");
    }
  }, [isLoading, searchParams, wizardData, initialView]);

  // Function to switch views (can be called from child components)
  const switchView = (view: "wizard" | "dashboard") => {
    setCurrentView(view);
    // Update URL without full page reload
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    params.delete("export"); // Clean up legacy param
    router.replace(`/demandes/${projectId}?${params.toString()}`, { scroll: false });
  };

  // Loading state
  if (isLoading || currentView === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Render the appropriate view
  if (currentView === "dashboard") {
    return (
      <DemandWorkspaceV2
        projectId={projectId}
        onSwitchToWizard={() => switchView("wizard")}
      />
    );
  }

  return (
    <WizardContainer
      projectId={projectId}
      onSwitchToDashboard={() => switchView("dashboard")}
    />
  );
}
