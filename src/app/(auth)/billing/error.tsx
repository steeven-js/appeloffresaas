"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function BillingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Billing page error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              Erreur de chargement
            </CardTitle>
            <CardDescription>
              Une erreur est survenue lors du chargement de vos informations
              d&apos;abonnement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {error.message || "Veuillez réessayer ultérieurement."}
            </p>
            <div className="flex gap-4">
              <Button onClick={reset}>Réessayer</Button>
              <Button variant="outline" asChild>
                <Link href="/settings">Retour aux paramètres</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
