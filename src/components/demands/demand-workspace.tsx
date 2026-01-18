"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Banknote,
  Calendar,
  Check,
  ChevronRight,
  Copy,
  Download,
  Edit,
  Eye,
  EyeOff,
  FileText,
  FileUp,
  HelpCircle,
  Lightbulb,
  Loader2,
  PanelRightClose,
  Plus,
  RefreshCw,
  Scale,
  Settings,
  Sparkles,
  Trash2,
  AlertCircle,
  AlertTriangle,
  X,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { DemandChatPanel } from "./demand-chat-panel";
import { SectionEditor, getDefaultSections } from "./section-editor";
import { DocumentPreview } from "./document-preview";
import { AnnexesManager } from "./annexes-manager";
import { PreExportDialog } from "./pre-export-dialog";
import type { DemandSection } from "~/server/db/schema";

type GeneratableSection = "context" | "description" | "constraints";
type QuestionTargetSection = GeneratableSection | "budget" | "general";

const sectionLabels: Record<GeneratableSection, string> = {
  context: "Contexte & Justification",
  description: "Description du besoin",
  constraints: "Contraintes identifiées",
};

const allSectionLabels: Record<QuestionTargetSection, string> = {
  context: "Contexte & Justification",
  description: "Description du besoin",
  constraints: "Contraintes identifiées",
  budget: "Budget & Délais",
  general: "Informations générales",
};

const priorityColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const projectSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255),
  reference: z.string().max(100).optional(),
  description: z.string().optional(),
  departmentName: z.string().max(255).optional(),
  contactName: z.string().max(255).optional(),
  contactEmail: z.string().email().max(255).optional().or(z.literal("")),
  context: z.string().optional(),
  constraints: z.string().optional(),
  urgencyLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
  needType: z.enum(["fourniture", "service", "travaux", "formation", "logiciel", "maintenance", "autre"]).optional(),
  // Budget & Délais fields
  budgetRange: z.string().max(100).optional(),
  budgetValidated: z.boolean().optional(),
  estimatedAmount: z.number().int().min(0).optional().nullable(),
  desiredDeliveryDate: z.string().optional(),
  urgencyJustification: z.string().optional(),
  notes: z.string().optional(),
});

type ProjectInput = z.infer<typeof projectSchema>;

const statusConfig = {
  draft: { label: "Brouillon", variant: "secondary" as const, className: "" },
  in_review: { label: "En relecture", variant: "default" as const, className: "bg-blue-500" },
  approved: { label: "Approuvé", variant: "default" as const, className: "bg-green-500" },
  sent_to_admin: { label: "Envoyé", variant: "default" as const, className: "bg-purple-500" },
  converted_to_ao: { label: "Converti en AO", variant: "default" as const, className: "bg-emerald-600" },
  archived: { label: "Archivé", variant: "outline" as const, className: "" },
};

const urgencyConfig = {
  low: { label: "Faible", className: "bg-gray-100 text-gray-700" },
  medium: { label: "Moyen", className: "bg-blue-100 text-blue-700" },
  high: { label: "Urgent", className: "bg-orange-100 text-orange-700" },
  critical: { label: "Critique", className: "bg-red-100 text-red-700" },
};

