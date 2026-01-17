import { openai, isOpenAIConfigured } from "./openai";
import { extractTextFromPDF, isTextTooLarge, splitTextIntoChunks } from "../pdf/pdf-parser";

/**
 * Required document extracted from RC
 */
export interface RequiredDocument {
  name: string;
  category: "administratif" | "technique" | "financier";
  mandatory: boolean;
  pageReference?: number;
  description?: string;
}

/**
 * Selection criteria from RC
 */
export interface SelectionCriteria {
  name: string;
  weight: number; // Percentage (0-100)
  description?: string;
}

/**
 * Lot information from RC
 */
export interface LotInfo {
  number: string;
  title: string;
  description?: string;
}

/**
 * Complete RC parsed data structure
 */
export interface RCParsedData {
  // Submission information
  deadline?: string; // ISO 8601
  submissionFormat?: "papier" | "pdf" | "plateforme";
  platform?: string;
  maxFileSize?: string;
  namingConvention?: string;

  // Required documents
  requiredDocuments: RequiredDocument[];

  // Lots
  lots?: LotInfo[];
  isAlloti: boolean;

  // Selection criteria
  criteria?: SelectionCriteria[];

  // Additional info
  estimatedAmount?: string;
  contractDuration?: string;
  startDate?: string;

  // Metadata
  pageCount: number;
  parsingDurationMs: number;
  confidence: "high" | "medium" | "low";
}

/**
 * RC Parsing prompt for AI
 */
const RC_PARSING_PROMPT = `Vous êtes un expert en analyse de marchés publics français. Analysez ce Règlement de Consultation (RC) et extrayez les informations clés.

Extrayez les informations suivantes en JSON:

1. **deadline**: Date et heure limite de remise des offres (format ISO 8601, ex: "2026-02-15T12:00:00")
2. **submissionFormat**: Format de soumission ("papier", "pdf", ou "plateforme")
3. **platform**: Plateforme de dépôt si dématérialisée (ex: "PLACE", "AWS-achat", "marches-publics.gouv.fr")
4. **maxFileSize**: Taille maximale des fichiers si mentionnée
5. **namingConvention**: Convention de nommage des fichiers si mentionnée
6. **requiredDocuments**: Liste des pièces à fournir, chaque document avec:
   - name: Nom du document
   - category: "administratif" | "technique" | "financier"
   - mandatory: true si obligatoire, false si optionnel
   - pageReference: Numéro de page si identifiable
   - description: Description courte si disponible
7. **lots**: Si alloti, liste des lots avec number, title, description
8. **isAlloti**: true si le marché est alloti, false sinon
9. **criteria**: Critères de sélection avec name, weight (pourcentage), description
10. **estimatedAmount**: Montant estimé si mentionné
11. **contractDuration**: Durée du marché si mentionnée
12. **startDate**: Date de début prévue si mentionnée

IMPORTANT:
- Répondez UNIQUEMENT en JSON valide
- Si une information n'est pas trouvée, omettez le champ ou utilisez null
- Pour les documents requis, incluez TOUS les documents mentionnés
- Les dates doivent être au format ISO 8601

Répondez avec ce format JSON:
{
  "deadline": "2026-02-15T12:00:00" ou null,
  "submissionFormat": "plateforme" ou null,
  "platform": "PLACE" ou null,
  "requiredDocuments": [...],
  "lots": [...] ou null,
  "isAlloti": true/false,
  "criteria": [...] ou null,
  "confidence": "high" | "medium" | "low"
}`;

/**
 * Parse RC document text with AI
 */
export async function parseRCWithAI(
  text: string,
  pageCount: number
): Promise<Omit<RCParsedData, "parsingDurationMs">> {
  if (!isOpenAIConfigured() || !openai) {
    throw new Error("OpenAI n'est pas configuré. Veuillez ajouter OPENAI_API_KEY.");
  }

  // Handle large documents by chunking
  let textToProcess = text;
  if (isTextTooLarge(text)) {
    // For large documents, use first and last chunks for key info
    const chunks = splitTextIntoChunks(text);
    // Take first chunk (usually contains deadline, format) and last chunk (usually has document list)
    textToProcess = chunks[0] + "\n\n[...]\n\n" + (chunks[chunks.length - 1] ?? "");
  }

  // Truncate if still too long (API limit ~128k tokens)
  const maxChars = 80000;
  if (textToProcess.length > maxChars) {
    textToProcess = textToProcess.slice(0, maxChars) + "\n\n[Document tronqué pour analyse]";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: RC_PARSING_PROMPT,
        },
        {
          role: "user",
          content: `Analysez ce Règlement de Consultation:\n\n${textToProcess}`,
        },
      ],
      max_tokens: 4000,
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return createEmptyResult(pageCount);
    }

    const parsed = JSON.parse(content) as Partial<RCParsedData>;

    return {
      deadline: parsed.deadline ?? undefined,
      submissionFormat: parsed.submissionFormat,
      platform: parsed.platform,
      maxFileSize: parsed.maxFileSize,
      namingConvention: parsed.namingConvention,
      requiredDocuments: parsed.requiredDocuments ?? [],
      lots: parsed.lots,
      isAlloti: parsed.isAlloti ?? false,
      criteria: parsed.criteria,
      estimatedAmount: parsed.estimatedAmount,
      contractDuration: parsed.contractDuration,
      startDate: parsed.startDate,
      pageCount,
      confidence: parsed.confidence ?? "medium",
    };
  } catch (error) {
    console.error("[RC Parser] Error parsing RC:", error);
    throw error;
  }
}

/**
 * Create empty result when parsing fails
 */
function createEmptyResult(pageCount: number): Omit<RCParsedData, "parsingDurationMs"> {
  return {
    requiredDocuments: [],
    isAlloti: false,
    pageCount,
    confidence: "low",
  };
}

/**
 * Full RC parsing pipeline: PDF buffer -> Parsed data
 */
export async function parseRCDocument(buffer: Buffer): Promise<RCParsedData> {
  const startTime = Date.now();

  // Extract text from PDF
  const pdfResult = await extractTextFromPDF(buffer);

  if (!pdfResult.text || pdfResult.text.trim().length < 100) {
    throw new Error("Le document PDF ne contient pas assez de texte extractible.");
  }

  // Parse with AI
  const parsedData = await parseRCWithAI(pdfResult.text, pdfResult.pageCount);

  return {
    ...parsedData,
    parsingDurationMs: Date.now() - startTime,
  };
}
