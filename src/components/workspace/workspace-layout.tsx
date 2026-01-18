"use client";

import { cn } from "~/lib/utils";

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
 * - Sidebar (260px): Modules et navigation
 * - Main (flex: 1): Zone centrale (chat/preview/overview)
 * - Copilot (320px): Suggestions et actions rapides
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
  return (
    <div className={cn("flex h-full w-full overflow-hidden", className)}>
      {/* Sidebar - 260px fixe */}
      <aside className="hidden lg:flex w-[260px] flex-col border-r bg-muted/30 overflow-hidden">
        {sidebar}
      </aside>

      {/* Zone centrale - flex: 1 */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {main}
      </main>

      {/* Co-pilote - 320px fixe */}
      <aside className="hidden xl:flex w-[320px] flex-col border-l bg-muted/10 overflow-hidden">
        {copilot}
      </aside>
    </div>
  );
}
