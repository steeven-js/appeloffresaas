"use client";

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

interface TierComparisonProps {
  currentTier: SubscriptionTier;
}

export function TierComparison({ currentTier }: TierComparisonProps) {
  const tiers = Object.values(TIER_DEFINITIONS);

  const features = [
    { key: "projects", label: "Projets AO / mois" },
    { key: "documents", label: "Documents coffre-fort" },
    { key: "teamMembers", label: "Membres d'équipe" },
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
      case "projects":
        return formatLimit(limits.maxProjects);
      case "documents":
        return formatLimit(limits.maxDocuments);
      case "teamMembers":
        return limits.maxTeamMembers.toString();
      case "aiAssistance":
        return limits.aiAssistance === "basic"
          ? "Basique"
          : limits.aiAssistance === "full"
            ? "Complète"
            : "Prioritaire";
      case "exportFormats":
        return limits.exportFormats.join(", ");
      case "support":
        return limits.supportLevel === "email"
          ? "Email"
          : limits.supportLevel === "priority"
            ? "Prioritaire"
            : "Dédié";
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
                    <Button variant="outline" disabled className="w-full">
                      Formule actuelle
                    </Button>
                  ) : canUpgrade(tier.id) ? (
                    <Button
                      variant={tier.highlighted ? "default" : "outline"}
                      className="w-full"
                      disabled
                      title="Disponible prochainement"
                    >
                      Passer à {tier.name}
                    </Button>
                  ) : canDowngrade(tier.id) ? (
                    <Button
                      variant="ghost"
                      className="w-full"
                      disabled
                      title="Disponible prochainement"
                    >
                      Rétrograder
                    </Button>
                  ) : null}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Les changements d&apos;abonnement seront disponibles prochainement.
        </p>
      </CardContent>
    </Card>
  );
}
