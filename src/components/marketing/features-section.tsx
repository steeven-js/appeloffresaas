import { FileSearch, MessageSquare, Brain, Download } from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "Analyse automatique",
    description:
      "Uploadez votre RC et obtenez la liste des pièces requises en 30 secondes. Fini les heures de lecture.",
  },
  {
    icon: MessageSquare,
    title: "Co-pilote intelligent",
    description:
      "Notre IA pose les bonnes questions et reformule vos réponses de façon professionnelle.",
  },
  {
    icon: Brain,
    title: "Zéro re-saisie",
    description:
      "Votre profil entreprise se souvient de tout. Au deuxième AO, vos infos sont déjà là.",
  },
  {
    icon: Download,
    title: "Export en 1 clic",
    description:
      "Générez un dossier ZIP complet, conforme et prêt à déposer sur la plateforme de votre choix.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tout ce qu&apos;il vous faut pour gagner
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des outils puissants pour transformer votre façon de répondre aux
            appels d&apos;offres publics.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-background rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* How it Works */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center mb-12">
            Comment ça marche ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="font-semibold mb-2">Uploadez votre RC</h4>
              <p className="text-sm text-muted-foreground">
                Glissez-déposez le règlement de consultation. L&apos;IA
                l&apos;analyse instantanément.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="font-semibold mb-2">Dialoguez avec l&apos;IA</h4>
              <p className="text-sm text-muted-foreground">
                Répondez aux questions. Votre dossier se construit en temps
                réel.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="font-semibold mb-2">Exportez et soumettez</h4>
              <p className="text-sm text-muted-foreground">
                Téléchargez votre dossier complet, prêt pour la soumission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
