import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { AppLayout } from "~/components/layout/app-layout";
import { AppSidebar } from "~/components/layout/app-sidebar";
import { UserDropdown } from "~/components/layout/user-dropdown";
import { MobileSidebar } from "~/components/layout/mobile-sidebar";
import { SidebarWrapper, SidebarContentWrapper } from "~/components/layout/sidebar-wrapper";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Mobile sidebar content (always expanded)
  const mobileSidebarContent = (
    <div className="flex flex-col h-full">
      <AppSidebar />
      <div className="border-t p-2">
        <UserDropdown user={session.user} />
      </div>
    </div>
  );

  const mobileHeader = (
    <>
      <MobileSidebar>{mobileSidebarContent}</MobileSidebar>
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">A</span>
        </div>
        <span className="font-semibold">AppelOffre</span>
      </Link>
    </>
  );

  return (
    <SidebarWrapper>
      <AppLayout
        sidebar={<SidebarContentWrapper user={session.user} />}
        mobileHeader={mobileHeader}
      >
        {children}
      </AppLayout>
    </SidebarWrapper>
  );
}
