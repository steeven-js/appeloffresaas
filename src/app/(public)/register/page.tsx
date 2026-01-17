import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { RegisterForm } from "~/components/auth/register-form";
import { AuthLayout } from "~/components/auth/auth-layout";

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
    <AuthLayout
      title="Créer votre compte"
      subtitle="Commencez gratuitement à préparer vos appels d'offres"
    >
      <RegisterForm />

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Vous avez déjà un compte ?{" "}
        <Link
          href="/login"
          className="text-primary font-medium hover:underline underline-offset-4"
        >
          Se connecter
        </Link>
      </div>
    </AuthLayout>
  );
}
