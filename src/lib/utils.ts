import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Strip HTML tags from a string and return plain text
 */
export function stripHtmlTags(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Check if content has real data vs just placeholder text
 * Placeholders are text wrapped in brackets like [À compléter], [Nombre], etc.
 * Returns true if content has meaningful data filled in
 */
export function hasRealContent(content: string | null | undefined): boolean {
  if (!content || content.trim() === "") return false;

  // Strip HTML tags to get raw text
  const textContent = content.replace(/<[^>]*>/g, " ").trim();
  if (!textContent) return false;

  // Find all placeholder patterns [text]
  const placeholderPattern = /\[[^\]]+\]/g;
  const placeholders = textContent.match(placeholderPattern) ?? [];

  // Calculate total placeholder text length
  const placeholderLength = placeholders.reduce((sum, p) => sum + p.length, 0);

  // Get text without placeholders
  const textWithoutPlaceholders = textContent.replace(placeholderPattern, "").replace(/\s+/g, " ").trim();

  // If text without placeholders is very short (just labels/headers), it's placeholder content
  // We consider content real if:
  // 1. There are no placeholders at all, OR
  // 2. The non-placeholder text is substantial (more than just HTML structure labels)
  if (placeholders.length === 0) {
    return textWithoutPlaceholders.length > 10; // Needs some actual content
  }

  // If placeholder text dominates (> 30% of content), it's not real content
  const totalLength = textContent.replace(/\s+/g, " ").length;
  const placeholderRatio = placeholderLength / totalLength;

  return placeholderRatio < 0.3 && textWithoutPlaceholders.length > 50;
}
