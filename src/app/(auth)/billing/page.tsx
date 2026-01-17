import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { SubscriptionCard } from "~/components/billing/subscription-card";
import { UsageDisplay } from "~/components/billing/usage-display";
import { TierComparison } from "~/components/billing/tier-comparison";
import { Button } from "~/components/ui/button";
import { BillingAlert } from "~/components/billing/billing-alert";

export const metadata = {
  title: "Abonnement | Appel Offre SaaS",
  description: "Gérez votre abonnement et consultez votre utilisation",
};

interface BillingPageProps {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [subscription, subscriptionStatus] = await Promise.all([
    api.user.getSubscription(),
    api.billing.getSubscriptionStatus(),
  ]);

  const params = await searchParams;
  const showSuccess = params.success === "true";
  const showCanceled = params.canceled === "true";

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Abonnement</h1>
            <p className="text-muted-foreground">
              Gérez votre formule et consultez votre utilisation
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/settings">Retour aux paramètres</Link>
          </Button>
        </div>

        {showSuccess && (
          <BillingAlert
            type="success"
            title="Paiement réussi !"
            description="Votre abonnement a été mis à jour. Merci pour votre confiance."
          />
        )}

        {showCanceled && (
          <BillingAlert
            type="info"
            title="Paiement annulé"
            description="Votre paiement a été annulé. Aucun montant n'a été débité."
          />
        )}

        {subscriptionStatus.cancelAtPeriodEnd && (
          <BillingAlert
            type="warning"
            title="Abonnement en cours d'annulation"
            description={`Votre abonnement sera annulé à la fin de la période de facturation${
              subscriptionStatus.currentPeriodEnd
                ? ` (${new Intl.DateTimeFormat("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(subscriptionStatus.currentPeriodEnd)})`
                : ""
            }.`}
          />
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <SubscriptionCard
            tierInfo={subscription.tierInfo}
            memberSince={subscription.memberSince}
          />
          <UsageDisplay
            usage={subscription.usage}
            limits={subscription.tierInfo.limits}
            usagePercentages={subscription.usagePercentages}
          />
        </div>

        <TierComparison
          currentTier={subscription.tier}
          hasActiveSubscription={subscriptionStatus.hasActiveSubscription}
        />
      </div>
    </main>
  );
}
