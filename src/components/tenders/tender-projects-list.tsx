"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertTriangle,
  Archive,
  Clock,
  Copy,
  Edit,
  Euro,
  ExternalLink,
  FileText,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

const tenderProjectSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255),
  reference: z.string().max(100).optional(),
  description: z.string().optional(),
  buyerName: z.string().max(255).optional(),
  buyerType: z.enum(["public", "private"]).optional(),
  estimatedAmount: z.coerce.number().int().min(0).optional(),
  lotNumber: z.string().max(50).optional(),
  publicationDate: z.string().optional(),
  submissionDeadline: z.string().optional(),
  sourceUrl: z.string().url().max(500).optional().or(z.literal("")),
  sourcePlatform: z.string().max(100).optional(),
  notes: z.string().optional(),
});

type TenderProjectInput = z.infer<typeof tenderProjectSchema>;

interface TenderProject {
  id: string;
  title: string;
  reference: string | null;
  description: string | null;
  buyerName: string | null;
  buyerType: string | null;
  estimatedAmount: number | null;
  lotNumber: string | null;
  publicationDate: string | null;
  submissionDeadline: Date | null;
  status: string;
  sourceUrl: string | null;
  sourcePlatform: string | null;
  notes: string | null;
  deadlineStatus: "upcoming" | "urgent" | "passed" | "none";
  createdAt: Date;
}

interface ProjectFormDialogProps {
  project?: TenderProject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function ProjectFormDialog({
  project,
  open,
  onOpenChange,
  onSuccess,
}: ProjectFormDialogProps) {
  const isEditing = !!project;

  const form = useForm<TenderProjectInput>({
    resolver: zodResolver(tenderProjectSchema),
    defaultValues: {
      title: project?.title ?? "",
      reference: project?.reference ?? "",
      description: project?.description ?? "",
      buyerName: project?.buyerName ?? "",
      buyerType: (project?.buyerType as "public" | "private") ?? undefined,
      estimatedAmount: project?.estimatedAmount ?? undefined,
      lotNumber: project?.lotNumber ?? "",
      publicationDate: project?.publicationDate ?? "",
      submissionDeadline: project?.submissionDeadline
        ? new Date(project.submissionDeadline).toISOString().slice(0, 16)
        : "",
      sourceUrl: project?.sourceUrl ?? "",
      sourcePlatform: project?.sourcePlatform ?? "",
      notes: project?.notes ?? "",
    },
  });

  const createMutation = api.tenderProjects.create.useMutation({
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
      form.reset();
    },
  });

