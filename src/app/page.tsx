import { Button } from "~/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Appel Offre <span className="text-primary">SaaS</span>
        </h1>
        <p className="max-w-xl text-center text-lg text-muted-foreground">
          Plateforme SaaS pour optimiser vos réponses aux appels d&apos;offres
          publics grâce à l&apos;intelligence artificielle.
        </p>

        {/* Button component demo - verifies AC #4 */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button>Commencer</Button>
          <Button variant="secondary">En savoir plus</Button>
          <Button variant="outline">Documentation</Button>
        </div>

        {/* All button variants for verification */}
        <div className="mt-8 flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">Variantes du bouton :</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="default" size="sm">
              Default
            </Button>
            <Button variant="destructive" size="sm">
              Destructive
            </Button>
            <Button variant="outline" size="sm">
              Outline
            </Button>
            <Button variant="secondary" size="sm">
              Secondary
            </Button>
            <Button variant="ghost" size="sm">
              Ghost
            </Button>
            <Button variant="link" size="sm">
              Link
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
