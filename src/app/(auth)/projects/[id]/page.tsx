import { redirect, notFound } from "next/navigation";

import { auth } from "~/server/auth";
import { ProjectWorkspace } from "~/components/tenders/project-workspace";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { id } = await params;
  return {
    title: `Projet - Appel Offre SaaS`,
    description: `Espace de travail du projet ${id}`,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
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
      <ProjectWorkspace projectId={id} />
    </main>
  );
}
