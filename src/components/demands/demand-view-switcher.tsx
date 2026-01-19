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

/**
 * DemandViewSwitcher - Intelligent view switching between Wizard and Dashboard
 *
 * Logic:
 * - If wizard is 100% complete → default to dashboard
 * - If wizard is in progress → default to wizard
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

  // Fetch wizard config to calculate progress
  const { data: config } = api.wizard.getConfig.useQuery(undefined, {
    staleTime: Infinity, // Config doesn't change
  });

  // Calculate overall progress
  const calculateOverallProgress = (): number => {
    if (!config || !wizardData?.wizardState) return 0;

    let totalQuestions = 0;
    let answeredQuestions = 0;

    for (const wizardModule of config.modules) {
      totalQuestions += wizardModule.questions.length;
      const moduleState = wizardData.wizardState.modules[wizardModule.id];
      if (moduleState?.answeredQuestions) {
        answeredQuestions += moduleState.answeredQuestions.length;
      }
    }

    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
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

    // Auto-detect based on wizard completion
    const overallProgress = calculateOverallProgress();
    const isWizardComplete = overallProgress === 100;

    // Check if all modules have been validated (have content)
    const allModulesValidated = wizardData?.sections?.every(
      (section) => section.id === "info" || section.validatedAt
    ) ?? false;

    // Default to dashboard if wizard is complete AND all modules validated
    if (isWizardComplete && allModulesValidated) {
      setCurrentView("dashboard");
    } else {
      setCurrentView("wizard");
    }
  }, [isLoading, searchParams, wizardData, config, initialView]);

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
