# Story 3.6: Suppression Demande

Status: done

## Story

As a **CHEF**,
I want **to delete a demand**,
So that **I can clean up unused drafts**.

## Acceptance Criteria

1. ✅ Confirmation before deletion (AlertDialog)
2. ✅ Deletion impossible if status "sent_to_admin" or "converted_to_ao"
3. ✅ Associated documents deleted (CASCADE in DB)
4. ✅ `pnpm typecheck` passes
5. ✅ `pnpm lint` passes
6. ✅ `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Verify existing implementation
  - [x] 1.1 Router delete mutation - EXISTS
  - [x] 1.2 UI delete button in dropdown - EXISTS
  - [x] 1.3 Confirmation dialog - EXISTS
  - [x] 1.4 CASCADE delete for documents - EXISTS (DB schema)

- [x] Task 2: Add status protection
  - [x] 2.1 Add status check in router (sent_to_admin, converted_to_ao)
  - [x] 2.2 Disable delete button in list when status prevents deletion
  - [x] 2.3 Disable delete button in workspace when status prevents deletion

- [x] Task 3: Verification
  - [x] 3.1 Run `pnpm typecheck`
  - [x] 3.2 Run `pnpm lint`
  - [x] 3.3 Run `pnpm build`

## Dev Notes

### Existing Implementation

The delete feature was already implemented in Sprint R1:
- Router: `demandProjects.delete` mutation
- UI List: Dropdown menu "Supprimer" option + AlertDialog
- UI Workspace: Delete button + AlertDialog
- DB: CASCADE delete for documents

### Changes Made

1. **Router** (`demandProjects.ts`):
   - Added status check before deletion
   - Throws `PRECONDITION_FAILED` error if status is "sent_to_admin" or "converted_to_ao"

2. **UI List** (`demand-projects-list.tsx`):
   - Added `disabled` prop to DropdownMenuItem when status prevents deletion

3. **UI Workspace** (`demand-workspace.tsx`):
   - Added `disabled` prop to Delete button
   - Added tooltip explaining why deletion is disabled

### References

- [Source: epics-demande-v1.md#Story 3.6]
- Router: `src/server/api/routers/demandProjects.ts`
- Components: `demand-projects-list.tsx`, `demand-workspace.tsx`
