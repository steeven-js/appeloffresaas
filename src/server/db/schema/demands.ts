import { timestamp, varchar, text, integer, date, jsonb } from "drizzle-orm/pg-core";
import { createTable } from "./helpers";
import { users } from "./auth";
import { relations } from "drizzle-orm";

/**
 * Demand Project Status
 * Nouveau workflow: Dossier de Demande (CHEF → Administration)
 */
export const DEMAND_STATUS = {
  DRAFT: "draft",                    // Brouillon en cours de rédaction
  IN_REVIEW: "in_review",            // En cours de relecture
  APPROVED: "approved",              // Approuvé en interne
  SENT_TO_ADMIN: "sent_to_admin",    // Envoyé à l'administration
  CONVERTED_TO_AO: "converted_to_ao", // Converti en AO par l'administration
  ARCHIVED: "archived",              // Archivé
} as const;

export type DemandStatus = (typeof DEMAND_STATUS)[keyof typeof DEMAND_STATUS];

/**
 * Urgency levels for demand projects
 */
export const URGENCY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type UrgencyLevel = (typeof URGENCY_LEVELS)[keyof typeof URGENCY_LEVELS];

/**
 * Need types for demand projects
 */
export const NEED_TYPES = {
  FOURNITURE: "fourniture",   // Fourniture / Équipement
  SERVICE: "service",         // Prestation de service
  TRAVAUX: "travaux",         // Travaux / Construction
  FORMATION: "formation",     // Formation
  LOGICIEL: "logiciel",       // Logiciel / Licence
  MAINTENANCE: "maintenance", // Maintenance / Support
  AUTRE: "autre",             // Autre
} as const;

export type NeedType = (typeof NEED_TYPES)[keyof typeof NEED_TYPES];

/**
 * Suggested criteria type for JSON storage
 */
export interface SuggestedCriteria {
  technicalCriteria?: string[];
  qualityCriteria?: string[];
  priceCriteria?: string[];
  otherCriteria?: string[];
}

/**
 * Answer type for wizard responses
 */
export interface WizardAnswer {
  questionId: string;
  questionLabel: string;
  value: string | string[] | number | boolean;
  answeredAt: string;
}

/**
 * Section type for flexible document structure
 */
export interface DemandSection {
  id: string;
  title: string;
  content: string;
  isDefault: boolean; // true for context, description, constraints
  isRequired: boolean; // cannot be deleted if true
  order: number;
  // Wizard-specific fields
  answers?: WizardAnswer[];
  generatedAt?: string;
  validatedAt?: string;
  generationCount?: number;
}

/**
 * Wizard module state
 */
export interface WizardModuleState {
  status: "pending" | "in_progress" | "completed";
  startedAt?: string;
  completedAt?: string;
  validatedAt?: string;
  answeredQuestions: string[];
}

/**
 * Wizard state for tracking wizard progress
 */
export interface WizardState {
  currentModule: number;
  currentQuestion: number;
  startedAt: string;
  lastActivityAt: string;
  modules: Record<string, WizardModuleState>;
}

/**
 * Interaction modes for demand projects
 */
export const INTERACTION_MODES = {
  WIZARD: "wizard",    // Step-by-step guided wizard
  CHAT: "chat",        // Free-form AI chat
  MANUAL: "manual",    // Manual editing
} as const;

export type InteractionMode = (typeof INTERACTION_MODES)[keyof typeof INTERACTION_MODES];

/**
 * Demand Projects table - stores user's demand projects (Dossier de Demande)
 * One-to-many relationship: one user can have multiple demand projects
 *
 * Flow: CHEF creates demand → sends to Administration → Administration creates formal AO
 */
