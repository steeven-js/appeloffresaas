import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { Button } from "~/components/ui/button";
import { LogoutButton } from "~/components/auth/logout-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export const metadata = {
  title: "Dashboard - Appel Offre SaaS",
  description: "Tableau de bord de vos projets d'appels d'offres",
};

export default async function DashboardPage() {
  const session = await auth();

  // Redirect if not logged in
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Bienvenue{session.user.name ? `, ${session.user.name}` : ""} !
          </h1>
          <p className="text-muted-foreground">
            Votre compte a été créé avec succès.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prochaines étapes</CardTitle>
            <CardDescription>
              Configurez votre profil entreprise pour commencer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Le tableau de bord complet sera disponible dans les prochaines mises à jour.
              Pour l&apos;instant, votre compte est prêt à être utilisé.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" disabled>
                Créer mon profil entreprise (bientôt)
              </Button>
              <LogoutButton />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="font-medium">Email :</dt>
                <dd className="text-muted-foreground">{session.user.email}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium">ID :</dt>
                <dd className="text-muted-foreground">{session.user.id}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
