import mammoth from "mammoth";
import { extractTextFromPDF } from "../pdf/pdf-parser";

/**
 * Document parsing result
 */
export interface DocumentParseResult {
  text: string;
  pageCount?: number;
  wordCount: number;
  format: "pdf" | "docx" | "doc";
  metadata?: {
    title?: string;
    author?: string;
    creationDate?: string;
  };
}

/**
 * Supported file types for document import
 */
export const SUPPORTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
] as const;

export type SupportedDocumentType = (typeof SUPPORTED_DOCUMENT_TYPES)[number];

/**
 * Check if a MIME type is supported for document import
 */
export function isSupportedDocumentType(
  mimeType: string
): mimeType is SupportedDocumentType {
  return SUPPORTED_DOCUMENT_TYPES.includes(mimeType as SupportedDocumentType);
}

/**
 * Get the document format from MIME type
 */
function getDocumentFormat(mimeType: string): "pdf" | "docx" | "doc" {
  switch (mimeType) {
    case "application/pdf":
      return "pdf";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    case "application/msword":
      return "doc";
    default:
      throw new Error(`Unsupported document type: ${mimeType}`);
  }
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Extract text from a Word document (docx)
 */
async function extractTextFromWord(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Parse a document and extract text content
 * @param buffer - Document file buffer
 * @param mimeType - MIME type of the document
 * @returns Parsed document result with text and metadata
 */
export async function parseDocument(
  buffer: Buffer,
  mimeType: string
): Promise<DocumentParseResult> {
  if (!isSupportedDocumentType(mimeType)) {
    throw new Error(
      `Type de document non supporté: ${mimeType}. Formats acceptés: PDF, Word (docx, doc)`
    );
  }

  const format = getDocumentFormat(mimeType);

  if (format === "pdf") {
    const pdfResult = await extractTextFromPDF(buffer);
    return {
      text: pdfResult.text,
      pageCount: pdfResult.pageCount,
      wordCount: countWords(pdfResult.text),
      format,
      metadata: pdfResult.info,
    };
  }

  // Word documents (docx or doc)
  const text = await extractTextFromWord(buffer);
  return {
    text,
    wordCount: countWords(text),
    format,
  };
}

/**
 * Validate document size
 * @param bufferSize - Size of the document buffer in bytes
 * @param maxSizeMB - Maximum allowed size in MB (default 10MB)
 */
export function validateDocumentSize(
  bufferSize: number,
  maxSizeMB = 10
): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return bufferSize <= maxBytes;
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
