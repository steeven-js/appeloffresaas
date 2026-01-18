/**
 * Filename generation utilities for export files
 * Format: DEMANDE_[REF]_[TITRE]_YYYYMMDD.ext
 */

/**
 * Sanitize a string for use in filenames
 * - Remove accented characters (é -> e, à -> a, etc.)
 * - Remove special characters except spaces and hyphens
 * - Replace spaces with underscores
 * - Trim and limit length
 */
export function sanitizeForFilename(text: string, maxLength = 50): string {
  return text
    // Normalize to decompose accented characters
    .normalize("NFD")
    // Remove diacritical marks (accents)
    .replace(/[\u0300-\u036f]/g, "")
    // Remove special characters except alphanumeric, spaces, and hyphens
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    // Replace multiple spaces/hyphens with single underscore
    .replace(/[\s-]+/g, "_")
    // Remove leading/trailing underscores
    .replace(/^_+|_+$/g, "")
    // Limit length
    .substring(0, maxLength)
    // Remove trailing underscore if truncated mid-word
    .replace(/_+$/, "");
}

/**
 * Format date as YYYYMMDD
 */
export function formatDateForFilename(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * Generate export filename following the convention:
 * DEMANDE_[REF]_[TITRE]_YYYYMMDD.ext
 *
 * @param title - Document title
 * @param reference - Reference number (optional)
 * @param extension - File extension (pdf, docx)
 * @param date - Date for the filename (defaults to now)
 */
export function generateExportFilename(
  title: string,
  reference: string | null | undefined,
  extension: "pdf" | "docx",
  date: Date = new Date()
): string {
  const parts: string[] = ["DEMANDE"];

  // Add reference if available
  if (reference) {
    const sanitizedRef = sanitizeForFilename(reference, 20);
    if (sanitizedRef) {
      parts.push(sanitizedRef);
    }
  }

  // Add title
  const sanitizedTitle = sanitizeForFilename(title, 40);
  if (sanitizedTitle) {
    parts.push(sanitizedTitle);
  } else {
    parts.push("Sans_titre");
  }

  // Add date
  parts.push(formatDateForFilename(date));

  return `${parts.join("_")}.${extension}`;
}
