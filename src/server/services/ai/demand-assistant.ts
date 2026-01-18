import OpenAI from "openai";
import { env } from "~/env";
import type { DemandProject } from "~/server/db/schema/demands";

/**
 * OpenAI client for demand assistant
 */
const openai = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

/**
 * Check if the AI assistant is configured
 */
export function isAssistantConfigured(): boolean {
  return !!env.OPENAI_API_KEY;
}

/**
 * Chat message format for the assistant
 */
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Build the system prompt for the demand assistant
 */
function buildSystemPrompt(project: DemandProject | null): string {
  const basePrompt = `Tu es un assistant expert en rédaction de dossiers de demande pour les marchés publics français.

Ton rôle est d'aider le CHEF (responsable de service) à formaliser son besoin pour qu'il puisse être transmis à l'Administration qui créera ensuite l'appel d'offres.

Tu dois:
1. Poser des questions pour comprendre le besoin de l'utilisateur
2. Aider à structurer et reformuler les réponses de manière professionnelle
3. Suggérer des éléments manquants ou à clarifier
4. Guider l'utilisateur vers un dossier complet et bien rédigé

Sois concis, professionnel et pédagogue. Utilise un langage clair et évite le jargon technique inutile.

IMPORTANT: Réponds toujours en français.`;

  if (!project) {
    return basePrompt;
  }

  // Add context about the current project
  const projectContext = `

CONTEXTE DU DOSSIER ACTUEL:
- Titre: ${project.title}
${project.reference ? `- Référence: ${project.reference}` : ""}
${project.departmentName ? `- Service demandeur: ${project.departmentName}` : ""}
${project.needType ? `- Type de besoin: ${getNeedTypeLabel(project.needType)}` : ""}
${project.urgencyLevel ? `- Niveau d'urgence: ${getUrgencyLabel(project.urgencyLevel)}` : ""}
${project.description ? `- Description actuelle: ${project.description.slice(0, 500)}${project.description.length > 500 ? "..." : ""}` : "- Description: Non renseignée"}
${project.context ? `- Contexte: ${project.context.slice(0, 500)}${project.context.length > 500 ? "..." : ""}` : "- Contexte: Non renseigné"}
${project.constraints ? `- Contraintes: ${project.constraints.slice(0, 300)}${project.constraints.length > 300 ? "..." : ""}` : "- Contraintes: Non renseignées"}
${project.budgetRange ? `- Budget estimé: ${project.budgetRange}` : "- Budget: Non renseigné"}
${project.desiredDeliveryDate ? `- Date souhaitée: ${project.desiredDeliveryDate}` : "- Date souhaitée: Non renseignée"}

Analyse ce contexte pour guider l'utilisateur vers les informations manquantes ou à améliorer.`;

  return basePrompt + projectContext;
}

/**
 * Get the label for a need type
 */
function getNeedTypeLabel(needType: string): string {
  const labels: Record<string, string> = {
    fourniture: "Fourniture / Équipement",
    service: "Prestation de service",
    travaux: "Travaux / Construction",
    formation: "Formation",
    logiciel: "Logiciel / Licence",
    maintenance: "Maintenance / Support",
    autre: "Autre",
  };
  return labels[needType] ?? needType;
}

/**
 * Get the label for an urgency level
 */
function getUrgencyLabel(urgency: string): string {
  const labels: Record<string, string> = {
    low: "Faible",
    medium: "Moyen",
    high: "Urgent",
    critical: "Critique",
  };
  return labels[urgency] ?? urgency;
}

/**
 * Assistant response
 */
export interface AssistantResponse {
  content: string;
  tokenCount?: number;
  model?: string;
}

/**
 * Send a message to the assistant and get a response
 */
export async function sendMessageToAssistant(
  userMessage: string,
  chatHistory: ChatMessage[],
  project: DemandProject | null
): Promise<AssistantResponse> {
  if (!openai) {
    throw new Error("L'assistant IA n'est pas configuré. Veuillez configurer OPENAI_API_KEY.");
  }

  const systemPrompt = buildSystemPrompt(project);

  // Build the messages array
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...chatHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user", content: userMessage },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content ?? "";
    const tokenCount = response.usage?.total_tokens;

    return {
      content,
      tokenCount,
      model: response.model,
    };
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw new Error("Erreur lors de la communication avec l'assistant IA.");
  }
}

/**
 * Generate an initial greeting message based on the project state
 */
