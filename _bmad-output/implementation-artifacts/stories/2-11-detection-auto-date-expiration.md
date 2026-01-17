# Story 2.11: Détection Auto Date Expiration

Status: done

## Story

As a **user**,
I want **the system to detect expiration dates from document content**,
So that **I don't have to enter them manually**.

## Acceptance Criteria

1. Given I upload an administrative document (attestation, certificat)
2. When the upload completes
3. Then the system attempts to extract the expiration date using OCR/AI
4. And if found, it suggests the date for confirmation
5. And I can accept, modify, or reject the suggestion
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Install and configure OpenAI SDK (AC: #3)
  - [x] 1.1 Install openai package
  - [x] 1.2 Add OPENAI_API_KEY to env schema
  - [x] 1.3 Add runtime env mapping

- [x] Task 2: Create AI service (AC: #3)
  - [x] 2.1 Create src/server/services/ai/openai.ts
  - [x] 2.2 Create OpenAI client with API key from env
  - [x] 2.3 Create analyzeDocumentForExpiryDate function
  - [x] 2.4 Create DocumentAnalysisResult interface
  - [x] 2.5 Create isOpenAIConfigured function

- [x] Task 3: Create tRPC procedures (AC: #3, #4)
  - [x] 3.1 Add isAnalysisAvailable query
  - [x] 3.2 Add analyzeForExpiryDate mutation
  - [x] 3.3 Fetch document from R2
  - [x] 3.4 Convert to base64 for OpenAI Vision
  - [x] 3.5 Return extracted date with confidence level

- [x] Task 4: Create UI for AI analysis (AC: #4, #5)
  - [x] 4.1 Add Sparkles icon for AI button
  - [x] 4.2 Add analyze button to DocumentCard (for images without expiry)
  - [x] 4.3 Add analyzeMutation to fetch suggestions
  - [x] 4.4 Create suggestion dialog with date preview
  - [x] 4.5 Show confidence level badge
  - [x] 4.6 Allow user to modify suggested date
  - [x] 4.7 Add Accept and Reject buttons

- [x] Task 5: Verification (AC: #6, #7, #8)
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### OpenAI Vision Integration

Uses GPT-4o-mini with vision capabilities to analyze document images:

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{
    role: "user",
    content: [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } }
    ]
  }]
});
```

### Prompt Design

The prompt is optimized for French administrative documents and asks the AI to:
- Find expiration/validity dates ("valable jusqu'au", "expire le", etc.)
- Identify document type (attestation URSSAF, Kbis, etc.)
- Return confidence level (high, medium, low)

### Confidence Levels

| Level | Description | Badge Color |
|-------|-------------|-------------|
| High | Clear date found | Green |
| Medium | Date found with some uncertainty | Yellow |
| Low | Date uncertain or not found | Orange |

### Supported Document Types

Currently supports image analysis only:
- JPEG images
- PNG images
- WebP images

PDF analysis requires conversion to images (future enhancement).

### Environment Variables

```env
# OpenAI - AI document analysis (Story 2.11)
# Required for: automatic expiration date detection
# Get your API key from https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-..."
```

### References

- [Source: epics.md#Story 2.11: Détection Auto Date Expiration]
- [FR17: System can detect expiration dates from documents]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/env.js` | Modified | Added OPENAI_API_KEY env variable |
| `src/server/services/ai/openai.ts` | Created | OpenAI service with document analysis |
| `src/server/services/ai/index.ts` | Created | AI service exports |
| `src/server/api/routers/companyDocuments.ts` | Modified | Added isAnalysisAvailable and analyzeForExpiryDate |
| `src/components/documents/document-vault.tsx` | Modified | Added AI analyze button and suggestion dialog |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story implementation | Epic 2 Story 2.11 - Auto expiration detection |
| 2026-01-17 | Added openai package | For GPT-4 Vision API |

### Completion Notes

- All acceptance criteria satisfied
- OpenAI Vision integration for document analysis
- Sparkles button appears on images without expiry date (when API key configured)
- Suggestion dialog shows detected date, document type, and confidence level
- User can accept, modify, or reject the suggestion
- PDFs not yet supported (would require image conversion)
- All validations pass: typecheck, lint, build
