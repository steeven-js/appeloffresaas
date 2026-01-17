"use client";

import { SidebarProvider, useSidebar } from "./sidebar-context";
import { TooltipProvider } from "~/components/ui/tooltip";
import { AppSidebar } from "./app-sidebar";
import { UserDropdown } from "./user-dropdown";

interface UserProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

function SidebarContent({ user }: { user: UserProps }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex flex-col h-full">
      <AppSidebar />

      {/* User dropdown menu - hidden when collapsed on desktop */}
      <div className={isCollapsed ? "hidden" : "border-t p-2"}>
        <UserDropdown user={user} />
      </div>
    </div>
  );
}

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </SidebarProvider>
  );
}

export function SidebarContentWrapper({ user }: { user: UserProps }) {
  return <SidebarContent user={user} />;
}
