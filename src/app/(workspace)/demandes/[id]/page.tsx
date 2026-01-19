import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { DemandViewSwitcher } from "~/components/demands/demand-view-switcher";

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

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default async function DemandWorkspacePage({ params }: DemandePageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <DemandViewSwitcher projectId={id} />
    </Suspense>
  );
}
