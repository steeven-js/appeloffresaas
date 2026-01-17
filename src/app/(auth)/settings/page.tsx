import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { ProfileForm } from "~/components/settings/profile-form";
import { EmailChangeForm } from "~/components/settings/email-change-form";
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
      </div>
    </main>
  );
}
