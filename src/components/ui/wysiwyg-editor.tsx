"use client";

import { useCallback, useMemo } from "react";
import TurndownService from "turndown";
import { RichTextEditor } from "./rich-text-editor";

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
 * Convert markdown to HTML for TipTap editor
 */
function markdownToHtml(markdown: string): string {
  if (!markdown) return "";

  let html = markdown;

  // Headers (must be done before other replacements)
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  // Also handle #### and #####
  html = html.replace(/^##### (.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, "<s>$1</s>");

  // Highlight (==text==)
  html = html.replace(/==(.+?)==/g, "<mark>$1</mark>");

  // Horizontal rule
  html = html.replace(/^---$/gm, "<hr>");
  html = html.replace(/^\*\*\*$/gm, "<hr>");

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, "<blockquote><p>$1</p></blockquote>");

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>");

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Unordered lists
  const ulRegex = /^- (.+)$/gm;
  let match;
  const ulMatches: string[] = [];
  while ((match = ulRegex.exec(html)) !== null) {
    ulMatches.push(match[0]);
  }
  if (ulMatches.length > 0) {
    // Group consecutive list items
    let inList = false;
    const lines = html.split("\n");
    const newLines: string[] = [];
    for (const line of lines) {
      if (line.match(/^- (.+)$/)) {
        if (!inList) {
          newLines.push("<ul>");
          inList = true;
        }
        newLines.push(line.replace(/^- (.+)$/, "<li>$1</li>"));
      } else {
        if (inList) {
          newLines.push("</ul>");
          inList = false;
        }
        newLines.push(line);
      }
    }
    if (inList) {
      newLines.push("</ul>");
    }
    html = newLines.join("\n");
  }

  // Ordered lists
  const olRegex = /^\d+\. (.+)$/gm;
  const olMatches: string[] = [];
  while ((match = olRegex.exec(html)) !== null) {
    olMatches.push(match[0]);
  }
  if (olMatches.length > 0) {
    let inList = false;
    const lines = html.split("\n");
    const newLines: string[] = [];
    for (const line of lines) {
      if (line.match(/^\d+\. (.+)$/)) {
        if (!inList) {
          newLines.push("<ol>");
          inList = true;
        }
        newLines.push(line.replace(/^\d+\. (.+)$/, "<li>$1</li>"));
      } else {
        if (inList) {
          newLines.push("</ol>");
          inList = false;
        }
        newLines.push(line);
      }
    }
    if (inList) {
      newLines.push("</ol>");
    }
    html = newLines.join("\n");
  }

  // Simple table conversion (basic support)
  const tableRegex = /^\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/gm;
  html = html.replace(tableRegex, (_match, header: string, body: string) => {
    const headerCells = header.split("|").map((cell: string) => cell.trim()).filter(Boolean);
    const headerHtml = "<tr>" + headerCells.map((cell: string) => `<th>${cell}</th>`).join("") + "</tr>";

    const bodyRows = body.trim().split("\n");
    const bodyHtml = bodyRows.map((row: string) => {
      const cells = row.split("|").map((cell: string) => cell.trim()).filter(Boolean);
      return "<tr>" + cells.map((cell: string) => `<td>${cell}</td>`).join("") + "</tr>";
    }).join("");

    return `<table><thead>${headerHtml}</thead><tbody>${bodyHtml}</tbody></table>`;
  });

  // Convert remaining newlines to paragraphs
  // Split by double newlines for paragraphs
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs
    .map((p) => {
      // Don't wrap block elements
      if (
        p.startsWith("<h") ||
        p.startsWith("<ul") ||
        p.startsWith("<ol") ||
        p.startsWith("<blockquote") ||
        p.startsWith("<pre") ||
        p.startsWith("<table") ||
        p.startsWith("<hr")
      ) {
        return p;
      }
      // Wrap plain text in paragraphs
      if (p.trim() && !p.includes("<p>")) {
        return `<p>${p.replace(/\n/g, "<br>")}</p>`;
      }
      return p;
    })
    .join("");

  return html;
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
