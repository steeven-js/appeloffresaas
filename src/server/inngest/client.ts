import { Inngest, EventSchemas } from "inngest";

/**
 * Event types for type-safe event handling
 * Note: Events will be added as features are implemented
 */
type DemandExportEvent = {
  name: "demand/export.requested";
  data: {
    demandProjectId: string;
    userId: string;
    format: "pdf" | "docx";
    timestamp: string;
  };
};

type InngestEvents = {
  "demand/export.requested": DemandExportEvent;
};

/**
 * Inngest client instance for background jobs
 * Used for: document generation, notifications, exports
 */
export const inngest = new Inngest({
  id: "appeloffresaas",
  schemas: new EventSchemas().fromRecord<InngestEvents>(),
});
