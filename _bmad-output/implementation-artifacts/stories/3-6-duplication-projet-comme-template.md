# Story 3.6: Duplication Projet comme Template

Status: done

## Story

As a **user**,
I want **to duplicate an existing project as a template**,
So that **I can reuse my work for similar tenders**.

## Acceptance Criteria

1. Given I have an existing tender project
2. When I click "Dupliquer"
3. Then a new project is created with copied content
4. And the new project has a modified name (e.g., "Copie de [original]")
5. And project-specific data (RC, deadline) is cleared
6. And reusable content (methodology, team) is preserved
7. `pnpm typecheck` passes
8. `pnpm lint` passes
9. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Verify existing API infrastructure (AC: #3, #4, #5, #6)
  - [x] 1.1 duplicate mutation exists with asTemplate option
  - [x] 1.2 Clears: reference, lotNumber, publicationDate, submissionDeadline
  - [x] 1.3 Copies: description, buyerType, sourcePlatform, notes
  - [x] 1.4 Default title: "{original} (copie)"

- [x] Task 2: Add duplicate dialog in project list (AC: #2, #4)
  - [x] 2.1 Add duplicateDialogOpen state
  - [x] 2.2 Add duplicateTitle state for customization
  - [x] 2.3 Add saveAsTemplate checkbox option
  - [x] 2.4 Create Dialog with title input and template checkbox
  - [x] 2.5 Update dropdown to open dialog

- [x] Task 3: Add redirect after duplication (AC: #3)
  - [x] 3.1 Update duplicateMutation onSuccess to redirect
  - [x] 3.2 Navigate to /projects/{newProjectId}

- [x] Task 4: Add duplicate to project workspace (AC: #2)
  - [x] 4.1 Import Copy icon
  - [x] 4.2 Add duplicateMutation
  - [x] 4.3 Add Dupliquer button in header
  - [x] 4.4 Redirect to new project on success

- [x] Task 5: Verification (AC: #7, #8, #9)
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Duplicate Dialog

The dialog in project list allows:
- **Title customization**: Pre-filled with "{title} (copie)"
- **Template option**: Checkbox to save as reusable template

### Data Handling

| Field | Copied | Cleared | Notes |
|-------|--------|---------|-------|
| title | ✓ | Modified | Adds " (copie)" suffix |
| description | ✓ | - | Preserved for reuse |
| notes | ✓ | - | Preserved for reuse |
| buyerType | ✓ | - | General setting |
| sourcePlatform | ✓ | - | General setting |
| reference | - | ✓ | Project-specific |
| lotNumber | - | ✓ | Project-specific |
| publicationDate | - | ✓ | Project-specific |
| submissionDeadline | - | ✓ | Project-specific |
| sourceUrl | - | ✓* | Cleared if template |
| buyerName | - | ✓* | Cleared if template |
| estimatedAmount | - | ✓* | Cleared if template |

*Only cleared when saving as template

### Template Mode

When "Enregistrer comme template" is checked:
- `isTemplate` is set to 1
- `templateName` is set to original title
- Additional client-specific fields are cleared

### Redirect Flow

After duplication:
1. New project is created in database
2. User is redirected to `/projects/{newProjectId}`
3. User lands on the duplicated project's workspace

### UI Locations

1. **Project List**: Dropdown menu → "Dupliquer" → Opens dialog
2. **Project Workspace**: Header button → Direct duplicate with default name

### References

- [Source: epics.md#Story 3.6: Duplication Projet comme Template]
- [FR26: Duplicate project as template]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/components/tenders/tender-projects-list.tsx` | Modified | Duplicate dialog with options |
| `src/components/tenders/project-workspace.tsx` | Modified | Duplicate button |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story implementation | Epic 3 Story 3.6 - Duplicate projects |
| 2026-01-17 | Added duplicate dialog | Customize title and template option |
| 2026-01-17 | Added workspace duplicate | Quick duplicate from project page |
| 2026-01-17 | Added redirect | Navigate to duplicated project |

### Completion Notes

- All acceptance criteria satisfied
- Duplicate dialog allows title customization
- Template option clears client-specific data
- Redirect to new project after duplication
- Both project list and workspace have duplicate functionality
- All validations pass: typecheck, lint, build
