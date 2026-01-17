/**
 * Database Schema
 *
 * Tables will be added here as features are implemented:
 * - Epic 1: users, accounts, sessions, verification_tokens (NextAuth) ✅
 * - Epic 2: company_profiles, documents, certifications
 * - Epic 3: tender_projects, requirements
 * - Epic 4: checklists, checklist_items
 * - Epic 5: chat_sessions, chat_messages
 * - Epic 6: document_versions
 * - Epic 7: exports
 * - Epic 8: alerts, notifications, analytics
 */

// Helper for creating prefixed tables
export { createTable } from "./helpers";

// Auth tables (Epic 1)
export * from "./auth";

// Company tables (Epic 2)
export * from "./company";