interface DemandWorkspaceProps {
  projectId: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function DemandWorkspace({ projectId }: DemandWorkspaceProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [chatOpen, setChatOpen] = useState(false);
  const [draftDialogOpen, setDraftDialogOpen] = useState(false);
  const [draftContent, setDraftContent] = useState("");
  const [draftSection, setDraftSection] = useState<GeneratableSection | null>(null);
  const [questionsExpanded, setQuestionsExpanded] = useState(true);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importedData, setImportedData] = useState<{
    extracted: {
      title?: string;
      reference?: string;
      departmentName?: string;
      contactName?: string;
      contactEmail?: string;
      needType?: string;
      urgencyLevel?: string;
      context?: string;
      description?: string;
      constraints?: string;
      budgetRange?: string;
      estimatedAmount?: number;
      desiredDeliveryDate?: string;
      confidence: { overall: number; fields: Record<string, number> };
      warnings?: string[];
    };
    documentInfo: { fileName: string; format: string; wordCount: number };
  } | null>(null);
  const [selectedImportFields, setSelectedImportFields] = useState<Set<string>>(new Set());
  const [criteria, setCriteria] = useState<{
    id: string;
    name: string;
    description: string;
    weight: number;
    category: "technical" | "quality" | "price" | "other";
  }[]>([]);
  const [criteriaRecommendations, setCriteriaRecommendations] = useState<string[]>([]);
  const [criteriaExpanded, setCriteriaExpanded] = useState(true);
  const [sections, setSections] = useState<DemandSection[]>([]);
  const [generatingSectionId, setGeneratingSectionId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sectionsSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const utils = api.useUtils();

  // PDF Export handler
  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/export/pdf/${projectId}`);
      if (!response.ok) {
        throw new Error("Erreur lors de l'export");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") ?? "demande.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // DOCX Export handler
  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      const response = await fetch(`/api/export/docx/${projectId}`);
      if (!response.ok) {
        throw new Error("Erreur lors de l'export");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") ?? "demande.docx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export DOCX error:", error);
    } finally {
      setIsExportingDocx(false);
    }
  };

  // ZIP Export handler
  const handleExportZip = async () => {
    setIsExportingZip(true);
    try {
      const response = await fetch(`/api/export/zip/${projectId}`);
      if (!response.ok) {
        throw new Error("Erreur lors de l'export");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") ?? "demande.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export ZIP error:", error);
    } finally {
      setIsExportingZip(false);
    }
  };

  const { data: project, isLoading, error } = api.demandProjects.get.useQuery({ id: projectId });

  // Fetch follow-up questions
  const {
    data: questionsData,
    isLoading: questionsLoading,
    refetch: refetchQuestions,
  } = api.demandChat.getFollowUpQuestions.useQuery(
    { demandProjectId: projectId },
    { enabled: !!project && isEditing }
  );

  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    values: project
      ? {
          title: project.title,
          reference: project.reference ?? "",
          description: project.description ?? "",
          departmentName: project.departmentName ?? "",
          contactName: project.contactName ?? "",
          contactEmail: project.contactEmail ?? "",
          context: project.context ?? "",
          constraints: project.constraints ?? "",
          urgencyLevel: (project.urgencyLevel as "low" | "medium" | "high" | "critical") ?? "medium",
          needType: (project.needType as "fourniture" | "service" | "travaux" | "formation" | "logiciel" | "maintenance" | "autre") ?? "autre",
          budgetRange: project.budgetRange ?? "",
          budgetValidated: project.budgetValidated === 1,
          estimatedAmount: project.estimatedAmount ?? null,
          desiredDeliveryDate: project.desiredDeliveryDate ?? "",
          urgencyJustification: project.urgencyJustification ?? "",
          notes: project.notes ?? "",
        }
      : undefined,
  });

  const updateMutation = api.demandProjects.update.useMutation({
    onMutate: () => {
      setSaveStatus("saving");
    },
    onSuccess: () => {
      void utils.demandProjects.get.invalidate({ id: projectId });
      setSaveStatus("saved");
      // Reset to idle after 2 seconds
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: () => {
      setSaveStatus("error");
    },
  });

  const updateStatusMutation = api.demandProjects.updateStatus.useMutation({
    onSuccess: () => {
      void utils.demandProjects.get.invalidate({ id: projectId });
    },
  });

  const archiveMutation = api.demandProjects.archive.useMutation({
    onSuccess: () => {
      router.push("/demandes");
    },
  });

  const unarchiveMutation = api.demandProjects.unarchive.useMutation({
    onSuccess: () => {
      void utils.demandProjects.get.invalidate({ id: projectId });
    },
  });

  const duplicateMutation = api.demandProjects.duplicate.useMutation({
    onSuccess: (newProject) => {
      router.push(`/demandes/${newProject.id}`);
    },
  });

  const deleteMutation = api.demandProjects.delete.useMutation({
    onSuccess: () => {
      router.push("/demandes");
    },
  });

  const generateDraftMutation = api.demandChat.generateDraft.useMutation({
    onSuccess: (data) => {
      setDraftContent(data.content);
      setDraftSection(data.section as GeneratableSection);
      setDraftDialogOpen(true);
    },
  });

  // Handle draft acceptance
  const handleAcceptDraft = () => {
    if (!draftSection) return;
    form.setValue(draftSection, draftContent);
    setDraftDialogOpen(false);
    setDraftContent("");
    setDraftSection(null);
    // Trigger autosave
    if (isEditing) {
      debouncedSave({ ...form.getValues(), [draftSection]: draftContent });
    }
  };

  const importDocumentMutation = api.demandChat.importDocument.useMutation({
    onSuccess: (data) => {
      setImportedData({
        extracted: data.extracted,
        documentInfo: data.documentInfo,
      });
      // Pre-select all fields that have values
      const fieldsWithValues = new Set<string>();
      Object.entries(data.extracted).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "confidence" && key !== "warnings") {
          fieldsWithValues.add(key);
        }
      });
      setSelectedImportFields(fieldsWithValues);
      setImportDialogOpen(true);
    },
  });

  const generateCriteriaMutation = api.demandChat.generateCriteria.useMutation({
    onSuccess: (data) => {
      setCriteria(data.criteria);
      setCriteriaRecommendations(data.recommendations ?? []);
    },
  });

  const saveCriteriaMutation = api.demandChat.saveCriteria.useMutation({
    onSuccess: () => {
      void utils.demandProjects.get.invalidate({ id: projectId });
    },
  });

  const updateSectionsMutation = api.demandProjects.updateSections.useMutation({
    onMutate: () => {
      setSaveStatus("saving");
    },
    onSuccess: () => {
      void utils.demandProjects.get.invalidate({ id: projectId });
      setSaveStatus("saved");
      if (sectionsSaveTimeoutRef.current) clearTimeout(sectionsSaveTimeoutRef.current);
      sectionsSaveTimeoutRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: () => {
      setSaveStatus("error");
    },
  });

  // Initialize sections from project data
  useEffect(() => {
    if (project) {
      if (project.sections && project.sections.length > 0) {
        setSections(project.sections);
      } else {
        // Create default sections from legacy fields
        setSections(getDefaultSections(
          project.context ?? "",
          project.description ?? "",
          project.constraints ?? ""
        ));
      }
    }
  }, [project]);

  // Handle file selection for document import
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Type de fichier non supporté. Utilisez PDF ou Word (.docx, .doc)");
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      if (base64) {
        importDocumentMutation.mutate({
          fileData: base64,
          fileName: file.name,
          mimeType: file.type,
        });
      }
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle import field toggle
  const toggleImportField = (field: string) => {
    setSelectedImportFields((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(field)) {
        newSet.delete(field);
      } else {
        newSet.add(field);
      }
      return newSet;
    });
  };

  // Handle import acceptance
  const handleAcceptImport = () => {
    if (!importedData) return;

    const updates: Partial<ProjectInput> = {};

    selectedImportFields.forEach((field) => {
      const value = importedData.extracted[field as keyof typeof importedData.extracted];
      if (value !== undefined && field !== "confidence" && field !== "warnings") {
        if (field === "budgetValidated") {
          updates.budgetValidated = Boolean(value);
        } else if (field === "estimatedAmount") {
          updates.estimatedAmount = typeof value === "number" ? value : null;
        } else if (field === "needType" && typeof value === "string") {
          updates.needType = value as ProjectInput["needType"];
        } else if (field === "urgencyLevel" && typeof value === "string") {
          updates.urgencyLevel = value as ProjectInput["urgencyLevel"];
        } else if (typeof value === "string") {
          (updates as Record<string, string>)[field] = value;
        }
      }
    });

    // Apply updates to form
    Object.entries(updates).forEach(([key, value]) => {
      form.setValue(key as keyof ProjectInput, value as never);
    });

    // Close dialog and reset
    setImportDialogOpen(false);
    setImportedData(null);
    setSelectedImportFields(new Set());

    // Trigger autosave if editing
    if (isEditing) {
      debouncedSave({ ...form.getValues(), ...updates });
    }
  };

  // Handle generate criteria
  const handleGenerateCriteria = () => {
    generateCriteriaMutation.mutate({ demandProjectId: projectId });
  };

  // Handle update criterion
  const handleUpdateCriterion = (id: string, field: string, value: string | number) => {
    setCriteria((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      )
    );
  };

  // Handle delete criterion
  const handleDeleteCriterion = (id: string) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  };

  // Handle add criterion
  const handleAddCriterion = () => {
    setCriteria((prev) => [
      ...prev,
      {
        id: `crit-${Date.now()}`,
        name: "Nouveau critère",
        description: "",
        weight: 10,
        category: "other" as const,
      },
    ]);
  };

  // Handle save criteria
  const handleSaveCriteria = () => {
    saveCriteriaMutation.mutate({
      demandProjectId: projectId,
      criteria,
    });
  };

  // Calculate total weight
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  // Debounced sections autosave
  const debouncedSaveSections = useCallback((updatedSections: DemandSection[]) => {
    if (sectionsSaveTimeoutRef.current) clearTimeout(sectionsSaveTimeoutRef.current);
    sectionsSaveTimeoutRef.current = setTimeout(() => {
      updateSectionsMutation.mutate({
        id: projectId,
        sections: updatedSections,
      });
    }, 1000); // 1 second debounce
  }, [projectId, updateSectionsMutation]);

  // Handle sections change
  const handleSectionsChange = useCallback((newSections: DemandSection[]) => {
    setSections(newSections);
    if (isEditing) {
      debouncedSaveSections(newSections);
    }
  }, [isEditing, debouncedSaveSections]);

  // Handle section draft generation
  const handleSectionGenerateDraft = useCallback((sectionId: string) => {
    // Find the section and map it to legacy section name for AI generation
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    // Map section ID to legacy section names
    let legacySection: GeneratableSection = "context";
    if (sectionId === "description" || section.title.toLowerCase().includes("description") || section.title.toLowerCase().includes("besoin")) {
      legacySection = "description";
    } else if (sectionId === "constraints" || section.title.toLowerCase().includes("contrainte")) {
      legacySection = "constraints";
    }

    setGeneratingSectionId(sectionId);
    generateDraftMutation.mutate({
      demandProjectId: projectId,
      section: legacySection,
    }, {
      onSuccess: (data) => {
        // Apply the draft to the section
        const updatedSections = sections.map(s =>
          s.id === sectionId ? { ...s, content: data.content } : s
        );
        setSections(updatedSections);
        setGeneratingSectionId(null);
        // Trigger save
        if (isEditing) {
          debouncedSaveSections(updatedSections);
        }
      },
      onError: () => {
        setGeneratingSectionId(null);
      },
    });
  }, [sections, projectId, generateDraftMutation, isEditing, debouncedSaveSections]);

  // Debounced autosave
  const debouncedSave = useCallback((data: ProjectInput) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateMutation.mutate({
        id: projectId,
        data,
      });
    }, 1000); // 1 second debounce
  }, [projectId, updateMutation]);

  // Watch form changes for autosave when editing
  const formValues = form.watch();
  const initialLoadRef = useRef(true);

  useEffect(() => {
    // Skip initial load and when not editing
    if (!isEditing || !project) return;

    // Skip the first render after entering edit mode
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    // Check if form is valid before autosaving
    const isValid = form.formState.isValid;
    if (isValid) {
      debouncedSave(formValues);
    }

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [formValues, isEditing, project, debouncedSave, form.formState.isValid]);

  // Reset initial load ref when starting to edit
  useEffect(() => {
    if (isEditing) {
      initialLoadRef.current = true;
    }
  }, [isEditing]);

  const onSubmit = async (data: ProjectInput) => {
    // Cancel any pending autosave
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    await updateMutation.mutateAsync({
      id: projectId,
      data,
    });
    setIsEditing(false);
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
            <h3 className="mb-2 text-lg font-medium">Dossier non trouvé</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Ce dossier n&apos;existe pas ou vous n&apos;y avez pas accès.
            </p>
            <Button onClick={() => router.push("/demandes")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux dossiers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[project.status as keyof typeof statusConfig] ?? statusConfig.draft;
  const urgency = project.urgencyLevel ? urgencyConfig[project.urgencyLevel as keyof typeof urgencyConfig] : null;

  // Calculate right margin based on open panels
  const rightMargin = (previewOpen ? 500 : 0) + (chatOpen ? 400 : 0);

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div
        className="flex-1 p-4 md:p-8 transition-all"
        style={{ marginRight: rightMargin > 0 ? `${rightMargin}px` : undefined }}
      >
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/demandes")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{project.title}</h1>
                  <Badge variant={status.variant} className={status.className}>
                    {status.label}
                  </Badge>
                  {urgency && (
                    <Badge variant="outline" className={urgency.className}>
                      {urgency.label}
                    </Badge>
                  )}
                </div>
                {project.reference && (
                  <p className="text-sm text-muted-foreground">Réf: {project.reference}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
            {/* Hidden file input for document import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
              onChange={handleFileSelect}
              className="hidden"
            />
            {/* Preview Toggle */}
            <Button
              variant={previewOpen ? "default" : "outline"}
              onClick={() => setPreviewOpen(!previewOpen)}
              title={previewOpen ? "Masquer l'aperçu" : "Afficher l'aperçu"}
            >
              {previewOpen ? (
                <EyeOff className="mr-2 h-4 w-4" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              Aperçu
            </Button>
            <Button
              variant="outline"
              onClick={() => setExportDialogOpen(true)}
              disabled={isExporting || isExportingDocx || isExportingZip}
              title="Exporter le dossier (PDF, Word ou ZIP)"
            >
              {isExporting || isExportingDocx || isExportingZip ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Exporter
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={importDocumentMutation.isPending}
              title="Importer un document existant (PDF ou Word)"
            >
              {importDocumentMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileUp className="mr-2 h-4 w-4" />
              )}
              Importer
            </Button>
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
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive hover:text-destructive"
              disabled={project.status === "sent_to_admin" || project.status === "converted_to_ao"}
              title={project.status === "sent_to_admin" || project.status === "converted_to_ao"
                ? "Impossible de supprimer un dossier envoyé"
                : undefined}
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
                {/* Autosave Status Indicator */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground px-2">
                  {saveStatus === "saving" && (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  )}
                  {saveStatus === "saved" && (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-green-600">Enregistré</span>
                    </>
                  )}
                  {saveStatus === "error" && (
                    <>
                      <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                      <span className="text-destructive">Erreur</span>
                    </>
                  )}
                </div>
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Fermer
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {project.departmentName && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <FileText className="h-4 w-4" />
                  Service demandeur
                </div>
                <div className="font-medium">{project.departmentName}</div>
              </CardContent>
            </Card>
          )}
          {project.contactName && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  Contact
                </div>
                <div className="font-medium">{project.contactName}</div>
              </CardContent>
            </Card>
          )}
          {project.budgetRange && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  Budget estimé
                </div>
                <div className="font-medium">{project.budgetRange}</div>
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
                <div className="font-medium">{project.desiredDeliveryDate}</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="redaction" disabled>Rédaction</TabsTrigger>
            <TabsTrigger value="export" disabled>Export</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* AI Questions Panel */}
                  {questionsData?.available && questionsData.questions.length > 0 && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader className="pb-2">
                        <button
                          type="button"
                          onClick={() => setQuestionsExpanded(!questionsExpanded)}
                          className="flex items-center justify-between w-full text-left"
                        >
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Lightbulb className="h-5 w-5 text-primary" />
                            Questions pour améliorer votre dossier
                            <Badge variant="secondary" className="ml-2">
                              {questionsData.questions.length}
                            </Badge>
                          </CardTitle>
                          <ChevronRight
                            className={`h-5 w-5 text-muted-foreground transition-transform ${
                              questionsExpanded ? "rotate-90" : ""
                            }`}
                          />
                        </button>
                      </CardHeader>
                      {questionsExpanded && (
                        <CardContent className="pt-2">
                          <div className="space-y-3">
                            {questionsData.questions.map((q) => (
                              <div
                                key={q.id}
                                className="flex items-start gap-3 p-3 rounded-lg bg-background border"
                              >
                                <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{q.question}</p>
                                  {q.hint && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      💡 {q.hint}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${priorityColors[q.priority]}`}
                                    >
                                      {q.priority === "high" ? "Important" : q.priority === "medium" ? "Recommandé" : "Optionnel"}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      → {allSectionLabels[q.targetSection as QuestionTargetSection]}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end mt-3">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => void refetchQuestions()}
                              disabled={questionsLoading}
                            >
                              {questionsLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                              )}
                              Actualiser
                            </Button>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )}

                  {/* Loading state for questions */}
                  {questionsLoading && !questionsData && (
                    <Card className="border-dashed">
                      <CardContent className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                        <span className="text-sm text-muted-foreground">
                          Analyse du dossier en cours...
                        </span>
                      </CardContent>
                    </Card>
                  )}

                  {/* Section 1: Informations générales */}
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Settings className="h-5 w-5" />
                        Informations générales
                      </CardTitle>
                      <CardDescription>
                        Identifiez votre demande et le service demandeur
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Title */}
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Titre du dossier *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Reference and Department */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="reference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Référence interne</FormLabel>
                              <FormControl>
                                <Input placeholder="DEM-2024-001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="departmentName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service demandeur</FormLabel>
                              <FormControl>
                                <Input placeholder="Direction informatique" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Contact */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="contactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom du contact</FormLabel>
                              <FormControl>
                                <Input placeholder="Jean Dupont" {...field} />
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
                              <FormLabel>Email du contact</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="jean.dupont@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Urgency and Need Type */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="urgencyLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Niveau d&apos;urgence</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <FormField
                          control={form.control}
                          name="needType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type de besoin</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      </div>
                    </CardContent>
                  </Card>

                  {/* Flexible Sections Editor */}
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5" />
                        Sections du dossier
                      </CardTitle>
                      <CardDescription>
                        Réorganisez, renommez ou ajoutez des sections selon vos besoins. Glissez-déposez pour réordonner.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SectionEditor
                        sections={sections}
                        onSectionsChange={handleSectionsChange}
                        onGenerateDraft={handleSectionGenerateDraft}
                        isGenerating={generateDraftMutation.isPending}
                        generatingSection={generatingSectionId ?? undefined}
                        disabled={updateMutation.isPending || updateSectionsMutation.isPending}
                      />
                    </CardContent>
                  </Card>

                  {/* Section 5: Budget & Délais */}
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Banknote className="h-5 w-5" />
                        Budget & Délais
                      </CardTitle>
                      <CardDescription>
                        Indiquez le budget estimé et les délais souhaités pour cette demande
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Budget fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="budgetRange"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fourchette budgétaire</FormLabel>
                              <FormControl>
                                <Input placeholder="50 000 - 100 000 EUR" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="estimatedAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Montant estimé (EUR)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="75000"
                                  {...field}
                                  value={field.value ?? ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Budget validated */}
                      <FormField
                        control={form.control}
                        name="budgetValidated"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Budget déjà validé</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Cochez si le budget a déjà été approuvé par la hiérarchie
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Delivery date */}
                      <FormField
                        control={form.control}
                        name="desiredDeliveryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date de livraison souhaitée</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Urgency justification - shown when urgency is high or critical */}
                      {(form.watch("urgencyLevel") === "high" || form.watch("urgencyLevel") === "critical") && (
                        <FormField
                          control={form.control}
                          name="urgencyJustification"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                Justification de l&apos;urgence
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={3}
                                  placeholder="Expliquez pourquoi ce délai est urgent : événement impératif, contrainte réglementaire, impact business..."
                                  className="resize-y"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </CardContent>
                  </Card>

                  {/* Section 6: Critères Suggérés */}
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Scale className="h-5 w-5" />
                          Critères de Sélection Suggérés
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {criteria.length > 0 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleSaveCriteria}
                              disabled={saveCriteriaMutation.isPending}
                            >
                              {saveCriteriaMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="mr-2 h-4 w-4" />
                              )}
                              Enregistrer
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={handleGenerateCriteria}
                            disabled={generateCriteriaMutation.isPending}
                          >
                            {generateCriteriaMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            {criteria.length > 0 ? "Régénérer" : "Suggérer des critères"}
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        Proposez des critères de sélection pour aider l&apos;Administration à définir l&apos;appel d&apos;offres
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {criteria.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Scale className="h-12 w-12 mx-auto mb-4 opacity-30" />
                          <p>Aucun critère suggéré</p>
                          <p className="text-sm mt-1">
                            Cliquez sur &quot;Suggérer des critères&quot; pour générer des propositions basées sur votre dossier
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Weight indicator */}
                          <div className="flex items-center justify-between px-2 py-1 bg-muted rounded-lg">
                            <span className="text-sm font-medium">Total pondération</span>
                            <span className={`text-sm font-bold ${totalWeight === 100 ? "text-green-600" : totalWeight > 100 ? "text-red-600" : "text-yellow-600"}`}>
                              {totalWeight}% {totalWeight !== 100 && `(cible: 100%)`}
                            </span>
                          </div>

                          {/* Recommendations */}
                          {criteriaRecommendations.length > 0 && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                              <div className="flex items-center gap-2 text-blue-700 mb-2">
                                <Lightbulb className="h-4 w-4" />
                                <span className="font-medium text-sm">Recommandations</span>
                              </div>
                              <ul className="text-sm text-blue-600 space-y-1 ml-6 list-disc">
                                {criteriaRecommendations.map((rec, i) => (
                                  <li key={i}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Criteria list */}
                          <Collapsible open={criteriaExpanded} onOpenChange={setCriteriaExpanded}>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" className="w-full justify-between mb-2">
                                <span>{criteria.length} critère{criteria.length > 1 ? "s" : ""}</span>
                                <ChevronRight className={`h-4 w-4 transition-transform ${criteriaExpanded ? "rotate-90" : ""}`} />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-3">
                              {criteria.map((criterion) => (
                                <CriterionCard
                                  key={criterion.id}
                                  criterion={criterion}
                                  onUpdate={handleUpdateCriterion}
                                  onDelete={handleDeleteCriterion}
                                />
                              ))}
                            </CollapsibleContent>
                          </Collapsible>

                          {/* Add criterion button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddCriterion}
                            className="w-full"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter un critère
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Section 7: Notes internes */}
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Notes internes</CardTitle>
                      <CardDescription>
                        Notes personnelles (non incluses dans le document final)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                rows={3}
                                placeholder="Notes de travail, rappels, informations à vérifier..."
                                className="resize-y"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </form>
              </Form>
            ) : (
              <div className="space-y-6">
                {/* Row 1: Context and Description */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Contexte & Justification */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Contexte & Justification</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {project.context ? (
                        <p className="text-sm whitespace-pre-wrap">{project.context}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Aucun contexte renseigné. Cliquez sur Modifier pour ajouter.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Description du besoin */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Description du besoin</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {project.description ? (
                        <p className="text-sm whitespace-pre-wrap">{project.description}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Aucune description renseignée. Cliquez sur Modifier pour ajouter.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Row 2: Constraints and Budget */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Contraintes */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Contraintes identifiées</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {project.constraints ? (
                        <p className="text-sm whitespace-pre-wrap">{project.constraints}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Aucune contrainte renseignée. Cliquez sur Modifier pour ajouter.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Budget & Délais */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Banknote className="h-5 w-5" />
                        Budget & Délais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Fourchette budgétaire</h4>
                          <p className="text-sm">{project.budgetRange ?? <span className="italic text-muted-foreground">Non renseigné</span>}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Montant estimé</h4>
                          <p className="text-sm">
                            {project.estimatedAmount
                              ? `${project.estimatedAmount.toLocaleString("fr-FR")} EUR`
                              : <span className="italic text-muted-foreground">Non renseigné</span>}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Date souhaitée</h4>
                          <p className="text-sm">
                            {project.desiredDeliveryDate
                              ? new Date(project.desiredDeliveryDate).toLocaleDateString("fr-FR")
                              : <span className="italic text-muted-foreground">Non renseignée</span>}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Statut budget</h4>
                          <p className="text-sm">
                            {project.budgetValidated === 1 ? (
                              <Badge variant="default" className="bg-green-600">Validé</Badge>
                            ) : (
                              <Badge variant="outline">À valider</Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      {project.urgencyJustification && (
                        <div className="pt-2 border-t">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
                            Justification urgence
                          </h4>
                          <p className="text-sm whitespace-pre-wrap">{project.urgencyJustification}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Row 3: Status */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Status & Actions Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Statut & Actions</CardTitle>
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
                            variant={project.status === "in_review" ? "default" : "outline"}
                            className={project.status === "in_review" ? "bg-blue-500" : ""}
                            onClick={() => updateStatusMutation.mutate({ id: projectId, status: "in_review" })}
                          >
                            En relecture
                          </Button>
                          <Button
                            size="sm"
                            variant={project.status === "approved" ? "default" : "outline"}
                            className={project.status === "approved" ? "bg-green-500" : ""}
                            onClick={() => updateStatusMutation.mutate({ id: projectId, status: "approved" })}
                          >
                            Approuvé
                          </Button>
                          <Button
                            size="sm"
                            variant={project.status === "sent_to_admin" ? "default" : "outline"}
                            className={project.status === "sent_to_admin" ? "bg-purple-500" : ""}
                            onClick={() => updateStatusMutation.mutate({ id: projectId, status: "sent_to_admin" })}
                          >
                            Envoyé
                          </Button>
                        </div>
                      </div>
                      {project.notes && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes internes</h4>
                          <p className="text-sm whitespace-pre-wrap">{project.notes}</p>
                        </div>
                      )}
                      <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                          Créé le {new Date(project.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Coming Soon Card */}
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mb-2 text-lg font-medium">Fonctionnalités à venir</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Les onglets Rédaction et Export seront disponibles dans les prochaines mises à jour.
                      Ils vous permettront de rédiger votre dossier et de l&apos;exporter en PDF.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <AnnexesManager demandProjectId={project.id} />
          </TabsContent>
        </Tabs>
        </div>
      </div>

      {/* Preview Panel */}
      <div
        className={`fixed top-0 h-full w-[500px] bg-background border-l shadow-lg transition-all z-30 ${
          previewOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ right: chatOpen ? "400px" : "0" }}
      >
        {previewOpen && (
          <DocumentPreview
            title={project.title}
            reference={project.reference}
            departmentName={project.departmentName}
            contactName={project.contactName}
            contactEmail={project.contactEmail}
            needType={project.needType}
            urgencyLevel={project.urgencyLevel}
            budgetRange={project.budgetRange}
            desiredDeliveryDate={project.desiredDeliveryDate}
            sections={sections}
            onClose={() => setPreviewOpen(false)}
            className="h-full"
          />
        )}
      </div>

      {/* Chat Toggle Button (Floating) */}
      {!chatOpen && (
        <Button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 h-14 w-14 rounded-full shadow-lg z-50"
          style={{ right: previewOpen ? "524px" : "24px" }}
          size="icon"
        >
          <Sparkles className="h-6 w-6" />
          <span className="sr-only">Ouvrir l&apos;assistant IA</span>
        </Button>
      )}

      {/* Chat Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-background border-l shadow-lg transition-transform z-40 ${
          chatOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Chat Panel Header with Close Button */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setChatOpen(false)}
            className="h-8 w-8"
          >
            <PanelRightClose className="h-4 w-4" />
            <span className="sr-only">Fermer l&apos;assistant</span>
          </Button>
        </div>
        {chatOpen && <DemandChatPanel projectId={projectId} />}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce dossier ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer &quot;{project.title}&quot; ?
              Cette action est irréversible.
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

      {/* Draft Preview Dialog */}
      <Dialog open={draftDialogOpen} onOpenChange={setDraftDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Brouillon généré par l&apos;IA
            </DialogTitle>
            <DialogDescription>
              {draftSection && (
                <>
                  Section : <span className="font-medium">{sectionLabels[draftSection]}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto my-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm whitespace-pre-wrap">{draftContent}</p>
            </div>
            <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Ce texte est une proposition générée par l&apos;IA. Vérifiez et adaptez-le à vos besoins.
            </p>
          </div>
          <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDraftDialogOpen(false);
                setDraftContent("");
                setDraftSection(null);
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Rejeter
            </Button>
            <Button onClick={handleAcceptDraft}>
              <Check className="mr-2 h-4 w-4" />
              Accepter et insérer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Import Preview Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5 text-primary" />
              Données extraites du document
            </DialogTitle>
            <DialogDescription>
              {importedData && (
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {importedData.documentInfo.fileName} ({importedData.documentInfo.format}, {importedData.documentInfo.wordCount.toLocaleString("fr-FR")} mots)
                  <span className="text-xs">
                    • Confiance: {Math.round(importedData.extracted.confidence.overall * 100)}%
                  </span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {importedData && (
            <>
              {/* Warnings */}
              {importedData.extracted.warnings && importedData.extracted.warnings.length > 0 && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <div className="flex items-center gap-2 text-yellow-700 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium text-sm">Avertissements</span>
                  </div>
                  <ul className="text-sm text-yellow-600 space-y-1 ml-6 list-disc">
                    {importedData.extracted.warnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Extracted Fields */}
              <div className="flex-1 overflow-y-auto my-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sélectionnez les champs à importer dans votre dossier. Les champs existants seront remplacés.
                </p>

                <div className="grid gap-3">
                  {/* Title */}
                  {importedData.extracted.title && (
                    <ImportFieldRow
                      field="title"
                      label="Titre"
                      value={importedData.extracted.title}
                      confidence={importedData.extracted.confidence.fields.title}
                      selected={selectedImportFields.has("title")}
                      onToggle={toggleImportField}
                    />
                  )}

                  {/* Reference */}
                  {importedData.extracted.reference && (
                    <ImportFieldRow
                      field="reference"
                      label="Référence"
                      value={importedData.extracted.reference}
                      confidence={importedData.extracted.confidence.fields.reference}
                      selected={selectedImportFields.has("reference")}
                      onToggle={toggleImportField}
                    />
                  )}

                  {/* Department */}
                  {importedData.extracted.departmentName && (
                    <ImportFieldRow
                      field="departmentName"
                      label="Service demandeur"
                      value={importedData.extracted.departmentName}
                      confidence={importedData.extracted.confidence.fields.departmentName}
                      selected={selectedImportFields.has("departmentName")}
                      onToggle={toggleImportField}
                    />
                  )}

                  {/* Contact */}
                  {importedData.extracted.contactName && (
                    <ImportFieldRow
                      field="contactName"
                      label="Contact"
                      value={importedData.extracted.contactName}
                      confidence={importedData.extracted.confidence.fields.contactName}
                      selected={selectedImportFields.has("contactName")}
                      onToggle={toggleImportField}
                    />
                  )}

                  {/* Email */}
                  {importedData.extracted.contactEmail && (
                    <ImportFieldRow
                      field="contactEmail"
                      label="Email"
                      value={importedData.extracted.contactEmail}
                      confidence={importedData.extracted.confidence.fields.contactEmail}
                      selected={selectedImportFields.has("contactEmail")}
                      onToggle={toggleImportField}
                    />
                  )}

                  {/* Need Type */}
                  {importedData.extracted.needType && (
                    <ImportFieldRow
                      field="needType"
                      label="Type de besoin"
                      value={getNeedTypeLabel(importedData.extracted.needType)}
                      confidence={importedData.extracted.confidence.fields.needType}
                      selected={selectedImportFields.has("needType")}
                      onToggle={toggleImportField}
                    />
                  )}

                  {/* Urgency */}
                  {importedData.extracted.urgencyLevel && (
                    <ImportFieldRow
                      field="urgencyLevel"
                      label="Niveau d'urgence"
                      value={getUrgencyLabel(importedData.extracted.urgencyLevel)}
                      confidence={importedData.extracted.confidence.fields.urgencyLevel}
                      selected={selectedImportFields.has("urgencyLevel")}
                      onToggle={toggleImportField}
                    />
                  )}

                  {/* Context - Long text */}
                  {importedData.extracted.context && (
                    <ImportFieldRow
                      field="context"
                      label="Contexte & Justification"
                      value={importedData.extracted.context}
                      confidence={importedData.extracted.confidence.fields.context}
                      selected={selectedImportFields.has("context")}
                      onToggle={toggleImportField}
                      isLongText
                    />
                  )}

                  {/* Description - Long text */}
                  {importedData.extracted.description && (
                    <ImportFieldRow
                      field="description"
                      label="Description du besoin"
                      value={importedData.extracted.description}
                      confidence={importedData.extracted.confidence.fields.description}
                      selected={selectedImportFields.has("description")}
                      onToggle={toggleImportField}
                      isLongText
                    />
                  )}

                  {/* Constraints - Long text */}
                  {importedData.extracted.constraints && (
                    <ImportFieldRow
                      field="constraints"
                      label="Contraintes"
                      value={importedData.extracted.constraints}
                      confidence={importedData.extracted.confidence.fields.constraints}
                      selected={selectedImportFields.has("constraints")}
                      onToggle={toggleImportField}
                      isLongText
                    />
                  )}

                  {/* Budget Range */}
                  {importedData.extracted.budgetRange && (
                    <ImportFieldRow
                      field="budgetRange"
                      label="Fourchette budgétaire"
                      value={importedData.extracted.budgetRange}
                      confidence={importedData.extracted.confidence.fields.budgetRange}
                      selected={selectedImportFields.has("budgetRange")}
                      onToggle={toggleImportField}
                    />
                  )}

                  {/* Estimated Amount */}
                  {importedData.extracted.estimatedAmount && (
                    <ImportFieldRow
                      field="estimatedAmount"
                      label="Montant estimé"
                      value={`${importedData.extracted.estimatedAmount.toLocaleString("fr-FR")} EUR`}
                      confidence={importedData.extracted.confidence.fields.estimatedAmount}
                      selected={selectedImportFields.has("estimatedAmount")}
                      onToggle={toggleImportField}
                    />
                  )}

                  {/* Desired Date */}
                  {importedData.extracted.desiredDeliveryDate && (
                    <ImportFieldRow
                      field="desiredDeliveryDate"
                      label="Date de livraison souhaitée"
                      value={importedData.extracted.desiredDeliveryDate}
                      confidence={importedData.extracted.confidence.fields.desiredDeliveryDate}
                      selected={selectedImportFields.has("desiredDeliveryDate")}
                      onToggle={toggleImportField}
                    />
                  )}
                </div>
              </div>

              <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => {
                    setImportDialogOpen(false);
                    setImportedData(null);
                    setSelectedImportFields(new Set());
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
                <Button
                  onClick={handleAcceptImport}
                  disabled={selectedImportFields.size === 0}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Importer {selectedImportFields.size > 0 ? `(${selectedImportFields.size} champs)` : ""}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Pre-Export Verification Dialog */}
      {project && (
        <PreExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          data={{
            title: project.title,
            reference: project.reference,
            description: project.description,
            departmentName: project.departmentName,
            contactName: project.contactName,
            contactEmail: project.contactEmail,
            needType: project.needType,
            urgencyLevel: project.urgencyLevel,
            budgetRange: project.budgetRange,
            desiredDeliveryDate: project.desiredDeliveryDate,
            sections: sections,
          }}
          onExportPdf={handleExportPdf}
          onExportDocx={handleExportDocx}
          onExportZip={handleExportZip}
          isExportingPdf={isExporting}
          isExportingDocx={isExportingDocx}
          isExportingZip={isExportingZip}
        />
      )}
    </div>
  );
}

/**
 * Helper component for import field rows
 */
function ImportFieldRow({
  field,
  label,
  value,
  confidence,
  selected,
  onToggle,
  isLongText = false,
}: {
  field: string;
  label: string;
  value: string;
  confidence?: number;
  selected: boolean;
  onToggle: (field: string) => void;
  isLongText?: boolean;
}) {
  const confidenceColor = confidence
    ? confidence >= 0.8
      ? "text-green-600"
      : confidence >= 0.5
        ? "text-yellow-600"
        : "text-red-600"
    : "text-muted-foreground";

  return (
    <div
      className={`rounded-lg border p-3 cursor-pointer transition-colors ${
        selected
          ? "border-primary bg-primary/5"
          : "border-muted hover:border-muted-foreground/30"
      }`}
      onClick={() => onToggle(field)}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggle(field)}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">{label}</span>
            {confidence !== undefined && (
              <span className={`text-xs ${confidenceColor}`}>
                {Math.round(confidence * 100)}%
              </span>
            )}
          </div>
          <p
            className={`text-sm text-muted-foreground ${
              isLongText ? "line-clamp-3" : "truncate"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Get label for need type
 */
function getNeedTypeLabel(needType: string): string {
  const labels: Record<string, string> = {
    fourniture: "Fourniture / Équipement",
    service: "Prestation de service",
    travaux: "Travaux / Construction",
    formation: "Formation",
    logiciel: "Logiciel / Licence",
    maintenance: "Maintenance / Support",
    autre: "Autre",
  };
  return labels[needType] ?? needType;
}

/**
 * Get label for urgency level
 */
function getUrgencyLabel(urgency: string): string {
  const labels: Record<string, string> = {
    low: "Faible",
    medium: "Moyen",
    high: "Urgent",
    critical: "Critique",
  };
  return labels[urgency] ?? urgency;
}

/**
 * Category labels and colors
 */
const categoryConfig: Record<string, { label: string; color: string }> = {
  technical: { label: "Technique", color: "bg-blue-100 text-blue-700" },
  quality: { label: "Qualité", color: "bg-green-100 text-green-700" },
  price: { label: "Prix", color: "bg-yellow-100 text-yellow-700" },
  other: { label: "Autre", color: "bg-gray-100 text-gray-700" },
};

/**
 * Helper component for criterion card
 */
function CriterionCard({
  criterion,
  onUpdate,
  onDelete,
}: {
  criterion: {
    id: string;
    name: string;
    description: string;
    weight: number;
    category: "technical" | "quality" | "price" | "other";
  };
  onUpdate: (id: string, field: string, value: string | number) => void;
  onDelete: (id: string) => void;
}) {
  const config = categoryConfig[criterion.category] ?? { label: "Autre", color: "bg-gray-100 text-gray-700" };

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={criterion.name}
              onChange={(e) => onUpdate(criterion.id, "name", e.target.value)}
              className="flex-1 font-medium bg-transparent border-b border-transparent hover:border-muted-foreground focus:border-primary focus:outline-none px-1 -mx-1"
            />
            <Badge variant="secondary" className={config.color}>
              {config.label}
            </Badge>
          </div>
          <textarea
            value={criterion.description}
            onChange={(e) => onUpdate(criterion.id, "description", e.target.value)}
            placeholder="Description du critère..."
            className="w-full text-sm text-muted-foreground bg-transparent border-b border-transparent hover:border-muted-foreground focus:border-primary focus:outline-none resize-none px-1 -mx-1"
            rows={2}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onDelete(criterion.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Pondération:</label>
          <input
            type="number"
            min={0}
            max={100}
            value={criterion.weight}
            onChange={(e) => onUpdate(criterion.id, "weight", parseInt(e.target.value) || 0)}
            className="w-16 text-center font-medium bg-muted rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Catégorie:</label>
          <select
            value={criterion.category}
            onChange={(e) => onUpdate(criterion.id, "category", e.target.value)}
            className="text-sm bg-muted rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="technical">Technique</option>
            <option value="quality">Qualité</option>
            <option value="price">Prix</option>
            <option value="other">Autre</option>
          </select>
        </div>
      </div>
    </div>
  );
}
