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
  type: "paragraph" | "bullet" | "numbered";
  number?: number;
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
 * Handles: **bold**, *italic*, lists, line breaks
 */
export function markdownToHtml(content: string): string {
  const plainText = stripHtml(content);

  // Split into paragraphs (double newlines)
  const paragraphs = plainText.split(/\n\n+/).filter((p) => p.trim());

  const htmlParts: string[] = [];

  for (const paragraph of paragraphs) {
    const lines = paragraph.split("\n").filter((l) => l.trim());

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
      // Process as regular paragraph with possible inline lists
      const processedLines: string[] = [];
      let currentList: { type: "ul" | "ol"; items: string[] } | null = null;

      for (const line of lines) {
        const trimmedLine = line.trim();
        const bulletMatch = /^[-*•]\s+(.*)$/.exec(trimmedLine);
        const numberedMatch = /^\d+\.\s+(.*)$/.exec(trimmedLine);

        if (bulletMatch?.[1] !== undefined) {
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

      // Join with <br> for regular text, but not for lists
      const paragraphHtml = processedLines
        .map((part, i) => {
          // Don't add <br> after list elements
          if (part.startsWith("<ul>") || part.startsWith("<ol>")) {
            return part;
          }
          // Don't add <br> before list elements
          if (i < processedLines.length - 1) {
            const nextPart = processedLines[i + 1];
            if (nextPart?.startsWith("<ul>") || nextPart?.startsWith("<ol>")) {
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
        // Only wrap in <p> if it's not just a list
        if (paragraphHtml.startsWith("<ul>") || paragraphHtml.startsWith("<ol>")) {
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
 */
function formatInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}
