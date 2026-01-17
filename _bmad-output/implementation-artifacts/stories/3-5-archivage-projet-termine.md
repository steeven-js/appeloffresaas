# Story 3.5: Archivage Projet Terminé

Status: done

## Story

As a **user**,
I want **to archive completed tender projects**,
So that **my active list stays clean while preserving history**.

## Acceptance Criteria

1. Given I have a tender project that is submitted or expired
2. When I click "Archiver"
3. Then the project moves to the archived section
4. And it no longer appears in the active tenders list
5. And I can still access it from the archives
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Verify existing API infrastructure (AC: #3)
  - [x] 1.1 archive mutation exists in tenderProjectsRouter
  - [x] 1.2 unarchive mutation exists in tenderProjectsRouter
  - [x] 1.3 List query filters archived projects correctly

- [x] Task 2: Add archive confirmation dialog (AC: #2)
  - [x] 2.1 Add archiveDialogOpen state to ProjectCard
  - [x] 2.2 Create AlertDialog for archive confirmation
  - [x] 2.3 Show confirmation message with project title

- [x] Task 3: Add unarchive functionality (AC: #5)
  - [x] 3.1 Add unarchiveMutation to ProjectCard
  - [x] 3.2 Import ArchiveRestore icon
  - [x] 3.3 Show "Désarchiver" option for archived projects
  - [x] 3.4 Show "Archiver" option for non-archived projects

- [x] Task 4: Add archive to project workspace (AC: #2)
  - [x] 4.1 Import Archive and ArchiveRestore icons
  - [x] 4.2 Add archive/unarchive mutations
  - [x] 4.3 Add Archive/Désarchiver button in header
  - [x] 4.4 Redirect to projects list after archiving

- [x] Task 5: Verification (AC: #6, #7, #8)
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Archive Flow

**From Project List:**
1. Click dropdown menu on project card
2. Click "Archiver"
3. Confirmation dialog appears
4. Confirm to archive
5. Project moves to "Archivés" tab

**From Project Workspace:**
1. Click "Archiver" button in header
2. Project is archived
3. User is redirected to /projects

### Unarchive Flow

**From Project List (Archivés tab):**
1. Click dropdown menu on archived project
2. Click "Désarchiver"
3. Project moves back to "Tous" with status "Brouillon"

**From Project Workspace:**
1. Click "Désarchiver" button in header
2. Project status changes to "Brouillon"
3. User stays on workspace

### API Behavior

| Action | Status Change | archivedAt |
|--------|---------------|------------|
| Archive | → "archived" | Set to now |
| Unarchive | → "draft" | Set to null |

### UI States

**Project Card Dropdown:**
- Non-archived: Shows "Archiver" with Archive icon
- Archived: Shows "Désarchiver" with ArchiveRestore icon

**Project Workspace Header:**
- Non-archived: Shows "Archiver" button
- Archived: Shows "Désarchiver" button

### Confirmation Dialog

Archive confirmation shows:
- Title: "Archiver ce projet ?"
- Description: Project title + info about accessing from archives
- Actions: Annuler / Archiver

### References

- [Source: epics.md#Story 3.5: Archivage Projet Terminé]
- [FR25: Archive completed projects]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/components/tenders/tender-projects-list.tsx` | Modified | Archive dialog, unarchive option |
| `src/components/tenders/project-workspace.tsx` | Modified | Archive/unarchive buttons |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story implementation | Epic 3 Story 3.5 - Archive projects |
| 2026-01-17 | Added archive confirmation | User confirmation before archiving |
| 2026-01-17 | Added unarchive option | Restore archived projects |
| 2026-01-17 | Added workspace archive button | Archive from project page |

### Completion Notes

- All acceptance criteria satisfied
- Archive confirmation dialog prevents accidental archiving
- Unarchive restores project to "Brouillon" status
- Both project list and workspace have archive functionality
- All validations pass: typecheck, lint, build
