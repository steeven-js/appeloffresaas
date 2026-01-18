# Story 3.7: Archivage Demande

Status: done

## Story

As a **CHEF**,
I want **to archive a completed demand**,
So that **I can keep a history without cluttering my active list**.

## Acceptance Criteria

1. ✅ "Archiver" action available for demands
2. ✅ Separate view for archives (tab)
3. ✅ Ability to unarchive
4. ✅ `pnpm typecheck` passes
5. ✅ `pnpm lint` passes
6. ✅ `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Verify existing implementation
  - [x] 1.1 Router archive mutation - EXISTS
  - [x] 1.2 Router unarchive mutation - EXISTS
  - [x] 1.3 UI Archive button in list dropdown - EXISTS
  - [x] 1.4 UI Archive button in workspace - EXISTS
  - [x] 1.5 "Archivés" tab in status filters - EXISTS
  - [x] 1.6 Unarchive button when archived - EXISTS
  - [x] 1.7 Confirmation dialog - EXISTS

- [x] Task 2: Verification
  - [x] 2.1 Run `pnpm typecheck`
  - [x] 2.2 Run `pnpm lint`
  - [x] 2.3 Run `pnpm build`

## Dev Notes

### Existing Implementation

The archive feature was fully implemented in Sprint R1:

**Router** (`demandProjects.ts`):
- `archive` mutation: Sets status to "archived", sets archivedAt timestamp
- `unarchive` mutation: Resets status to "draft", clears archivedAt

**UI List** (`demand-projects-list.tsx`):
- "Archiver" in dropdown menu with confirmation dialog
- "Désarchiver" shown when status is "archived"
- "Archivés" tab in status filter tabs
- Archived projects filtered separately

**UI Workspace** (`demand-workspace.tsx`):
- Archive/Unarchive button based on current status
- Loading state during mutation

### No Changes Required

All acceptance criteria were already met by existing implementation.

### References

- [Source: epics-demande-v1.md#Story 3.7]
- Router: `src/server/api/routers/demandProjects.ts`
- Components: `demand-projects-list.tsx`, `demand-workspace.tsx`
