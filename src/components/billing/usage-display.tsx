"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { formatLimit, type TierLimits } from "~/lib/subscription-tiers";

interface UsageDisplayProps {
  usage: {
    demands: number;
    documents: number;
    teamMembers: number;
  };
  limits: TierLimits;
  usagePercentages: {
    demands: number | null;
    documents: number | null;
    teamMembers: number | null;
  };
}

interface UsageItemProps {
  label: string;
  current: number;
  max: number | null;
  percentage: number | null;
}

function UsageItem({ label, current, max, percentage }: UsageItemProps) {
  const isUnlimited = max === null;
  const displayPercentage = percentage ?? 0;
  const isNearLimit = percentage !== null && percentage >= 80;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {current} / {formatLimit(max)}
        </span>
      </div>
      {!isUnlimited && (
        <Progress
          value={displayPercentage}
          className={isNearLimit ? "[&>div]:bg-amber-500" : ""}
        />
      )}
      {isUnlimited && (
        <div className="h-2 rounded-full bg-green-100 dark:bg-green-900/30">
          <div className="h-full rounded-full bg-green-500 dark:bg-green-400 w-full opacity-50" />
        </div>
      )}
    </div>
  );
}

export function UsageDisplay({
  usage,
  limits,
  usagePercentages,
}: UsageDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Utilisation</CardTitle>
        <CardDescription>
          Votre consommation ce mois-ci
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <UsageItem
          label="Dossiers de demande"
          current={usage.demands}
          max={limits.maxDemands}
          percentage={usagePercentages.demands}
        />
        <UsageItem
          label="Documents coffre-fort"
          current={usage.documents}
          max={limits.maxDocuments}
          percentage={usagePercentages.documents}
        />
      </CardContent>
    </Card>
  );
}
