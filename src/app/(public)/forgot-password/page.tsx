import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { ForgotPasswordForm } from "~/components/auth/forgot-password-form";
import { AuthLayout } from "~/components/auth/auth-layout";

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
    <AuthLayout
      title="Mot de passe oublié"
      subtitle="Entrez votre email pour recevoir un lien de réinitialisation"
    >
      <ForgotPasswordForm />

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="text-primary font-medium hover:underline underline-offset-4"
        >
          Retour à la connexion
        </Link>
      </div>
    </AuthLayout>
  );
}
