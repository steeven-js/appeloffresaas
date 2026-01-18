# Story 3.2: Informations du Besoin

Status: done

## Story

As a **CHEF**,
I want **to describe my need in detail**,
So that **the Administration understands exactly what I'm requesting**.

## Acceptance Criteria

1. ✅ Section "Contexte & Justification" (why this need)
2. ✅ Section "Description du besoin" (what exactly)
3. ✅ Section "Contraintes" (technical, legal, deadline constraints)
4. ✅ Automatic save on each modification (debounced)
5. ✅ `pnpm typecheck` passes
6. ✅ `pnpm lint` passes
7. ✅ `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Implement autosave functionality
  - [x] 1.1 Add debounced form watcher
  - [x] 1.2 Show save indicator (saving/saved/error)
  - [x] 1.3 Handle save errors gracefully

- [x] Task 2: Improve workspace sections UX
  - [x] 2.1 Reorganize form with clear section cards
  - [x] 2.2 Add helpful descriptions for each section
  - [x] 2.3 Improve read-only view with better section display

- [x] Task 3: Verification
  - [x] 3.1 Run `pnpm typecheck`
  - [x] 3.2 Run `pnpm lint`
  - [x] 3.3 Run `pnpm build`

## Dev Notes

### Existing Implementation

The workspace (`demand-workspace.tsx`) already has:
- `context` field (textarea)
- `description` field (textarea)
- `constraints` field (textarea)
- Manual save with "Enregistrer" button

### Missing Features

1. **Autosave** - Need to implement:
   - Watch form changes with `useEffect` + debounce
   - Auto-trigger mutation on change
   - Show save status indicator (Saving... / Saved)

2. **Better UX** - Sections need:
   - Clear visual separation
   - Helpful placeholder text
   - Better organization in view mode

### References

- [Source: epics-demande-v1.md#Story 3.2]
- Component: `src/components/demands/demand-workspace.tsx`
