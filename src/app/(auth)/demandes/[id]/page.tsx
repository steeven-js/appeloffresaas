import { redirect, notFound } from "next/navigation";

import { auth } from "~/server/auth";
import { DemandWorkspace } from "~/components/demands/demand-workspace";

interface DemandePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DemandePageProps) {
  const { id } = await params;
  return {
    title: `Dossier de Demande - Appel Offre SaaS`,
    description: `Espace de travail du dossier ${id}`,
  };
}

export default async function DemandePage({ params }: DemandePageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <DemandWorkspace projectId={id} />
    </main>
  );
}
