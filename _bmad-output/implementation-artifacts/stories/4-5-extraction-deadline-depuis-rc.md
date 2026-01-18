# Story 4.5: Extraction Deadline depuis RC

Status: done

## Story

As a **user**,
I want **the system to automatically extract the submission deadline from the RC**,
So that **I don't miss the date**.

## Acceptance Criteria

1. Given the RC has been parsed
2. When a deadline is found in the document
3. Then the deadline is suggested for the project
4. And I can confirm, modify, or reject the suggested date
5. And if confirmed, the project deadline is automatically set
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Create Extracted Deadline Card Component (AC: #2, #3)
  - [x] 1.1 Create `src/components/tenders/extracted-deadline-card.tsx`
  - [x] 1.2 Display extracted deadline from parsed data
  - [x] 1.3 Show confirmation buttons (Confirmer, Modifier, Ignorer)
  - [x] 1.4 Handle case where deadline already set on project

- [x] Task 2: Add Mutation for Deadline Confirmation (AC: #5)
  - [x] 2.1 Create `tenderProjects.setDeadlineFromRC` mutation
  - [x] 2.2 Update project submissionDeadline
  - [x] 2.3 Invalidate project cache

- [x] Task 3: Integrate in Checklist Tab (AC: #2, #3, #4)
  - [x] 3.1 Add ExtractedDeadlineCard to checklist tab
  - [x] 3.2 Show between SubmissionFormatCard and CategorizedDocumentsList
  - [x] 3.3 Handle empty state when no deadline extracted

- [x] Task 4: Verification (AC: #6, #7, #8)
  - [x] 4.1 Run `pnpm typecheck`
  - [x] 4.2 Run `pnpm lint`
  - [x] 4.3 Run `pnpm build`

## Dev Notes

### Existing Code References

**RCParsedData Interface** (`src/server/services/ai/rc-parser.ts`):
```typescript
interface RCParsedData {
  deadline?: string; // ISO 8601
  // ...other fields
}
```

**Project submissionDeadline** (`src/server/db/schema/tenders.ts`):
```typescript
submissionDeadline: timestamp("submission_deadline", { withTimezone: true }),
```

### UI Design

**Extracted Deadline Card:**
- Card with header "Date Limite Détectée"
- Display extracted deadline prominently
- Comparison with current project deadline if set
- Three action buttons:
  - "Confirmer" - Sets project deadline to extracted date
  - "Modifier" - Opens datetime picker
  - "Ignorer" - Dismisses the suggestion
- Success state after confirmation

### References

- [Source: epics.md#Story 4.5: Extraction Deadline depuis RC]
- [Story 4.1: Parsing Automatique du RC] - provides parsed data
- [Story 3.3: Définition Deadline Soumission] - project deadline display

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/components/tenders/extracted-deadline-card.tsx` | Created | Card component for deadline confirmation |
| `src/server/api/routers/tenderProjects.ts` | Modified | Added setDeadlineFromRC mutation |
| `src/components/tenders/project-workspace.tsx` | Modified | Added ExtractedDeadlineCard to checklist tab |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story created | Epic 4 Story 4.5 |
| 2026-01-17 | Created ExtractedDeadlineCard | Display and confirm extracted deadline |
| 2026-01-17 | Added setDeadlineFromRC mutation | Update project deadline |
| 2026-01-17 | Integrated in workspace | Added between format and documents |

### Completion Notes

- ExtractedDeadlineCard displays deadline extracted from RC parsing
- Three action buttons: Confirmer (apply), Modifier (edit), Ignorer (dismiss)
- Edit mode with datetime-local input for modification
- Automatic detection if current deadline matches extracted
- Success state after confirmation (green card)
- Synchronized state when deadlines match
- Empty state when no deadline extracted
- Loading skeleton state
- setDeadlineFromRC mutation updates project submissionDeadline
- Cache invalidation after successful update
- All validations pass: typecheck, lint, build
