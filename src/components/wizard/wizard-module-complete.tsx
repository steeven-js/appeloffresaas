"use client";

import { useState } from "react";
import { Check, RefreshCw, Edit2, Eye } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { markdownToHtml } from "~/lib/utils/markdown-parser";

interface WizardModuleCompleteProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  moduleTitle: string;
  generatedContent: string;
  onValidate: (content: string) => void;
  onRegenerate: () => void;
  isValidating: boolean;
  isRegenerating: boolean;
}

export function WizardModuleComplete({
  isOpen,
  onOpenChange,
  moduleTitle,
  generatedContent,
  onValidate,
  onRegenerate,
  isValidating,
  isRegenerating,
}: WizardModuleCompleteProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(generatedContent);

  // Reset edit state when content changes
  const handleContentChange = (content: string) => {
    setEditedContent(content);
  };

  // Reset when modal opens with new content
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setEditedContent(generatedContent);
      setIsEditMode(false);
    }
    onOpenChange(open);
  };

  const handleValidate = () => {
    const contentToSave = isEditMode ? editedContent : generatedContent;
    onValidate(contentToSave);
  };

  const handleRegenerate = () => {
    setIsEditMode(false);
    onRegenerate();
  };

  // Update edited content when generated content changes (after regeneration)
  if (generatedContent !== editedContent && !isEditMode) {
    setEditedContent(generatedContent);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Module &quot;{moduleTitle}&quot; terminé !
          </DialogTitle>
          <DialogDescription>
            Voici le texte généré à partir de vos réponses. Vous pouvez le
            valider, le modifier ou le régénérer.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto my-4">
          {isEditMode ? (
            <div className="space-y-2">
              <Textarea
                value={editedContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="min-h-[300px] text-base"
              />
              <div className="text-xs text-muted-foreground text-right">
                {editedContent.split(/\s+/).filter(Boolean).length} mots
              </div>
            </div>
          ) : (
            <div
              className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted/50 rounded-lg"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(generatedContent) }}
            />
          )}
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleRegenerate}
            disabled={isRegenerating || isValidating}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isRegenerating && "animate-spin")} />
            Régénérer
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditMode(!isEditMode)}
            disabled={isValidating}
            className="gap-2"
          >
            {isEditMode ? (
              <>
                <Eye className="h-4 w-4" />
                Voir aperçu
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4" />
                Modifier
              </>
            )}
          </Button>
          <Button
            onClick={handleValidate}
            disabled={isValidating || isRegenerating}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            {isValidating ? "Validation..." : "Valider et continuer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
