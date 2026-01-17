# Story 3.4: Liste des Projets AO avec Statuts

Status: done

## Story

As a **user**,
I want **to view all my tender projects with their status**,
So that **I can track progress across multiple tenders**.

## Acceptance Criteria

1. Given I have multiple tender projects
2. When I go to the tenders list page
3. Then I see all my projects sorted by deadline (soonest first)
4. And each project shows: name, client, deadline, status, completion %
5. And I can filter by status (Brouillon, En cours, Soumis, Archivé)
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Fix sorting order in API (AC: #3)
  - [x] 1.1 Import asc and sql from drizzle-orm
  - [x] 1.2 Update orderBy to sort by deadline ascending (soonest first)
  - [x] 1.3 Put projects with NULL deadlines at the end

- [x] Task 2: Add completion percentage calculation (AC: #4)
  - [x] 2.1 Create calculateCompletion() function
  - [x] 2.2 Query RC documents to check for each project
  - [x] 2.3 Calculate score based on: title, deadline, buyer, reference, amount, RC
  - [x] 2.4 Return completionPercentage with each project

- [x] Task 3: Update frontend display (AC: #4)
  - [x] 3.1 Add completionPercentage to TenderProject interface
  - [x] 3.2 Import Progress component
  - [x] 3.3 Display completion bar with color coding in ProjectCard

- [x] Task 4: Add status filters (AC: #5)
  - [x] 4.1 Create StatusFilter type
  - [x] 4.2 Replace Actifs/Archivés tabs with status filter tabs
  - [x] 4.3 Add counts badges to each filter tab
  - [x] 4.4 Update API query to filter by status
  - [x] 4.5 Add click handler to navigate to project workspace

- [x] Task 5: Verification (AC: #6, #7, #8)
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Sorting Logic

Projects are now sorted by:
1. Projects with deadlines first (CASE WHEN NULL THEN 1 ELSE 0 END)
2. Deadline ascending (soonest first)
3. Created date descending (newest first for same deadline)

### Completion Percentage Calculation

Score is calculated out of 6 points:
| Field | Points | Notes |
|-------|--------|-------|
| Title | 1 | Always present (required) |
| Deadline | 1 | submissionDeadline set |
| Buyer name | 1 | buyerName filled |
| Reference | 1 | reference filled |
| Amount | 1 | estimatedAmount set |
| RC Document | 1 | Has uploaded RC |

Formula: `Math.round((score / 6) * 100)`

### Completion Color Coding

| Percentage | Color |
|------------|-------|
| >= 80% | Green |
| 50-79% | Blue |
| < 50% | Orange |

### Status Filters

| Filter | API Query | Display |
|--------|-----------|---------|
| Tous | No status filter | All non-archived |
| Brouillon | status: "draft" | Draft projects |
| En cours | status: "in_progress" | In progress |
| Soumis | status: "submitted" | Submitted |
| Archivés | includeArchived: true | Archived only |

Each filter tab shows count badges with color-coded styling.

### Card Click Navigation

Clicking on a project card now navigates to `/projects/{id}` workspace.

### References

- [Source: epics.md#Story 3.4: Liste des Projets AO avec Statuts]
- [FR24: Project list with status filters and completion]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/server/api/routers/tenderProjects.ts` | Modified | Added sorting, completion calculation |
| `src/components/tenders/tender-projects-list.tsx` | Modified | Status filters, completion display, navigation |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story implementation | Epic 3 Story 3.4 - Project list with statuses |
| 2026-01-17 | Fixed sorting order | Soonest deadline first |
| 2026-01-17 | Added completion % | Track project progress |
| 2026-01-17 | Added status filters | Filter by Brouillon/En cours/Soumis/Archivé |

### Completion Notes

- All acceptance criteria satisfied
- Projects sorted by deadline (soonest first)
- Each project shows: name, client, deadline, status, completion %
- Status filters work correctly with count badges
- Card click navigates to project workspace
- All validations pass: typecheck, lint, build
