/**
 * Completeness check utilities for demand projects
 * SINGLE SOURCE OF TRUTH for completion percentage calculation
 * Used by: list, workspace sidebar, copilot panel
 */

import type { DemandSection } from "~/server/db/schema";

/**
 * Check result for a single field
 */
export interface FieldCheck {
  field: string;
  label: string;
  status: "complete" | "incomplete" | "warning";
  message?: string;
}

/**
 * Section check result
 */
export interface SectionCheck {
  id: string;
  title: string;
  status: "complete" | "empty" | "partial";
  wordCount: number;
}

/**
 * Complete check result
 */
export interface CompletenessResult {
  isComplete: boolean;
  percentage: number;
  requiredFields: FieldCheck[];
  recommendedFields: FieldCheck[];
  sections: SectionCheck[];
  totalChecks: number;
  passedChecks: number;
  warnings: string[];
}

/**
 * Input data for completeness check
 */
export interface CompletenessInput {
  title: string;
  reference?: string | null;
  description?: string | null;
  departmentName?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  context?: string | null;
  constraints?: string | null;
  needType?: string | null;
  urgencyLevel?: string | null;
  budgetRange?: string | null;
  desiredDeliveryDate?: string | null;
  sections?: DemandSection[] | null;
  annexesCount?: number;
}

/**
 * Check if a string has meaningful content (strips HTML tags)
 */
function hasContent(value: string | null | undefined): boolean {
  if (!value) return false;
  // Strip HTML and check if there's actual text
  const stripped = value
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return stripped.length > 0;
}

/**
 * Check if content has real data vs just placeholder text
 * Placeholders are text wrapped in brackets like [À compléter], [Nombre], etc.
 * Returns true if content has meaningful data filled in
 */
function hasRealContentInternal(content: string | null | undefined): boolean {
  if (!content || content.trim() === "") return false;

  // Strip HTML tags to get raw text
  const textContent = content.replace(/<[^>]*>/g, " ").trim();
  if (!textContent) return false;

  // Find all placeholder patterns [text]
  const placeholderPattern = /\[[^\]]+\]/g;
  const placeholders = textContent.match(placeholderPattern) ?? [];

  // Calculate total placeholder text length
  const placeholderLength = placeholders.reduce((sum, p) => sum + p.length, 0);

  // Get text without placeholders
  const textWithoutPlaceholders = textContent.replace(placeholderPattern, "").replace(/\s+/g, " ").trim();

  // If text without placeholders is very short (just labels/headers), it's placeholder content
  if (placeholders.length === 0) {
    return textWithoutPlaceholders.length > 10;
  }

  // If placeholder text dominates (> 30% of content), it's not real content
  const totalLength = textContent.replace(/\s+/g, " ").length;
  const placeholderRatio = placeholderLength / totalLength;

  return placeholderRatio < 0.3 && textWithoutPlaceholders.length > 50;
}

/**
 * UNIFIED completion percentage calculation
 * This is the SINGLE SOURCE OF TRUTH used by all parts of the app
 *
 * CANVAS-BASED SCORING:
 * - Sections (70%): Editorial content written in sections (real content vs placeholders)
 * - Metadata (20%): Budget, delivery date, contact email, constraints
 * - Documents (10%): Supporting documents attached
 *
 * A blank project (just created with required fields) = 0%
 * Progress reflects actual editorial content written.
 */
export function calculateCompletionPercentage(data: CompletenessInput & { hasDocuments?: boolean }): number {
  // === SECTIONS (70%) - Core editorial content ===
  const sections = data.sections ?? [];
  let sectionsScore = 0;

  if (sections.length > 0) {
    // Count sections with real content (not placeholders)
    const sectionsWithContent = sections.filter(s => hasRealContentInternal(s.content)).length;
    sectionsScore = (sectionsWithContent / sections.length) * 70;
  } else {
    // No sections defined - check legacy fields (context, description, constraints)
    // These are the "default canvas" fields stored directly on the project
    const legacyFields = [
      { content: data.context, weight: 30 },     // Contexte - required, 30%
      { content: data.description, weight: 30 }, // Description - required, 30%
      { content: data.constraints, weight: 10 }, // Contraintes - optional, 10%
    ];

    for (const field of legacyFields) {
      if (hasRealContentInternal(field.content)) {
        sectionsScore += field.weight;
      }
    }
  }

  // === METADATA (20%) - Supporting information ===
  let metadataScore = 0;

  // Check if budget section has content (alternative to budgetRange/desiredDeliveryDate fields)
  const budgetSection = sections.find(s => s.id === "budget");
  const hasBudgetSectionContent = budgetSection && hasRealContentInternal(budgetSection.content);

  // Budget info: either explicit fields OR section content
  if (hasContent(data.budgetRange) || hasBudgetSectionContent) {
    metadataScore += 7; // Budget - important
  }
  if (hasContent(data.desiredDeliveryDate) || hasBudgetSectionContent) {
    metadataScore += 7; // Delivery date - important (often included in budget section)
  }
  if (hasContent(data.contactEmail)) {
    metadataScore += 3; // Contact email
  }
  // Constraints with real content if stored as legacy field and not already counted in sections
  if (sections.length > 0 && hasRealContentInternal(data.constraints)) {
    metadataScore += 3;
  }

  // === DOCUMENTS (10%) - Supporting materials ===
  const documentsScore = (data.hasDocuments || (data.annexesCount && data.annexesCount > 0)) ? 10 : 0;

  // Calculate total
  const totalScore = sectionsScore + metadataScore + documentsScore;

  return Math.round(totalScore);
}

