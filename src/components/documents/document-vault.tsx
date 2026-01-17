"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  File,
  FileText,
  Image as ImageIcon,
  Upload,
  Trash2,
  Download,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Loader2,
  Tag,
  Filter,
  Calendar,
  AlertTriangle,
  Clock,
  Sparkles,
  Eye,
  ExternalLink,
  Search,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { DOCUMENT_CATEGORIES, type DocumentCategory } from "~/server/db/schema/company";

/**
 * Accepted file types
 */
const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp";
const MAX_FILE_SIZE_MB = 10;

/**
 * Category labels in French
 */
const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  kbis: "Kbis",
  attestation_fiscale: "Attestation fiscale",
  attestation_sociale: "Attestation sociale (URSSAF)",
  assurance_rc: "Assurance RC Pro",
  assurance_decennale: "Assurance décennale",
  certification: "Certification / Qualification",
  reference_projet: "Référence projet",
  cv: "CV",
  organigramme: "Organigramme",
  bilan: "Bilan comptable",
  autre: "Autre",
};

/**
 * Get category label
 */
function getCategoryLabel(category: string | null): string {
  if (!category) return "Non catégorisé";
  return CATEGORY_LABELS[category as DocumentCategory] ?? category;
}

/**
 * Expiry status types
 */
type ExpiryStatus = "valid" | "expiring-soon" | "expired" | "none";

/**
 * Get expiry status for a document
 * - "expired" if date is in the past
 * - "expiring-soon" if within 30 days
 * - "valid" if more than 30 days away
 * - "none" if no expiry date
 */
function getExpiryStatus(expiryDate: string | null): ExpiryStatus {
  if (!expiryDate) return "none";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "expired";
  if (diffDays <= 30) return "expiring-soon";
  return "valid";
}

/**
 * Get days until expiry (negative if expired)
 */
function getDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get expiry badge styling based on status
 */
function getExpiryBadgeClass(status: ExpiryStatus): string {
  switch (status) {
    case "expired":
      return "bg-red-100 text-red-800 border-red-200";
    case "expiring-soon":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "valid":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "";
  }
}

/**
 * Format expiry message
 */
function formatExpiryMessage(expiryDate: string | null): string {
  const days = getDaysUntilExpiry(expiryDate);
  if (days === null) return "";

  if (days < 0) {
    const absDays = Math.abs(days);
    return `Expiré depuis ${absDays} jour${absDays > 1 ? "s" : ""}`;
  }
  if (days === 0) return "Expire aujourd'hui";
  if (days === 1) return "Expire demain";
  return `Expire dans ${days} jours`;
}

/**
 * Get icon for file type
 */
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="h-5 w-5 text-blue-500" />;
  }
  if (mimeType.includes("pdf")) {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  if (mimeType.includes("word") || mimeType.includes("document")) {
    return <FileText className="h-5 w-5 text-blue-600" />;
  }
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) {
    return <FileText className="h-5 w-5 text-green-600" />;
  }
  return <File className="h-5 w-5 text-gray-500" />;
}

