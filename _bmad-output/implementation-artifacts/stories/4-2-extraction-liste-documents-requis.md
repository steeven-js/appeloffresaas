# Story 4.2: Extraction Liste Documents Requis

Status: done

## Story

As a **user**,
I want **the system to extract the list of required documents from the RC**,
So that **I have a clear checklist of what to prepare**.

## Acceptance Criteria

1. Given the RC has been parsed
2. When I view the results
3. Then I see a list of all required documents extracted from the RC
4. And each item shows the document name and source reference (page number)
5. And the list includes both mandatory and optional documents (clearly labeled)
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Create Required Documents List Component (AC: #3, #4, #5)
  - [x] 1.1 Create `src/components/tenders/required-documents-list.tsx`
  - [x] 1.2 Display document name from parsed data
  - [x] 1.3 Show page reference if available
  - [x] 1.4 Show mandatory/optional badge for each document
  - [x] 1.5 Add category badge (administratif, technique, financier)

- [x] Task 2: Add Documents Tab to Project Workspace (AC: #2, #3)
  - [x] 2.1 Add "Checklist" tab to project-workspace.tsx
  - [x] 2.2 Fetch parsed RC data using getParsedData query
  - [x] 2.3 Display RequiredDocumentsList component
  - [x] 2.4 Show empty state when no RC or parsing not complete

- [x] Task 3: Add Loading and Error States (AC: #2)
  - [x] 3.1 Show skeleton while loading parsed data
  - [x] 3.2 Show message if RC not uploaded
  - [x] 3.3 Show message if parsing not complete or failed

- [x] Task 4: Verification (AC: #6, #7, #8)
  - [x] 4.1 Run `pnpm typecheck`
  - [x] 4.2 Run `pnpm lint`
  - [x] 4.3 Run `pnpm build`

## Dev Notes

### Existing Code References

**Parsed Data Structure** (`src/server/services/ai/rc-parser.ts`):
```typescript
interface RequiredDocument {
  name: string;
  category: "administratif" | "technique" | "financier";
  mandatory: boolean;
  pageReference?: number;
  description?: string;
}

interface RCParsedData {
  requiredDocuments: RequiredDocument[];
  // ... other fields
}
```

**Get Parsed Data Query** (`src/server/api/routers/tenderDocuments.ts`):
```typescript
getParsedData: protectedProcedure
  .input(z.object({ documentId: z.string() }))
  .query(...)
```

### UI Design

**Required Documents List:**
- Card with header "Documents Requis"
- List of documents with:
  - Document name (bold)
  - Category badge (colored: bleu=admin, vert=technique, orange=financier)
  - Mandatory badge (rouge) or Optional badge (gris)
  - Page reference if available (muted text)
- Empty state when no documents extracted

### Component Structure

```
RequiredDocumentsList
├── Header (count of documents)
├── DocumentItem (for each document)
│   ├── Name
│   ├── CategoryBadge
│   ├── MandatoryBadge
│   └── PageReference
└── EmptyState (if no documents)
```

### References

- [Source: epics.md#Story 4.2: Extraction Liste Documents Requis]
- [Story 4.1: Parsing Automatique du RC] - provides parsed data

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/components/tenders/required-documents-list.tsx` | Created | Component to display extracted required documents |
| `src/components/tenders/project-workspace.tsx` | Modified | Added Checklist tab with parsed data query and RequiredDocumentsList |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story created | Epic 4 Story 4.2 |
| 2026-01-17 | RequiredDocumentsList component created | Display extracted documents from RC parsing |
| 2026-01-17 | Checklist tab enabled | Integration in project workspace |
| 2026-01-17 | Loading/error states added | Handle RC not uploaded, parsing in progress/failed states |

### Completion Notes

- RequiredDocumentsList component displays documents extracted from parsed RC
- Each document shows: name, category badge (colored), mandatory/optional badge, page reference
- Empty state when no documents extracted
- Loading skeleton while fetching parsed data
- Checklist tab shows contextual messages for:
  - No RC uploaded (with button to go to Documents tab)
  - Parsing in progress (with spinner)
  - Parsing failed (with error message)
  - Parsing pending (waiting message)
- All validations pass: typecheck, lint, build
