"use client";

import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { TierInfo } from "~/lib/subscription-tiers";

interface SubscriptionCardProps {
  tierInfo: TierInfo;
  memberSince: Date;
}

export function SubscriptionCard({
  tierInfo,
  memberSince,
}: SubscriptionCardProps) {
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(memberSince));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Votre abonnement</CardTitle>
            <CardDescription>
              Membre depuis le {formattedDate}
            </CardDescription>
          </div>
          <Badge
            variant={tierInfo.id === "FREE" ? "secondary" : "default"}
            className="text-sm px-3 py-1"
          >
            {tierInfo.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-2xl font-bold">
              {tierInfo.priceMonthly === 0 ? (
                "Gratuit"
              ) : (
                <>
                  {tierInfo.priceMonthly}€
                  <span className="text-sm font-normal text-muted-foreground">
                    /mois
                  </span>
                </>
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {tierInfo.description}
            </p>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Fonctionnalités incluses</h4>
            <ul className="space-y-1.5">
              {tierInfo.features.map((feature) => (
                <li
                  key={feature}
                  className="text-sm text-muted-foreground flex items-center gap-2"
                >
                  <span className="text-green-500 dark:text-green-400">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
