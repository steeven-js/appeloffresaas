"use client";

import { useEffect } from "react";
import { Loader2, CheckCircle2, XCircle, RefreshCw, FileText } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";

interface RCParsingStatusProps {
  documentId: string;
  parsingStatus: string | null;
  onStatusChange?: () => void;
}

/**
 * RC Parsing Status Component (Story 4.1)
 * Shows the current parsing status of an RC document with retry option
 */
export function RCParsingStatus({
  documentId,
  parsingStatus,
  onStatusChange,
}: RCParsingStatusProps) {
  const utils = api.useUtils();

  // Retry mutation
  const retryMutation = api.tenderDocuments.retryParsing.useMutation({
    onSuccess: () => {
      void utils.tenderDocuments.getRC.invalidate();
      onStatusChange?.();
    },
  });

  // Polling for status updates when processing
  const { data: rcData } = api.tenderDocuments.get.useQuery(
    { id: documentId },
    {
      enabled: parsingStatus === "processing" || parsingStatus === "pending",
      refetchInterval: parsingStatus === "processing" ? 3000 : false,
    }
  );

  // Update parent when status changes
  useEffect(() => {
    if (rcData && rcData.parsingStatus !== parsingStatus) {
      onStatusChange?.();
    }
  }, [rcData, parsingStatus, onStatusChange]);

  const currentStatus = rcData?.parsingStatus ?? parsingStatus;

  const handleRetry = () => {
    retryMutation.mutate({ id: documentId });
  };

  // Render based on status
  if (currentStatus === "pending") {
    return (
      <Card className="border-muted-foreground/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Analyse du RC
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">En attente de traitement...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStatus === "processing") {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyse du RC en cours
          </CardTitle>
          <CardDescription>
            Extraction des exigences et documents requis...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>Lecture du document PDF</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-muted" />
              <span>Analyse IA des exigences</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-muted" />
              <span>Extraction de la checklist</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStatus === "completed") {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            Analyse terminée
          </CardTitle>
          <CardDescription>
            Le document a été analysé avec succès.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les exigences et documents requis ont été extraits.
            Consultez l&apos;onglet Checklist pour voir les résultats.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (currentStatus === "failed") {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-destructive">
            <XCircle className="h-4 w-4" />
            Échec de l&apos;analyse
          </CardTitle>
          <CardDescription>
            Une erreur est survenue lors de l&apos;analyse du document.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              L&apos;analyse automatique a échoué. Cela peut arriver si le document
              est scanné, protégé, ou dans un format non standard.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={retryMutation.isPending}
            >
              {retryMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Réessayer l&apos;analyse
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No status yet (document just uploaded)
  return null;
}
