import { notFound } from "next/navigation";

import { WizardContainer } from "~/components/wizard";
import { DemandWorkspaceV2 } from "~/components/demands/demand-workspace-v2";

interface DemandePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: DemandePageProps) {
  const { id } = await params;
  return {
    title: `Dossier de Demande - Appel Offre SaaS`,
    description: `Espace de travail du dossier ${id}`,
  };
}

export default async function DemandWorkspacePage({ params, searchParams }: DemandePageProps) {
  const { id } = await params;
  const search = await searchParams;

  if (!id) {
    notFound();
  }

  // Show workspace view when export=true (wizard completed)
  if (search.export === "true") {
    return <DemandWorkspaceV2 projectId={id} />;
  }

  return <WizardContainer projectId={id} />;
}
