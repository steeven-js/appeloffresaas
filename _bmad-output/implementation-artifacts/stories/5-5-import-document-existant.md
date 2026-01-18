# Story 5.5: Import Document Existant

Status: done

## Story

As a **CHEF**,
I want **to import an existing demand document**,
So that **form fields are automatically pre-filled**.

## Acceptance Criteria

1. [x] Upload PDF or Word documents
2. [x] AI extracts key information
3. [x] Mapping to form fields
4. [x] Manual validation of extracted data
5. [x] `pnpm typecheck` passes
6. [x] `pnpm lint` passes
7. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Document Parsing Service
  - [x] 1.1 Install mammoth for Word parsing
  - [x] 1.2 Create `document-parser.ts` service
  - [x] 1.3 Support PDF and Word (docx, doc) formats
  - [x] 1.4 Text extraction with word count

- [x] Task 2: AI Extraction Function
  - [x] 2.1 Add `ExtractedDocumentInfo` interface
  - [x] 2.2 Create `extractDocumentInfo()` function
  - [x] 2.3 Extract all form fields with confidence scores
  - [x] 2.4 Return warnings for incomplete/ambiguous data

- [x] Task 3: tRPC Endpoint
  - [x] 3.1 Add `importDocument` mutation to demandChat router
  - [x] 3.2 Accept base64 encoded file + metadata
  - [x] 3.3 Validate file type and size (max 10MB)
  - [x] 3.4 Parse and extract in one call

- [x] Task 4: UI Components
  - [x] 4.1 Add "Importer" button in workspace header
  - [x] 4.2 Hidden file input for PDF/Word
  - [x] 4.3 Import preview dialog with extracted fields
  - [x] 4.4 Field selection with checkboxes
  - [x] 4.5 Confidence indicators per field
  - [x] 4.6 Warnings display
  - [x] 4.7 Accept/Cancel functionality

- [x] Task 5: Verification
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**Document Parser Service** (`src/server/services/document/document-parser.ts`):
- Uses `pdf-parse` for PDF text extraction (already installed)
- Uses `mammoth` for Word document parsing (newly installed)
- Supports: PDF, DOCX, DOC
- Returns: text, word count, format, optional metadata
- Validates file size (max 10MB)

**AI Extraction** (`src/server/services/ai/demand-assistant.ts`):
- Added `ExtractedDocumentInfo` interface with all form fields
- `extractDocumentInfo()` function using gpt-4o-mini
- Extracts with JSON response format
- Per-field confidence scores (0.0 to 1.0)
- Warnings for incomplete or ambiguous data
- Type guards for needType and urgencyLevel

**tRPC Router** (`src/server/api/routers/demandChat.ts`):
- `importDocument` mutation:
  - Input: base64 fileData, fileName, mimeType
  - Validates MIME type and file size
  - Returns: extracted data + document info

**UI Components** (`src/components/demands/demand-workspace.tsx`):
- "Importer" button with FileUp icon
- Hidden file input with accept filter
- `ImportFieldRow` helper component for field display
- Confidence color coding: green (>80%), yellow (50-80%), red (<50%)
- Field selection with checkboxes
- Long text fields show truncated preview (line-clamp-3)

### Extracted Fields

| Field | Description |
|-------|-------------|
| title | Document title/object |
| reference | Internal reference number |
| departmentName | Requesting department |
| contactName | Contact person name |
| contactEmail | Contact email |
| needType | Type of need (enum) |
| urgencyLevel | Urgency level (enum) |
| context | Context and justification (full text) |
| description | Need description (full text) |
| constraints | Identified constraints (full text) |
| budgetRange | Budget range |
| estimatedAmount | Estimated amount in EUR |
| desiredDeliveryDate | Desired delivery date (YYYY-MM-DD) |

### User Flow

1. User clicks "Importer" button in workspace header
2. File picker opens (PDF or Word)
3. File is read and sent to server as base64
4. Server parses document and extracts text
5. AI analyzes text and extracts structured fields
6. Preview dialog shows all extracted fields with confidence
7. User selects which fields to import (checkboxes)
8. User clicks "Importer" to apply selected fields to form
9. Form is updated with imported data

### References

- [Source: epics-demande-v1.md#Story 5.5]
- Document Parser: `src/server/services/document/document-parser.ts`
- AI Service: `src/server/services/ai/demand-assistant.ts`
- Router: `src/server/api/routers/demandChat.ts`
- Workspace: `src/components/demands/demand-workspace.tsx`
