import Link from "next/link";
import { Building, Settings, CreditCard, FileText, ArrowRight } from "lucide-react";

import { auth } from "~/server/auth";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export const metadata = {
  title: "Dashboard - Appel Offre SaaS",
  description: "Tableau de bord de vos projets d'appels d'offres",
};

const quickActions = [
  {
    title: "Profil Entreprise",
    description: "Complétez les informations de votre entreprise",
    href: "/profile/company",
    icon: Building,
  },
  {
    title: "Paramètres",
    description: "Gérez votre compte et vos préférences",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Facturation",
    description: "Consultez votre abonnement et vos factures",
    href: "/billing",
    icon: CreditCard,
  },
];

export default async function DashboardPage() {
  // Session is guaranteed by (auth) layout
  const session = await auth();

  // TypeScript guard (layout already redirects if null)
  if (!session?.user) return null;

  return (
    <div className="p-6 lg:p-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bienvenue{session.user.name ? `, ${session.user.name}` : ""} !
          </h1>
          <p className="text-muted-foreground">
            Voici un aperçu de votre espace de travail.
          </p>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Accès rapide</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card key={action.href} className="hover:bg-muted/50 transition-colors">
                  <Link href={action.href}>
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{action.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{action.description}</CardDescription>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Coming Soon - Placeholder for future features */}
        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Mes Appels d&apos;Offres</CardTitle>
            </div>
            <CardDescription>
              Bientôt disponible : créez et gérez vos réponses aux appels d&apos;offres avec l&apos;aide de l&apos;IA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled>
              <span>Créer un nouvel AO</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
