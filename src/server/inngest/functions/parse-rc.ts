import { inngest } from "../client";
import { db } from "~/server/db";
import { tenderDocuments } from "~/server/db/schema";
import { rcParsedData } from "~/server/db/schema/parsed-data";
import { eq } from "drizzle-orm";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET } from "~/server/services/storage";
import { parseRCDocument, type RCParsedData } from "~/server/services/ai/rc-parser";

/**
 * Event data for RC upload
 */
interface RCUploadedEventData {
  documentId: string;
  tenderProjectId: string;
  userId: string;
  storageKey: string;
  timestamp: string;
}

/**
 * Inngest function to parse RC documents (Story 4.1)
 * Triggered when a RC document is uploaded
 */
export const parseRCFunction = inngest.createFunction(
  {
    id: "parse-rc-document",
    name: "Parse RC Document",
    retries: 3,
  },
  { event: "tender/rc.uploaded" },
  async ({ event, step }) => {
    // Type assertion for event data
    const eventData = event.data as RCUploadedEventData;
    const documentId = eventData.documentId;
    const tenderProjectId = eventData.tenderProjectId;
    const storageKey = eventData.storageKey;
    const startTime = Date.now();

    // Step 1: Update status to processing
    await step.run("update-status-processing", async () => {
      await db
        .update(tenderDocuments)
        .set({
          parsingStatus: "processing",
          updatedAt: new Date(),
        })
        .where(eq(tenderDocuments.id, documentId));
    });

    let parsedData: RCParsedData | null = null;

    try {
      // Step 2: Download PDF from R2 and parse
      parsedData = await step.run("download-and-parse-pdf", async () => {
        const response = await r2Client.send(
          new GetObjectCommand({
            Bucket: R2_BUCKET,
            Key: storageKey,
          })
        );

        if (!response.Body) {
          throw new Error("Impossible de télécharger le document");
        }

        // Convert stream to buffer using arrayBuffer
        const arrayBuffer = await response.Body.transformToByteArray();
        const pdfBuffer = Buffer.from(arrayBuffer);

        // Parse the RC document
        return await parseRCDocument(pdfBuffer);
      }) as RCParsedData;

      // Step 3: Store parsed data
      await step.run("store-parsed-data", async () => {
        if (!parsedData) return;

        // Delete existing parsed data if any
        await db
          .delete(rcParsedData)
          .where(eq(rcParsedData.tenderDocumentId, documentId));

        // Insert new parsed data
        await db.insert(rcParsedData).values({
          tenderDocumentId: documentId,
          tenderProjectId: tenderProjectId,
          rawText: "",
          parsedRequirements: parsedData,
          pageCount: parsedData.pageCount,
          parsingDurationMs: parsedData.parsingDurationMs,
          confidence: parsedData.confidence,
        });
      });

      // Step 4: Update document status to completed
      await step.run("update-status-completed", async () => {
        await db
          .update(tenderDocuments)
          .set({
            parsingStatus: "completed",
            parsedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(tenderDocuments.id, documentId));
      });

      // Step 5: Send completion event
      await step.sendEvent("send-completion-event", {
        name: "tender/rc.parsed",
        data: {
          documentId,
          tenderProjectId,
          success: true,
          pageCount: parsedData?.pageCount ?? 0,
          durationMs: Date.now() - startTime,
        },
      });

      return {
        success: true,
        documentId,
        pageCount: parsedData?.pageCount ?? 0,
        durationMs: Date.now() - startTime,
      };
    } catch (error) {
      // Update status to failed
      await step.run("update-status-failed", async () => {
        await db
          .update(tenderDocuments)
          .set({
            parsingStatus: "failed",
            updatedAt: new Date(),
          })
          .where(eq(tenderDocuments.id, documentId));
      });

      // Send failure event
      await step.sendEvent("send-failure-event", {
        name: "tender/rc.parsed",
        data: {
          documentId,
          tenderProjectId,
          success: false,
          error: error instanceof Error ? error.message : "Erreur inconnue",
          durationMs: Date.now() - startTime,
        },
      });

      throw error;
    }
  }
);
