import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { TenderProjectsList } from "~/components/tenders/tender-projects-list";

export const metadata = {
  title: "Mes Projets AO - Appel Offre SaaS",
  description: "Gérez vos projets d'appels d'offres",
};

export default async function ProjectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <TenderProjectsList />
      </div>
    </main>
  );
}
