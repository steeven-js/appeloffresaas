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
 * Relations for tender projects
 */
export const tenderProjectsRelations = relations(tenderProjects, ({ one }) => ({
  user: one(users, {
    fields: [tenderProjects.userId],
    references: [users.id],
  }),
}));

/**
 * Type exports for tender projects
 */
export type TenderProject = typeof tenderProjects.$inferSelect;
export type NewTenderProject = typeof tenderProjects.$inferInsert;
