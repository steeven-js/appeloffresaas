# Story 3.4: Liste des Demandes

Status: done

## Story

As a **CHEF**,
I want **to see all my demands with their status**,
So that **I can track their progress**.

## Acceptance Criteria

1. ✅ List with columns: title, date, status, urgency
2. ✅ Filters by status
3. ✅ Search by title
4. ✅ Sort by date/status/urgency
5. ✅ Quick actions (open, duplicate, delete)
6. ✅ `pnpm typecheck` passes
7. ✅ `pnpm lint` passes
8. ✅ `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Analyze existing implementation
  - [x] 1.1 Status filters - ALREADY EXISTS (Tabs)
  - [x] 1.2 Quick actions - ALREADY EXISTS (Dropdown menu)
  - [x] 1.3 Card display - ALREADY EXISTS

- [x] Task 2: Add search functionality
  - [x] 2.1 Add search input field with icon
  - [x] 2.2 Filter projects by title, reference, department (client-side)
  - [x] 2.3 Add empty state for search with no results

- [x] Task 3: Add sort functionality
  - [x] 3.1 Add sort dropdown (date, title, urgency, status)
  - [x] 3.2 Implement sorting logic (6 options)

- [x] Task 4: Verification
  - [x] 4.1 Run `pnpm typecheck`
  - [x] 4.2 Run `pnpm lint`
  - [x] 4.3 Run `pnpm build`

## Dev Notes

### Existing Implementation

The `demand-projects-list.tsx` already has:
- Status filters using Tabs (all, draft, in_review, approved, archived)
- Quick actions in dropdown (edit, duplicate, archive, delete)
- Card display with urgency, budget, completion percentage
- Stats cards showing counts by status

### Missing Features

1. **Search by title** - Need to add Input field with search icon
2. **Sort functionality** - Need to add dropdown for sort options

### References

- [Source: epics-demande-v1.md#Story 3.4]
- Component: `src/components/demands/demand-projects-list.tsx`
