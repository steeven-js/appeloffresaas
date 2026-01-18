# Story 4.3: Catégorisation des Requirements

Status: done

## Story

As a **user**,
I want **extracted requirements categorized by type**,
So that **I can focus on one category at a time**.

## Acceptance Criteria

1. Given the RC has been parsed with requirements extracted
2. When I view the checklist
3. Then requirements are grouped into categories: Administratif, Technique, Financier
4. And I can expand/collapse each category
5. And I see a count of items per category
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Create Categorized Documents Component (AC: #3, #5)
  - [x] 1.1 Create `src/components/tenders/categorized-documents-list.tsx`
  - [x] 1.2 Group documents by category (administratif, technique, financier)
  - [x] 1.3 Display count per category in header
  - [x] 1.4 Use Collapsible component for expand/collapse

- [x] Task 2: Add Expand/Collapse Functionality (AC: #4)
  - [x] 2.1 Implement collapsible sections using Radix UI Collapsible
  - [x] 2.2 Add chevron icon to indicate expand/collapse state
  - [x] 2.3 All categories expanded by default

- [x] Task 3: Integrate in Project Workspace (AC: #2, #3)
  - [x] 3.1 Replace RequiredDocumentsList with CategorizedDocumentsList
  - [x] 3.2 Keep loading/error states from Story 4.2

- [x] Task 4: Verification (AC: #6, #7, #8)
  - [x] 4.1 Run `pnpm typecheck`
  - [x] 4.2 Run `pnpm lint`
  - [x] 4.3 Run `pnpm build`

## Dev Notes

### Existing Code References

**RequiredDocument Type** (`src/server/services/ai/rc-parser.ts`):
```typescript
interface RequiredDocument {
  name: string;
  category: "administratif" | "technique" | "financier";
  mandatory: boolean;
  pageReference?: number;
  description?: string;
}
```

**Current RequiredDocumentsList** (`src/components/tenders/required-documents-list.tsx`):
- Already has categoryConfig with colors
- Will be enhanced/replaced with categorized version

### UI Design

**Categorized Documents List:**
- 3 collapsible sections (Administratif, Technique, Financier)
- Each section header shows:
  - Category icon
  - Category name
  - Count badge
  - Chevron for expand/collapse
- Section content shows DocumentItem components from Story 4.2
- Sections expanded by default

### Component Structure

```
CategorizedDocumentsList
├── CategorySection (administratif)
│   ├── Header (icon, label, count, chevron)
│   └── Content (DocumentItem list)
├── CategorySection (technique)
│   ├── Header (icon, label, count, chevron)
│   └── Content (DocumentItem list)
└── CategorySection (financier)
    ├── Header (icon, label, count, chevron)
    └── Content (DocumentItem list)
```

### References

- [Source: epics.md#Story 4.3: Catégorisation des Requirements]
- [Story 4.2: Extraction Liste Documents Requis] - provides base component

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/components/ui/collapsible.tsx` | Created | Radix UI Collapsible component wrapper |
| `src/components/tenders/categorized-documents-list.tsx` | Created | Component grouping documents by category with expand/collapse |
| `src/components/tenders/project-workspace.tsx` | Modified | Replaced RequiredDocumentsList with CategorizedDocumentsList |
| `package.json` | Modified | Added @radix-ui/react-collapsible dependency |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story created | Epic 4 Story 4.3 |
| 2026-01-17 | Installed @radix-ui/react-collapsible | Required for collapsible sections |
| 2026-01-17 | Created Collapsible UI component | Wrapper for Radix UI |
| 2026-01-17 | Created CategorizedDocumentsList | Groups documents by category |
| 2026-01-17 | Integrated in workspace | Replaced RequiredDocumentsList |

### Completion Notes

- Documents are grouped into 3 collapsible sections: Administratif, Technique, Financier
- Each section has a colored header with icon, label, count badge, and chevron
- All sections are expanded by default (state managed with useState)
- Categories with no documents are hidden
- Chevron rotates 180° when collapsed
- Border-left visual indicator on document list
- All validations pass: typecheck, lint, build
