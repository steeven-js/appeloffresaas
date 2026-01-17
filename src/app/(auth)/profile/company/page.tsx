import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { CompanyProfileForm } from "~/components/company/company-profile-form";
import { FinancialDataForm } from "~/components/company/financial-data-form";
import { CertificationsForm } from "~/components/company/certifications-form";
import { TeamMembersForm } from "~/components/company/team-members-form";
import { ProjectReferencesForm } from "~/components/company/project-references-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export const metadata = {
  title: "Profil Entreprise - Appel Offre SaaS",
  description: "Gérez les informations de votre entreprise",
};

export default async function CompanyProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profil Entreprise</h1>
            <p className="text-muted-foreground">
              Renseignez les informations de votre entreprise pour vos appels d&apos;offres
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/settings">Retour aux paramètres</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations de base</CardTitle>
            <CardDescription>
              Ces informations seront utilisées pour pré-remplir vos réponses aux appels d&apos;offres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyProfileForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Données financières</CardTitle>
            <CardDescription>
              Chiffre d&apos;affaires, résultat et effectifs des dernières années
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FinancialDataForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certifications & Qualifications</CardTitle>
            <CardDescription>
              ISO, Qualibat, RGE et autres certifications de votre entreprise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CertificationsForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Équipe & Compétences</CardTitle>
            <CardDescription>
              Les membres clés de votre équipe et leurs compétences pour les appels d&apos;offres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TeamMembersForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Références Projets</CardTitle>
            <CardDescription>
              Vos réalisations passées à présenter dans les appels d&apos;offres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectReferencesForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
