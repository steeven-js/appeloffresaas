import { timestamp, varchar, text, integer, date } from "drizzle-orm/pg-core";
import { createTable } from "./helpers";
import { users } from "./auth";
import { relations } from "drizzle-orm";

/**
 * Company Profiles table - stores company information for tender responses
 * One company profile per user (1:1 relationship)
 */
export const companyProfiles = createTable("company_profiles", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  // Basic information
  name: varchar("name", { length: 255 }),
  siret: varchar("siret", { length: 14 }),
  // Legal information (Story 2.2)
  legalForm: varchar("legal_form", { length: 50 }), // SAS, SARL, SA, EURL, etc.
  capitalSocial: integer("capital_social"), // Capital in euros
  nafCode: varchar("naf_code", { length: 10 }), // Code NAF/APE (ex: 6201Z)
  creationDate: date("creation_date"), // Date de création entreprise
  rcsCity: varchar("rcs_city", { length: 255 }), // Ville d'immatriculation RCS
  // Address
  address: text("address"),
  city: varchar("city", { length: 255 }),
  postalCode: varchar("postal_code", { length: 10 }),
  country: varchar("country", { length: 255 }).default("France"),
  // Contact
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Relations for company profiles
 */
export const companyProfilesRelations = relations(companyProfiles, ({ one }) => ({
  user: one(users, {
    fields: [companyProfiles.userId],
    references: [users.id],
  }),
}));

/**
 * Type exports for company profiles
 */
export type CompanyProfile = typeof companyProfiles.$inferSelect;
export type NewCompanyProfile = typeof companyProfiles.$inferInsert;
