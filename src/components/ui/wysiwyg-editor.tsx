"use client";

import { useCallback, useMemo } from "react";
import { marked } from "marked";
import TurndownService from "turndown";
import { RichTextEditor } from "./rich-text-editor";

// Configure marked for synchronous parsing
marked.use({
  async: false,
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
});

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "*",
  strongDelimiter: "**",
});

// Add table support to Turndown
turndownService.addRule("table", {
  filter: "table",
  replacement: function (_content, node) {
    const table = node as HTMLTableElement;
    const rows = Array.from(table.rows);
    if (rows.length === 0) return "";

    let markdown = "";
    const headerRow = rows[0];
    if (headerRow) {
      const headerCells = Array.from(headerRow.cells);
      markdown += "| " + headerCells.map((cell) => cell.textContent?.trim() ?? "").join(" | ") + " |\n";
      markdown += "| " + headerCells.map(() => "---").join(" | ") + " |\n";
    }

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row) {
        const cells = Array.from(row.cells);
        markdown += "| " + cells.map((cell) => cell.textContent?.trim() ?? "").join(" | ") + " |\n";
      }
    }

    return markdown;
  },
});

// Keep highlight marks
turndownService.addRule("highlight", {
  filter: "mark",
  replacement: function (content) {
    return `==${content}==`;
  },
});

// Keep underline
turndownService.addRule("underline", {
  filter: "u",
  replacement: function (content) {
    return `<u>${content}</u>`;
  },
});

/**
 * Convert markdown to HTML using marked library
 */
function markdownToHtml(markdown: string): string {
  if (!markdown) return "";

  try {
    // Use marked.parse synchronously
    const html = marked.parse(markdown) as string;
    return html;
  } catch (error) {
    console.error("Markdown parsing error:", error);
    return `<p>${markdown}</p>`;
  }
}

/**
 * Convert HTML to Markdown using Turndown
 */
function htmlToMarkdown(html: string): string {
  if (!html) return "";
  return turndownService.turndown(html);
}

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
  disabled?: boolean;
  autofocus?: boolean;
}

/**
 * WYSIWYG Editor that accepts and outputs Markdown
 *
 * This component wraps the RichTextEditor (TipTap-based) and handles
 * the conversion between Markdown and HTML automatically.
 *
 * - Input: Markdown string
 * - Display: Rich formatted text (WYSIWYG)
 * - Output: Markdown string
 */
export function WysiwygEditor({
  value,
  onChange,
  placeholder = "Commencez à écrire...",
  className,
  editorClassName,
  disabled = false,
  autofocus = false,
}: WysiwygEditorProps) {
  // Convert markdown to HTML for the editor
  const htmlContent = useMemo(() => markdownToHtml(value), [value]);

  // Convert HTML back to markdown when content changes
  const handleChange = useCallback(
    (html: string) => {
      const markdown = htmlToMarkdown(html);
      onChange(markdown);
    },
    [onChange]
  );

  return (
    <RichTextEditor
      content={htmlContent}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      editorClassName={editorClassName}
      disabled={disabled}
      autofocus={autofocus}
    />
  );
}
