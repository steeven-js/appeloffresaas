import { redirect } from "next/navigation";

import { auth } from "~/server/auth";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default async function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Full-screen layout without main sidebar
  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {children}
    </div>
  );
}