  const updateMutation = api.tenderProjects.update.useMutation({
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const onSubmit = async (data: TenderProjectInput) => {
    const payload = {
      ...data,
      estimatedAmount: data.estimatedAmount ?? null,
    };

    if (isEditing) {
      await updateMutation.mutateAsync({
        id: project.id,
        data: payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error ?? updateMutation.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le projet" : "Nouveau projet AO"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations du projet"
              : "Créez un nouveau projet d'appel d'offres"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre du projet *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Construction du nouveau collège..."
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reference and Lot */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Référence / N° marché</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="2024-AO-0123"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lotNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de lot</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Lot 3"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Buyer info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="buyerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acheteur / Maître d&apos;ouvrage</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ville de Lyon, Région..."
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buyerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d&apos;acheteur</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Privé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Amount and deadline */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant estimé (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="500000"
                        disabled={isPending}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="submissionDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date limite de soumission</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Source */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sourcePlatform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plateforme source</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BOAMP">BOAMP</SelectItem>
                        <SelectItem value="TED">TED (Europe)</SelectItem>
                        <SelectItem value="achatpublic.com">achatpublic.com</SelectItem>
                        <SelectItem value="marchespublics.gouv.fr">marchespublics.gouv.fr</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sourceUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de l&apos;avis</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://..."
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description / Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Détails du projet, points d'attention..."
                      disabled={isPending}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error.message}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Enregistrement..."
                  : isEditing
                    ? "Enregistrer"
                    : "Créer le projet"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface ProjectCardProps {
  project: TenderProject;
  onEdit: () => void;
  onRefresh: () => void;
}

function formatAmount(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")} M€`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)} k€`;
  }
  return `${amount} €`;
}

function formatDeadline(deadline: Date | null): string {
  if (!deadline) return "";
  const d = new Date(deadline);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDaysUntilDeadline(deadline: Date | null): number | null {
  if (!deadline) return null;
  const now = new Date();
  const d = new Date(deadline);
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const statusConfig = {
  draft: { label: "Brouillon", variant: "secondary" as const, className: "" },
  in_progress: { label: "En cours", variant: "default" as const, className: "bg-blue-500" },
  submitted: { label: "Soumis", variant: "default" as const, className: "bg-green-500" },
  won: { label: "Gagné", variant: "default" as const, className: "bg-emerald-600" },
  lost: { label: "Perdu", variant: "destructive" as const, className: "" },
  archived: { label: "Archivé", variant: "outline" as const, className: "" },
};

function ProjectCard({ project, onEdit, onRefresh }: ProjectCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const utils = api.useUtils();

  const updateStatusMutation = api.tenderProjects.updateStatus.useMutation({
    onSuccess: () => {
      void utils.tenderProjects.list.invalidate();
    },
  });

  const archiveMutation = api.tenderProjects.archive.useMutation({
    onSuccess: onRefresh,
  });

  const duplicateMutation = api.tenderProjects.duplicate.useMutation({
    onSuccess: onRefresh,
  });

  const deleteMutation = api.tenderProjects.delete.useMutation({
    onSuccess: onRefresh,
  });

  const status = statusConfig[project.status as keyof typeof statusConfig] ?? statusConfig.draft;
  const daysUntil = getDaysUntilDeadline(project.submissionDeadline);

  return (
    <>
      <Card className={cn(
        project.deadlineStatus === "urgent" && "border-orange-400",
        project.deadlineStatus === "passed" && "border-red-400 opacity-75"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{project.title}</CardTitle>
                <Badge variant={status.variant} className={status.className}>
                  {status.label}
                </Badge>
              </div>
              <CardDescription className="mt-1">
                {project.buyerName && <span>{project.buyerName}</span>}
                {project.reference && (
                  <span className="text-muted-foreground">
                    {project.buyerName && " • "}
                    Réf: {project.reference}
                  </span>
                )}
              </CardDescription>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => duplicateMutation.mutate({ id: project.id })}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Dupliquer
                </DropdownMenuItem>
                {project.sourceUrl && (
                  <DropdownMenuItem asChild>
                    <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Voir l&apos;avis
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate({ id: project.id, status: "in_progress" })}
                  disabled={project.status === "in_progress"}
                >
                  Marquer en cours
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate({ id: project.id, status: "submitted" })}
                  disabled={project.status === "submitted"}
                >
                  Marquer soumis
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate({ id: project.id, status: "won" })}
                >
                  Marquer gagné
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate({ id: project.id, status: "lost" })}
                >
                  Marquer perdu
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => archiveMutation.mutate({ id: project.id })}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archiver
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {/* Deadline and amount */}
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              {project.submissionDeadline && (
                <div className={cn(
                  "flex items-center gap-1",
                  project.deadlineStatus === "urgent" && "text-orange-600 font-medium",
                  project.deadlineStatus === "passed" && "text-red-600"
                )}>
                  {project.deadlineStatus === "urgent" && <AlertTriangle className="h-3 w-3" />}
                  <Clock className="h-3 w-3" />
                  <span>{formatDeadline(project.submissionDeadline)}</span>
                  {daysUntil !== null && daysUntil > 0 && (
                    <span className="text-xs">({daysUntil}j)</span>
                  )}
                  {daysUntil !== null && daysUntil <= 0 && (
                    <span className="text-xs">(passé)</span>
                  )}
                </div>
              )}
              {project.estimatedAmount !== null && (
                <div className="flex items-center gap-1">
                  <Euro className="h-3 w-3" />
                  <span>{formatAmount(project.estimatedAmount)}</span>
                </div>
              )}
              {project.buyerType && (
                <Badge variant="outline" className="text-xs">
                  {project.buyerType === "public" ? "Public" : "Privé"}
                </Badge>
              )}
            </div>

            {/* Description preview */}
            {project.description && (
              <p className="line-clamp-2 text-muted-foreground">{project.description}</p>
            )}

            {/* Source */}
            {project.sourcePlatform && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                <span>{project.sourcePlatform}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce projet ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le projet &quot;{project.title}&quot;
              {" "}sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate({ id: project.id })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function TenderProjectsList() {
  const utils = api.useUtils();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<TenderProject | null>(null);
  const [activeTab, setActiveTab] = useState("active");

  const { data, isLoading } = api.tenderProjects.list.useQuery({
    includeArchived: activeTab === "archived",
  });

  const handleSuccess = () => {
    void utils.tenderProjects.list.invalidate();
  };

  const handleEdit = (project: TenderProject) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingProject(null);
    }
  };

  const projects = data?.projects ?? [];
  const counts = data?.counts ?? { total: 0, draft: 0, inProgress: 0, submitted: 0, urgent: 0 };

  // Filter based on tab
  const filteredProjects = activeTab === "archived"
    ? projects.filter((p) => p.status === "archived")
    : projects.filter((p) => p.status !== "archived");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes Projets AO</h1>
          <p className="text-muted-foreground">
            Gérez vos projets d&apos;appels d&apos;offres
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau projet
        </Button>
      </div>

      {/* Stats */}
      {!isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{counts.total}</div>
              <p className="text-xs text-muted-foreground">Projets actifs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{counts.inProgress}</div>
              <p className="text-xs text-muted-foreground">En cours</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{counts.submitted}</div>
              <p className="text-xs text-muted-foreground">Soumis</p>
            </CardContent>
          </Card>
          <Card className={cn(counts.urgent > 0 && "border-orange-400")}>
            <CardContent className="p-4">
              <div className={cn("text-2xl font-bold", counts.urgent > 0 && "text-orange-600")}>
                {counts.urgent}
              </div>
              <p className="text-xs text-muted-foreground">Urgents (&lt;3j)</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Actifs</TabsTrigger>
          <TabsTrigger value="archived">Archivés</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-medium">Aucun projet</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Créez votre premier projet d&apos;appel d&apos;offres
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau projet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={() => handleEdit(project)}
                  onRefresh={handleSuccess}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived" className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Archive className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-medium">Aucun projet archivé</h3>
                <p className="text-sm text-muted-foreground">
                  Les projets archivés apparaîtront ici
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={() => handleEdit(project)}
                  onRefresh={handleSuccess}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Form dialog */}
      <ProjectFormDialog
        project={editingProject ?? undefined}
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
