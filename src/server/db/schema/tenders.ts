import { timestamp, varchar, text, integer, date } from "drizzle-orm/pg-core";
import { createTable } from "./helpers";
import { users } from "./auth";
import { relations } from "drizzle-orm";

/**
 * Tender Project Status
 */
export const TENDER_STATUS = {
  DRAFT: "draft",
  IN_PROGRESS: "in_progress",
  SUBMITTED: "submitted",
  WON: "won",
  LOST: "lost",
  ARCHIVED: "archived",
} as const;

export type TenderStatus = (typeof TENDER_STATUS)[keyof typeof TENDER_STATUS];

/**
 * Tender Projects table - stores user's tender/bid projects (Epic 3)
 * One-to-many relationship: one user can have multiple tender projects
 */
export const tenderProjects = createTable("tender_projects", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Basic project information (Story 3.1)
  title: varchar("title", { length: 255 }).notNull(),
  reference: varchar("reference", { length: 100 }), // Numéro de marché / Référence AO
  description: text("description"),
  // Client/buyer information
  buyerName: varchar("buyer_name", { length: 255 }), // Acheteur / Maître d'ouvrage
  buyerType: varchar("buyer_type", { length: 50 }), // public, private
  // Project details
  estimatedAmount: integer("estimated_amount"), // Montant estimé en euros
  lotNumber: varchar("lot_number", { length: 50 }), // Numéro de lot (si alloti)
  // Dates (Story 3.3)
  publicationDate: date("publication_date"), // Date de publication
  submissionDeadline: timestamp("submission_deadline", { withTimezone: true }), // Date limite de soumission
  // Status tracking
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  // Source information
  sourceUrl: varchar("source_url", { length: 500 }), // URL de l'avis (BOAMP, TED, etc.)
  sourcePlatform: varchar("source_platform", { length: 100 }), // BOAMP, TED, achatpublic.com, etc.
  // Notes
  notes: text("notes"),
  // Template flag (Story 3.6)
  isTemplate: integer("is_template").default(0), // 1 = template project
  templateName: varchar("template_name", { length: 255 }), // Name if it's a template
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  // Archive timestamp (Story 3.5)
  archivedAt: timestamp("archived_at", { withTimezone: true }),
});

/**
 * Document types for tender projects
 */
export const TENDER_DOCUMENT_TYPES = [
  "rc", // Règlement de Consultation
  "cctp", // Cahier des Clauses Techniques Particulières
  "ccap", // Cahier des Clauses Administratives Particulières
  "bpu", // Bordereau des Prix Unitaires
  "dpgf", // Décomposition du Prix Global et Forfaitaire
  "acte_engagement", // Acte d'Engagement
  "annexe", // Annexe
  "autre", // Autre document
] as const;

export type TenderDocumentType = (typeof TENDER_DOCUMENT_TYPES)[number];

/**
 * Tender Documents table - stores documents associated with tender projects (Story 3.2)
 * One-to-many relationship: one tender project can have multiple documents
 */
export const tenderDocuments = createTable("tender_documents", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tenderProjectId: varchar("tender_project_id", { length: 255 })
    .notNull()
    .references(() => tenderProjects.id, { onDelete: "cascade" }),
  // Document type
  documentType: varchar("document_type", { length: 50 }).notNull(), // rc, cctp, ccap, etc.
  // File information
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  storageKey: varchar("storage_key", { length: 500 }).notNull(), // R2 storage key
  // Parsing status (for Epic 4)
  parsingStatus: varchar("parsing_status", { length: 20 }).default("pending"), // pending, processing, completed, failed
  parsedAt: timestamp("parsed_at", { withTimezone: true }),
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Relations for tender projects
 */
export const tenderProjectsRelations = relations(tenderProjects, ({ one, many }) => ({
  user: one(users, {
    fields: [tenderProjects.userId],
    references: [users.id],
  }),
  documents: many(tenderDocuments),
}));

/**
 * Relations for tender documents
 */
export const tenderDocumentsRelations = relations(tenderDocuments, ({ one }) => ({
  tenderProject: one(tenderProjects, {
    fields: [tenderDocuments.tenderProjectId],
    references: [tenderProjects.id],
  }),
}));

/**
 * Type exports for tender projects
 */
export type TenderProject = typeof tenderProjects.$inferSelect;
export type NewTenderProject = typeof tenderProjects.$inferInsert;

/**
 * Type exports for tender documents
 */
export type TenderDocument = typeof tenderDocuments.$inferSelect;
export type NewTenderDocument = typeof tenderDocuments.$inferInsert;
