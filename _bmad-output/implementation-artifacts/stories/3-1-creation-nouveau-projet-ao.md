# Story 3.1: Création Nouveau Projet AO

Status: done

## Story

As a **user**,
I want **to create a new tender project**,
So that **I can start preparing my response to a specific call for tender**.

## Acceptance Criteria

1. Given I am on the dashboard or tenders list
2. When I click "Nouveau projet AO"
3. Then a new project is created with a default name
4. And I am redirected to the project workspace
5. And the project appears in my tenders list with status "Brouillon"
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Verify existing infrastructure (AC: #3, #5)
  - [x] 1.1 Database schema exists (tenderProjects table)
  - [x] 1.2 CRUD operations exist in tenderProjectsRouter
  - [x] 1.3 TenderProjectsList component with create dialog
  - [x] 1.4 Status "Brouillon" (draft) is default

- [x] Task 2: Create project workspace page (AC: #4)
  - [x] 2.1 Create /projects/[id]/page.tsx route
  - [x] 2.2 Create ProjectWorkspace component
  - [x] 2.3 Display project details and stats
  - [x] 2.4 Add edit mode for project info
  - [x] 2.5 Add status change buttons
  - [x] 2.6 Add placeholder tabs for future features

- [x] Task 3: Add redirect after creation (AC: #4)
  - [x] 3.1 Add useRouter to ProjectFormDialog
  - [x] 3.2 Redirect to /projects/[id] on create success

- [x] Task 4: Verification (AC: #6, #7, #8)
  - [x] 4.1 Run `pnpm typecheck`
  - [x] 4.2 Run `pnpm lint`
  - [x] 4.3 Run `pnpm build`

## Dev Notes

### Existing Infrastructure

The database schema and API were already implemented:
- `src/server/db/schema/tenders.ts` - Full schema with all fields
- `src/server/api/routers/tenderProjects.ts` - Complete CRUD operations
- `src/components/tenders/tender-projects-list.tsx` - List with create dialog

### Project Workspace

New page at `/projects/[id]` with:
- Project header with title, status badge, and reference
- Quick stats cards (deadline, amount, buyer, source)
- Tabbed interface (Overview, Documents, Checklist, Responses)
- Edit mode for modifying project information
- Status change buttons (Brouillon, En cours, Soumis, Gagné, Perdu)

### Redirect Flow

After creating a project:
1. User clicks "Nouveau projet" button
2. Form dialog opens
3. User fills title and optional fields
4. On submit, project is created with status "draft" (Brouillon)
5. User is redirected to `/projects/{newProjectId}`

### Status Labels (French)

| Status | Label | Color |
|--------|-------|-------|
| draft | Brouillon | Secondary |
| in_progress | En cours | Blue |
| submitted | Soumis | Green |
| won | Gagné | Emerald |
| lost | Perdu | Destructive |
| archived | Archivé | Outline |

### Future Features (Tabs)

The workspace includes disabled tabs for:
- Documents (Story 3.2 - RC upload)
- Checklist (Epic 4 - Parsing & Conformité)
- Responses (Epic 5/6 - AI Assistant & Document Editor)

### References

- [Source: epics.md#Story 3.1: Création Nouveau Projet AO]
- [FR21: Create new tender project]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/app/(auth)/projects/[id]/page.tsx` | Created | Project workspace page route |
| `src/components/tenders/project-workspace.tsx` | Created | Project workspace component |
| `src/components/tenders/tender-projects-list.tsx` | Modified | Added redirect after create |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story implementation | Epic 3 Story 3.1 - Create tender project |
| 2026-01-17 | Created project workspace | User redirection after creation |

### Completion Notes

- All acceptance criteria satisfied
- Existing infrastructure (schema, API, list) was already in place
- Created new project workspace page with edit/view modes
- Added redirect to workspace after project creation
- Status "Brouillon" is correctly shown (default status)
- All validations pass: typecheck, lint, build
