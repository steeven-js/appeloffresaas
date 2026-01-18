import { notFound } from "next/navigation";

import { WizardContainer } from "~/components/wizard";

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

export default async function DemandWorkspacePage({ params }: DemandePageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return <WizardContainer projectId={id} />;
}
