# Story 2.9: Catégorisation Documents

Status: done

## Story

As a **user**,
I want **to categorize my documents in the vault**,
So that **I can filter and find documents more easily**.

## Acceptance Criteria

1. Given I have documents in my vault
2. When I assign a category (Kbis, Attestation URSSAF, Certificat, CV, etc.)
3. Then the document is tagged with that category
4. And I can filter the vault by category
5. And I can change a document's category later
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Verify existing schema has category support (AC: #2, #3)
  - [x] 1.1 Confirm DOCUMENT_CATEGORIES constant exists
  - [x] 1.2 Confirm companyDocuments.category field exists
  - [x] 1.3 Confirm update mutation supports category changes

- [x] Task 2: Add category labels (AC: #2, #3)
  - [x] 2.1 Create CATEGORY_LABELS map with French translations
  - [x] 2.2 Create getCategoryLabel helper function

- [x] Task 3: Add category editing UI (AC: #2, #3, #5)
  - [x] 3.1 Add Dialog component for category editing
  - [x] 3.2 Add Select component with all categories
  - [x] 3.3 Add clickable badge/button to trigger edit
  - [x] 3.4 Connect to update mutation
  - [x] 3.5 Show "Add category" link for uncategorized documents

- [x] Task 4: Add category filter UI (AC: #4)
  - [x] 4.1 Add selectedCategory state
  - [x] 4.2 Add getCategoryCounts query
  - [x] 4.3 Create filter buttons showing active categories
  - [x] 4.4 Filter documents by selected category
  - [x] 4.5 Show "Uncategorized" filter when applicable
  - [x] 4.6 Update empty state message based on filter

- [x] Task 5: Verification (AC: #6, #7, #8)
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Category Labels

```typescript
const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  kbis: "Kbis",
  attestation_fiscale: "Attestation fiscale",
  attestation_sociale: "Attestation sociale (URSSAF)",
  assurance_rc: "Assurance RC Pro",
  assurance_decennale: "Assurance décennale",
  certification: "Certification / Qualification",
  reference_projet: "Référence projet",
  cv: "CV",
  organigramme: "Organigramme",
  bilan: "Bilan comptable",
  autre: "Autre",
};
```

### Features Implemented

1. **Category Edit Dialog** - Click on the category badge (or "Add category" link) to open a dialog with a select dropdown
2. **Category Filter Pills** - Filter buttons at the top of the document list showing:
   - "Tous" (all documents)
   - Active categories (only those with documents)
   - "Non catégorisé" (uncategorized documents)
3. **Real-time Updates** - Category counts update immediately when documents are added/modified/deleted

### References

- [Source: epics.md#Story 2.9: Catégorisation Documents]
- [FR15: User can categorize documents in vault]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/components/documents/document-vault.tsx` | Modified | Added category labels, edit dialog, and filter UI |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story implementation | Epic 2 Story 2.9 - Document categorization |

### Completion Notes

- All acceptance criteria satisfied
- Category editing via dialog with select dropdown
- Category filtering with pill-style buttons
- Shows only active categories in filter
- Uncategorized filter available when applicable
- Real-time updates to category counts
- All validations pass: typecheck, lint, build
