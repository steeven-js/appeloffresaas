import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { DocumentVault } from "~/components/documents/document-vault";

export const metadata = {
  title: "Coffre-fort Documents - Appel Offre SaaS",
  description: "Gérez vos documents administratifs et professionnels",
};

export default async function DocumentsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Coffre-fort Documents</h1>
          <p className="text-muted-foreground">
            Stockez et gérez vos documents administratifs pour les réutiliser dans vos appels d&apos;offres.
          </p>
        </div>

        <DocumentVault />
      </div>
    </main>
  );
}
