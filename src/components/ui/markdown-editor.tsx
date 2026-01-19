"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { cn } from "~/lib/utils";

// Dynamic import to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full animate-pulse bg-muted rounded-md" />
  ),
});

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxLength?: number;
  className?: string;
  preview?: "edit" | "live" | "preview";
}

/**
 * MarkdownEditor - Rich text editor with markdown support
 *
 * Features:
 * - Toolbar with formatting buttons (bold, italic, lists, etc.)
 * - Live preview mode
 * - Dark/light theme support
 * - Customizable height
 */
export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  minHeight = 300,
  maxLength,
  className,
  preview = "edit",
}: MarkdownEditorProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div className={cn("w-full", className)} data-color-mode={resolvedTheme}>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val ?? "")}
        preview={preview}
        height={minHeight}
        textareaProps={{
          placeholder: placeholder ?? "Saisissez votre texte ici... (Markdown supporté)",
          maxLength,
        }}
        visibleDragbar={false}
        hideToolbar={false}
        enableScroll={true}
      />
      {maxLength && (
        <div className="text-xs text-muted-foreground text-right mt-1">
          {value.length} / {maxLength}
        </div>
      )}
    </div>
  );
}

/**
 * MarkdownEditorSimple - Simplified version with just textarea styling
 * For cases where full editor is too heavy
 */
export function MarkdownEditorSimple({
  value,
  onChange,
  placeholder,
  minHeight = 200,
  maxLength,
  className,
}: Omit<MarkdownEditorProps, "preview">) {
  return (
    <div className={cn("w-full", className)}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Saisissez votre texte..."}
        maxLength={maxLength}
        className={cn(
          "w-full rounded-md border border-input bg-background px-3 py-2",
          "text-base ring-offset-background",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none font-mono"
        )}
        style={{ minHeight }}
      />
      {maxLength && (
        <div className="text-xs text-muted-foreground text-right mt-1">
          {value.length} / {maxLength}
        </div>
      )}
    </div>
  );
}
