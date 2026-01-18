"use client";

import { AlertCircle, Banknote, Calendar, FileText, PenLine } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { markdownToHtml, transformPlaceholders } from "~/lib/utils/markdown-parser";
import { cn, hasRealContent } from "~/lib/utils";

interface OverviewDashboardProps {
  project: {
    title: string;
    reference: string | null;
    departmentName: string | null;
    contactName: string | null;
    contactEmail: string | null;
    budgetRange: string | null;
    estimatedAmount: number | null;
    desiredDeliveryDate: string | null;
    budgetValidated: number | null;
    urgencyJustification: string | null;
    context: string | null;
    description: string | null;
    constraints: string | null;
    notes: string | null;
    status: string;
    createdAt: Date;
  };
  onCardClick?: (moduleId: string) => void;
  className?: string;
}

interface OverviewCardProps {
  title: string;
  moduleId: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: (moduleId: string) => void;
}

function OverviewCard({ title, moduleId, icon, children, onClick }: OverviewCardProps) {
  return (
    <Card
      className={cn(
        "transition-colors",
        onClick && "cursor-pointer hover:border-primary/50"
      )}
      onClick={() => onClick?.(moduleId)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className="rounded-full bg-muted p-3 mb-3">
        <PenLine className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
      <p className="text-xs text-muted-foreground/60 mt-1">
        Cliquez pour compléter avec l&apos;assistant IA
      </p>
    </div>
  );
}

export function OverviewDashboard({
  project,
  onCardClick,
  className,
}: OverviewDashboardProps) {
  return (
    <div className={cn("h-full overflow-y-auto p-6", className)}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {project.departmentName && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <FileText className="h-4 w-4" />
                  Service demandeur
                </div>
                <div className="font-medium text-sm">{project.departmentName}</div>
              </CardContent>
            </Card>
          )}
          {project.contactName && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  Contact
                </div>
                <div className="font-medium text-sm">{project.contactName}</div>
              </CardContent>
            </Card>
          )}
          {project.budgetRange && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  Budget estimé
                </div>
                <div className="font-medium text-sm">{project.budgetRange}</div>
              </CardContent>
            </Card>
          )}
          {project.desiredDeliveryDate && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Date souhaitée
                </div>
                <div className="font-medium text-sm">
                  {new Date(project.desiredDeliveryDate).toLocaleDateString("fr-FR")}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Row 1: Context and Description */}
        <div className="grid gap-6 md:grid-cols-2">
          <OverviewCard
            title="Contexte & Justification"
            moduleId="context"
            onClick={onCardClick}
          >
            {hasRealContent(project.context) ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: transformPlaceholders(markdownToHtml(project.context ?? "")) }}
              />
            ) : (
              <EmptyState message="Section à compléter" />
            )}
          </OverviewCard>

          <OverviewCard
            title="Description du besoin"
            moduleId="description"
            onClick={onCardClick}
          >
            {hasRealContent(project.description) ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: transformPlaceholders(markdownToHtml(project.description ?? "")) }}
              />
            ) : (
              <EmptyState message="Section à compléter" />
            )}
          </OverviewCard>
        </div>

        {/* Row 2: Constraints and Budget */}
        <div className="grid gap-6 md:grid-cols-2">
          <OverviewCard
            title="Contraintes identifiées"
            moduleId="constraints"
            onClick={onCardClick}
          >
            {hasRealContent(project.constraints) ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: transformPlaceholders(markdownToHtml(project.constraints ?? "")) }}
              />
            ) : (
              <EmptyState message="Section à compléter" />
            )}
          </OverviewCard>

          <OverviewCard
            title="Budget & Délais"
            moduleId="budget"
            icon={<Banknote className="h-5 w-5" />}
            onClick={onCardClick}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Fourchette budgétaire
                  </h4>
                  <p className="text-sm">
                    {project.budgetRange ?? (
                      <span className="italic text-muted-foreground">Non renseigné</span>
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Montant estimé
                  </h4>
                  <p className="text-sm">
                    {project.estimatedAmount ? (
                      `${project.estimatedAmount.toLocaleString("fr-FR")} EUR`
                    ) : (
                      <span className="italic text-muted-foreground">Non renseigné</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Date souhaitée
                  </h4>
                  <p className="text-sm">
                    {project.desiredDeliveryDate ? (
                      new Date(project.desiredDeliveryDate).toLocaleDateString("fr-FR")
                    ) : (
                      <span className="italic text-muted-foreground">Non renseignée</span>
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Statut budget
                  </h4>
                  <div className="text-sm">
                    {project.budgetValidated === 1 ? (
                      <Badge variant="default" className="bg-green-600">
                        Validé
                      </Badge>
                    ) : (
                      <Badge variant="outline">À valider</Badge>
                    )}
                  </div>
                </div>
              </div>
              {project.urgencyJustification && (
                <div className="pt-2 border-t">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
                    Justification urgence
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">
                    {project.urgencyJustification}
                  </p>
                </div>
              )}
            </div>
          </OverviewCard>
        </div>
      </div>
    </div>
  );
}