export const demandProjects = createTable("demand_projects", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Basic project information
  title: varchar("title", { length: 255 }).notNull(),
  reference: varchar("reference", { length: 100 }), // Référence interne du dossier
  description: text("description"),

  // Department/Contact information (NEW for demand flow)
  departmentName: varchar("department_name", { length: 255 }), // Service demandeur
  contactName: varchar("contact_name", { length: 255 }), // Nom du contact
  contactEmail: varchar("contact_email", { length: 255 }), // Email du contact

  // Context and needs (NEW for demand flow)
  context: text("context"), // Contexte du besoin
  constraints: text("constraints"), // Contraintes identifiées
  urgencyLevel: varchar("urgency_level", { length: 20 }).default("medium"), // low, medium, high, critical
  needType: varchar("need_type", { length: 20 }).default("autre"), // fourniture, service, travaux, formation, logiciel, maintenance, autre

  // Budget and timeline (NEW for demand flow)
  budgetRange: varchar("budget_range", { length: 100 }), // Fourchette budgétaire estimée
  budgetValidated: integer("budget_validated").default(0), // 0 = à valider, 1 = validé
  desiredDeliveryDate: date("desired_delivery_date"), // Date de livraison souhaitée
  urgencyJustification: text("urgency_justification"), // Justification si délai urgent

  // Suggested criteria (NEW for demand flow)
  suggestedCriteria: jsonb("suggested_criteria").$type<SuggestedCriteria>(),

  // Flexible sections structure
  sections: jsonb("sections").$type<DemandSection[]>(),

  // Wizard state for step-by-step guidance
  wizardState: jsonb("wizard_state").$type<WizardState>(),

  // Interaction mode (wizard, chat, manual)
  interactionMode: varchar("interaction_mode", { length: 20 }).default("wizard"),

  // Legacy fields (kept for compatibility during migration)
  buyerName: varchar("buyer_name", { length: 255 }), // Can be used for destination admin
  buyerType: varchar("buyer_type", { length: 50 }), // public, private
  estimatedAmount: integer("estimated_amount"), // Montant estimé en euros
  lotNumber: varchar("lot_number", { length: 50 }), // Numéro de lot (si alloti)
  publicationDate: date("publication_date"),
  submissionDeadline: timestamp("submission_deadline", { withTimezone: true }),

  // Status tracking
  status: varchar("status", { length: 20 }).notNull().default("draft"),

  // Source information (may not be relevant for demand, but kept for now)
  sourceUrl: varchar("source_url", { length: 500 }),
  sourcePlatform: varchar("source_platform", { length: 100 }),

  // Notes
  notes: text("notes"),

  // Template flag
  isTemplate: integer("is_template").default(0),
  templateName: varchar("template_name", { length: 255 }),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
});

/**
 * Document types for demand projects
 * Updated for demand-centric workflow
 */
export const DEMAND_DOCUMENT_TYPES = [
  "demande", // Document principal de demande
  "cctp", // Cahier des Clauses Techniques Particulières (draft by CHEF)
  "annexe", // Annexe / Document justificatif
  "devis", // Devis estimatif
  "etude", // Étude préalable
  "plan", // Plan / Schéma
  "photo", // Photo / Image
  "autre", // Autre document
] as const;

export type DemandDocumentType = (typeof DEMAND_DOCUMENT_TYPES)[number];

/**
 * Demand Documents table - stores documents associated with demand projects
 * One-to-many relationship: one demand project can have multiple documents
 */
export const demandDocuments = createTable("demand_documents", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  demandProjectId: varchar("demand_project_id", { length: 255 })
    .notNull()
    .references(() => demandProjects.id, { onDelete: "cascade" }),

  // Document type
  documentType: varchar("document_type", { length: 50 }).notNull(),

  // File information
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  storageKey: varchar("storage_key", { length: 500 }).notNull(), // R2 storage key

  // Display order for annexes (used for sorting)
  displayOrder: integer("display_order").default(0),

  // Optional description/caption
  description: text("description"),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Relations for demand projects
 */
export const demandProjectsRelations = relations(demandProjects, ({ one, many }) => ({
  user: one(users, {
    fields: [demandProjects.userId],
    references: [users.id],
  }),
  documents: many(demandDocuments),
  chatMessages: many(demandChatMessages),
  aiConversations: many(aiAssistantConversations),
}));

/**
 * Relations for demand documents
 */
export const demandDocumentsRelations = relations(demandDocuments, ({ one }) => ({
  demandProject: one(demandProjects, {
    fields: [demandDocuments.demandProjectId],
    references: [demandProjects.id],
  }),
}));

/**
 * Type exports for demand projects
 */
export type DemandProject = typeof demandProjects.$inferSelect;
export type NewDemandProject = typeof demandProjects.$inferInsert;

/**
 * Type exports for demand documents
 */
export type DemandDocument = typeof demandDocuments.$inferSelect;
export type NewDemandDocument = typeof demandDocuments.$inferInsert;

/**
 * Chat message roles
 */
export const CHAT_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
} as const;

