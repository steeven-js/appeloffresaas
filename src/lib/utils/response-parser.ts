/**
 * Response parser utility to detect saveable content in AI responses
 * Identifies sections that can be saved to the document
 */

export type SaveableSection = "context" | "description" | "constraints" | "budget";

export interface SaveableContent {
  section: SaveableSection;
  label: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Patterns to detect saveable content in AI responses
 */
const SECTION_PATTERNS: {
  section: SaveableSection;
  label: string;
  patterns: RegExp[];
}[] = [
  {
    section: "context",
    label: "Contexte",
    patterns: [
      /(?:voici|voilà)?\s*(?:une?\s+)?(?:proposition\s+(?:de\s+)?)?(?:pour\s+)?(?:le\s+)?contexte\s*(?:et\s+justification)?\s*:?\s*/i,
      /contexte\s*(?:à\s+ajouter|proposé|suggéré)\s*:?\s*/i,
      /(?:section\s+)?contexte\s*:?\s*\n/i,
      /(?:pour\s+)?(?:la\s+section\s+)?["«]?contexte["»]?\s*:?\s*/i,
      /éléments?\s+(?:de\s+)?contexte\s*:?\s*/i,
      /justification\s+(?:du\s+besoin|de\s+l'urgence)?\s*:?\s*/i,
      // Numbered headers like "7. Contexte"
      /\d+\.\s*\*{0,2}contexte\*{0,2}\s*\n/i,
      /\*{2}contexte\*{2}\s*:?\s*\n/i,
      /#{1,3}\s*contexte\s*(?:&|et)?\s*justification?\s*\n/i,
    ],
  },
  {
    section: "description",
    label: "Description",
    patterns: [
      /(?:voici|voilà)?\s*(?:une?\s+)?(?:proposition\s+(?:de\s+)?)?(?:pour\s+)?(?:la\s+)?description\s*(?:du\s+besoin)?\s*:?\s*/i,
      /description\s*(?:à\s+ajouter|proposée|suggérée)\s*:?\s*/i,
      /(?:section\s+)?description\s*:?\s*\n/i,
      /(?:pour\s+)?(?:la\s+section\s+)?["«]?description["»]?\s*:?\s*/i,
      /description\s+(?:technique|fonctionnelle|du\s+besoin)\s*:?\s*/i,
      /spécifications?\s*(?:fonctionnelles?|techniques?)?\s*:?\s*/i,
      /reformulation\s*:?\s*/i,
      /proposition\s+de\s+reformulation\s*:?\s*/i,
      // Numbered headers like "6. Description du besoin"
      /\d+\.\s*\*{0,2}description\s*(?:du\s+besoin)?\*{0,2}\s*\n/i,
      /\*{2}description\*{2}\s*:?\s*\n/i,
      /#{1,3}\s*description\s*(?:du\s+besoin)?\s*\n/i,
    ],
  },
  {
    section: "constraints",
    label: "Contraintes",
    patterns: [
      /(?:voici|voilà)?\s*(?:une?\s+)?(?:proposition\s+(?:de\s+)?)?(?:pour\s+)?(?:les\s+)?contraintes?\s*(?:identifiées?)?\s*:?\s*/i,
      /contraintes?\s*(?:à\s+ajouter|proposées?|suggérées?)\s*:?\s*/i,
      /(?:section\s+)?contraintes?\s*:?\s*\n/i,
      /(?:pour\s+)?(?:la\s+section\s+)?["«]?contraintes?["»]?\s*:?\s*/i,
      /contraintes?\s+(?:techniques?|réglementaires?|temporelles?|budgétaires?)\s*:?\s*/i,
      /exigences?\s*:?\s*/i,
      // Numbered headers like "9. Contraintes à préciser"
      /\d+\.\s*\*{0,2}contraintes?\s*(?:à\s+préciser|identifiées?)?\*{0,2}\s*\n/i,
      /\*{2}contraintes?\*{2}\s*:?\s*\n/i,
      /#{1,3}\s*contraintes?\s*\n/i,
    ],
  },
  {
    section: "budget",
    label: "Budget & Délais",
    patterns: [
      /(?:voici|voilà)?\s*(?:une?\s+)?(?:proposition\s+(?:de\s+)?)?(?:pour\s+)?(?:le\s+)?budget\s*(?:et\s+délais?)?\s*:?\s*/i,
      /budget\s*(?:estimé|proposé|suggéré)\s*:?\s*/i,
      /estimation\s+(?:budgétaire|financière)\s*:?\s*/i,
      // Numbered headers like "10. Budget" or "**10. Budget**"
      /\d+\.\s*\*{0,2}budget\*{0,2}\s*:?\s*$/im,
      // Simple header formats
      /\*{2}budget(?:\s*(?:&|et)\s*délais?)?\*{2}\s*:?\s*$/im,
      /#{1,3}\s*budget\s*(?:&|et)?\s*délais?\s*$/im,
      // Inline patterns
      /(?:informations?\s+)?budget(?:aires?)?\s*(?:&|et)?\s*délais?\s*:\s*/i,
      // Date/delivery patterns (often part of budget section)
      /(?:date\s+(?:de\s+)?(?:livraison|souhaitée)|délai(?:s)?\s+(?:de\s+)?(?:livraison|réalisation))\s*:?\s*/i,
      // Fourchette budgétaire as indicator
      /fourchette\s+budgétaire\s*:?\s*/i,
      // Budget with bullet points
      /budget\s*:\s*\n\s*[-•\*]/i,
    ],
  },
];

/**
 * Detect saveable content patterns in an AI response
 * Returns array of detected sections that can be saved
 */
export function detectSaveableContent(response: string): SaveableContent[] {
  const results: SaveableContent[] = [];

  for (const { section, label, patterns } of SECTION_PATTERNS) {
    for (const pattern of patterns) {
      const match = response.match(pattern);
      if (match?.index !== undefined) {
        // Find the content after the pattern
        const startIndex = match.index + match[0].length;

        // Find the end of the content (next section header or end of text)
        let endIndex = response.length;

        // Look for common section breaks
        // For budget section, we want to include date-related content too
        const isBudgetSection = section === "budget";
        const breakPatterns = isBudgetSection
          ? [
              // For budget, break only on suggestions or unrelated sections
              /\n+(?:\d+\.\s*)?(?:\*{2})?(?:suggestions?\s+supplémentaires?|remarques?|notes?|conclusion)(?:\*{2})?/i,
              // Break on numbered headers that aren't date/budget related
              /\n(?:\d+)\.\s+(?!budget|date|délai|livraison|montant)/i,
              /\n(?:contexte|description|contraintes?|spécifications?|exigences?)\s*:/i,
            ]
          : [
              // Break on numbered section headers (like "8. Justification")
              /\n\d+\.\s+[A-ZÀ-Ü]/,
              // Break on markdown headers
              /\n#{1,3}\s+[A-ZÀ-Ü]/,
              // Break on bold headers
              /\n\*{2}[A-ZÀ-Ü]/,
              // Break on specific section keywords
              /\n(?:contexte|description|contraintes?|budget|spécifications?|exigences?)\s*:/i,
              // Stop at suggestions section
              /\n+(?:\*{2})?suggestions?\s+supplémentaires?/i,
            ];

        for (const breakPattern of breakPatterns) {
          const remainingText = response.slice(startIndex);
          const breakMatch = remainingText.match(breakPattern);
          if (breakMatch?.index !== undefined) {
            const potentialEnd = startIndex + breakMatch.index;
            if (potentialEnd < endIndex && potentialEnd > startIndex + 50) {
              endIndex = potentialEnd;
            }
          }
        }

        const content = response.slice(startIndex, endIndex).trim();

        // Only add if content is substantial (more than 50 chars)
        if (content.length > 50) {
          // Check if this section wasn't already detected
          const existingSection = results.find(r => r.section === section);
          if (!existingSection) {
            results.push({
              section,
              label,
              content,
              startIndex,
              endIndex,
            });
          }
        }

        break; // Found a match for this section, move to next
      }
    }
  }

  return results;
}

/**
 * Check if an AI response contains any saveable content
 */
export function hasSaveableContent(response: string): boolean {
  return detectSaveableContent(response).length > 0;
}

/**
 * Get the primary saveable section from a response (the first/most important one)
 */
export function getPrimarySaveableSection(response: string): SaveableContent | null {
  const sections = detectSaveableContent(response);
  return sections.length > 0 ? sections[0]! : null;
}

/**
 * Clean content for saving to database
 * Removes AI meta-commentary and keeps only the actual content
 */
export function cleanContentForSave(content: string): string {
  // Remove common AI phrases that shouldn't be in the final document
  const phrasesToRemove = [
    /^(?:voici|voilà)\s+(?:une?\s+)?(?:proposition|suggestion)\s*:?\s*/i,
    /^(?:je\s+(?:vous\s+)?(?:propose|suggère))\s*:?\s*/i,
    /(?:n'hésitez\s+pas\s+à\s+(?:me\s+)?demander|voulez-vous\s+que\s+je).*$/i,
    /(?:si\s+vous\s+(?:le\s+)?souhaitez|dites-moi\s+si).*$/i,
  ];

  let cleaned = content;
  for (const phrase of phrasesToRemove) {
    cleaned = cleaned.replace(phrase, "");
  }

  return cleaned.trim();
}
