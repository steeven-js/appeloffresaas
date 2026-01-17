import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { RegisterForm } from "~/components/auth/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export const metadata = {
  title: "Créer un compte - Appel Offre SaaS",
  description: "Créez votre compte pour commencer à préparer vos réponses aux appels d'offres",
};

export default async function RegisterPage() {
  const session = await auth();

  // Redirect if already logged in
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>
            Entrez vos informations pour créer votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Vous avez déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Se connecter
            </Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