/**
 * Format file size
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface DocumentCardProps {
  document: {
    id: string;
    fileName: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    category: string | null;
    expiryDate: string | null;
    createdAt: Date;
  };
  onDelete: () => void;
  onUpdate: () => void;
  isAnalysisAvailable: boolean;
}

function DocumentCard({ document, onDelete, onUpdate, isAnalysisAvailable }: DocumentCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingExpiry, setIsEditingExpiry] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(document.category ?? "");
  const [selectedExpiryDate, setSelectedExpiryDate] = useState<string>(document.expiryDate ?? "");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    expiryDate: string | null;
    confidence: string;
    documentType: string | null;
    message: string;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const deleteMutation = api.companyDocuments.delete.useMutation({
    onSuccess: onDelete,
  });

  const downloadMutation = api.companyDocuments.getDownloadUrl.useMutation();
  const previewMutation = api.companyDocuments.getPreviewUrl.useMutation();

  const updateMutation = api.companyDocuments.update.useMutation({
    onSuccess: () => {
      setIsEditingCategory(false);
      setIsEditingExpiry(false);
      setShowSuggestion(false);
      onUpdate();
    },
  });

  const analyzeMutation = api.companyDocuments.analyzeForExpiryDate.useMutation({
    onSuccess: (result) => {
      setSuggestion(result);
      if (result.expiryDate) {
        setSelectedExpiryDate(result.expiryDate);
        setShowSuggestion(true);
      }
    },
  });

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const { url } = await downloadMutation.mutateAsync({ id: document.id });
      // Open in new tab to trigger download
      window.open(url, "_blank");
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = async () => {
    setIsLoadingPreview(true);
    try {
      const result = await previewMutation.mutateAsync({ id: document.id });
      setPreviewUrl(result.url);
      setShowPreview(true);
    } catch (error) {
      console.error("Preview error:", error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleAnalyze = () => {
    analyzeMutation.mutate({ id: document.id });
  };

  // Check if document can be previewed (images and PDFs)
  const canPreview = document.mimeType.startsWith("image/") || document.mimeType === "application/pdf";

  const handleAcceptSuggestion = () => {
    if (suggestion?.expiryDate) {
      updateMutation.mutate({
        id: document.id,
        data: { expiryDate: suggestion.expiryDate },
      });
    }
  };

  const handleCategorySave = () => {
    updateMutation.mutate({
      id: document.id,
      data: {
        category: selectedCategory === "" ? null : selectedCategory as DocumentCategory,
      },
    });
  };

  const handleExpirySave = () => {
    updateMutation.mutate({
      id: document.id,
      data: {
        expiryDate: selectedExpiryDate === "" ? null : selectedExpiryDate,
      },
    });
  };

  const expiryStatus = getExpiryStatus(document.expiryDate);

  // Check if document can be analyzed (images only for now)
  const canAnalyze = isAnalysisAvailable &&
    !document.expiryDate &&
    document.mimeType.startsWith("image/");

  return (
    <Card className="group hover:border-primary/50 hover:shadow-sm transition-all">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={canPreview ? handlePreview : undefined}
            disabled={isLoadingPreview || !canPreview}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg bg-muted transition-colors",
              canPreview && "hover:bg-muted/80 cursor-pointer"
            )}
          >
            {isLoadingPreview ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              getFileIcon(document.mimeType)
            )}
          </button>
          <div className="flex-1 min-w-0">
            <button
              type="button"
              onClick={canPreview ? handlePreview : undefined}
              disabled={isLoadingPreview || !canPreview}
              className={cn(
                "font-medium text-sm truncate text-left w-full",
                canPreview && "hover:text-primary cursor-pointer"
              )}
              title={document.originalName}
            >
              {document.originalName}
            </button>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{formatFileSize(document.fileSize)}</span>
              <span>•</span>
              <span>
                {new Date(document.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <Dialog open={isEditingCategory} onOpenChange={setIsEditingCategory}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="mt-2 flex items-center gap-1 text-xs hover:bg-muted rounded px-1.5 py-0.5 -ml-1.5 transition-colors"
                >
                  {document.category ? (
                    <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
                      {getCategoryLabel(document.category)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Ajouter une catégorie
                    </span>
                  )}
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Catégoriser le document</DialogTitle>
                  <DialogDescription>
                    Sélectionnez une catégorie pour &quot;{document.originalName}&quot;
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Non catégorisé</SelectItem>
                      {DOCUMENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORY_LABELS[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingCategory(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleCategorySave}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Enregistrer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Expiry Date */}
            <Dialog open={isEditingExpiry} onOpenChange={setIsEditingExpiry}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="mt-1 flex items-center gap-1 text-xs hover:bg-muted rounded px-1.5 py-0.5 -ml-1.5 transition-colors"
                >
                  {document.expiryDate ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs cursor-pointer border",
                        getExpiryBadgeClass(expiryStatus)
                      )}
                    >
                      {expiryStatus === "expired" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {expiryStatus === "expiring-soon" && <Clock className="h-3 w-3 mr-1" />}
                      {formatExpiryMessage(document.expiryDate)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Définir une date d&apos;expiration
                    </span>
                  )}
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Date d&apos;expiration</DialogTitle>
                  <DialogDescription>
                    Définissez la date d&apos;expiration pour &quot;{document.originalName}&quot;
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    type="date"
                    value={selectedExpiryDate}
                    onChange={(e) => setSelectedExpiryDate(e.target.value)}
                    className="w-full"
                  />
                  {selectedExpiryDate && (
                    <p className={cn(
                      "mt-2 text-sm",
                      getExpiryStatus(selectedExpiryDate) === "expired" && "text-red-600",
                      getExpiryStatus(selectedExpiryDate) === "expiring-soon" && "text-orange-600",
                      getExpiryStatus(selectedExpiryDate) === "valid" && "text-green-600"
                    )}>
                      {formatExpiryMessage(selectedExpiryDate)}
                    </p>
                  )}
                </div>
                <DialogFooter className="gap-2">
                  {document.expiryDate && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedExpiryDate("");
                        updateMutation.mutate({
                          id: document.id,
                          data: { expiryDate: null },
                        });
                      }}
                      disabled={updateMutation.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      Supprimer
                    </Button>
                  )}
                  <div className="flex-1" />
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingExpiry(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleExpirySave}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Enregistrer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Preview Button */}
            {canPreview && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handlePreview}
                disabled={isLoadingPreview}
                title="Prévisualiser"
              >
                {isLoadingPreview ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            )}
            {/* AI Analyze Button */}
            {canAnalyze && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-purple-600 hover:text-purple-700"
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending}
                title="Détecter la date d'expiration"
              >
                {analyzeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDownload}
              disabled={isDownloading}
              title="Télécharger"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Le document &quot;{document.originalName}&quot;
                    {" "}sera définitivement supprimé.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate({ id: document.id })}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* AI Suggestion Dialog */}
        <Dialog open={showSuggestion} onOpenChange={setShowSuggestion}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Date d&apos;expiration détectée
              </DialogTitle>
              <DialogDescription>
                L&apos;IA a analysé le document et suggère une date d&apos;expiration.
              </DialogDescription>
            </DialogHeader>
            {suggestion && (
              <div className="py-4 space-y-4">
                {suggestion.documentType && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Type de document: </span>
                    <span className="font-medium">{suggestion.documentType}</span>
                  </div>
                )}
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <p className="text-sm text-purple-800 mb-2">{suggestion.message}</p>
                  {suggestion.expiryDate && (
                    <p className="text-lg font-semibold text-purple-900">
                      {new Date(suggestion.expiryDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      "mt-2",
                      suggestion.confidence === "high" && "bg-green-100 text-green-800 border-green-200",
                      suggestion.confidence === "medium" && "bg-yellow-100 text-yellow-800 border-yellow-200",
                      suggestion.confidence === "low" && "bg-orange-100 text-orange-800 border-orange-200"
                    )}
                  >
                    Confiance {suggestion.confidence === "high" ? "élevée" : suggestion.confidence === "medium" ? "moyenne" : "faible"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Vous pouvez modifier la date si nécessaire:</p>
                  <Input
                    type="date"
                    value={selectedExpiryDate}
                    onChange={(e) => setSelectedExpiryDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowSuggestion(false)}
              >
                Rejeter
              </Button>
              <Button
                onClick={handleAcceptSuggestion}
                disabled={updateMutation.isPending || !selectedExpiryDate}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Accepter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2 truncate pr-8">
                  <Eye className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{document.originalName}</span>
                </DialogTitle>
              </div>
              <DialogDescription className="flex flex-wrap items-center gap-2 text-xs">
                <span>{formatFileSize(document.fileSize)}</span>
                <span>•</span>
                <span>{new Date(document.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}</span>
                {document.category && (
                  <>
                    <span>•</span>
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(document.category)}
                    </Badge>
                  </>
                )}
                {document.expiryDate && (
                  <>
                    <span>•</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        getExpiryBadgeClass(getExpiryStatus(document.expiryDate))
                      )}
                    >
                      {formatExpiryMessage(document.expiryDate)}
                    </Badge>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 min-h-0 overflow-auto bg-muted rounded-lg">
              {previewUrl && (
                <>
                  {document.mimeType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt={document.originalName}
                      className="w-full h-auto object-contain"
                    />
                  ) : document.mimeType === "application/pdf" ? (
                    <iframe
                      src={previewUrl}
                      title={document.originalName}
                      className="w-full h-[60vh] border-0"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-muted-foreground">
                      Prévisualisation non disponible pour ce type de fichier
                    </div>
                  )}
                </>
              )}
            </div>
            <DialogFooter className="flex-shrink-0 gap-2">
              <Button
                variant="outline"
                onClick={() => previewUrl && window.open(previewUrl, "_blank")}
                disabled={!previewUrl}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir dans un nouvel onglet
              </Button>
              <Button onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Télécharger
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

interface UploadState {
  status: "idle" | "uploading" | "success" | "error";
  progress: number;
  message?: string;
}

export function DocumentVault() {
  const utils = api.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data, isLoading } = api.companyDocuments.list.useQuery(
    selectedCategory !== "all" && selectedCategory !== "uncategorized"
      ? { category: selectedCategory as DocumentCategory }
      : undefined
  );
  const { data: categoryData } = api.companyDocuments.getCategoryCounts.useQuery();
  const { data: analysisData } = api.companyDocuments.isAnalysisAvailable.useQuery();
  const isAnalysisAvailable = analysisData?.available ?? false;

  const createDocumentMutation = api.companyDocuments.create.useMutation({
    onSuccess: () => {
      void utils.companyDocuments.list.invalidate();
      void utils.companyDocuments.getCategoryCounts.invalidate();
    },
  });

  // Debounce search query (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setUploadState({
        status: "error",
        progress: 0,
        message: `Fichier trop volumineux (max ${MAX_FILE_SIZE_MB} MB)`,
      });
      return;
    }

    setUploadState({ status: "uploading", progress: 10 });

    try {
      // Upload file to R2
      const formData = new FormData();
      formData.append("file", file);

      setUploadState({ status: "uploading", progress: 30 });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setUploadState({ status: "uploading", progress: 70 });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error ?? "Erreur lors de l'upload");
      }

      const result = (await response.json()) as {
        file: {
          fileName: string;
          originalName: string;
          mimeType: string;
          fileSize: number;
          storageKey: string;
        };
      };

      setUploadState({ status: "uploading", progress: 90 });

      // Create document record in database
      await createDocumentMutation.mutateAsync({
        fileName: result.file.fileName,
        originalName: result.file.originalName,
        mimeType: result.file.mimeType,
        fileSize: result.file.fileSize,
        storageKey: result.file.storageKey,
      });

      setUploadState({
        status: "success",
        progress: 100,
        message: "Document uploadé avec succès",
      });

      // Reset after 3 seconds
      setTimeout(() => {
        setUploadState({ status: "idle", progress: 0 });
      }, 3000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadState({
        status: "error",
        progress: 0,
        message: error instanceof Error ? error.message : "Erreur lors de l'upload",
      });
    }

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [createDocumentMutation]);

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
    void handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleSuccess = () => {
    void utils.companyDocuments.list.invalidate();
    void utils.companyDocuments.getCategoryCounts.invalidate();
  };

  // Filter documents by category and search query
  // useMemo must be called before any early returns
  const documents = useMemo(() => {
    const allDocuments = data?.documents ?? [];
    let filtered = allDocuments;

    // Filter by "uncategorized" if selected
    if (selectedCategory === "uncategorized") {
      filtered = filtered.filter((doc) => !doc.category);
    }

    // Filter by search query (case-insensitive, matches original name)
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase().trim();
      filtered = filtered.filter((doc) =>
        doc.originalName.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [data?.documents, selectedCategory, debouncedSearch]);

  // Get active categories (those with documents)
  const activeCategories = useMemo(() =>
    categoryData?.categories.filter((c) => c.count > 0) ?? [],
    [categoryData?.categories]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-5 w-5" />
            Ajouter un document
          </CardTitle>
          <CardDescription>
            Formats acceptés: PDF, Word, Excel, Images (max {MAX_FILE_SIZE_MB} MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            <Input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={uploadState.status === "uploading"}
            />

            {uploadState.status === "idle" && (
              <>
                <Upload className="mb-4 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Glissez-déposez un fichier ou cliquez pour sélectionner
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
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Mes documents
          </h3>
          <Badge variant="outline">{categoryData?.total ?? 0} document{(categoryData?.total ?? 0) > 1 ? "s" : ""}</Badge>
        </div>

        {/* Search Input */}
        {(categoryData?.total ?? 0) > 0 && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher par nom de fichier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {debouncedSearch.trim() && (
              <p className="text-xs text-muted-foreground">
                {documents.length} résultat{documents.length > 1 ? "s" : ""} pour &quot;{debouncedSearch}&quot;
                {selectedCategory !== "all" && ` dans ${selectedCategory === "uncategorized" ? "Non catégorisé" : getCategoryLabel(selectedCategory)}`}
              </p>
            )}
          </div>
        )}

        {/* Category Filter */}
        {(categoryData?.total ?? 0) > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "px-3 py-1 text-xs rounded-full transition-colors",
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                Tous ({categoryData?.total ?? 0})
              </button>
              {activeCategories.map((cat) => (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => setSelectedCategory(cat.category)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full transition-colors",
                    selectedCategory === cat.category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {CATEGORY_LABELS[cat.category]} ({cat.count})
                </button>
              ))}
              {(categoryData?.uncategorized ?? 0) > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory("uncategorized")}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full transition-colors",
                    selectedCategory === "uncategorized"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  Non catégorisé ({categoryData?.uncategorized ?? 0})
                </button>
              )}
            </div>
          </div>
        )}

        {documents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              {debouncedSearch.trim() ? (
                <>
                  <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Aucun document trouvé pour &quot;{debouncedSearch}&quot;
                    {selectedCategory !== "all" && ` dans ${selectedCategory === "uncategorized" ? "Non catégorisé" : getCategoryLabel(selectedCategory)}`}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    Effacer la recherche
                  </button>
                </>
              ) : (
                <>
                  <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory === "all"
                      ? "Aucun document dans votre coffre-fort."
                      : `Aucun document dans la catégorie "${selectedCategory === "uncategorized" ? "Non catégorisé" : getCategoryLabel(selectedCategory)}".`}
                  </p>
                  {selectedCategory === "all" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Uploadez votre premier document ci-dessus.
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={handleSuccess}
                onUpdate={handleSuccess}
                isAnalysisAvailable={isAnalysisAvailable}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