/**
 * Count words in a string (stripping HTML)
 */
function countWords(value: string | null | undefined): number {
  if (!value) return 0;
  const stripped = value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!stripped) return 0;
  return stripped.split(" ").filter((w) => w.length > 0).length;
}

/**
 * Check completeness of a demand project
 */
export function checkCompleteness(data: CompletenessInput): CompletenessResult {
  const requiredFields: FieldCheck[] = [];
  const recommendedFields: FieldCheck[] = [];
  const sectionChecks: SectionCheck[] = [];
  const warnings: string[] = [];

  // Required fields
  requiredFields.push({
    field: "title",
    label: "Titre du dossier",
    status: hasContent(data.title) ? "complete" : "incomplete",
  });

  requiredFields.push({
    field: "departmentName",
    label: "Service demandeur",
    status: hasContent(data.departmentName) ? "complete" : "incomplete",
  });

  requiredFields.push({
    field: "contactName",
    label: "Nom du contact",
    status: hasContent(data.contactName) ? "complete" : "incomplete",
  });

  requiredFields.push({
    field: "needType",
    label: "Type de besoin",
    status: hasContent(data.needType) ? "complete" : "incomplete",
  });

  // Recommended fields
  recommendedFields.push({
    field: "reference",
    label: "Référence interne",
    status: hasContent(data.reference) ? "complete" : "warning",
    message: !hasContent(data.reference) ? "Recommandé pour le suivi" : undefined,
  });

  recommendedFields.push({
    field: "contactEmail",
    label: "Email du contact",
    status: hasContent(data.contactEmail) ? "complete" : "warning",
    message: !hasContent(data.contactEmail) ? "Facilite la communication" : undefined,
  });

  recommendedFields.push({
    field: "budgetRange",
    label: "Budget estimé",
    status: hasContent(data.budgetRange) ? "complete" : "warning",
    message: !hasContent(data.budgetRange) ? "Important pour l'évaluation" : undefined,
  });

  recommendedFields.push({
    field: "desiredDeliveryDate",
    label: "Date de livraison souhaitée",
    status: hasContent(data.desiredDeliveryDate) ? "complete" : "warning",
    message: !hasContent(data.desiredDeliveryDate) ? "Aide à la planification" : undefined,
  });

  recommendedFields.push({
    field: "description",
    label: "Description générale",
    status: hasContent(data.description) ? "complete" : "warning",
    message: !hasContent(data.description) ? "Donne un aperçu du projet" : undefined,
  });

  // Check sections
  const sections = data.sections ?? [];
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  for (const section of sortedSections) {
    const wordCount = countWords(section.content);
    let status: "complete" | "empty" | "partial";

    if (wordCount === 0) {
      status = "empty";
      if (section.isRequired) {
        warnings.push(`La section "${section.title}" est obligatoire mais vide`);
      }
    } else if (wordCount < 10) {
      status = "partial";
      warnings.push(`La section "${section.title}" semble incomplète (${wordCount} mots)`);
    } else {
      status = "complete";
    }

    sectionChecks.push({
      id: section.id,
      title: section.title,
      status,
      wordCount,
    });
  }

  // Check if there are sections at all
  if (sections.length === 0) {
    warnings.push("Aucune section de contenu définie");
  }

  // Calculate statistics
  const requiredComplete = requiredFields.filter((f) => f.status === "complete").length;
  const requiredTotal = requiredFields.length;

  const recommendedComplete = recommendedFields.filter((f) => f.status === "complete").length;
  const recommendedTotal = recommendedFields.length;

  const sectionsComplete = sectionChecks.filter((s) => s.status === "complete").length;
  const sectionsTotal = sectionChecks.length;

  // Weight: required fields (50%), recommended fields (20%), sections (30%)
  const requiredWeight = 0.5;
  const recommendedWeight = 0.2;
  const sectionsWeight = 0.3;

  const requiredScore = requiredTotal > 0 ? (requiredComplete / requiredTotal) * requiredWeight : requiredWeight;
  const recommendedScore = recommendedTotal > 0 ? (recommendedComplete / recommendedTotal) * recommendedWeight : recommendedWeight;
  const sectionsScore = sectionsTotal > 0 ? (sectionsComplete / sectionsTotal) * sectionsWeight : sectionsWeight;

  const percentage = Math.round((requiredScore + recommendedScore + sectionsScore) * 100);

  // All required fields must be complete
  const isComplete = requiredFields.every((f) => f.status === "complete");

  const totalChecks = requiredTotal + recommendedTotal + sectionsTotal;
  const passedChecks = requiredComplete + recommendedComplete + sectionsComplete;

  return {
    isComplete,
    percentage,
    requiredFields,
    recommendedFields,
    sections: sectionChecks,
    totalChecks,
    passedChecks,
    warnings,
  };
}

/**
 * Get a summary message for the completeness result
 */
export function getCompletenessSummary(result: CompletenessResult): string {
  if (result.isComplete && result.percentage >= 90) {
    return "Votre dossier est complet et prêt à être exporté.";
  } else if (result.isComplete && result.percentage >= 70) {
    return "Votre dossier est exportable mais pourrait être amélioré.";
  } else if (result.isComplete) {
    return "Votre dossier peut être exporté avec quelques recommandations.";
  } else {
    return "Des champs obligatoires sont manquants.";
  }
}

/**
 * Get the status color for a percentage
 */
export function getCompletenessColor(percentage: number): "green" | "yellow" | "red" {
  if (percentage >= 80) return "green";
  if (percentage >= 50) return "yellow";
  return "red";
}
