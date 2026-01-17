import { PDFParse } from "pdf-parse";

/**
 * PDF text extraction result
 */
export interface PDFParseResult {
  text: string;
  pageCount: number;
  info?: {
    title?: string;
    author?: string;
    creationDate?: string;
  };
}

/**
 * Extract text content from a PDF buffer
 * @param buffer - PDF file buffer
 * @returns Extracted text and metadata
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<PDFParseResult> {
  // Convert Buffer to Uint8Array for pdf-parse
  const data = new Uint8Array(buffer);

  // Create parser with the data
  const pdfParser = new PDFParse({ data });

  // Get text from all pages
  const textResult = await pdfParser.getText();

  // Get metadata
  const info = await pdfParser.getInfo();

  // Clean up
  await pdfParser.destroy();

  // Get date info
  const dateNode = info?.getDateNode();

  // Extract info from the info dictionary
  const pdfInfo = info?.info as Record<string, unknown> | undefined;

  return {
    text: textResult.text,
    pageCount: textResult.pages.length,
    info: {
      title: typeof pdfInfo?.Title === "string" ? pdfInfo.Title : undefined,
      author: typeof pdfInfo?.Author === "string" ? pdfInfo.Author : undefined,
      creationDate: dateNode?.CreationDate?.toISOString() ?? undefined,
    },
  };
}

/**
 * Check if text content is too large for single API call
 * @param text - Extracted text content
 * @param maxChars - Maximum characters for single call (default 100k)
 */
export function isTextTooLarge(text: string, maxChars = 100000): boolean {
  return text.length > maxChars;
}

/**
 * Split text into chunks for processing
 * @param text - Full text content
 * @param chunkSize - Maximum chunk size (default 50k chars)
 * @param overlap - Overlap between chunks (default 1k chars)
 */
export function splitTextIntoChunks(
  text: string,
  chunkSize = 50000,
  overlap = 1000
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;

    // Avoid infinite loop
    if (start >= text.length - overlap) break;
  }

  return chunks;
}
