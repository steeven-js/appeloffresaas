"use client";

import { useMemo } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  CheckCircle2,
  Download,
  FileText,
  FileType,
  X,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import {
  checkCompleteness,
  getCompletenessSummary,
  type CompletenessInput,
} from "~/lib/utils/completeness";

interface PreExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CompletenessInput;
  onExportPdf: () => void;
  onExportDocx: () => void;
  onExportZip: () => void;
  isExportingPdf?: boolean;
  isExportingDocx?: boolean;
  isExportingZip?: boolean;
}

export function PreExportDialog({
  open,
  onOpenChange,
  data,
  onExportPdf,
  onExportDocx,
  onExportZip,
  isExportingPdf = false,
  isExportingDocx = false,
  isExportingZip = false,
}: PreExportDialogProps) {
  const result = useMemo(() => checkCompleteness(data), [data]);
  const summary = useMemo(() => getCompletenessSummary(result), [result]);

  const isExporting = isExportingPdf || isExportingDocx || isExportingZip;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleExportPdf = () => {
    onExportPdf();
    onOpenChange(false);
  };

  const handleExportDocx = () => {
    onExportDocx();
    onOpenChange(false);
  };

  const handleExportZip = () => {
    onExportZip();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Vérification avant export
          </DialogTitle>
          <DialogDescription>{summary}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Completeness Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Complétude du dossier</span>
              <span className="text-2xl font-bold">{result.percentage}%</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-primary/20">
              <div
                className={`h-full transition-all ${getProgressColor(result.percentage)}`}
                style={{ width: `${result.percentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {result.passedChecks} / {result.totalChecks} éléments complétés
            </p>
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            <div className="space-y-4 pr-2">
              {/* Required Fields */}
              <div>
                <h4 className="mb-2 text-sm font-semibold flex items-center gap-2">
                  <span>Champs obligatoires</span>
                  {result.requiredFields.every((f) => f.status === "complete") ? (
                    <Badge variant="default" className="bg-green-500">
                      Complet
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Incomplet</Badge>
                  )}
                </h4>
                <div className="space-y-1">
                  {result.requiredFields.map((field) => (
                    <div
                      key={field.field}
                      className="flex items-center gap-2 text-sm"
                    >
                      {field.status === "complete" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={
                          field.status === "complete"
                            ? "text-muted-foreground"
                            : "text-red-600 font-medium"
                        }
                      >
                        {field.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Fields */}
              <div>
                <h4 className="mb-2 text-sm font-semibold flex items-center gap-2">
                  <span>Champs recommandés</span>
                  <Badge variant="outline">
                    {result.recommendedFields.filter((f) => f.status === "complete").length} /{" "}
                    {result.recommendedFields.length}
                  </Badge>
                </h4>
                <div className="space-y-1">
                  {result.recommendedFields.map((field) => (
                    <div
                      key={field.field}
                      className="flex items-center gap-2 text-sm"
                    >
                      {field.status === "complete" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-muted-foreground">{field.label}</span>
                      {field.message && (
                        <span className="text-xs text-yellow-600">
                          ({field.message})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sections */}
              {result.sections.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold flex items-center gap-2">
                    <span>Sections du document</span>
                    <Badge variant="outline">
                      {result.sections.filter((s) => s.status === "complete").length} /{" "}
                      {result.sections.length}
                    </Badge>
                  </h4>
                  <div className="space-y-1">
                    {result.sections.map((section) => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {section.status === "complete" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : section.status === "empty" ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span
                            className={
                              section.status === "complete"
                                ? "text-muted-foreground"
                                : section.status === "empty"
                                  ? "text-red-600"
                                  : "text-yellow-600"
                            }
                          >
                            {section.title}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {section.wordCount} mots
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="rounded-md bg-yellow-50 p-3 border border-yellow-200">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Avertissements
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {result.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleExportPdf}
              disabled={isExporting}
              variant={result.isComplete ? "default" : "secondary"}
            >
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button
              onClick={handleExportDocx}
              disabled={isExporting}
              variant="outline"
            >
              <FileType className="mr-2 h-4 w-4" />
              Word
            </Button>
            <Button
              onClick={handleExportZip}
              disabled={isExporting}
              variant="outline"
              title="Télécharger l'archive complète (PDF + Word + Annexes)"
            >
              <Archive className="mr-2 h-4 w-4" />
              ZIP Complet
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
