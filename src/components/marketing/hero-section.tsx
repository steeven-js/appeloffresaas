import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "~/components/ui/button";

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Propulsé par l&apos;IA
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto mb-6">
          Répondez aux appels d&apos;offres{" "}
          <span className="text-primary">10x plus vite</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          L&apos;IA qui analyse vos règlements de consultation, pose les bonnes
          questions, et génère des dossiers conformes automatiquement.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/register">
              Commencer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#features">Découvrir les fonctionnalités</a>
          </Button>
        </div>

        {/* Social Proof */}
        <div className="mt-16 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Faites confiance à notre solution
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">500+</div>
              <div className="text-sm">Entreprises</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">10k+</div>
              <div className="text-sm">AO traités</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">85%</div>
              <div className="text-sm">Temps gagné</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
