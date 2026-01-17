import { AppHeader } from "./app-header";

interface AppLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  mobileHeader?: React.ReactNode;
}

export function AppLayout({ children, sidebar, mobileHeader }: AppLayoutProps) {
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
          <aside className="hidden lg:flex w-[280px] flex-col border-r bg-muted/30 h-screen sticky top-0">
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
