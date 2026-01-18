/**
 * Markdown parser utility for PDF and DOCX exports
 * Parses basic markdown syntax into structured segments
 */

export interface TextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

export interface ParsedLine {
  type: "paragraph" | "bullet" | "numbered" | "header";
  number?: number;
  level?: number; // For headers (1-6)
  segments: TextSegment[];
}

/**
 * Strip HTML tags and convert to plain text
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "- ")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<strong>/gi, "**")
    .replace(/<\/strong>/gi, "**")
    .replace(/<b>/gi, "**")
    .replace(/<\/b>/gi, "**")
    .replace(/<em>/gi, "*")
    .replace(/<\/em>/gi, "*")
    .replace(/<i>/gi, "*")
    .replace(/<\/i>/gi, "*")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Parse inline markdown (bold, italic) into text segments
 * Handles: **bold**, *italic*, ***bold italic***
 */
export function parseInlineMarkdown(text: string): TextSegment[] {
  const segments: TextSegment[] = [];

  // Regex to match markdown patterns
  // Order matters: check bold+italic first, then bold, then italic
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*)/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index);
      if (beforeText) {
        segments.push({ text: beforeText });
      }
    }

    // Determine the type of match
    if (match[2]) {
      // ***bold italic***
      segments.push({ text: match[2], bold: true, italic: true });
    } else if (match[3]) {
      // **bold**
      segments.push({ text: match[3], bold: true });
    } else if (match[4]) {
      // *italic*
      segments.push({ text: match[4], italic: true });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    if (remainingText) {
      segments.push({ text: remainingText });
    }
  }

  // If no segments were created, return the original text
  if (segments.length === 0) {
    return [{ text }];
  }

  return segments;
}

/**
 * Parse a single line to determine its type and content
 */
