# Story 3.5: Duplication Demande

Status: done

## Story

As a **CHEF**,
I want **to duplicate an existing demand**,
So that **I can reuse a structure for a similar need**.

## Acceptance Criteria

1. ✅ "Dupliquer" button on each demand (dropdown menu)
2. ✅ Copy all fields except title and dates
3. ✅ New title with "(copie)" suffix
4. ✅ Status reset to "draft"
5. ✅ `pnpm typecheck` passes
6. ✅ `pnpm lint` passes
7. ✅ `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Verify existing implementation
  - [x] 1.1 Router duplicate mutation - EXISTS
  - [x] 1.2 UI duplicate button in dropdown - EXISTS
  - [x] 1.3 Dialog for new title - EXISTS
  - [x] 1.4 Option to save as template - EXISTS

- [x] Task 2: Update duplicate to include new fields
  - [x] 2.1 Add needType to copy
  - [x] 2.2 Reset budgetValidated to 0
  - [x] 2.3 Copy urgencyJustification

- [x] Task 3: Verification
  - [x] 3.1 Run `pnpm typecheck`
  - [x] 3.2 Run `pnpm lint`
  - [x] 3.3 Run `pnpm build`

## Dev Notes

### Existing Implementation

The duplication feature was already implemented in Sprint R1:
- Router: `demandProjects.duplicate` mutation
- UI: Dropdown menu "Dupliquer" option
- Dialog: Custom title input + "Save as template" checkbox

### Changes Made

Added missing fields to duplicate mutation:
- `needType: source.needType` - copied from source
- `budgetValidated: 0` - reset (new copy needs validation)
- `urgencyJustification: source.urgencyJustification` - copied

### References

- [Source: epics-demande-v1.md#Story 3.5]
- Router: `src/server/api/routers/demandProjects.ts` (duplicate mutation)
- Component: `src/components/demands/demand-projects-list.tsx` (UI)
