"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Archive,
  ArchiveRestore,
  ArrowUpDown,
  Check,
  Clock,
  Copy,
  Edit,
  FileText,
  Filter,
  GraduationCap,
  Hammer,
  Monitor,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
  Users,
  Wrench,
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
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Progress } from "~/components/ui/progress";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";
import { cn, stripHtmlTags, hasRealContent } from "~/lib/utils";
import { demandTemplates, type DemandTemplate } from "~/lib/demand-templates";

const demandProjectSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255),
  reference: z.string().max(100).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  departmentName: z.string().min(1, "Le service demandeur est requis").max(255),
  contactName: z.string().min(1, "Le nom du contact est requis").max(255),
  contactEmail: z.string().email("Email invalide").max(255),
  context: z.string().optional().or(z.literal("")),
  constraints: z.string().optional().or(z.literal("")),
  urgencyLevel: z.enum(["low", "medium", "high", "critical"]),
  needType: z.enum(["fourniture", "service", "travaux", "formation", "logiciel", "maintenance", "autre"]),
  budgetRange: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  templateId: z.string().optional(),
});

type DemandProjectInput = z.infer<typeof demandProjectSchema>;

interface DemandProject {
  id: string;
  title: string;
  reference: string | null;
  description: string | null;
  departmentName: string | null;
  contactName: string | null;
  contactEmail: string | null;
  urgencyLevel: string | null;
  needType: string | null;
  budgetRange: string | null;
  status: string;
  completionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

type StatusFilter = "all" | "draft" | "in_review" | "approved" | "sent_to_admin" | "archived";
type SortOption = "date_desc" | "date_asc" | "title_asc" | "title_desc" | "urgency_desc" | "status";

interface ProjectFormDialogProps {
  project?: DemandProject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Template icon mapping
const templateIcons: Record<string, React.ElementType> = {
  FileText,
  Monitor,
  Hammer,
  Users,
  GraduationCap,
  Package,
  Wrench,
};

function ProjectFormDialog({
  project,
  open,
  onOpenChange,
  onSuccess,
}: ProjectFormDialogProps) {
  const router = useRouter();
  const isEditing = !!project;
  const [selectedTemplate, setSelectedTemplate] = useState<DemandTemplate | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(!isEditing);

  // Fetch departments and team members from company profile
  const { data: formOptions } = api.companyProfile.getDemandFormOptions.useQuery();
  const departments = formOptions?.departments ?? [];
  const teamMembers = formOptions?.teamMembers ?? [];

  const form = useForm<DemandProjectInput>({
    resolver: zodResolver(demandProjectSchema),
    defaultValues: {
      title: project?.title ?? "",
      reference: project?.reference ?? "",
      description: project?.description ?? "",
      departmentName: project?.departmentName ?? "",
      contactName: project?.contactName ?? "",
      contactEmail: project?.contactEmail ?? "",
      urgencyLevel: (project?.urgencyLevel as "low" | "medium" | "high" | "critical") ?? "medium",
      needType: (project?.needType as "fourniture" | "service" | "travaux" | "formation" | "logiciel" | "maintenance" | "autre") ?? "autre",
      budgetRange: project?.budgetRange ?? "",
      notes: "",
      templateId: "",
    },
  });

  // Reset form and template selector when dialog opens/closes
  useEffect(() => {
    if (open && !isEditing) {
      // Reset form to empty values for new project
      form.reset({
        title: "",
        reference: "",
        description: "",
        departmentName: "",
        contactName: "",
        contactEmail: "",
        urgencyLevel: "medium",
        needType: "autre",
        budgetRange: "",
        notes: "",
        templateId: "",
      });
      setShowTemplateSelector(true);
      setSelectedTemplate(null);
    } else if (open && isEditing && project) {
      // Reset form to project values when editing
      form.reset({
        title: project.title ?? "",
        reference: project.reference ?? "",
        description: project.description ?? "",
        departmentName: project.departmentName ?? "",
        contactName: project.contactName ?? "",
        contactEmail: project.contactEmail ?? "",
        urgencyLevel: (project.urgencyLevel as "low" | "medium" | "high" | "critical") ?? "medium",
        needType: (project.needType as "fourniture" | "service" | "travaux" | "formation" | "logiciel" | "maintenance" | "autre") ?? "autre",
        budgetRange: project.budgetRange ?? "",
        notes: "",
        templateId: "",
      });
    }
  }, [open, isEditing, project, form]);

  const handleSelectTemplate = (template: DemandTemplate) => {
    setSelectedTemplate(template);
    // Pre-fill needType based on template
    form.setValue("needType", template.needType as "fourniture" | "service" | "travaux" | "formation" | "logiciel" | "maintenance" | "autre");
    form.setValue("templateId", template.id);
  };

  const handleContinueWithTemplate = () => {
    setShowTemplateSelector(false);
  };

  const handleBackToTemplates = () => {
    setShowTemplateSelector(true);
  };

  const createMutation = api.demandProjects.create.useMutation({
    onSuccess: (newProject) => {
      onSuccess();
      onOpenChange(false);
      form.reset();
      setSelectedTemplate(null);
      setShowTemplateSelector(true);
      router.push(`/demandes/${newProject.id}`);
    },
  });

  const updateMutation = api.demandProjects.update.useMutation({
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const onSubmit = async (data: DemandProjectInput) => {
    // Remove templateId from data as it's not a database field
    const { templateId, ...projectData } = data;
    void templateId; // Explicitly mark as intentionally unused

    if (isEditing) {
      await updateMutation.mutateAsync({
        id: project.id,
        data: projectData,
      });
    } else {
      // Apply template content when creating
      const template = selectedTemplate ?? demandTemplates[0];
      await createMutation.mutateAsync({
        ...projectData,
        context: template?.context ?? "",
        description: template?.descriptionContent ?? "",
        constraints: template?.constraints ?? "",
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error ?? updateMutation.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        {/* Template Selection View */}
        {showTemplateSelector && !isEditing ? (
          <>
            <DialogHeader>
              <DialogTitle>Choisir un modèle</DialogTitle>
              <DialogDescription>
                Sélectionnez un modèle adapté à votre type de demande pour démarrer avec une structure pré-définie.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4">
              {demandTemplates.map((template) => {
                const IconComponent = templateIcons[template.icon] ?? FileText;
                const isSelected = selectedTemplate?.id === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleSelectTemplate(template)}
                    className={cn(
                      "flex items-start gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50",
                      isSelected && "border-primary bg-primary/5 ring-1 ring-primary"
                    )}
                  >
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{template.name}</span>
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleContinueWithTemplate}
                disabled={!selectedTemplate}
              >
                Continuer
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* Form View */}
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Modifier le dossier" : "Nouveau Dossier de Demande"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Modifiez les informations du dossier"
                  : selectedTemplate
                    ? `Modèle: ${selectedTemplate.name}`
                    : "Créez un nouveau dossier de demande"}
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
                      <FormLabel>Titre du dossier *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Acquisition de matériel informatique..."
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

            {/* Reference (read-only when editing) and Department */}
            <div className={cn("grid gap-4", isEditing ? "grid-cols-2" : "grid-cols-1")}>
              {isEditing && (
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Référence interne</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="departmentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service demandeur *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Direction informatique"
                        disabled={isPending}
                        list="department-suggestions"
                        {...field}
                      />
                    </FormControl>
                    {departments.length > 0 && (
                      <datalist id="department-suggestions">
                        {departments.map((dept) => (
                          <option key={dept} value={dept} />
                        ))}
                      </datalist>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du responsable *</FormLabel>
                    <FormControl>
                      {teamMembers.length > 0 ? (
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Auto-fill email when team member selected
                            const member = teamMembers.find((m) => m.fullName === value);
                            if (member?.email) {
                              form.setValue("contactEmail", member.email);
                            }
                          }}
                          value={field.value}
                          disabled={isPending}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un responsable..." />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.id} value={member.fullName}>
                                <div className="flex flex-col">
                                  <span>{member.fullName}</span>
                                  {member.role && (
                                    <span className="text-xs text-muted-foreground">{member.role}</span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder="Jean Dupont"
                          disabled={isPending}
                          {...field}
                        />
                      )}
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
                    <FormLabel>Email de contact *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="jean.dupont@example.com"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Need Type and Urgency */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="needType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de besoin *</FormLabel>
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
                        <SelectItem value="fourniture">Fourniture / Équipement</SelectItem>
                        <SelectItem value="service">Prestation de service</SelectItem>
                        <SelectItem value="travaux">Travaux / Construction</SelectItem>
                        <SelectItem value="formation">Formation</SelectItem>
                        <SelectItem value="logiciel">Logiciel / Licence</SelectItem>
                        <SelectItem value="maintenance">Maintenance / Support</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgencyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau d&apos;urgence</FormLabel>
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
                        <SelectItem value="low">Faible</SelectItem>
                        <SelectItem value="medium">Moyen</SelectItem>
                        <SelectItem value="high">Urgent</SelectItem>
                        <SelectItem value="critical">Critique</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Budget */}
            <FormField
              control={form.control}
              name="budgetRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fourchette budgétaire estimée</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="50 000 - 100 000 EUR"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Context */}
            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contexte du besoin</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez le contexte et les objectifs de cette demande..."
                      disabled={isPending}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description / Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Détails supplémentaires..."
                      disabled={isPending}
                      rows={2}
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

                <DialogFooter className="flex-col gap-2 sm:flex-row">
                  {!isEditing && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleBackToTemplates}
                      disabled={isPending}
                      className="sm:mr-auto"
                    >
                      ← Changer de modèle
                    </Button>
                  )}
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
                        : "Créer le dossier"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ProjectCardProps {
  project: DemandProject;
  onEdit: () => void;
  onRefresh: () => void;
}

const statusConfig = {
  draft: { label: "Brouillon", variant: "secondary" as const, className: "" },
  in_review: { label: "En relecture", variant: "default" as const, className: "bg-blue-500" },
  approved: { label: "Approuvé", variant: "default" as const, className: "bg-green-500" },
  sent_to_admin: { label: "Envoyé", variant: "default" as const, className: "bg-purple-500" },
  converted_to_ao: { label: "Converti en AO", variant: "default" as const, className: "bg-emerald-600" },
  archived: { label: "Archivé", variant: "outline" as const, className: "" },
};

const urgencyConfig = {
  low: { label: "Faible", className: "text-gray-600" },
  medium: { label: "Moyen", className: "text-blue-600" },
  high: { label: "Urgent", className: "text-orange-600" },
  critical: { label: "Critique", className: "text-red-600" },
};

function ProjectCard({ project, onEdit, onRefresh }: ProjectCardProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateTitle, setDuplicateTitle] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const utils = api.useUtils();

  const updateStatusMutation = api.demandProjects.updateStatus.useMutation({
    onSuccess: () => {
      void utils.demandProjects.list.invalidate();
    },
  });

  const archiveMutation = api.demandProjects.archive.useMutation({
    onSuccess: onRefresh,
  });

  const unarchiveMutation = api.demandProjects.unarchive.useMutation({
    onSuccess: onRefresh,
  });

  const duplicateMutation = api.demandProjects.duplicate.useMutation({
    onSuccess: (newProject) => {
      onRefresh();
      setDuplicateDialogOpen(false);
      router.push(`/demandes/${newProject.id}`);
    },
  });

  const handleOpenDuplicateDialog = () => {
    setDuplicateTitle(`${project.title} (copie)`);
    setSaveAsTemplate(false);
    setDuplicateDialogOpen(true);
  };

  const handleDuplicate = () => {
    duplicateMutation.mutate({
      id: project.id,
      newTitle: duplicateTitle,
      asTemplate: saveAsTemplate,
      templateName: saveAsTemplate ? project.title : undefined,
    });
  };

  const deleteMutation = api.demandProjects.delete.useMutation({
    onSuccess: () => {
      setDeleteDialogOpen(false);
      onRefresh();
    },
    onError: (error) => {
      setDeleteDialogOpen(false);
      window.alert(`Erreur lors de la suppression: ${error.message}`);
    },
  });

  const isArchived = project.status === "archived";
  const status = statusConfig[project.status as keyof typeof statusConfig] ?? statusConfig.draft;
  const urgency = project.urgencyLevel ? urgencyConfig[project.urgencyLevel as keyof typeof urgencyConfig] : null;

  return (
    <>
      <Card>
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
                {project.departmentName && <span>{project.departmentName}</span>}
                {project.reference && (
                  <span className="text-muted-foreground">
                    {project.departmentName && " • "}
                    Réf: {project.reference}
                  </span>
                )}
              </CardDescription>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenDuplicateDialog}>
                  <Copy className="mr-2 h-4 w-4" />
                  Dupliquer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate({ id: project.id, status: "in_review" })}
                  disabled={project.status === "in_review"}
                >
                  Passer en relecture
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate({ id: project.id, status: "approved" })}
                  disabled={project.status === "approved"}
                >
                  Marquer approuvé
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate({ id: project.id, status: "sent_to_admin" })}
                  disabled={project.status === "sent_to_admin"}
                >
                  Marquer envoyé
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isArchived ? (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    unarchiveMutation.mutate({ id: project.id });
                  }}>
                    <ArchiveRestore className="mr-2 h-4 w-4" />
                    Désarchiver
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    setArchiveDialogOpen(true);
                  }}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archiver
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteDialogOpen(true);
                  }}
                  className="text-destructive focus:text-destructive"
                  disabled={project.status === "sent_to_admin" || project.status === "converted_to_ao"}
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
            {/* Urgency and budget */}
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              {urgency && (
                <div className={cn("flex items-center gap-1", urgency.className)}>
                  <Clock className="h-3 w-3" />
                  <span>{urgency.label}</span>
                </div>
              )}
              {project.budgetRange && (
                <Badge variant="outline" className="text-xs">
                  {project.budgetRange}
                </Badge>
              )}
            </div>

            {/* Description preview - only show if has real content (not just placeholders) */}
            {hasRealContent(project.description) && (
              <p className="line-clamp-2 text-muted-foreground">{stripHtmlTags(project.description)}</p>
            )}

            {/* Completion percentage */}
            <div className="pt-2 border-t mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Complétion</span>
                <span className={cn(
                  "font-medium",
                  project.completionPercentage >= 80 && "text-green-600",
                  project.completionPercentage >= 50 && project.completionPercentage < 80 && "text-blue-600",
                  project.completionPercentage < 50 && "text-orange-600"
                )}>
                  {project.completionPercentage}%
                </span>
              </div>
              <Progress
                value={project.completionPercentage}
                className={cn(
                  "h-1.5",
                  project.completionPercentage >= 80 && "[&>div]:bg-green-500",
                  project.completionPercentage >= 50 && project.completionPercentage < 80 && "[&>div]:bg-blue-500",
                  project.completionPercentage < 50 && "[&>div]:bg-orange-500"
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Duplicate Dialog */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Dupliquer le dossier</DialogTitle>
            <DialogDescription>
              Créez une copie de ce dossier.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="duplicate-title">Titre du nouveau dossier</Label>
              <Input
                id="duplicate-title"
                value={duplicateTitle}
                onChange={(e) => setDuplicateTitle(e.target.value)}
                placeholder="Titre du dossier..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="save-as-template"
                checked={saveAsTemplate}
                onCheckedChange={(checked) => setSaveAsTemplate(checked === true)}
              />
              <Label htmlFor="save-as-template" className="text-sm font-normal cursor-pointer">
                Enregistrer comme template réutilisable
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleDuplicate}
              disabled={!duplicateTitle.trim() || duplicateMutation.isPending}
            >
              {duplicateMutation.isPending ? "Duplication..." : "Dupliquer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Archiver ce dossier ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le dossier &quot;{project.title}&quot; sera déplacé dans les archives.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                archiveMutation.mutate({ id: project.id });
              }}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce dossier ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le dossier &quot;{project.title}&quot;
              {" "}et tous ses documents associés seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                deleteMutation.mutate({ id: project.id });
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "date_desc", label: "Plus récent" },
  { value: "date_asc", label: "Plus ancien" },
  { value: "title_asc", label: "Titre A-Z" },
  { value: "title_desc", label: "Titre Z-A" },
  { value: "urgency_desc", label: "Urgence" },
  { value: "status", label: "Statut" },
];

const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
const statusOrder = { draft: 0, in_review: 1, approved: 2, sent_to_admin: 3, converted_to_ao: 4, archived: 5 };

export function DemandProjectsList() {
  const router = useRouter();
  const utils = api.useUtils();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<DemandProject | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date_desc");

  const { data, isLoading } = api.demandProjects.list.useQuery({
    includeArchived: statusFilter === "archived",
    status: statusFilter !== "all" && statusFilter !== "archived" ? statusFilter : undefined,
  });

  const handleSuccess = () => {
    void utils.demandProjects.list.invalidate();
  };

  const handleEdit = (project: DemandProject) => {
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
  const counts = data?.counts ?? { total: 0, draft: 0, inReview: 0, approved: 0, sentToAdmin: 0 };

  // Filter based on status and search query
  const filteredProjects = projects
    .filter((p) => {
      // Status filter
      if (statusFilter === "archived") {
        if (p.status !== "archived") return false;
      } else {
        if (p.status === "archived") return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = p.title.toLowerCase().includes(query);
        const refMatch = p.reference?.toLowerCase().includes(query) ?? false;
        const deptMatch = p.departmentName?.toLowerCase().includes(query) ?? false;
        return titleMatch || refMatch || deptMatch;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "date_asc":
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case "title_asc":
          return a.title.localeCompare(b.title, "fr");
        case "title_desc":
          return b.title.localeCompare(a.title, "fr");
        case "urgency_desc":
          const urgA = urgencyOrder[a.urgencyLevel as keyof typeof urgencyOrder] ?? 3;
          const urgB = urgencyOrder[b.urgencyLevel as keyof typeof urgencyOrder] ?? 3;
          return urgA - urgB;
        case "status":
          const statA = statusOrder[a.status as keyof typeof statusOrder] ?? 5;
          const statB = statusOrder[b.status as keyof typeof statusOrder] ?? 5;
          return statA - statB;
        default:
          return 0;
      }
    });

  // Navigate to project workspace when clicking on card
  const handleCardClick = (projectId: string) => {
    router.push(`/demandes/${projectId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes Dossiers de Demande</h1>
          <p className="text-muted-foreground">
            Gérez vos dossiers de demande internes
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau dossier
        </Button>
      </div>

      {/* Stats */}
      {!isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{counts.total}</div>
              <p className="text-xs text-muted-foreground">Dossiers actifs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{counts.inReview}</div>
              <p className="text-xs text-muted-foreground">En relecture</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{counts.approved}</div>
              <p className="text-xs text-muted-foreground">Approuvés</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{counts.sentToAdmin}</div>
              <p className="text-xs text-muted-foreground">Envoyés</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre, référence ou service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Trier par..." />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="all">
              Tous
              {counts.total > 0 && <Badge variant="secondary" className="ml-2 h-5 px-1.5">{counts.total}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="draft">
              Brouillon
              {counts.draft > 0 && <Badge variant="secondary" className="ml-2 h-5 px-1.5">{counts.draft}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="in_review">
              En relecture
              {counts.inReview > 0 && <Badge variant="secondary" className="ml-2 h-5 px-1.5 bg-blue-100 text-blue-700">{counts.inReview}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approuvés
              {counts.approved > 0 && <Badge variant="secondary" className="ml-2 h-5 px-1.5 bg-green-100 text-green-700">{counts.approved}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="archived">Archivés</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Projects List */}
      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              {searchQuery.trim() ? (
                <>
                  <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-2 text-lg font-medium">Aucun résultat</h3>
                  <p className="text-sm text-muted-foreground">
                    Aucun dossier ne correspond à &quot;{searchQuery}&quot;
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSearchQuery("")}
                  >
                    Effacer la recherche
                  </Button>
                </>
              ) : statusFilter === "archived" ? (
                <>
                  <Archive className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-2 text-lg font-medium">Aucun dossier archivé</h3>
                  <p className="text-sm text-muted-foreground">
                    Les dossiers archivés apparaîtront ici
                  </p>
                </>
              ) : statusFilter !== "all" ? (
                <>
                  <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-2 text-lg font-medium">Aucun dossier avec ce statut</h3>
                  <p className="text-sm text-muted-foreground">
                    Aucun dossier {statusFilter === "draft" ? "en brouillon" : statusFilter === "in_review" ? "en relecture" : "approuvé"}
                  </p>
                </>
              ) : (
                <>
                  <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-2 text-lg font-medium">Aucun dossier</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Créez votre premier dossier de demande
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau dossier
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleCardClick(project.id)}
                className="cursor-pointer transition-shadow hover:shadow-md"
              >
                <ProjectCard
                  project={project}
                  onEdit={() => handleEdit(project)}
                  onRefresh={handleSuccess}
                />
              </div>
            ))}
          </div>
        )}
      </div>

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
