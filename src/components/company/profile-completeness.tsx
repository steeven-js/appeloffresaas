"use client";

import { CheckCircle, Circle, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Progress } from "~/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

interface CompletionGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function CompletionGauge({ score, size = "md", showLabel = true }: CompletionGaugeProps) {
  const sizeConfig = {
    sm: { width: 64, strokeWidth: 6, fontSize: "text-lg" },
    md: { width: 96, strokeWidth: 8, fontSize: "text-2xl" },
    lg: { width: 128, strokeWidth: 10, fontSize: "text-3xl" },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = () => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-500";
  };

  const getStrokeColor = () => {
    if (score >= 80) return "stroke-green-500";
    if (score >= 50) return "stroke-yellow-500";
    return "stroke-red-400";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg className="rotate-[-90deg]" width={config.width} height={config.width}>
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn("transition-all duration-500 ease-out", getStrokeColor())}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", config.fontSize, getScoreColor())}>
            {score}%
          </span>
        </div>
      </div>
      {showLabel && (
        <p className="mt-2 text-sm text-muted-foreground">Complétude profil</p>
      )}
    </div>
  );
}

interface SectionItemProps {
  name: string;
  complete: boolean;
  weight: number;
}

function SectionItem({ name, complete, weight }: SectionItemProps) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        {complete ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground/50" />
        )}
        <span className={cn("text-sm", complete ? "text-foreground" : "text-muted-foreground")}>
          {name}
        </span>
      </div>
      <span className="text-xs text-muted-foreground">{weight}%</span>
    </div>
  );
}

export function ProfileCompletenessCard() {
  const { data, isLoading } = api.companyProfile.getCompleteness.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-3 w-48 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="h-24 w-24 animate-pulse rounded-full bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalScore = 0, sections = [], suggestions = [] } = data ?? {};

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          Score de complétude
          {totalScore === 100 && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
        </CardTitle>
        <CardDescription>
          Complétez votre profil pour maximiser vos chances
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gauge */}
        <div className="flex justify-center">
          <CompletionGauge score={totalScore} size="md" />
        </div>

        {/* Progress bar alternative */}
        <div className="space-y-2">
          <Progress value={totalScore} className="h-2" />
          <p className="text-center text-xs text-muted-foreground">
            {totalScore < 100
              ? `${100 - totalScore}% restant pour un profil complet`
              : "Profil complet !"}
          </p>
        </div>

        {/* Section breakdown */}
        <div className="space-y-1 border-t pt-4">
          <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
            Détail par section
          </p>
          {sections.map((section) => (
            <SectionItem
              key={section.id}
              name={section.name}
              complete={section.complete}
              weight={section.weight}
            />
          ))}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2 rounded-lg border bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <p className="text-xs font-medium">Suggestions</p>
            </div>
            <ul className="space-y-1">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ChevronRight className="mt-0.5 h-3 w-3 flex-shrink-0" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProfileCompletenessCompact() {
  const { data, isLoading } = api.companyProfile.getCompleteness.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
        <div className="space-y-1">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-2 w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  const { totalScore = 0 } = data ?? {};

  return (
    <Link
      href="/profile/company"
      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
    >
      <CompletionGauge score={totalScore} size="sm" showLabel={false} />
      <div>
        <p className="text-sm font-medium">Profil entreprise</p>
        <p className="text-xs text-muted-foreground">
          {totalScore}% complet
        </p>
      </div>
    </Link>
  );
}
