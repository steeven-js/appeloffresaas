"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [newEmail, setNewEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verifyEmailMutation = api.user.verifyEmailChange.useMutation({
    onSuccess: (data) => {
      setStatus("success");
      setNewEmail(data.newEmail);
      // Redirect to login after 5 seconds (session was invalidated)
      setTimeout(() => {
        router.push("/login");
      }, 5000);
    },
    onError: (error) => {
      setStatus("error");
      setErrorMessage(error.message);
    },
  });

  useEffect(() => {
    if (token && status === "loading") {
      verifyEmailMutation.mutate({ token });
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Lien invalide</CardTitle>
            <CardDescription>
              Ce lien de vérification est invalide.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
              Aucun token de vérification fourni.
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/settings">Retour aux paramètres</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Vérification en cours...</CardTitle>
            <CardDescription>
              Veuillez patienter pendant la vérification de votre email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Erreur de vérification</CardTitle>
            <CardDescription>
              Impossible de vérifier votre adresse email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
              {errorMessage}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/settings">Retour aux paramètres</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email vérifié</CardTitle>
          <CardDescription>
            Votre adresse email a été mise à jour avec succès.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
            <p className="font-medium">Changement confirmé</p>
            <p className="mt-1">
              Votre email est maintenant : <strong>{newEmail}</strong>
            </p>
            <p className="mt-2 text-xs">
              Vous allez être redirigé vers la page de connexion...
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/login">Se connecter</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

function VerifyEmailLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Chargement...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
