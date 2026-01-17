import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { TIER_DEFINITIONS, type SubscriptionTier } from "~/lib/subscription-tiers";

const tierOrder: SubscriptionTier[] = ["FREE", "PRO", "BUSINESS"];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tarifs simples et transparents
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Commencez gratuitement, évoluez selon vos besoins. Pas de frais
            cachés.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tierOrder.map((tierId) => {
            const tier = TIER_DEFINITIONS[tierId];
            const isHighlighted = tier.highlighted;

            return (
              <div
                key={tier.id}
                className={cn(
                  "relative rounded-2xl border bg-background p-8 shadow-sm",
                  isHighlighted && "border-primary shadow-lg scale-105"
                )}
              >
                {isHighlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Populaire
                  </Badge>
                )}

                {/* Tier Header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {tier.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">
                      {tier.priceMonthly}€
                    </span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>
                  {tier.priceYearly > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {Math.round(tier.priceYearly / 12)}€/mois facturé
                      annuellement
                    </p>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className="w-full"
                  variant={isHighlighted ? "default" : "outline"}
                  asChild
                >
                  <Link href="/register">
                    {tier.priceMonthly === 0
                      ? "Commencer gratuitement"
                      : `Essayer ${tier.name}`}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* FAQ Teaser */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Des questions ?{" "}
            <a href="#" className="text-primary hover:underline">
              Consultez notre FAQ
            </a>{" "}
            ou{" "}
            <a href="mailto:contact@appeloffre.fr" className="text-primary hover:underline">
              contactez-nous
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
