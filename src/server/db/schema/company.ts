import { timestamp, varchar, text, integer, date, bigint, uniqueIndex } from "drizzle-orm/pg-core";
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
 * Financial Data table - stores yearly financial information (Story 2.3)
 * One-to-many relationship: one company profile can have multiple years of data
 */
export const companyFinancialData = createTable(
  "company_financial_data",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    companyProfileId: varchar("company_profile_id", { length: 255 })
      .notNull()
      .references(() => companyProfiles.id, { onDelete: "cascade" }),
    // Year for this financial data
    year: integer("year").notNull(),
    // Financial metrics
    revenue: bigint("revenue", { mode: "number" }), // Chiffre d'affaires in euros
    netIncome: bigint("net_income", { mode: "number" }), // Résultat net in euros
    employeeCount: integer("employee_count"), // Effectif
    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Unique constraint: one record per year per company
    uniqueIndex("company_year_unique_idx").on(table.companyProfileId, table.year),
  ]
);

/**
 * Certifications table - stores company certifications and qualifications (Story 2.4)
 * One-to-many relationship: one company profile can have multiple certifications
 */
export const companyCertifications = createTable("company_certifications", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyProfileId: varchar("company_profile_id", { length: 255 })
    .notNull()
    .references(() => companyProfiles.id, { onDelete: "cascade" }),
  // Certification details
  name: varchar("name", { length: 255 }).notNull(), // e.g., "ISO 9001", "Qualibat"
  issuer: varchar("issuer", { length: 255 }), // Organisme certificateur
  certificationNumber: varchar("certification_number", { length: 100 }), // Numéro de certificat
  // Dates
  obtainedDate: date("obtained_date"), // Date d'obtention
  expiryDate: date("expiry_date"), // Date d'expiration
  // Document reference (will be linked to document vault later)
  documentId: varchar("document_id", { length: 255 }), // Reference to uploaded certificate
  // Additional info
  description: text("description"), // Notes or scope of certification
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
export const companyProfilesRelations = relations(companyProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [companyProfiles.userId],
    references: [users.id],
  }),
  financialData: many(companyFinancialData),
  certifications: many(companyCertifications),
}));

/**
 * Relations for financial data
 */
export const companyFinancialDataRelations = relations(companyFinancialData, ({ one }) => ({
  companyProfile: one(companyProfiles, {
    fields: [companyFinancialData.companyProfileId],
    references: [companyProfiles.id],
  }),
}));

/**
 * Relations for certifications
 */
export const companyCertificationsRelations = relations(companyCertifications, ({ one }) => ({
  companyProfile: one(companyProfiles, {
    fields: [companyCertifications.companyProfileId],
    references: [companyProfiles.id],
  }),
}));

/**
 * Type exports for company profiles
 */
export type CompanyProfile = typeof companyProfiles.$inferSelect;
export type NewCompanyProfile = typeof companyProfiles.$inferInsert;

/**
 * Type exports for financial data
 */
export type CompanyFinancialData = typeof companyFinancialData.$inferSelect;
export type NewCompanyFinancialData = typeof companyFinancialData.$inferInsert;

/**
 * Type exports for certifications
 */
export type CompanyCertification = typeof companyCertifications.$inferSelect;
export type NewCompanyCertification = typeof companyCertifications.$inferInsert;
