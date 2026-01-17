# Story 3.7: Suppression Projet AO

Status: done

## Story

As a **user**,
I want **to delete a tender project**,
So that **I can remove projects I no longer need**.

## Acceptance Criteria

1. Given I have a tender project
2. When I click "Supprimer" and confirm
3. Then the project and all associated data are permanently deleted
4. And the project no longer appears in any list
5. And I see a confirmation message
6. Given the project has submitted status, I see a warning
7. `pnpm typecheck` passes
8. `pnpm lint` passes
9. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Verify existing API infrastructure (AC: #3, #4)
  - [x] 1.1 delete mutation exists in tenderProjectsRouter
  - [x] 1.2 Cascading delete for associated documents

- [x] Task 2: Enhance delete dialog in project list (AC: #2, #5, #6)
  - [x] 2.1 Add warning for submitted/won/lost projects
  - [x] 2.2 Show AlertTriangle icon for warning

- [x] Task 3: Add delete to project workspace (AC: #2, #5, #6)
  - [x] 3.1 Add deleteDialogOpen state
  - [x] 3.2 Add deleteMutation
  - [x] 3.3 Add Supprimer button in header
  - [x] 3.4 Add AlertDialog with warning for submitted projects
  - [x] 3.5 Redirect to /projects after deletion

- [x] Task 4: Verification (AC: #7, #8, #9)
  - [x] 4.1 Run `pnpm typecheck`
  - [x] 4.2 Run `pnpm lint`
  - [x] 4.3 Run `pnpm build`

## Dev Notes

### Delete Confirmation Dialog

The dialog shows:
- **Title**: "Supprimer ce projet ?"
- **Description**: Project title + info about irreversible action
- **Warning** (for submitted/won/lost): Alert triangle + message about losing submission history
- **Actions**: Annuler / Supprimer (destructive style)

### API Behavior

| Action | Effect |
|--------|--------|
| Delete | Permanently removes project |
| | Cascading delete for all associated documents |
| | User redirected to /projects |

### UI Locations

1. **Project List**: Dropdown menu → "Supprimer" → Opens confirmation dialog
2. **Project Workspace**: Header button → "Supprimer" → Opens confirmation dialog

### Warning for Submitted Projects

When deleting a project with status `submitted`, `won`, or `lost`:
- AlertTriangle icon displayed
- Warning message: "Ce projet a été soumis. Supprimer un projet soumis effacera définitivement tout l'historique de cette candidature."

### Redirect Flow

After deletion:
1. Project is permanently deleted from database
2. Associated documents are cascade deleted
3. User is redirected to `/projects`

### References

- [Source: epics.md#Story 3.7: Suppression Projet AO]
- [FR27: Delete project with confirmation]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/components/tenders/tender-projects-list.tsx` | Modified | Enhanced delete dialog with warning |
| `src/components/tenders/project-workspace.tsx` | Modified | Delete button and confirmation dialog |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story implementation | Epic 3 Story 3.7 - Delete projects |
| 2026-01-17 | Enhanced delete dialog | Added warning for submitted projects |
| 2026-01-17 | Added workspace delete | Delete from project page with dialog |

### Completion Notes

- All acceptance criteria satisfied
- Delete confirmation dialog with irreversible warning
- Special warning for submitted/won/lost projects
- Both project list and workspace have delete functionality
- Redirect to projects list after deletion
- All validations pass: typecheck, lint, build
