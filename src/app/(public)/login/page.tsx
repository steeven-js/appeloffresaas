import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { LoginForm } from "~/components/auth/login-form";
import { AuthLayout } from "~/components/auth/auth-layout";

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
    <AuthLayout
      title="Connexion à votre compte"
      subtitle="Entrez vos identifiants pour accéder à votre espace"
    >
      <LoginForm />

      <div className="mt-6 space-y-4 text-center text-sm">
        <Link
          href="/forgot-password"
          className="text-primary hover:underline underline-offset-4"
        >
          Mot de passe oublié ?
        </Link>
        <div className="text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
