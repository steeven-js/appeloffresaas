import { redirect } from "next/navigation";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

// Redirect to new /demandes/[id] route
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  redirect(`/demandes/${id}`);
}
