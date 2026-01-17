import OpenAI from "openai";
import { env } from "~/env";

/**
 * OpenAI client instance
 * Used for document analysis and date extraction (Story 2.11)
 */
export const openai = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

/**
 * Check if OpenAI is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!env.OPENAI_API_KEY;
}

/**
 * Document analysis result
 */
export interface DocumentAnalysisResult {
  expiryDate: string | null;
  confidence: "high" | "medium" | "low";
  documentType: string | null;
  rawText?: string;
}

/**
 * Analyze a document image to extract expiration date
 * Uses GPT-4 Vision to analyze the document
 */
export async function analyzeDocumentForExpiryDate(
  imageBase64: string,
  mimeType: string
): Promise<DocumentAnalysisResult> {
  if (!openai) {
    throw new Error("OpenAI n'est pas configuré");
  }

  const prompt = `Analysez ce document administratif français et extrayez les informations suivantes:

1. **Date d'expiration/validité**: Cherchez une date de fin de validité, date d'expiration, "valable jusqu'au", "expire le", etc.
2. **Type de document**: Identifiez s'il s'agit d'une attestation URSSAF, Kbis, attestation fiscale, assurance, certificat, etc.

IMPORTANT:
- Les dates doivent être au format ISO (YYYY-MM-DD)
- Si aucune date d'expiration n'est trouvée, retournez null
- Indiquez votre niveau de confiance (high, medium, low)

Répondez UNIQUEMENT en JSON avec ce format exact:
{
  "expiryDate": "YYYY-MM-DD" ou null,
  "confidence": "high" | "medium" | "low",
  "documentType": "type du document" ou null
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        expiryDate: null,
        confidence: "low",
        documentType: null,
      };
    }

    // Extract JSON from response (handle potential markdown code blocks)
    const jsonRegex = /\{[\s\S]*\}/;
    const jsonMatch = jsonRegex.exec(content);
    if (!jsonMatch) {
      return {
        expiryDate: null,
        confidence: "low",
        documentType: null,
      };
    }

    const result = JSON.parse(jsonMatch[0]) as {
      expiryDate?: string | null;
      confidence?: string;
      documentType?: string | null;
    };

    // Validate the expiry date format
    let validatedDate: string | null = null;
    if (result.expiryDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(result.expiryDate)) {
        validatedDate = result.expiryDate;
      }
    }

    return {
      expiryDate: validatedDate,
      confidence: (result.confidence as "high" | "medium" | "low") ?? "low",
      documentType: result.documentType ?? null,
    };
  } catch (error) {
    console.error("Error analyzing document:", error);
    return {
      expiryDate: null,
      confidence: "low",
      documentType: null,
    };
  }
}
