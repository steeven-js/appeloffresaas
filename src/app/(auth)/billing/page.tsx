import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { SubscriptionCard } from "~/components/billing/subscription-card";
import { UsageDisplay } from "~/components/billing/usage-display";
import { TierComparison } from "~/components/billing/tier-comparison";
import { Button } from "~/components/ui/button";

export const metadata = {
  title: "Abonnement | Appel Offre SaaS",
  description: "Gérez votre abonnement et consultez votre utilisation",
};

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const subscription = await api.user.getSubscription();

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

        <TierComparison currentTier={subscription.tier} />
      </div>
    </main>
  );
}
