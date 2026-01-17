import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { ResetPasswordForm } from "~/components/auth/reset-password-form";
import { AuthLayout } from "~/components/auth/auth-layout";
import { Button } from "~/components/ui/button";

export const metadata = {
  title: "Réinitialiser le mot de passe - Appel Offre SaaS",
  description: "Créez un nouveau mot de passe",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const session = await auth();

  // Redirect if already logged in
  if (session?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const token = params.token;

  // Show error if no token provided
  if (!token) {
    return (
      <AuthLayout
        title="Lien invalide"
        subtitle="Ce lien de réinitialisation est invalide ou a expiré"
      >
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive mb-6">
          <p>
            Veuillez demander un nouveau lien de réinitialisation de mot de
            passe.
          </p>
        </div>

        <Button asChild className="w-full">
          <Link href="/forgot-password">Demander un nouveau lien</Link>
        </Button>

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

  return (
    <AuthLayout
      title="Nouveau mot de passe"
      subtitle="Créez un nouveau mot de passe pour votre compte"
    >
      <ResetPasswordForm token={token} />

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
