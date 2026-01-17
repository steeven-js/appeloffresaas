import { Inngest, EventSchemas } from "inngest";

/**
 * Event types for type-safe event handling
 */
type TenderRCUploadedEvent = {
  name: "tender/rc.uploaded";
  data: {
    documentId: string;
    tenderProjectId: string;
    userId: string;
    storageKey: string;
    timestamp: string;
  };
};

type TenderRCParsedEvent = {
  name: "tender/rc.parsed";
  data: {
    documentId: string;
    tenderProjectId: string;
    success: boolean;
    pageCount?: number;
    durationMs?: number;
    error?: string;
  };
};

type InngestEvents = {
  "tender/rc.uploaded": TenderRCUploadedEvent;
  "tender/rc.parsed": TenderRCParsedEvent;
};

/**
 * Inngest client instance for background jobs (Story 4.1)
 * Used for: RC parsing, document generation, notifications
 */
export const inngest = new Inngest({
  id: "appeloffresaas",
  schemas: new EventSchemas().fromRecord<InngestEvents>(),
});
