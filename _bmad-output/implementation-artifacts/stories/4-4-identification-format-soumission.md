# Story 4.4: Identification Format Soumission

Status: done

## Story

As a **user**,
I want **the system to identify the submission format requirements**,
So that **I know how to submit my response (PDF, paper, platform)**.

## Acceptance Criteria

1. Given the RC has been parsed
2. When I view the project details
3. Then I see the identified submission format (PDF, papier, plateforme dématérialisée)
4. And I see any specific platform mentioned (PLACE, AWS, etc.)
5. And I see format requirements (max file size, naming convention)
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Create Submission Format Card Component (AC: #3, #4, #5)
  - [x] 1.1 Create `src/components/tenders/submission-format-card.tsx`
  - [x] 1.2 Display submission format (papier, pdf, plateforme)
  - [x] 1.3 Display platform name if available
  - [x] 1.4 Display max file size if available
  - [x] 1.5 Display naming convention if available

- [x] Task 2: Integrate in Checklist Tab (AC: #2, #3)
  - [x] 2.1 Add SubmissionFormatCard to checklist tab
  - [x] 2.2 Show above CategorizedDocumentsList
  - [x] 2.3 Handle empty state when no format info

- [x] Task 3: Verification (AC: #6, #7, #8)
  - [x] 3.1 Run `pnpm typecheck`
  - [x] 3.2 Run `pnpm lint`
  - [x] 3.3 Run `pnpm build`

## Dev Notes

### Existing Code References

**RCParsedData Interface** (`src/server/services/ai/rc-parser.ts`):
```typescript
interface RCParsedData {
  submissionFormat?: "papier" | "pdf" | "plateforme";
  platform?: string;
  maxFileSize?: string;
  namingConvention?: string;
  // ...other fields
}
```

### UI Design

**Submission Format Card:**
- Card with header "Format de Soumission"
- Icon based on format type (File, Globe, Printer)
- Main format displayed prominently
- Platform badge if applicable
- Format details (file size, naming convention) as secondary info
- Empty state when no format info extracted

### References

- [Source: epics.md#Story 4.4: Identification Format Soumission]
- [Story 4.1: Parsing Automatique du RC] - provides parsed data

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/components/tenders/submission-format-card.tsx` | Created | Card component displaying submission format info |
| `src/components/tenders/project-workspace.tsx` | Modified | Added SubmissionFormatCard to checklist tab |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story created | Epic 4 Story 4.4 |
| 2026-01-17 | Created SubmissionFormatCard | Display submission format requirements |
| 2026-01-17 | Integrated in workspace | Added above CategorizedDocumentsList |

### Completion Notes

- SubmissionFormatCard displays submission format requirements extracted from RC
- Three format types supported: papier (Printer icon), pdf (FileText icon), plateforme (Globe icon)
- Each format has colored background (amber, blue, green)
- Platform name shown as badge if available
- Details section shows: platform name, max file size, naming convention
- Empty state when no format info extracted
- Loading skeleton state
- All validations pass: typecheck, lint, build
