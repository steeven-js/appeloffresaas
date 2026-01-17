import { pgTableCreator } from "drizzle-orm/pg-core";

/**
 * Multi-project schema feature of Drizzle ORM.
 * All tables will be prefixed with `appeloffresaas_` to avoid conflicts
 * when sharing a database instance across multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `appeloffresaas_${name}`);

/**
 * Database Schema
 *
 * Tables will be added here as features are implemented:
 * - Epic 1: users, accounts, sessions, verification_tokens (NextAuth)
 * - Epic 2: company_profiles, documents, certifications
 * - Epic 3: tender_projects, requirements
 * - Epic 4: checklists, checklist_items
 * - Epic 5: chat_sessions, chat_messages
 * - Epic 6: document_versions
 * - Epic 7: exports
 * - Epic 8: alerts, notifications, analytics
 */
