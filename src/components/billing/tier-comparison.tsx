"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  TIER_DEFINITIONS,
  formatLimit,
  type SubscriptionTier,
} from "~/lib/subscription-tiers";
import { api } from "~/trpc/react";

interface TierComparisonProps {
  currentTier: SubscriptionTier;
  hasActiveSubscription?: boolean;
}

export function TierComparison({
  currentTier,
  hasActiveSubscription = false,
}: TierComparisonProps) {
  const tiers = Object.values(TIER_DEFINITIONS);
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);

  const createCheckoutSession = api.billing.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    },
    onError: (error) => {
      console.error("Checkout error:", error);
      alert(error.message);
      setLoadingTier(null);
    },
  });

  const createPortalSession = api.billing.createPortalSession.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    },
    onError: (error) => {
      console.error("Portal error:", error);
      alert(error.message);
      setLoadingTier(null);
    },
  });

  const handleUpgrade = (tier: "PRO" | "BUSINESS") => {
    setLoadingTier(tier);
    createCheckoutSession.mutate({ tier });
  };

  const handleManageSubscription = () => {
    setLoadingTier(currentTier);
    createPortalSession.mutate();
  };

  const features = [
    { key: "demands", label: "Dossiers de demande / mois" },
    { key: "documents", label: "Documents coffre-fort" },
    { key: "templates", label: "Templates" },
    { key: "aiAssistance", label: "Assistance IA" },
    { key: "exportFormats", label: "Formats d'export" },
    { key: "support", label: "Support" },
  ];

  const getFeatureValue = (
    tier: (typeof tiers)[0],
    featureKey: string
  ): string => {
    const limits = tier.limits;
    switch (featureKey) {
      case "demands":
        return formatLimit(limits.maxDemands);
      case "documents":
        return formatLimit(limits.maxDocuments);
      case "templates":
        return limits.templates === "basic"
          ? "Basiques"
          : limits.templates === "premium"
            ? "Premium"
            : "Personnalisables";
      case "aiAssistance":
        return limits.aiAssistance === "basic"
          ? "Basique"
          : limits.aiAssistance === "full"
            ? "Complète"
            : "Prioritaire";
      case "exportFormats":
        return limits.exportFormats.join(", ");
      case "support":
        return limits.supportLevel === "community"
          ? "Communauté"
          : limits.supportLevel === "email"
            ? "Email"
            : "Prioritaire";
      default:
        return "-";
    }
  };

  const getTierOrder = (tierId: SubscriptionTier): number => {
    const order: Record<SubscriptionTier, number> = {
      FREE: 0,
      PRO: 1,
      BUSINESS: 2,
    };
    return order[tierId];
  };

  const canUpgrade = (tierId: SubscriptionTier): boolean => {
    return getTierOrder(tierId) > getTierOrder(currentTier);
  };

  const canDowngrade = (tierId: SubscriptionTier): boolean => {
    return getTierOrder(tierId) < getTierOrder(currentTier);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Comparer les formules</CardTitle>
        <CardDescription>
          Choisissez la formule adaptée à vos besoins
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Fonctionnalité</TableHead>
                {tiers.map((tier) => (
                  <TableHead
                    key={tier.id}
                    className={`text-center ${
                      tier.id === currentTier
                        ? "bg-primary/5 dark:bg-primary/10"
                        : ""
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-semibold">{tier.name}</div>
                      <div className="text-sm font-normal text-muted-foreground">
                        {tier.priceMonthly === 0
                          ? "Gratuit"
                          : `${tier.priceMonthly}€/mois`}
                      </div>
                      {tier.id === currentTier && (
                        <div className="text-xs text-primary font-medium">
                          Formule actuelle
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((feature) => (
                <TableRow key={feature.key}>
                  <TableCell className="font-medium">{feature.label}</TableCell>
                  {tiers.map((tier) => (
                    <TableCell
                      key={tier.id}
                      className={`text-center ${
                        tier.id === currentTier
                          ? "bg-primary/5 dark:bg-primary/10"
                          : ""
                      }`}
                    >
                      {getFeatureValue(tier, feature.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TableRow>
                <TableCell />
                {tiers.map((tier) => (
                  <TableCell
                    key={tier.id}
                    className={`text-center ${
                      tier.id === currentTier
                        ? "bg-primary/5 dark:bg-primary/10"
                        : ""
                    }`}
                  >
                    {tier.id === currentTier ? (
                      hasActiveSubscription && currentTier !== "FREE" ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleManageSubscription}
                          disabled={loadingTier !== null}
                        >
                          {loadingTier === currentTier
                            ? "Chargement..."
                            : "Gérer l'abonnement"}
                        </Button>
                      ) : (
                        <Button variant="outline" disabled className="w-full">
                          Formule actuelle
                        </Button>
                      )
                    ) : canUpgrade(tier.id) ? (
                      <Button
                        variant={tier.highlighted ? "default" : "outline"}
                        className="w-full"
                        onClick={() =>
                          handleUpgrade(tier.id as "PRO" | "BUSINESS")
                        }
                        disabled={loadingTier !== null}
                      >
                        {loadingTier === tier.id
                          ? "Chargement..."
                          : `Passer à ${tier.name}`}
                      </Button>
                    ) : canDowngrade(tier.id) ? (
                      hasActiveSubscription ? (
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={handleManageSubscription}
                          disabled={loadingTier !== null}
                        >
                          {loadingTier === tier.id
                            ? "Chargement..."
                            : "Rétrograder"}
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          className="w-full"
                          disabled
                        >
                          Rétrograder
                        </Button>
                      )
                    ) : null}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
        {currentTier === "FREE" && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Passez à Pro ou Business pour débloquer plus de fonctionnalités.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
