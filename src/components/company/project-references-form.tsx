"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  Calendar,
  Edit,
  Euro,
  MapPin,
  Plus,
  Star,
  Trash2,
  User,
  Briefcase,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
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
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

const PROJECT_SECTORS = [
  "BTP",
  "IT / Numérique",
  "Services",
  "Conseil",
  "Industrie",
  "Transport",
  "Énergie",
  "Santé",
  "Éducation",
  "Finance",
  "Commerce",
  "Autre",
] as const;

const projectReferenceSchema = z.object({
  projectName: z.string().min(1, "Le nom du projet est requis").max(255),
  clientName: z.string().min(1, "Le nom du client est requis").max(255),
  clientType: z.enum(["public", "private"]).optional(),
  sector: z.string().max(100).optional(),
  description: z.string().optional(),
  amount: z.coerce.number().int().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().max(255).optional(),
  contactName: z.string().max(255).optional(),
  contactEmail: z.string().email("Email invalide").max(255).optional().or(z.literal("")),
  contactPhone: z.string().max(20).optional(),
  isHighlight: z.boolean().optional(),
  tags: z.string().optional(), // Comma-separated tags
});

type ProjectReferenceInput = z.infer<typeof projectReferenceSchema>;

interface ProjectReferenceFormDialogProps {
  projectReference?: {
    id: string;
    projectName: string;
    clientName: string;
    clientType: string | null;
    sector: string | null;
    description: string | null;
    amount: number | null;
    startDate: string | null;
    endDate: string | null;
    location: string | null;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    isHighlight: number | null;
    tags: string[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function ProjectReferenceFormDialog({
  projectReference,
  open,
  onOpenChange,
  onSuccess,
}: ProjectReferenceFormDialogProps) {
  const isEditing = !!projectReference;

  const form = useForm<ProjectReferenceInput>({
    resolver: zodResolver(projectReferenceSchema),
    defaultValues: {
      projectName: projectReference?.projectName ?? "",
      clientName: projectReference?.clientName ?? "",
      clientType: (projectReference?.clientType as "public" | "private") ?? undefined,
      sector: projectReference?.sector ?? "",
      description: projectReference?.description ?? "",
      amount: projectReference?.amount ?? undefined,
      startDate: projectReference?.startDate ?? "",
      endDate: projectReference?.endDate ?? "",
      location: projectReference?.location ?? "",
      contactName: projectReference?.contactName ?? "",
      contactEmail: projectReference?.contactEmail ?? "",
      contactPhone: projectReference?.contactPhone ?? "",
      isHighlight: projectReference?.isHighlight === 1,
      tags: projectReference?.tags?.join(", ") ?? "",
    },
  });

  const createMutation = api.companyProjectReferences.create.useMutation({
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
      form.reset();
    },
  });

  const updateMutation = api.companyProjectReferences.update.useMutation({
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const onSubmit = async (data: ProjectReferenceInput) => {
    // Parse comma-separated tags into array
    const tags = data.tags
      ? data.tags.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    // Convert empty strings to null for optional fields
    const emptyToNull = (value: string | undefined) => (value && value.trim() !== "" ? value : null);

    const payload = {
      projectName: data.projectName,
      clientName: data.clientName,
      clientType: data.clientType ?? null,
      sector: emptyToNull(data.sector),
      description: emptyToNull(data.description),
      amount: data.amount ?? null,
      startDate: emptyToNull(data.startDate),
      endDate: emptyToNull(data.endDate),
      location: emptyToNull(data.location),
      contactName: emptyToNull(data.contactName),
      contactEmail: emptyToNull(data.contactEmail),
      contactPhone: emptyToNull(data.contactPhone),
      isHighlight: data.isHighlight ?? false,
      tags: tags.length > 0 ? tags : null,
    };

    if (isEditing) {
      await updateMutation.mutateAsync({
        id: projectReference.id,
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
            {isEditing ? "Modifier la référence" : "Ajouter une référence"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de la référence projet"
              : "Ajoutez une nouvelle référence de projet réalisé"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Project Info */}
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du projet *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Construction du siège social..."
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du client *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mairie de Paris, Société XYZ..."
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
                name="clientType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de client</FormLabel>
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

            {/* Sector and Location */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secteur d&apos;activité</FormLabel>
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
                        {PROJECT_SECTORS.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localisation</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Paris, Île-de-France..."
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Amount and Dates */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="150000"
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
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de début</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de fin</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isPending} {...field} />
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
                  <FormLabel>Description du projet</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description des travaux réalisés, contexte, résultats..."
                      disabled={isPending}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Reference */}
            <div className="rounded-md border p-4">
              <h4 className="mb-3 text-sm font-medium">Contact de référence (optionnel)</h4>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="M. Dupont"
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
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contact@client.fr"
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
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+33 1 23 45 67 89"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags / Mots-clés</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="rénovation, haute qualité environnementale, ..."
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Séparez les tags par des virgules
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Highlight */}
            <FormField
              control={form.control}
              name="isHighlight"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Référence phare</FormLabel>
                    <FormDescription>
                      Mettre en avant cette référence dans les appels d&apos;offres
                    </FormDescription>
                  </div>
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
                    : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface ProjectReferenceCardProps {
  projectReference: {
    id: string;
    projectName: string;
    clientName: string;
    clientType: string | null;
    sector: string | null;
    description: string | null;
    amount: number | null;
    startDate: string | null;
    endDate: string | null;
    location: string | null;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    isHighlight: number | null;
    tags: string[];
  };
  onEdit: () => void;
  onDelete: () => void;
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

function ProjectReferenceCard({ projectReference, onEdit, onDelete }: ProjectReferenceCardProps) {
  const utils = api.useUtils();

  const deleteMutation = api.companyProjectReferences.delete.useMutation({
    onSuccess: onDelete,
  });

  const toggleHighlightMutation = api.companyProjectReferences.toggleHighlight.useMutation({
    onSuccess: () => {
      void utils.companyProjectReferences.list.invalidate();
    },
  });

  const isHighlight = projectReference.isHighlight === 1;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("fr-FR", { year: "numeric", month: "short" });
  };

  return (
    <Card className={cn(isHighlight && "border-primary/50 bg-primary/5")}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-base">
              {projectReference.projectName}
              {isHighlight && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {projectReference.clientName}
              </span>
              {projectReference.clientType && (
                <Badge variant="outline" className="text-xs">
                  {projectReference.clientType === "public" ? "Public" : "Privé"}
                </Badge>
              )}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleHighlightMutation.mutate({ id: projectReference.id })}
            className={cn(
              "h-8 w-8 p-0",
              isHighlight && "text-yellow-500 hover:text-yellow-600"
            )}
            title={isHighlight ? "Retirer des références phares" : "Marquer comme référence phare"}
          >
            <Star className={cn("h-4 w-4", isHighlight && "fill-current")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          {/* Sector, location, amount */}
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            {projectReference.sector && (
              <div className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                <span>{projectReference.sector}</span>
              </div>
            )}
            {projectReference.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{projectReference.location}</span>
              </div>
            )}
            {projectReference.amount !== null && (
              <div className="flex items-center gap-1">
                <Euro className="h-3 w-3" />
                <span className="font-medium text-foreground">
                  {formatAmount(projectReference.amount)}
                </span>
              </div>
            )}
          </div>

          {/* Dates */}
          {(projectReference.startDate ?? projectReference.endDate) && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDate(projectReference.startDate)}
                {projectReference.startDate && projectReference.endDate && " - "}
                {formatDate(projectReference.endDate)}
              </span>
            </div>
          )}

          {/* Description */}
          {projectReference.description && (
            <p className="text-muted-foreground">{projectReference.description}</p>
          )}

          {/* Tags */}
          {projectReference.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {projectReference.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Contact reference */}
          {projectReference.contactName && (
            <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>Contact: {projectReference.contactName}</span>
              {projectReference.contactEmail && (
                <span>• {projectReference.contactEmail}</span>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="mr-1 h-4 w-4" />
            Modifier
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer cette référence ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. La référence &quot;{projectReference.projectName}&quot;
                  {" "}sera définitivement supprimée.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate({ id: projectReference.id })}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectReferencesForm() {
  const utils = api.useUtils();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReference, setEditingReference] = useState<
    ProjectReferenceCardProps["projectReference"] | null
  >(null);

  const { data, isLoading } = api.companyProjectReferences.list.useQuery();

  const handleSuccess = () => {
    void utils.companyProjectReferences.list.invalidate();
  };

  const handleEdit = (projectReference: ProjectReferenceCardProps["projectReference"]) => {
    setEditingReference(projectReference);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingReference(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  const projectReferences = data?.projectReferences ?? [];
  const highlightCount = projectReferences.filter((r) => r.isHighlight === 1).length;
  const totalAmount = projectReferences.reduce((sum, r) => sum + (r.amount ?? 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      {projectReferences.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{projectReferences.length}</span>
            <span className="text-muted-foreground">
              référence{projectReferences.length > 1 ? "s" : ""}
            </span>
          </div>
          {highlightCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{highlightCount}</span>
              <span className="text-muted-foreground">
                phare{highlightCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
          {totalAmount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Euro className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatAmount(totalAmount)}</span>
              <span className="text-muted-foreground">total</span>
            </div>
          )}
        </div>
      )}

      {/* List of project references */}
      {projectReferences.map((reference) => (
        <ProjectReferenceCard
          key={reference.id}
          projectReference={reference}
          onEdit={() => handleEdit(reference)}
          onDelete={handleSuccess}
        />
      ))}

      {/* Empty state */}
      {projectReferences.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <Briefcase className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="mb-4 text-sm text-muted-foreground">
            Aucune référence projet enregistrée.
          </p>
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une référence
          </Button>
        </div>
      )}

      {/* Add button */}
      {projectReferences.length > 0 && (
        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une référence
        </Button>
      )}

      {/* Form dialog */}
      <ProjectReferenceFormDialog
        projectReference={editingReference ?? undefined}
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
