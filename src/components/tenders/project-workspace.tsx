"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  ArrowLeft,
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  Download,
  Edit,
  Euro,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  Save,
  Settings,
  Trash2,
  Upload,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Progress } from "~/components/ui/progress";
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
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { RCParsingStatus } from "./rc-parsing-status";

const MAX_FILE_SIZE_MB = 10;

const projectSchema = z.object({
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

type ProjectInput = z.infer<typeof projectSchema>;

const statusConfig = {
  draft: { label: "Brouillon", variant: "secondary" as const, className: "" },
  in_progress: { label: "En cours", variant: "default" as const, className: "bg-blue-500" },
  submitted: { label: "Soumis", variant: "default" as const, className: "bg-green-500" },
  won: { label: "Gagné", variant: "default" as const, className: "bg-emerald-600" },
  lost: { label: "Perdu", variant: "destructive" as const, className: "" },
  archived: { label: "Archivé", variant: "outline" as const, className: "" },
};

function formatDeadline(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  isPassed: boolean;
}

function calculateCountdown(deadline: Date | null): CountdownValue | null {
  if (!deadline) return null;

  const now = new Date().getTime();
  const target = new Date(deadline).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
      isPassed: true,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, total: diff, isPassed: false };
}

interface ProjectWorkspaceProps {
  projectId: string;
}

interface UploadState {
  status: "idle" | "uploading" | "success" | "error";
  progress: number;
  message?: string;
}

export function ProjectWorkspace({ projectId }: ProjectWorkspaceProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle", progress: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [countdown, setCountdown] = useState<CountdownValue | null>(null);
  const utils = api.useUtils();

  const { data: project, isLoading, error } = api.tenderProjects.get.useQuery({ id: projectId });
  const { data: rcData, isLoading: isLoadingRC } = api.tenderDocuments.getRC.useQuery({ tenderProjectId: projectId });

  // Countdown timer effect (Story 3.3)
  useEffect(() => {
    if (!project?.submissionDeadline) {
      setCountdown(null);
      return;
    }

    // Initial calculation
    setCountdown(calculateCountdown(project.submissionDeadline));

    // Update every second
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(project.submissionDeadline));
    }, 1000);

    return () => clearInterval(interval);
  }, [project?.submissionDeadline]);

  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    values: project
      ? {
          title: project.title,
          reference: project.reference ?? "",
          description: project.description ?? "",
          buyerName: project.buyerName ?? "",
          buyerType: (project.buyerType as "public" | "private") ?? undefined,
          estimatedAmount: project.estimatedAmount ?? undefined,
          lotNumber: project.lotNumber ?? "",
          publicationDate: project.publicationDate ?? "",
          submissionDeadline: project.submissionDeadline
            ? new Date(project.submissionDeadline).toISOString().slice(0, 16)
            : "",
          sourceUrl: project.sourceUrl ?? "",
          sourcePlatform: project.sourcePlatform ?? "",
          notes: project.notes ?? "",
        }
      : undefined,
  });

  const updateMutation = api.tenderProjects.update.useMutation({
    onSuccess: () => {
      void utils.tenderProjects.get.invalidate({ id: projectId });
      setIsEditing(false);
    },
  });

  const updateStatusMutation = api.tenderProjects.updateStatus.useMutation({
    onSuccess: () => {
      void utils.tenderProjects.get.invalidate({ id: projectId });
    },
  });

  // Archive mutations (Story 3.5)
  const archiveMutation = api.tenderProjects.archive.useMutation({
    onSuccess: () => {
      router.push("/projects");
    },
  });

  const unarchiveMutation = api.tenderProjects.unarchive.useMutation({
    onSuccess: () => {
      void utils.tenderProjects.get.invalidate({ id: projectId });
    },
  });

  // Duplicate mutation (Story 3.6)
  const duplicateMutation = api.tenderProjects.duplicate.useMutation({
    onSuccess: (newProject) => {
      router.push(`/projects/${newProject.id}`);
    },
  });

  // Delete mutation (Story 3.7)
  const deleteMutation = api.tenderProjects.delete.useMutation({
    onSuccess: () => {
      router.push("/projects");
    },
  });

  const createDocumentMutation = api.tenderDocuments.create.useMutation({
    onSuccess: () => {
      void utils.tenderDocuments.getRC.invalidate({ tenderProjectId: projectId });
    },
  });

  const deleteDocumentMutation = api.tenderDocuments.delete.useMutation({
    onSuccess: () => {
      void utils.tenderDocuments.getRC.invalidate({ tenderProjectId: projectId });
    },
  });

  const previewMutation = api.tenderDocuments.getPreviewUrl.useMutation();
  const downloadMutation = api.tenderDocuments.getDownloadUrl.useMutation();

  const handleRCUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file) return;

    // Validate PDF only
    if (file.type !== "application/pdf") {
      setUploadState({
        status: "error",
        progress: 0,
        message: "Seuls les fichiers PDF sont acceptés",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setUploadState({
        status: "error",
        progress: 0,
        message: `Le fichier dépasse la limite de ${MAX_FILE_SIZE_MB} Mo`,
      });
      return;
    }

    setUploadState({ status: "uploading", progress: 10 });

    try {
      // Upload to R2
      const formData = new FormData();
      formData.append("file", file);

      setUploadState({ status: "uploading", progress: 30 });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json() as { error: string };
        throw new Error(error.error ?? "Erreur lors de l'upload");
      }

      setUploadState({ status: "uploading", progress: 70 });

      const result = await response.json() as {
        success: boolean;
        file: {
          fileName: string;
          originalName: string;
          mimeType: string;
          fileSize: number;
          storageKey: string;
        };
      };

      // Create document record
      await createDocumentMutation.mutateAsync({
        tenderProjectId: projectId,
        documentType: "rc",
        fileName: result.file.fileName,
        originalName: result.file.originalName,
        mimeType: result.file.mimeType,
        fileSize: result.file.fileSize,
        storageKey: result.file.storageKey,
      });

      setUploadState({
        status: "success",
        progress: 100,
        message: "RC uploadé avec succès",
      });

      // Reset after 3 seconds
      setTimeout(() => {
        setUploadState({ status: "idle", progress: 0 });
      }, 3000);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadState({
        status: "error",
        progress: 0,
        message: err instanceof Error ? err.message : "Erreur lors de l'upload",
      });
    }

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [createDocumentMutation, projectId]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    void handleRCUpload(e.dataTransfer.files);
  }, [handleRCUpload]);

  const handlePreviewRC = async () => {
    if (!rcData?.rcDocument) return;
    try {
      const result = await previewMutation.mutateAsync({ id: rcData.rcDocument.id });
      setPreviewUrl(result.url);
      setShowPreview(true);
    } catch (err) {
      console.error("Preview error:", err);
    }
  };

  const handleDownloadRC = async () => {
    if (!rcData?.rcDocument) return;
    try {
      const { url } = await downloadMutation.mutateAsync({ id: rcData.rcDocument.id });
      window.open(url, "_blank");
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const onSubmit = async (data: ProjectInput) => {
    await updateMutation.mutateAsync({
      id: projectId,
      data: {
        ...data,
        estimatedAmount: data.estimatedAmount ?? null,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-medium">Projet non trouvé</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Ce projet n&apos;existe pas ou vous n&apos;y avez pas accès.
            </p>
            <Button onClick={() => router.push("/projects")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux projets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[project.status as keyof typeof statusConfig] ?? statusConfig.draft;

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/projects")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{project.title}</h1>
                <Badge variant={status.variant} className={status.className}>
                  {status.label}
                </Badge>
              </div>
              {project.reference && (
                <p className="text-sm text-muted-foreground">Réf: {project.reference}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Duplicate Button (Story 3.6) */}
            <Button
              variant="outline"
              onClick={() => duplicateMutation.mutate({
                id: projectId,
                newTitle: `${project.title} (copie)`,
              })}
              disabled={duplicateMutation.isPending}
            >
              {duplicateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              Dupliquer
            </Button>
            {/* Archive/Unarchive Button (Story 3.5) */}
            {project.status === "archived" ? (
              <Button
                variant="outline"
                onClick={() => unarchiveMutation.mutate({ id: projectId })}
                disabled={unarchiveMutation.isPending}
              >
                {unarchiveMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                )}
                Désarchiver
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => archiveMutation.mutate({ id: projectId })}
                disabled={archiveMutation.isPending}
              >
                {archiveMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="mr-2 h-4 w-4" />
                )}
                Archiver
              </Button>
            )}
            {/* Delete Button (Story 3.7) */}
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
                <Button onClick={form.handleSubmit(onSubmit)} disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Deadline Card - Always Visible (Story 3.3) */}
        <Card className={cn(
          "border-2",
          !project.submissionDeadline && "border-dashed border-muted-foreground/30",
          project.deadlineStatus === "urgent" && "border-orange-400 bg-orange-50 dark:bg-orange-950/20",
          project.deadlineStatus === "passed" && "border-red-400 bg-red-50 dark:bg-red-950/20"
        )}>
          <CardContent className="p-4">
            {project.submissionDeadline ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Date limite de soumission
                  </div>
                  {countdown?.isPassed && (
                    <Badge variant="destructive">Expirée</Badge>
                  )}
                  {project.deadlineStatus === "urgent" && !countdown?.isPassed && (
                    <Badge variant="default" className="bg-orange-500">Urgent</Badge>
                  )}
                </div>
                <div className={cn(
                  "text-lg font-semibold",
                  project.deadlineStatus === "urgent" && "text-orange-600",
                  project.deadlineStatus === "passed" && "text-red-600"
                )}>
                  {formatDeadline(project.submissionDeadline)}
                </div>
                {/* Countdown Display */}
                {countdown && !countdown.isPassed && (
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t">
                    <div className="text-center">
                      <div className={cn(
                        "text-2xl font-bold tabular-nums",
                        countdown.days <= 3 && "text-orange-600",
                        countdown.days === 0 && countdown.hours <= 12 && "text-red-600"
                      )}>
                        {countdown.days}
                      </div>
                      <div className="text-xs text-muted-foreground">jours</div>
                    </div>
                    <div className="text-center">
                      <div className={cn(
                        "text-2xl font-bold tabular-nums",
                        countdown.days <= 3 && "text-orange-600",
                        countdown.days === 0 && countdown.hours <= 12 && "text-red-600"
                      )}>
                        {countdown.hours.toString().padStart(2, "0")}
                      </div>
                      <div className="text-xs text-muted-foreground">heures</div>
                    </div>
                    <div className="text-center">
                      <div className={cn(
                        "text-2xl font-bold tabular-nums",
                        countdown.days <= 3 && "text-orange-600",
                        countdown.days === 0 && countdown.hours <= 12 && "text-red-600"
                      )}>
                        {countdown.minutes.toString().padStart(2, "0")}
                      </div>
                      <div className="text-xs text-muted-foreground">minutes</div>
                    </div>
                    <div className="text-center">
                      <div className={cn(
                        "text-2xl font-bold tabular-nums",
                        countdown.days <= 3 && "text-orange-600",
                        countdown.days === 0 && countdown.hours <= 12 && "text-red-600"
                      )}>
                        {countdown.seconds.toString().padStart(2, "0")}
                      </div>
                      <div className="text-xs text-muted-foreground">secondes</div>
                    </div>
                  </div>
                )}
                {countdown?.isPassed && (
                  <div className="flex items-center gap-2 pt-2 border-t text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">La date limite est dépassée</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-2">
                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mb-2">
                  Aucune date limite définie
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Définir la deadline
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {project.estimatedAmount !== null && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Euro className="h-4 w-4" />
                  Montant estimé
                </div>
                <div className="font-medium">{formatAmount(project.estimatedAmount)}</div>
              </CardContent>
            </Card>
          )}
          {project.buyerName && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <FileText className="h-4 w-4" />
                  Acheteur
                </div>
                <div className="font-medium">{project.buyerName}</div>
              </CardContent>
            </Card>
          )}
          {project.sourceUrl && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <ExternalLink className="h-4 w-4" />
                  Source
                </div>
                <a
                  href={project.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  {project.sourcePlatform ?? "Voir l'avis"}
                </a>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="checklist" disabled>Checklist</TabsTrigger>
            <TabsTrigger value="responses" disabled>Réponses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Informations du projet
                  </CardTitle>
                  <CardDescription>
                    Modifiez les informations de votre projet AO
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                              <Input {...field} />
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
                                <Input placeholder="2024-AO-0123" {...field} />
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
                                <Input placeholder="Lot 3" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Buyer */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="buyerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Acheteur / Maître d&apos;ouvrage</FormLabel>
                              <FormControl>
                                <Input placeholder="Ville de Lyon..." {...field} />
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
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                <Input type="number" placeholder="100000" {...field} />
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
                                <Input type="datetime-local" {...field} />
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
                          name="sourceUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL de l&apos;avis</FormLabel>
                              <FormControl>
                                <Input type="url" placeholder="https://..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="sourcePlatform"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Plateforme source</FormLabel>
                              <FormControl>
                                <Input placeholder="BOAMP, TED..." {...field} />
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
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea rows={3} placeholder="Description du projet..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Notes */}
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes internes</FormLabel>
                            <FormControl>
                              <Textarea rows={2} placeholder="Notes personnelles..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Project Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.description && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                        <p className="text-sm">{project.description}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-muted-foreground mb-1">Type</h4>
                        <p>{project.buyerType === "public" ? "Marché public" : project.buyerType === "private" ? "Marché privé" : "-"}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-muted-foreground mb-1">Lot</h4>
                        <p>{project.lotNumber ?? "-"}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-muted-foreground mb-1">Date de publication</h4>
                        <p>{project.publicationDate ?? "-"}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-muted-foreground mb-1">Plateforme</h4>
                        <p>{project.sourcePlatform ?? "-"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Status & Actions Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Statut & Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Changer le statut</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant={project.status === "draft" ? "default" : "outline"}
                          onClick={() => updateStatusMutation.mutate({ id: projectId, status: "draft" })}
                        >
                          Brouillon
                        </Button>
                        <Button
                          size="sm"
                          variant={project.status === "in_progress" ? "default" : "outline"}
                          className={project.status === "in_progress" ? "bg-blue-500" : ""}
                          onClick={() => updateStatusMutation.mutate({ id: projectId, status: "in_progress" })}
                        >
                          En cours
                        </Button>
                        <Button
                          size="sm"
                          variant={project.status === "submitted" ? "default" : "outline"}
                          className={project.status === "submitted" ? "bg-green-500" : ""}
                          onClick={() => updateStatusMutation.mutate({ id: projectId, status: "submitted" })}
                        >
                          Soumis
                        </Button>
                        <Button
                          size="sm"
                          variant={project.status === "won" ? "default" : "outline"}
                          className={project.status === "won" ? "bg-emerald-600" : ""}
                          onClick={() => updateStatusMutation.mutate({ id: projectId, status: "won" })}
                        >
                          Gagné
                        </Button>
                        <Button
                          size="sm"
                          variant={project.status === "lost" ? "destructive" : "outline"}
                          onClick={() => updateStatusMutation.mutate({ id: projectId, status: "lost" })}
                        >
                          Perdu
                        </Button>
                      </div>
                    </div>
                    {project.notes && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
                        <p className="text-sm">{project.notes}</p>
                      </div>
                    )}
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        Créé le {new Date(project.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Coming Soon Card */}
                <Card className="md:col-span-2">
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mb-2 text-lg font-medium">Fonctionnalités à venir</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Les onglets Checklist et Réponses seront disponibles dans les prochaines mises à jour.
                      Ils vous permettront de suivre votre conformité et préparer vos réponses.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Documents Tab (Story 3.2) */}
          <TabsContent value="documents" className="mt-6">
            <div className="space-y-6">
              {/* RC Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Règlement de Consultation (RC)
                  </CardTitle>
                  <CardDescription>
                    Uploadez le document RC au format PDF pour que le système puisse analyser les exigences.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingRC ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : rcData?.rcDocument ? (
                    /* RC Already Uploaded */
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                        <FileText className="h-10 w-10 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{rcData.rcDocument.originalName}</p>
                          <p className="text-sm text-muted-foreground">
                            {(rcData.rcDocument.fileSize / 1024).toFixed(1)} Ko • Uploadé le{" "}
                            {new Date(rcData.rcDocument.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void handlePreviewRC()}
                            disabled={previewMutation.isPending}
                          >
                            {previewMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void handleDownloadRC()}
                            disabled={downloadMutation.isPending}
                          >
                            {downloadMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer le RC ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action supprimera le document RC. Vous pourrez en uploader un nouveau.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteDocumentMutation.mutate({ id: rcData.rcDocument!.id })}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {/* RC Parsing Status (Story 4.1) */}
                      {rcData.rcDocument.parsingStatus && rcData.rcDocument.parsingStatus !== "completed" && (
                        <RCParsingStatus
                          documentId={rcData.rcDocument.id}
                          parsingStatus={rcData.rcDocument.parsingStatus}
                          onStatusChange={() => void utils.tenderDocuments.getRC.invalidate()}
                        />
                      )}

                      {/* Replace RC */}
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          Vous pouvez remplacer le RC existant en uploadant un nouveau fichier.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadState.status === "uploading"}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Remplacer le RC
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => void handleRCUpload(e.target.files)}
                          className="hidden"
                        />
                      </div>
                    </div>
                  ) : (
                    /* No RC - Upload Zone */
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={cn(
                        "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-primary/50",
                        uploadState.status === "uploading" && "pointer-events-none"
                      )}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => void handleRCUpload(e.target.files)}
                        className="absolute inset-0 cursor-pointer opacity-0"
                        disabled={uploadState.status === "uploading"}
                      />

                      {uploadState.status === "idle" && (
                        <>
                          <Upload className="mb-4 h-10 w-10 text-muted-foreground/50" />
                          <p className="text-sm font-medium">
                            Glissez-déposez le fichier RC ou cliquez pour sélectionner
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Format PDF uniquement (max {MAX_FILE_SIZE_MB} Mo)
                          </p>
                        </>
                      )}

                      {uploadState.status === "uploading" && (
                        <div className="w-full max-w-xs space-y-3">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            <span className="text-sm">Upload en cours...</span>
                          </div>
                          <Progress value={uploadState.progress} className="h-2" />
                        </div>
                      )}

                      {uploadState.status === "success" && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm">{uploadState.message}</span>
                        </div>
                      )}

                      {uploadState.status === "error" && (
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-5 w-5" />
                          <span className="text-sm">{uploadState.message}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Other Documents Section (Future) */}
              <Card>
                <CardHeader>
                  <CardTitle>Autres documents</CardTitle>
                  <CardDescription>
                    CCTP, CCAP, BPU, DPGF et autres documents du dossier de consultation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="mb-4 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    La gestion des autres documents sera disponible prochainement.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* PDF Preview Dialog */}
            {showPreview && previewUrl && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="relative w-full max-w-4xl h-[90vh] bg-background rounded-lg shadow-lg">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-medium">Aperçu du RC</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                      ✕
                    </Button>
                  </div>
                  <iframe
                    src={previewUrl}
                    className="w-full h-[calc(90vh-60px)]"
                    title="Aperçu du RC"
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog (Story 3.7) */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce projet ?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <span className="block">
                  Êtes-vous sûr de vouloir supprimer &quot;{project.title}&quot; ?
                </span>
                <span className="block">
                  Cette action est irréversible et supprimera également tous les documents associés.
                </span>
                {(project.status === "submitted" || project.status === "won" || project.status === "lost") && (
                  <span className="flex items-center gap-2 text-destructive font-medium pt-2">
                    <AlertTriangle className="h-4 w-4" />
                    Attention : Ce projet a été soumis. Supprimer un projet soumis effacera
                    définitivement tout l&apos;historique de cette candidature.
                  </span>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate({ id: projectId })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