export type ChatRole = (typeof CHAT_ROLES)[keyof typeof CHAT_ROLES];

/**
 * Chat message metadata type
 */
export interface ChatMessageMetadata {
  fieldUpdated?: string;
  tokenCount?: number;
  model?: string;
}

/**
 * Demand Chat Messages table - stores AI assistant conversation history
 * One-to-many relationship: one demand project can have multiple chat messages
 */
export const demandChatMessages = createTable("demand_chat_messages", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  demandProjectId: varchar("demand_project_id", { length: 255 })
    .notNull()
    .references(() => demandProjects.id, { onDelete: "cascade" }),

  // Message content
  role: varchar("role", { length: 20 }).notNull(), // user, assistant, system
  content: text("content").notNull(),

  // Optional metadata (e.g., which field was updated based on this message)
  metadata: jsonb("metadata").$type<ChatMessageMetadata>(),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Relations for demand chat messages
 */
export const demandChatMessagesRelations = relations(demandChatMessages, ({ one }) => ({
  demandProject: one(demandProjects, {
    fields: [demandChatMessages.demandProjectId],
    references: [demandProjects.id],
  }),
}));

/**
 * Type exports for demand chat messages
 */
export type DemandChatMessage = typeof demandChatMessages.$inferSelect;
export type NewDemandChatMessage = typeof demandChatMessages.$inferInsert;

/**
 * Demand Reference Counters table - tracks auto-incrementing reference numbers per user per year
 * Ensures references never decrease even after project deletion
 */
export const demandReferenceCounters = createTable("demand_reference_counters", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  lastSequence: integer("last_sequence").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Type exports for demand reference counters
 */
export type DemandReferenceCounter = typeof demandReferenceCounters.$inferSelect;
export type NewDemandReferenceCounter = typeof demandReferenceCounters.$inferInsert;

/**
 * AI Assistant Message type
 */
export interface AIAssistantMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  type: "question" | "response" | "validation" | "suggestion" | "final";
  options?: { id: string; label: string; value: string }[];
  generatedText?: string;
  example?: string;
  timestamp: string;
}

/**
 * AI Assistant Suggestion type
 */
export interface AIAssistantSuggestion {
  id: string;
  label: string;
  preview: string;
  priority: "high" | "medium" | "low";
  type: "add" | "improve" | "reformulate";
}

/**
 * AI Assistant modes
 */
export const AI_ASSISTANT_MODES = {
  GUIDED: "guided",
  EXPERT: "expert",
} as const;

export type AIAssistantMode = (typeof AI_ASSISTANT_MODES)[keyof typeof AI_ASSISTANT_MODES];

/**
 * AI Assistant conversation status
 */
export const AI_CONVERSATION_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  ABANDONED: "abandoned",
} as const;

export type AIConversationStatus = (typeof AI_CONVERSATION_STATUS)[keyof typeof AI_CONVERSATION_STATUS];

/**
 * AI Assistant Conversations table - stores wizard AI assistant conversations
 * One conversation per module/question combination
 */
export const aiAssistantConversations = createTable("ai_assistant_conversations", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  demandProjectId: varchar("demand_project_id", { length: 255 })
    .notNull()
    .references(() => demandProjects.id, { onDelete: "cascade" }),

  // Context
  moduleId: varchar("module_id", { length: 50 }).notNull(),
  questionId: varchar("question_id", { length: 50 }).notNull(),

  // Mode and status
  mode: varchar("mode", { length: 20 }).notNull().default("guided"),
  status: varchar("status", { length: 20 }).notNull().default("active"),

  // Conversation history
  messages: jsonb("messages").$type<AIAssistantMessage[]>().default([]),

  // Generated content
  generatedText: text("generated_text"),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

/**
 * Relations for AI assistant conversations
 */
export const aiAssistantConversationsRelations = relations(aiAssistantConversations, ({ one }) => ({
  demandProject: one(demandProjects, {
    fields: [aiAssistantConversations.demandProjectId],
    references: [demandProjects.id],
  }),
}));

/**
 * Type exports for AI assistant conversations
 */
export type AIAssistantConversation = typeof aiAssistantConversations.$inferSelect;
export type NewAIAssistantConversation = typeof aiAssistantConversations.$inferInsert;
