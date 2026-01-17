import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { ForgotPasswordForm } from "~/components/auth/forgot-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export const metadata = {
  title: "Mot de passe oublié - Appel Offre SaaS",
  description: "Réinitialisez votre mot de passe",
};

export default async function ForgotPasswordPage() {
  const session = await auth();

  // Redirect if already logged in
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Mot de passe oublié
          </CardTitle>
          <CardDescription>
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Retour à la connexion
            </Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
