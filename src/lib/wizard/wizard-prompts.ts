/**
 * Wizard AI Prompts
 *
 * This file contains the prompt templates for generating content
 * from wizard answers. Each module has its own prompt template.
 */

import type { WizardAnswer } from "~/server/db/schema/demands";

export interface PromptContext {
  needType?: string;
  departmentName?: string;
  urgencyLevel?: string;
  title?: string;
}

/**
 * System prompt for all AI generations
 */
export const SYSTEM_PROMPT = `Tu es un expert en rédaction de dossiers de marchés publics français.

Tes responsabilités :
- Rédiger des textes professionnels, clairs et structurés
- Utiliser un ton formel adapté aux documents administratifs
- Être précis et factuel dans les descriptions
- Structurer le contenu de manière logique

Format de sortie :
- Texte fluide et bien rédigé
- Pas de listes à puces sauf si explicitement demandé
- Pas de titres de sections dans le texte
- Longueur appropriée (ni trop court, ni trop long)`;

/**
 * Module-specific prompt templates
 */
export const MODULE_PROMPTS: Record<string, string> = {
  context: `Rédige la section "Contexte et Justification" d'un dossier de marché public à partir des informations suivantes :

**Situation actuelle :** {current_situation}

**Problèmes identifiés :** {problems}

**Impact des problèmes :** {impact}

**Raison d'agir maintenant :** {why_now}

Instructions :
- Rédige un texte fluide qui présente la situation actuelle
- Explique les problèmes rencontrés et leurs conséquences
- Justifie l'urgence ou la nécessité d'agir
- Le texte doit faire entre 150 et 300 mots
- Utilise un ton professionnel et factuel`,

  description: `Rédige la section "Description du Besoin" d'un dossier de marché public à partir des informations suivantes :

**Type de besoin :** {need_type}
**Objectif principal :** {main_objective}

**Fonctionnalités attendues :** {expected_features}

**Quantités :** {quantities}

**Spécifications techniques :** {technical_specs}

Instructions :
- Décris clairement ce qui est recherché
- Précise les caractéristiques techniques essentielles
- Indique les quantités et les délais
- Le texte doit faire entre 200 et 400 mots
- Sois précis sur les exigences techniques`,

  constraints: `Rédige la section "Contraintes et Exigences" d'un dossier de marché public à partir des informations suivantes :

**Contraintes techniques :** {technical_constraints}

**Contraintes réglementaires :** {regulatory_constraints}

**Garanties requises :** {warranties}

**Formation requise :** {training}

**Maintenance requise :** {maintenance}

Instructions :
- Liste les contraintes de manière structurée
- Explique les exigences obligatoires
- Précise les normes et certifications requises
- Le texte doit faire entre 150 et 250 mots`,

  budget: `Rédige la section "Budget et Délais" d'un dossier de marché public à partir des informations suivantes :

**Fourchette budgétaire :** {budget_range}

**Budget validé :** {budget_validated}

**Date de livraison souhaitée :** {delivery_date}

**Justification du délai :** {date_justification}

Instructions :
- Présente le cadre budgétaire
- Explique le calendrier prévu
- Justifie les délais si nécessaire
- Le texte doit faire entre 100 et 200 mots`,
};

/**
 * Format answers as a map of questionId -> formatted value
 */
export function formatAnswersForPrompt(answers: WizardAnswer[]): Record<string, string> {
  const formatted: Record<string, string> = {};

  for (const answer of answers) {
    let valueStr: string;

    if (Array.isArray(answer.value)) {
      valueStr = answer.value.join(", ");
    } else if (typeof answer.value === "boolean") {
      valueStr = answer.value ? "Oui" : "Non";
    } else {
      valueStr = String(answer.value);
    }

    formatted[answer.questionId] = valueStr;
  }

  return formatted;
}

/**
 * Build the complete prompt for a module
 */
export function buildModulePrompt(
  moduleId: string,
  answers: WizardAnswer[],
  context: PromptContext
): string {
  const template = MODULE_PROMPTS[moduleId];
  if (!template) {
    throw new Error(`No prompt template found for module: ${moduleId}`);
  }

  let prompt = template;
  const formattedAnswers = formatAnswersForPrompt(answers);

  // Replace answer placeholders
  for (const [questionId, value] of Object.entries(formattedAnswers)) {
    const placeholder = `{${questionId}}`;
    prompt = prompt.replaceAll(placeholder, value || "Non spécifié");
  }

  // Replace context placeholders
  prompt = prompt
    .replaceAll("{need_type}", context.needType ?? "autre")
    .replaceAll("{department}", context.departmentName ?? "Non spécifié")
    .replaceAll("{urgency}", context.urgencyLevel ?? "medium")
    .replaceAll("{title}", context.title ?? "Non spécifié");

  // Clean up any remaining placeholders
  prompt = prompt.replace(/\{[^}]+\}/g, "Non spécifié");

  return prompt;
}

/**
 * Get the recommended max tokens for a module
 */
export function getModuleMaxTokens(moduleId: string): number {
  const tokenLimits: Record<string, number> = {
    context: 500,
    description: 700,
    constraints: 400,
    budget: 300,
  };

  return tokenLimits[moduleId] ?? 500;
}