export function generateGreetingMessage(project: DemandProject | null): string {
  if (!project) {
    return "Bonjour ! Je suis votre assistant pour la rédaction de votre dossier de demande. Comment puis-je vous aider ?";
  }

  // Check what's missing in the project
  const missingFields: string[] = [];

  if (!project.description) {
    missingFields.push("la description du besoin");
  }
  if (!project.context) {
    missingFields.push("le contexte et la justification");
  }
  if (!project.constraints) {
    missingFields.push("les contraintes identifiées");
  }
  if (!project.budgetRange) {
    missingFields.push("le budget estimé");
  }
  if (!project.desiredDeliveryDate) {
    missingFields.push("la date de livraison souhaitée");
  }

  if (missingFields.length === 0) {
    return `Bonjour ! Votre dossier "${project.title}" semble bien avancé. Souhaitez-vous que je vous aide à améliorer certaines sections ou avez-vous des questions ?`;
  }

  if (missingFields.length <= 2) {
    return `Bonjour ! Je vois que votre dossier "${project.title}" est presque complet. Il manque encore ${missingFields.join(" et ")}. Voulez-vous que je vous aide à compléter ces informations ?`;
  }

  return `Bonjour ! Je suis là pour vous aider à compléter votre dossier "${project.title}". Je remarque qu'il manque plusieurs informations importantes. Par où souhaitez-vous commencer ?`;
}

/**
 * Section types that can be generated
 */
export type GeneratableSection = "context" | "description" | "constraints";

/**
 * Section prompts for draft generation
 */
const sectionPrompts: Record<GeneratableSection, { title: string; prompt: string }> = {
  context: {
    title: "Contexte & Justification",
    prompt: `Génère un texte professionnel pour la section "Contexte & Justification" d'un dossier de demande.

Cette section doit expliquer:
- Le contexte dans lequel s'inscrit ce besoin
- La situation actuelle et ses limites
- Les raisons qui motivent cette demande
- Les objectifs visés par cette acquisition/prestation

Le texte doit être:
- Professionnel et structuré
- Clair et concis (3-5 paragraphes)
- Adapté au secteur public français
- Axé sur la justification du besoin`,
  },
  description: {
    title: "Description du besoin",
    prompt: `Génère un texte professionnel pour la section "Description du besoin" d'un dossier de demande.

Cette section doit détailler:
- Ce qui est demandé précisément
- Les caractéristiques et spécifications attendues
- Les fonctionnalités ou prestations requises
- Les quantités si applicable

Le texte doit être:
- Technique mais accessible
- Structuré (liste à puces si approprié)
- Précis sur les attentes
- Sans ambiguïté`,
  },
  constraints: {
    title: "Contraintes identifiées",
    prompt: `Génère un texte professionnel pour la section "Contraintes identifiées" d'un dossier de demande.

Cette section doit lister:
- Les contraintes techniques (compatibilité, normes, standards)
- Les contraintes réglementaires (conformité, certifications)
- Les contraintes temporelles (délais impératifs, jalons)
- Les contraintes budgétaires si connues
- Les contraintes d'installation ou de déploiement

Le texte doit être:
- Structuré en catégories claires
- Réaliste et pertinent
- Utile pour l'Administration qui créera l'AO`,
  },
};

/**
 * Generate a draft for a specific section
 */
export async function generateSectionDraft(
  section: GeneratableSection,
  project: DemandProject
): Promise<AssistantResponse> {
  if (!openai) {
    throw new Error("L'assistant IA n'est pas configuré. Veuillez configurer OPENAI_API_KEY.");
  }

  const sectionConfig = sectionPrompts[section];

  // Build context from project data
  const projectContext = `
INFORMATIONS DU DOSSIER:
- Titre: ${project.title}
${project.reference ? `- Référence: ${project.reference}` : ""}
${project.departmentName ? `- Service demandeur: ${project.departmentName}` : ""}
${project.needType ? `- Type de besoin: ${getNeedTypeLabel(project.needType)}` : ""}
${project.urgencyLevel ? `- Niveau d'urgence: ${getUrgencyLabel(project.urgencyLevel)}` : ""}
${project.budgetRange ? `- Budget estimé: ${project.budgetRange}` : ""}
${project.desiredDeliveryDate ? `- Date souhaitée: ${project.desiredDeliveryDate}` : ""}

CONTENU EXISTANT:
${project.context ? `- Contexte actuel: ${project.context}` : "- Contexte: (non renseigné)"}
${project.description ? `- Description actuelle: ${project.description}` : "- Description: (non renseignée)"}
${project.constraints ? `- Contraintes actuelles: ${project.constraints}` : "- Contraintes: (non renseignées)"}
`;

  const systemPrompt = `Tu es un expert en rédaction de dossiers de demande pour les marchés publics français.

${sectionConfig.prompt}

IMPORTANT:
- Réponds UNIQUEMENT avec le contenu de la section demandée
- N'ajoute pas de titre ou d'en-tête
- Utilise les informations du projet pour personnaliser le contenu
- Si des informations manquent, fais des suggestions pertinentes basées sur le type de besoin
- Écris en français professionnel`;

  const userPrompt = `Génère la section "${sectionConfig.title}" pour ce dossier de demande:

${projectContext}

Génère un brouillon professionnel et complet pour cette section.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content ?? "";
    const tokenCount = response.usage?.total_tokens;

    return {
      content,
      tokenCount,
      model: response.model,
    };
  } catch (error) {
    console.error("Error generating section draft:", error);
    throw new Error("Erreur lors de la génération du brouillon.");
  }
}

