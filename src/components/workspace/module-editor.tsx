"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Save, Loader2, CheckCircle } from "lucide-react";

import { Button } from "~/components/ui/button";
import { MarkdownEditor } from "~/components/ui/markdown-editor";
import { cn } from "~/lib/utils";

interface ModuleEditorProps {
  moduleId: string;
  moduleTitle: string;
  content: string;
  onSave: (content: string) => Promise<void>;
  onBack: () => void;
  isSaving?: boolean;
  className?: string;
}

/**
 * ModuleEditor - Inline editor for module content
 *
 * Features:
 * - Rich markdown editor
 * - Auto-save indicator
 * - Back navigation
 * - Manual save button
 */
export function ModuleEditor({
  moduleId,
  moduleTitle,
  content,
  onSave,
  onBack,
  isSaving = false,
  className,
}: ModuleEditorProps) {
  const [localContent, setLocalContent] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Sync content when moduleId changes
  useEffect(() => {
    setLocalContent(content);
    setHasChanges(false);
    setSaveStatus("idle");
  }, [moduleId, content]);

  // Track changes
  const handleContentChange = useCallback((newContent: string) => {
    setLocalContent(newContent);
    setHasChanges(newContent !== content);
    setSaveStatus("idle");
  }, [content]);

  // Save handler
  const handleSave = useCallback(async () => {
    if (!hasChanges || isSaving) return;

    setSaveStatus("saving");
    try {
      await onSave(localContent);
      setHasChanges(false);
      setSaveStatus("saved");
      // Reset saved status after 2 seconds
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus("idle");
    }
  }, [localContent, hasChanges, isSaving, onSave]);

  // Keyboard shortcut for save (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        void handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div className="h-4 w-px bg-border" />
          <h2 className="font-semibold text-foreground">{moduleTitle}</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Save status indicator */}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Enregistré
            </span>
          )}
          {hasChanges && saveStatus === "idle" && (
            <span className="text-sm text-muted-foreground">
              Modifications non enregistrées
            </span>
          )}

          {/* Save button */}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving || saveStatus === "saving"}
            size="sm"
            className="gap-2"
          >
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden p-4">
        <MarkdownEditor
          value={localContent}
          onChange={handleContentChange}
          placeholder={`Saisissez le contenu pour "${moduleTitle}"...`}
          minHeight={500}
          preview="live"
          className="h-full"
        />
      </div>

      {/* Footer with keyboard shortcut hint */}
      <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
        <span className="hidden sm:inline">
          Astuce : Utilisez <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs">S</kbd> pour enregistrer rapidement
        </span>
      </div>
    </div>
  );
}
