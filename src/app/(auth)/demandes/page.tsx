import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { DemandProjectsList } from "~/components/demands/demand-projects-list";

export const metadata = {
  title: "Mes Dossiers de Demande - Appel Offre SaaS",
  description: "Gérez vos dossiers de demande internes",
};

export default async function DemandesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <DemandProjectsList />
      </div>
    </main>
  );
}