export function parseLine(line: string): ParsedLine {
  const trimmedLine = line.trim();

  // Check for headers (### Header text)
  const headerRegex = /^(#{1,6})\s+(.*)$/;
  const headerMatch = headerRegex.exec(trimmedLine);
  if (headerMatch?.[1] && headerMatch[2]) {
    return {
      type: "header",
      level: headerMatch[1].length,
      segments: parseInlineMarkdown(headerMatch[2]),
    };
  }

  // Check for bullet points (-, *, •)
  const bulletRegex = /^[-*•]\s+(.*)$/;
  const bulletMatch = bulletRegex.exec(trimmedLine);
  if (bulletMatch?.[1] !== undefined) {
    return {
      type: "bullet",
      segments: parseInlineMarkdown(bulletMatch[1]),
    };
  }

  // Check for numbered list (1., 2., etc.)
  const numberedRegex = /^(\d+)\.\s+(.*)$/;
  const numberedMatch = numberedRegex.exec(trimmedLine);
  if (numberedMatch?.[1] !== undefined && numberedMatch[2] !== undefined) {
    return {
      type: "numbered",
      number: parseInt(numberedMatch[1], 10),
      segments: parseInlineMarkdown(numberedMatch[2]),
    };
  }

  // Regular paragraph
  return {
    type: "paragraph",
    segments: parseInlineMarkdown(trimmedLine),
  };
}

/**
 * Parse markdown content into structured data
 */
export function parseMarkdownContent(content: string): ParsedLine[][] {
  const plainText = stripHtml(content);
  const paragraphs = plainText.split("\n\n").filter((p) => p.trim());

  return paragraphs.map((paragraph) => {
    const lines = paragraph.split("\n").filter((l) => l.trim());
    return lines.map(parseLine);
  });
}

/**
 * Convert segments back to plain text (for accessibility/fallback)
 */
export function segmentsToPlainText(segments: TextSegment[]): string {
  return segments.map((s) => s.text).join("");
}

/**
 * Convert markdown to HTML for browser rendering
 * Handles: **bold**, *italic*, lists, headers, line breaks
 */
export function markdownToHtml(content: string): string {
  const plainText = stripHtml(content);

  // Split into paragraphs (double newlines)
  const paragraphs = plainText.split(/\n\n+/).filter((p) => p.trim());

  const htmlParts: string[] = [];

  for (const paragraph of paragraphs) {
    const lines = paragraph.split("\n").filter((l) => l.trim());

    // Check if first line is a header
    const firstLine = lines[0]?.trim() ?? "";
    const headerMatch = /^(#{1,6})\s+(.+)$/.exec(firstLine);
    if (headerMatch?.[1] && headerMatch[2] && lines.length === 1) {
      const level = headerMatch[1].length;
      const headerContent = formatInlineMarkdown(headerMatch[2]);
      htmlParts.push(`<h${level}>${headerContent}</h${level}>`);
      continue;
    }

    // Check if this paragraph is a bullet list
    const isBulletList = lines.every((line) => /^[-*•]\s+/.test(line.trim()));
    // Check if this paragraph is a numbered list
    const isNumberedList = lines.every((line) => /^\d+\.\s+/.test(line.trim()));

    if (isBulletList && lines.length > 0) {
      // Process as bullet list
      const listItems = lines.map((line) => {
        const content = line.trim().replace(/^[-*•]\s+/, "");
        return `<li>${formatInlineMarkdown(content)}</li>`;
      });
      htmlParts.push(`<ul>${listItems.join("")}</ul>`);
    } else if (isNumberedList && lines.length > 0) {
      // Process as numbered list
      const listItems = lines.map((line) => {
        const content = line.trim().replace(/^\d+\.\s+/, "");
        return `<li>${formatInlineMarkdown(content)}</li>`;
      });
      htmlParts.push(`<ol>${listItems.join("")}</ol>`);
    } else {
      // Process as regular paragraph with possible inline lists and headers
      const processedLines: string[] = [];
      let currentList: { type: "ul" | "ol"; items: string[] } | null = null;

      for (const line of lines) {
        const trimmedLine = line.trim();

        // Check for headers within mixed content
        const headerMatch = /^(#{1,6})\s+(.+)$/.exec(trimmedLine);
        const bulletMatch = /^[-*•]\s+(.*)$/.exec(trimmedLine);
        const numberedMatch = /^\d+\.\s+(.*)$/.exec(trimmedLine);

        if (headerMatch?.[1] && headerMatch[2]) {
          // Close any open list first
          if (currentList) {
            processedLines.push(
              `<${currentList.type}>${currentList.items.map((i) => `<li>${i}</li>`).join("")}</${currentList.type}>`
            );
            currentList = null;
          }
          const level = headerMatch[1].length;
          const headerContent = formatInlineMarkdown(headerMatch[2]);
          processedLines.push(`<h${level}>${headerContent}</h${level}>`);
        } else if (bulletMatch?.[1] !== undefined) {
          // Start or continue bullet list
          if (currentList?.type !== "ul") {
            if (currentList) {
              // Close previous list
              processedLines.push(
                `<${currentList.type}>${currentList.items.map((i) => `<li>${i}</li>`).join("")}</${currentList.type}>`
              );
            }
            currentList = { type: "ul", items: [] };
          }
          currentList.items.push(formatInlineMarkdown(bulletMatch[1]));
        } else if (numberedMatch?.[1] !== undefined) {
          // Start or continue numbered list
          if (currentList?.type !== "ol") {
            if (currentList) {
              // Close previous list
              processedLines.push(
                `<${currentList.type}>${currentList.items.map((i) => `<li>${i}</li>`).join("")}</${currentList.type}>`
              );
            }
            currentList = { type: "ol", items: [] };
          }
          currentList.items.push(formatInlineMarkdown(numberedMatch[1]));
        } else {
          // Regular text line
          if (currentList) {
            // Close current list
            processedLines.push(
              `<${currentList.type}>${currentList.items.map((i) => `<li>${i}</li>`).join("")}</${currentList.type}>`
            );
            currentList = null;
          }
          processedLines.push(formatInlineMarkdown(trimmedLine));
        }
      }

      // Close any remaining list
      if (currentList) {
        processedLines.push(
          `<${currentList.type}>${currentList.items.map((i) => `<li>${i}</li>`).join("")}</${currentList.type}>`
        );
      }

      // Join with <br> for regular text, but not for lists or headers
      const paragraphHtml = processedLines
        .map((part, i) => {
          // Don't add <br> after list or header elements
          if (part.startsWith("<ul>") || part.startsWith("<ol>") || part.startsWith("<h")) {
            return part;
          }
          // Don't add <br> before list or header elements
          if (i < processedLines.length - 1) {
            const nextPart = processedLines[i + 1];
            if (nextPart?.startsWith("<ul>") || nextPart?.startsWith("<ol>") || nextPart?.startsWith("<h")) {
              return part;
            }
          }
          // Add <br> between regular text lines
          if (i < processedLines.length - 1 && !processedLines[i + 1]?.startsWith("<")) {
            return part + "<br>";
          }
          return part;
        })
        .join("");

      if (paragraphHtml) {
        // Only wrap in <p> if it's not starting with a block element (list or header)
        if (paragraphHtml.startsWith("<ul>") || paragraphHtml.startsWith("<ol>") || paragraphHtml.startsWith("<h")) {
          htmlParts.push(paragraphHtml);
        } else {
          htmlParts.push(`<p>${paragraphHtml}</p>`);
        }
      }
    }
  }

  return htmlParts.join("");
}

/**
 * Format inline markdown (bold, italic) to HTML
 * Also transforms placeholder patterns [text] into styled elements
 */
function formatInlineMarkdown(text: string, transformPlaceholders = true): string {
  let result = text
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Transform placeholder patterns [text] into styled placeholder elements
  if (transformPlaceholders) {
    result = result.replace(
      /\[([^\]]+)\]/g,
      '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/50 border border-dashed border-muted-foreground/30 text-muted-foreground/60 text-xs font-normal italic">$1</span>'
    );
  }

  return result;
}

/**
 * Transform placeholder patterns [text] in already-rendered HTML
 */
export function transformPlaceholders(html: string): string {
  return html.replace(
    /\[([^\]]+)\]/g,
    '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/50 border border-dashed border-muted-foreground/30 text-muted-foreground/60 text-xs font-normal italic">$1</span>'
  );
}