/**
 * Reformulate text to make it more professional
 */
export async function reformulateText(
  originalText: string
): Promise<AssistantResponse> {
  if (!openai) {
    throw new Error("L'assistant IA n'est pas configuré. Veuillez configurer OPENAI_API_KEY.");
  }

  if (!originalText.trim()) {
    throw new Error("Le texte à reformuler est vide.");
  }

  const systemPrompt = `Tu es un expert en rédaction de documents administratifs pour les marchés publics français.

Ta mission est de reformuler le texte fourni pour le rendre plus professionnel, clair et adapté à un contexte administratif.

Règles de reformulation:
1. Améliore la clarté et la structure du texte
2. Utilise un vocabulaire professionnel et précis
3. Corrige les fautes d'orthographe et de grammaire
4. Garde le sens original intact
5. Adapte le ton au contexte des marchés publics
6. Évite les répétitions et le jargon inutile
7. Structure le texte avec des paragraphes si nécessaire

IMPORTANT:
- Réponds UNIQUEMENT avec le texte reformulé
- N'ajoute pas de commentaires ou d'explications
- Conserve le même niveau de détail que l'original
- Ne change pas le sens ou les informations clés`;

  const userPrompt = `Reformule ce texte de manière professionnelle:

${originalText}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content ?? "";
    const tokenCount = response.usage?.total_tokens;

    return {
      content,
      tokenCount,
      model: response.model,
    };
  } catch (error) {
    console.error("Error reformulating text:", error);
    throw new Error("Erreur lors de la reformulation du texte.");
  }
}

/**
 * Follow-up question structure
 */
export interface FollowUpQuestion {
  id: string;
  question: string;
  targetSection: GeneratableSection | "budget" | "general";
  priority: "high" | "medium" | "low";
  hint?: string;
}

/**
 * Extracted document information structure
 */
export interface ExtractedDocumentInfo {
  title?: string;
  reference?: string;
  departmentName?: string;
  contactName?: string;
  contactEmail?: string;
  needType?: "fourniture" | "service" | "travaux" | "formation" | "logiciel" | "maintenance" | "autre";
  urgencyLevel?: "low" | "medium" | "high" | "critical";
  context?: string;
  description?: string;
  constraints?: string;
  budgetRange?: string;
  estimatedAmount?: number;
  desiredDeliveryDate?: string;
  confidence: {
    overall: number;
    fields: Record<string, number>;
  };
  warnings?: string[];
}

/**
 * Generate follow-up questions based on project state
 */
export async function generateFollowUpQuestions(
  project: DemandProject
): Promise<FollowUpQuestion[]> {
  if (!openai) {
    throw new Error("L'assistant IA n'est pas configuré. Veuillez configurer OPENAI_API_KEY.");
  }

  // First, analyze what's missing or incomplete
  const missingFields: string[] = [];
  const incompleteFields: string[] = [];

  if (!project.context?.trim()) {
    missingFields.push("contexte et justification");
  } else if (project.context.length < 100) {
    incompleteFields.push("contexte (trop court)");
  }

  if (!project.description?.trim()) {
    missingFields.push("description du besoin");
  } else if (project.description.length < 100) {
    incompleteFields.push("description (trop courte)");
  }

  if (!project.constraints?.trim()) {
    missingFields.push("contraintes identifiées");
  }

  if (!project.budgetRange?.trim()) {
    missingFields.push("estimation budgétaire");
  }

  if (!project.desiredDeliveryDate) {
    missingFields.push("date de livraison souhaitée");
  }

  if (!project.needType) {
    missingFields.push("type de besoin");
  }

  // Build context for AI
  const projectContext = `
ÉTAT DU DOSSIER DE DEMANDE:
- Titre: ${project.title}
${project.reference ? `- Référence: ${project.reference}` : ""}
${project.departmentName ? `- Service: ${project.departmentName}` : ""}
${project.needType ? `- Type: ${getNeedTypeLabel(project.needType)}` : "- Type: Non défini"}
${project.urgencyLevel ? `- Urgence: ${getUrgencyLabel(project.urgencyLevel)}` : ""}

CONTENU ACTUEL:
- Contexte: ${project.context?.slice(0, 300) ?? "(vide)"}${project.context && project.context.length > 300 ? "..." : ""}
- Description: ${project.description?.slice(0, 300) ?? "(vide)"}${project.description && project.description.length > 300 ? "..." : ""}
- Contraintes: ${project.constraints?.slice(0, 200) ?? "(vide)"}${project.constraints && project.constraints.length > 200 ? "..." : ""}
- Budget: ${project.budgetRange ?? "(non défini)"}
- Date souhaitée: ${project.desiredDeliveryDate ?? "(non définie)"}

INFORMATIONS MANQUANTES: ${missingFields.length > 0 ? missingFields.join(", ") : "Aucune"}
INFORMATIONS INCOMPLÈTES: ${incompleteFields.length > 0 ? incompleteFields.join(", ") : "Aucune"}
`;

  const systemPrompt = `Tu es un expert en analyse de dossiers de demande pour les marchés publics français.

Ta mission est de générer des questions pertinentes pour aider le CHEF à compléter son dossier de demande.

Règles:
1. Génère 3 à 5 questions maximum
2. Priorise les questions selon l'importance pour le dossier
3. Les questions doivent être spécifiques au contexte du projet
4. Chaque question doit cibler une section du dossier
5. Inclus un indice (hint) pour guider la réponse

Format de sortie JSON:
[
  {
    "question": "La question à poser",
    "targetSection": "context" | "description" | "constraints" | "budget" | "general",
    "priority": "high" | "medium" | "low",
    "hint": "Un indice pour aider à répondre"
  }
]

IMPORTANT:
- Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire
- Les questions doivent être en français
- Priorise les informations manquantes critiques`;

  const userPrompt = `Analyse ce dossier et génère des questions de relance pertinentes:

${projectContext}

Génère les questions au format JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "[]";

    // Parse the JSON response
    let questions: FollowUpQuestion[] = [];
    try {
      const parsed: unknown = JSON.parse(content);
      // Handle both array and object with questions property
      let questionsArray: unknown[] = [];
      if (Array.isArray(parsed)) {
        questionsArray = parsed;
      } else if (parsed && typeof parsed === "object" && "questions" in parsed) {
        const parsedObj = parsed as { questions?: unknown };
        questionsArray = Array.isArray(parsedObj.questions) ? parsedObj.questions : [];
      }

      questions = questionsArray.map((item, index) => {
        const q = item as Record<string, unknown>;
        return {
          id: `q-${Date.now()}-${index}`,
          question: typeof q.question === "string" ? q.question : "",
          targetSection: (typeof q.targetSection === "string" ? q.targetSection : "general") as FollowUpQuestion["targetSection"],
          priority: (typeof q.priority === "string" ? q.priority : "medium") as FollowUpQuestion["priority"],
          hint: typeof q.hint === "string" ? q.hint : undefined,
        };
      });
    } catch {
      console.error("Failed to parse follow-up questions JSON:", content);
      questions = [];
    }

    return questions;
  } catch (error) {
    console.error("Error generating follow-up questions:", error);
    throw new Error("Erreur lors de la génération des questions.");
  }
}

