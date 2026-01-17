import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { AppLayout } from "~/components/layout/app-layout";
import { AppSidebar } from "~/components/layout/app-sidebar";
import { UserDropdown } from "~/components/layout/user-dropdown";
import { MobileSidebar } from "~/components/layout/mobile-sidebar";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <AppSidebar />

      {/* User dropdown menu - fixed at bottom */}
      <div className="border-t p-2 flex-shrink-0">
        <UserDropdown user={session.user} />
      </div>
    </div>
  );

  const mobileHeader = (
    <>
      <MobileSidebar>{sidebarContent}</MobileSidebar>
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">A</span>
        </div>
        <span className="font-semibold">AppelOffre</span>
      </Link>
    </>
  );

  return (
    <AppLayout sidebar={sidebarContent} mobileHeader={mobileHeader}>
      {children}
    </AppLayout>
  );
}
