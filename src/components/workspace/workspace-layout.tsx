"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface WorkspaceLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  copilot: React.ReactNode;
  className?: string;
}

/**
 * WorkspaceLayout - Structure 3 colonnes pour le workspace de demande
 *
 * Layout:
 * - Sidebar (260px): Modules et navigation (collapsible)
 * - Main (flex: 1): Zone centrale (chat/preview/overview)
 * - Copilot (320px): Suggestions et actions rapides (collapsible)
 *
 * Responsive:
 * - Desktop (≥1280px): 3 colonnes
 * - Tablet (1024-1279px): Sidebar drawer, copilot overlay
 * - Mobile (<1024px): Navigation bottom, copilot sheet
 */
export function WorkspaceLayout({
  sidebar,
  main,
  copilot,
  className,
}: WorkspaceLayoutProps) {
  // Initialize from localStorage or default to expanded
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [copilotCollapsed, setCopilotCollapsed] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedSidebar = localStorage.getItem("workspace-sidebar-collapsed");
    const savedCopilot = localStorage.getItem("workspace-copilot-collapsed");
    if (savedSidebar) setSidebarCollapsed(savedSidebar === "true");
    if (savedCopilot) setCopilotCollapsed(savedCopilot === "true");
  }, []);

  // Save collapsed state to localStorage
  const toggleSidebar = () => {
    const newValue = !sidebarCollapsed;
    setSidebarCollapsed(newValue);
    localStorage.setItem("workspace-sidebar-collapsed", String(newValue));
  };

  const toggleCopilot = () => {
    const newValue = !copilotCollapsed;
    setCopilotCollapsed(newValue);
    localStorage.setItem("workspace-copilot-collapsed", String(newValue));
  };

  return (
    <div className={cn("flex h-full w-full overflow-hidden", className)}>
      {/* Sidebar - Collapsible */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r bg-muted/30 overflow-hidden transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-0" : "w-[260px]"
        )}
      >
        <div className={cn(
          "flex-1 overflow-hidden transition-opacity duration-200",
          sidebarCollapsed ? "opacity-0" : "opacity-100"
        )}>
          {sidebar}
        </div>
      </aside>

      {/* Sidebar Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-6 rounded-l-none rounded-r-md bg-muted/80 hover:bg-muted border border-l-0 shadow-sm"
        style={{ left: sidebarCollapsed ? 0 : 260 }}
        title={sidebarCollapsed ? "Afficher le menu" : "Masquer le menu"}
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </Button>

      {/* Zone centrale - flex: 1 */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {main}
      </main>

      {/* Copilot Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleCopilot}
        className="hidden xl:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-6 rounded-r-none rounded-l-md bg-muted/80 hover:bg-muted border border-r-0 shadow-sm"
        style={{ right: copilotCollapsed ? 0 : 320 }}
        title={copilotCollapsed ? "Afficher le co-pilote" : "Masquer le co-pilote"}
      >
        {copilotCollapsed ? (
          <PanelRightOpen className="h-4 w-4" />
        ) : (
          <PanelRightClose className="h-4 w-4" />
        )}
      </Button>

      {/* Co-pilote - Collapsible */}
      <aside
        className={cn(
          "hidden xl:flex flex-col border-l bg-muted/10 overflow-hidden transition-all duration-300 ease-in-out",
          copilotCollapsed ? "w-0" : "w-[320px]"
        )}
      >
        <div className={cn(
          "flex-1 overflow-hidden transition-opacity duration-200",
          copilotCollapsed ? "opacity-0" : "opacity-100"
        )}>
          {copilot}
        </div>
      </aside>
    </div>
  );
}
