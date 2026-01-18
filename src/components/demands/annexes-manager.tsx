"use client";

import { useState, useRef, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  GripVertical,
  Trash2,
  Download,
  Eye,
  Upload,
  Loader2,
  Plus,
  X,
  Paperclip,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
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
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import type { DemandDocument } from "~/server/db/schema";

/**
 * Accepted file types for annexes
 */
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp";

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/**
 * Get icon for file type
 */
function getFileIcon(mimeType: string) {
  if (mimeType === "application/pdf") return FileText;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet;
  if (mimeType.startsWith("image/")) return FileImage;
  return File;
}

/**
 * Upload response type
 */
interface UploadResponse {
  success: boolean;
  file: {
    fileName: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    storageKey: string;
  };
}

interface UploadError {
  error: string;
}

/**
 * Sortable annex item
 */
function SortableAnnex({
  annexe,
  index,
  onDelete,
  onPreview,
  onDownload,
  isDeleting,
}: {
  annexe: DemandDocument;
  index: number;
  onDelete: (id: string) => void;
  onPreview: (id: string) => void;
  onDownload: (id: string) => void;
  isDeleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: annexe.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const FileIcon = getFileIcon(annexe.mimeType);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 bg-background border rounded-lg",
        isDragging && "opacity-50 border-primary shadow-lg"
      )}
    >
      {/* Drag Handle */}
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Index Badge */}
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium shrink-0">
        {index + 1}
      </div>

      {/* File Icon */}
      <FileIcon className="h-8 w-8 text-muted-foreground shrink-0" />

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{annexe.originalName}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(annexe.fileSize)}
          {annexe.description && ` • ${annexe.description}`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {annexe.mimeType.startsWith("image/") || annexe.mimeType === "application/pdf" ? (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => onPreview(annexe.id)}
            title="Aperçu"
          >
            <Eye className="h-4 w-4" />
          </Button>
        ) : null}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => onDownload(annexe.id)}
          title="Télécharger"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => onDelete(annexe.id)}
          disabled={isDeleting}
          title="Supprimer"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

interface AnnexesManagerProps {
  demandProjectId: string;
}

export function AnnexesManager({ demandProjectId }: AnnexesManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = api.useUtils();

  // Fetch annexes
  const { data, isLoading } = api.demandDocuments.list.useQuery({
    demandProjectId,
    documentType: "annexe",
  });

  const annexes = data?.documents ?? [];

  // Mutations
  const createMutation = api.demandDocuments.create.useMutation({
    onSuccess: () => {
      void utils.demandDocuments.list.invalidate({ demandProjectId, documentType: "annexe" });
    },
  });

  const deleteMutation = api.demandDocuments.delete.useMutation({
    onSuccess: () => {
      void utils.demandDocuments.list.invalidate({ demandProjectId, documentType: "annexe" });
      setDeleteId(null);
    },
  });

  const updateOrderMutation = api.demandDocuments.updateOrder.useMutation({
    onSuccess: () => {
      void utils.demandDocuments.list.invalidate({ demandProjectId, documentType: "annexe" });
    },
  });

  const getPreviewUrlMutation = api.demandDocuments.getPreviewUrl.useMutation();
  const getDownloadUrlMutation = api.demandDocuments.getDownloadUrl.useMutation();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle file upload
  const uploadFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        setUploadError("Type de fichier non accepté");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadError("Le fichier est trop volumineux (max 10 Mo)");
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        // Upload file
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = (await response.json()) as UploadError;
          throw new Error(error.error ?? "Erreur lors de l'upload");
        }

        const data = (await response.json()) as UploadResponse;

        // Create document record
        await createMutation.mutateAsync({
          demandProjectId,
          documentType: "annexe",
          fileName: data.file.fileName,
          originalName: data.file.originalName,
          mimeType: data.file.mimeType,
          fileSize: data.file.fileSize,
          storageKey: data.file.storageKey,
        });
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Erreur lors de l'upload");
      } finally {
        setIsUploading(false);
      }
    },
    [demandProjectId, createMutation]
  );

  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    for (const file of files) {
      await uploadFile(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle drag and drop upload
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (!files?.length) return;

    for (const file of files) {
      await uploadFile(file);
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  // Handle reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = annexes.findIndex((a) => a.id === active.id);
      const newIndex = annexes.findIndex((a) => a.id === over.id);

      const reordered = arrayMove(annexes, oldIndex, newIndex);
      const documentIds = reordered.map((a) => a.id);

      updateOrderMutation.mutate({ demandProjectId, documentIds });
    }
  };

  // Handle preview
  const handlePreview = async (id: string) => {
    try {
      const result = await getPreviewUrlMutation.mutateAsync({ id });
      window.open(result.url, "_blank");
    } catch (error) {
      console.error("Preview error:", error);
    }
  };

  // Handle download
  const handleDownload = async (id: string) => {
    try {
      const result = await getDownloadUrlMutation.mutateAsync({ id });
      window.open(result.url, "_blank");
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          Annexes
        </CardTitle>
        <CardDescription>
          Ajoutez des documents complémentaires à votre dossier de demande (PDF, images, Excel).
          Vous pouvez réorganiser l&apos;ordre des annexes par glisser-déposer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Zone */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            isDraggingOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Upload en cours...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Glissez-déposez des fichiers ici ou{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary underline hover:no-underline"
                >
                  parcourez
                </button>
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, Word, Excel, images • Max 10 Mo par fichier
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {uploadError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
            <X className="h-4 w-4" />
            <p className="text-sm">{uploadError}</p>
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto h-6"
              onClick={() => setUploadError(null)}
            >
              Fermer
            </Button>
          </div>
        )}

        {/* Annexes List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : annexes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucune annexe ajoutée</p>
            <p className="text-sm">Ajoutez des documents pour compléter votre dossier</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={annexes.map((a) => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {annexes.map((annexe, index) => (
                  <SortableAnnex
                    key={annexe.id}
                    annexe={annexe}
                    index={index}
                    onDelete={(id) => setDeleteId(id)}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                    isDeleting={deleteMutation.isPending && deleteId === annexe.id}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Add More Button */}
        {annexes.length > 0 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une annexe
          </Button>
        )}

        {/* Reference Info */}
        {annexes.length > 0 && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-1">Référencement dans le document :</p>
            <p>
              Les annexes sont numérotées automatiquement (Annexe 1, Annexe 2, etc.) et peuvent être
              référencées dans le corps du document.
            </p>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette annexe ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le fichier sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
