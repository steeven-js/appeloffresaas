import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { LoginForm } from "~/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export const metadata = {
  title: "Connexion - Appel Offre SaaS",
  description: "Connectez-vous à votre compte",
};

export default async function LoginPage() {
  const session = await auth();

  // Redirect if already logged in
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>
            Entrez vos identifiants pour accéder à votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Créer un compte
            </Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
