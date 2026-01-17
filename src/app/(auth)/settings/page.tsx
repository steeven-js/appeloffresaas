import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { ProfileForm } from "~/components/settings/profile-form";
import { EmailChangeForm } from "~/components/settings/email-change-form";
import { DeleteAccountDialog } from "~/components/settings/delete-account-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export const metadata = {
  title: "Paramètres du compte - Appel Offre SaaS",
  description: "Gérez vos informations personnelles",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Paramètres du compte</h1>
            <p className="text-muted-foreground">
              Gérez vos informations personnelles
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Retour au tableau de bord</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>
              Modifiez vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adresse email</CardTitle>
            <CardDescription>
              Modifiez l&apos;adresse email associée à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailChangeForm currentEmail={session.user.email ?? ""} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profil Entreprise</CardTitle>
            <CardDescription>
              Renseignez les informations de votre entreprise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Ces informations seront utilisées pour pré-remplir vos réponses aux appels d&apos;offres.
              </p>
              <Button asChild>
                <Link href="/profile/company">Gérer le profil</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Abonnement</CardTitle>
            <CardDescription>
              Gérez votre formule et consultez votre utilisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Consultez votre abonnement actuel, votre utilisation et comparez les formules disponibles.
              </p>
              <Button asChild>
                <Link href="/billing">Gérer l&apos;abonnement</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Zone de danger</CardTitle>
            <CardDescription>
              Actions irréversibles sur votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                La suppression de votre compte est définitive et irréversible.
                Toutes vos données seront supprimées conformément au RGPD.
              </p>
              <DeleteAccountDialog />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
