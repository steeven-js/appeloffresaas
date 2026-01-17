import { timestamp, varchar, text, integer, jsonb } from "drizzle-orm/pg-core";
import { createTable } from "./helpers";
import { tenderDocuments, tenderProjects } from "./tenders";
import { relations } from "drizzle-orm";
import type { RCParsedData } from "~/server/services/ai/rc-parser";

/**
 * RC Parsed Data table - stores parsed content from RC documents (Story 4.1)
 * One-to-one relationship with tender documents
 */
export const rcParsedData = createTable("rc_parsed_data", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tenderDocumentId: varchar("tender_document_id", { length: 255 })
    .notNull()
    .references(() => tenderDocuments.id, { onDelete: "cascade" })
    .unique(),
  tenderProjectId: varchar("tender_project_id", { length: 255 })
    .notNull()
    .references(() => tenderProjects.id, { onDelete: "cascade" }),
  // Raw extracted text (optional, can be large)
  rawText: text("raw_text"),
  // Parsed requirements as JSON
  parsedRequirements: jsonb("parsed_requirements").$type<RCParsedData>().notNull(),
  // Parsing metadata
  pageCount: integer("page_count").notNull().default(0),
  parsingDurationMs: integer("parsing_duration_ms").notNull().default(0),
  confidence: varchar("confidence", { length: 20 }).notNull().default("low"),
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Relations for RC parsed data
 */
export const rcParsedDataRelations = relations(rcParsedData, ({ one }) => ({
  tenderDocument: one(tenderDocuments, {
    fields: [rcParsedData.tenderDocumentId],
    references: [tenderDocuments.id],
  }),
  tenderProject: one(tenderProjects, {
    fields: [rcParsedData.tenderProjectId],
    references: [tenderProjects.id],
  }),
}));

/**
 * Type exports for RC parsed data
 */
export type RCParsedDataRecord = typeof rcParsedData.$inferSelect;
export type NewRCParsedDataRecord = typeof rcParsedData.$inferInsert;
