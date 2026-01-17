"use client";

import { AppHeader } from "./app-header";
import { useSidebar } from "./sidebar-context";
import { cn } from "~/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  mobileHeader?: React.ReactNode;
}

export function AppLayout({ children, sidebar, mobileHeader }: AppLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Mobile header - visible only on mobile */}
      {mobileHeader && (
        <header className="lg:hidden h-14 border-b flex items-center px-4 gap-4">
          {mobileHeader}
        </header>
      )}

      {/* Main container with sidebar and content */}
      <div className="flex-1 flex">
        {/* Sidebar - hidden on mobile, visible on lg+ */}
        {sidebar && (
          <aside
            className={cn(
              "hidden lg:flex flex-col border-r bg-muted/30 transition-all duration-300",
              isCollapsed ? "w-[68px]" : "w-[280px]"
            )}
          >
            {sidebar}
          </aside>
        )}

        {/* Main content area with header */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop header with breadcrumb */}
          <div className="hidden lg:block">
            <AppHeader />
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