/**
 * Extract structured information from document text using AI
 * @param documentText - Raw text extracted from the document
 * @param documentFormat - Format of the source document (pdf, docx, doc)
 */
export async function extractDocumentInfo(
  documentText: string,
  documentFormat: "pdf" | "docx" | "doc"
): Promise<ExtractedDocumentInfo> {
  if (!openai) {
    throw new Error("L'assistant IA n'est pas configuré. Veuillez configurer OPENAI_API_KEY.");
  }

  if (!documentText.trim()) {
    throw new Error("Le document est vide ou illisible.");
  }

  // Truncate if too long (keep first 30k chars for context)
  const maxChars = 30000;
  const truncatedText = documentText.length > maxChars
    ? documentText.slice(0, maxChars) + "\n\n[... document tronqué ...]"
    : documentText;

  const systemPrompt = `Tu es un expert en analyse de documents de demande pour les marchés publics français.

Ta mission est d'extraire les informations structurées d'un ancien document de demande pour les mapper vers un formulaire de dossier de demande.

Champs à extraire (si présents dans le document):
- title: Titre ou objet de la demande
- reference: Numéro de référence ou code interne
- departmentName: Nom du service demandeur
- contactName: Nom du contact ou responsable
- contactEmail: Email du contact (format email valide)
- needType: Type de besoin parmi [fourniture, service, travaux, formation, logiciel, maintenance, autre]
- urgencyLevel: Niveau d'urgence parmi [low, medium, high, critical]
- context: Contexte et justification de la demande (texte complet)
- description: Description détaillée du besoin (texte complet)
- constraints: Contraintes identifiées (texte complet)
- budgetRange: Fourchette budgétaire (ex: "50 000 - 100 000 EUR")
- estimatedAmount: Montant estimé en euros (nombre entier uniquement)
- desiredDeliveryDate: Date souhaitée au format YYYY-MM-DD

Pour chaque champ extrait, évalue ta confiance (0.0 à 1.0).

Format de sortie JSON:
{
  "extracted": {
    "title": "...",
    "reference": "...",
    ...
  },
  "confidence": {
    "overall": 0.85,
    "fields": {
      "title": 0.95,
      "description": 0.80,
      ...
    }
  },
  "warnings": ["avertissement 1", "avertissement 2"]
}

IMPORTANT:
- N'invente PAS d'informations non présentes dans le document
- Laisse les champs vides (null) si l'information n'est pas trouvée
- Les champs context, description et constraints doivent être des textes complets, pas des résumés
- Inclus des warnings si le document semble incomplet ou si des informations sont ambiguës`;

  const userPrompt = `Analyse ce document (format: ${documentFormat.toUpperCase()}) et extrais les informations structurées:

--- DÉBUT DU DOCUMENT ---
${truncatedText}
--- FIN DU DOCUMENT ---

Extrais les informations au format JSON spécifié.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 3000,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "{}";

    // Parse the JSON response
    const parsed: unknown = JSON.parse(content);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid response format");
    }

    const result = parsed as {
      extracted?: Record<string, unknown>;
      confidence?: { overall?: number; fields?: Record<string, number> };
      warnings?: string[];
    };

    const extracted = result.extracted ?? {};
    const confidence = result.confidence ?? { overall: 0.5, fields: {} };

    // Build the result with proper type validation
    return {
      title: typeof extracted.title === "string" ? extracted.title : undefined,
      reference: typeof extracted.reference === "string" ? extracted.reference : undefined,
      departmentName: typeof extracted.departmentName === "string" ? extracted.departmentName : undefined,
      contactName: typeof extracted.contactName === "string" ? extracted.contactName : undefined,
      contactEmail: typeof extracted.contactEmail === "string" ? extracted.contactEmail : undefined,
      needType: isValidNeedType(extracted.needType) ? extracted.needType : undefined,
      urgencyLevel: isValidUrgencyLevel(extracted.urgencyLevel) ? extracted.urgencyLevel : undefined,
      context: typeof extracted.context === "string" ? extracted.context : undefined,
      description: typeof extracted.description === "string" ? extracted.description : undefined,
      constraints: typeof extracted.constraints === "string" ? extracted.constraints : undefined,
      budgetRange: typeof extracted.budgetRange === "string" ? extracted.budgetRange : undefined,
      estimatedAmount: typeof extracted.estimatedAmount === "number" ? Math.round(extracted.estimatedAmount) : undefined,
      desiredDeliveryDate: typeof extracted.desiredDeliveryDate === "string" ? extracted.desiredDeliveryDate : undefined,
      confidence: {
        overall: typeof confidence.overall === "number" ? confidence.overall : 0.5,
        fields: confidence.fields ?? {},
      },
      warnings: Array.isArray(result.warnings) ? result.warnings.filter((w): w is string => typeof w === "string") : undefined,
    };
  } catch (error) {
    console.error("Error extracting document info:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Erreur lors de l'analyse de la réponse IA.");
    }
    throw new Error("Erreur lors de l'extraction des informations du document.");
  }
}

/**
 * Type guard for need type
 */
function isValidNeedType(value: unknown): value is ExtractedDocumentInfo["needType"] {
  return typeof value === "string" &&
    ["fourniture", "service", "travaux", "formation", "logiciel", "maintenance", "autre"].includes(value);
}

/**
 * Type guard for urgency level
 */
function isValidUrgencyLevel(value: unknown): value is ExtractedDocumentInfo["urgencyLevel"] {
  return typeof value === "string" &&
    ["low", "medium", "high", "critical"].includes(value);
}

/**
 * Suggested criterion structure
 */
export interface SuggestedCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-100
  category: "technical" | "quality" | "price" | "other";
}

/**
 * Suggested criteria response
 */
export interface SuggestedCriteriaResponse {
  criteria: SuggestedCriterion[];
  totalWeight: number;
  recommendations?: string[];
}

/**
 * Generate suggested criteria based on project type and context
 */
export async function generateSuggestedCriteria(
  project: DemandProject
): Promise<SuggestedCriteriaResponse> {
  if (!openai) {
    throw new Error("L'assistant IA n'est pas configuré. Veuillez configurer OPENAI_API_KEY.");
  }

  const needTypeLabels: Record<string, string> = {
    fourniture: "Fourniture / Équipement",
    service: "Prestation de service",
    travaux: "Travaux / Construction",
    formation: "Formation",
    logiciel: "Logiciel / Licence",
    maintenance: "Maintenance / Support",
    autre: "Autre",
  };

  const projectContext = `
TYPE DE BESOIN: ${project.needType ? needTypeLabels[project.needType] ?? project.needType : "Non spécifié"}
TITRE: ${project.title}
${project.description ? `DESCRIPTION: ${project.description.slice(0, 500)}` : ""}
${project.context ? `CONTEXTE: ${project.context.slice(0, 300)}` : ""}
${project.constraints ? `CONTRAINTES: ${project.constraints.slice(0, 300)}` : ""}
${project.budgetRange ? `BUDGET: ${project.budgetRange}` : ""}
`;

  const systemPrompt = `Tu es un expert en marchés publics français.

Ta mission est de suggérer des critères de sélection pour un appel d'offres basé sur le dossier de demande.

Les critères doivent être:
1. Pertinents pour le type de besoin
2. Mesurables et objectifs
3. Conformes au Code de la Commande Publique
4. Avec des pondérations équilibrées (total = 100%)

Catégories de critères:
- technical: Critères techniques (conformité, performance, innovation)
- quality: Critères de qualité (garantie, SAV, délais, formation)
- price: Critères économiques (prix, coût global, TCO)
- other: Autres critères (développement durable, insertion sociale)

Format de sortie JSON:
{
  "criteria": [
    {
      "name": "Nom du critère",
      "description": "Description détaillée",
      "weight": 30,
      "category": "technical"
    }
  ],
  "recommendations": ["Recommandation 1", "Recommandation 2"]
}

IMPORTANT:
- Génère 5 à 8 critères
- La somme des poids doit faire 100
- Le prix doit représenter au moins 20% du total
- Les critères techniques entre 30-50%
- Adapte les critères au type de besoin spécifique`;

  const userPrompt = `Génère des critères de sélection pour ce dossier de demande:

${projectContext}

Génère les critères au format JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "{}";

    // Parse the JSON response
    const parsed: unknown = JSON.parse(content);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid response format");
    }

    const result = parsed as {
      criteria?: unknown[];
      recommendations?: string[];
    };

    const criteriaArray = Array.isArray(result.criteria) ? result.criteria : [];

    const criteria: SuggestedCriterion[] = criteriaArray.map((item, index) => {
      const c = item as Record<string, unknown>;
      return {
        id: `crit-${Date.now()}-${index}`,
        name: typeof c.name === "string" ? c.name : `Critère ${index + 1}`,
        description: typeof c.description === "string" ? c.description : "",
        weight: typeof c.weight === "number" ? Math.round(c.weight) : 10,
        category: isValidCategory(c.category) ? c.category : "other",
      };
    });

    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

    const recommendations = Array.isArray(result.recommendations)
      ? result.recommendations.filter((r): r is string => typeof r === "string")
      : undefined;

    return {
      criteria,
      totalWeight,
      recommendations,
    };
  } catch (error) {
    console.error("Error generating suggested criteria:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Erreur lors de l'analyse de la réponse IA.");
    }
    throw new Error("Erreur lors de la génération des critères suggérés.");
  }
}

/**
 * Type guard for criteria category
 */
function isValidCategory(value: unknown): value is SuggestedCriterion["category"] {
  return typeof value === "string" &&
    ["technical", "quality", "price", "other"].includes(value);
}
