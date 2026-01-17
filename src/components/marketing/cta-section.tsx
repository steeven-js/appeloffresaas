import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "~/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 px-4 bg-primary text-primary-foreground">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Prêt à gagner du temps ?
        </h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
          Rejoignez les entreprises qui ont déjà transformé leur façon de
          répondre aux appels d&apos;offres. Commencez gratuitement, sans carte
          bancaire.
        </p>
        <Button
          size="lg"
          variant="secondary"
          asChild
          className="bg-background text-foreground hover:bg-background/90"
        >
          <Link href="/register">
            Créer mon compte gratuit
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
