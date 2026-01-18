import { notFound } from "next/navigation";

import { DemandWorkspaceV2 } from "~/components/demands/demand-workspace-v2";
import { WizardContainer } from "~/components/wizard";

interface DemandePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string; export?: string }>;
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
  const { mode } = await searchParams;

  if (!id) {
    notFound();
  }

  // Render wizard mode or workspace mode based on query param
  if (mode === "wizard") {
    return <WizardContainer projectId={id} />;
  }

  // Default to workspace mode
  return <DemandWorkspaceV2 projectId={id} />;
}
