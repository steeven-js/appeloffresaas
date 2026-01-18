# Story 6.3: Structure Flexible

Status: done

## Story

As a **CHEF**,
I want **to reorganize the sections of my demand**,
So that **I can adapt it to my specific needs**.

## Acceptance Criteria

1. [x] Drag & drop section reordering
2. [x] Add custom sections
3. [x] Delete optional sections
4. [x] Rename sections
5. [x] `pnpm typecheck` passes
6. [x] `pnpm lint` passes
7. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Database Schema
  - [x] 1.1 Add DemandSection interface to schema
  - [x] 1.2 Add sections jsonb field to demand_projects
  - [x] 1.3 Push schema changes to database

- [x] Task 2: Install Dependencies
  - [x] 2.1 Install @dnd-kit/core
  - [x] 2.2 Install @dnd-kit/sortable
  - [x] 2.3 Install @dnd-kit/utilities

- [x] Task 3: Create SectionEditor Component
  - [x] 3.1 Create `src/components/demands/section-editor.tsx`
  - [x] 3.2 Implement SortableSection with drag handle
  - [x] 3.3 Add inline title editing
  - [x] 3.4 Add delete confirmation dialog
  - [x] 3.5 Add AI generation button per section
  - [x] 3.6 Add collapsible sections
  - [x] 3.7 Add "Add section" UI

- [x] Task 4: Update tRPC Router
  - [x] 4.1 Add sectionSchema to demandProjectSchema
  - [x] 4.2 Add updateSections mutation (optimized for autosave)
  - [x] 4.3 Sync sections with legacy fields (context, description, constraints)

- [x] Task 5: Integrate into Workspace
  - [x] 5.1 Add sections state and initialization
  - [x] 5.2 Add updateSections mutation
  - [x] 5.3 Add debounced sections autosave
  - [x] 5.4 Add section draft generation handler
  - [x] 5.5 Replace hardcoded sections with SectionEditor

- [x] Task 6: Verification
  - [x] 6.1 Run `pnpm typecheck`
  - [x] 6.2 Run `pnpm lint`
  - [x] 6.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**DemandSection Interface:**
```typescript
interface DemandSection {
  id: string;
  title: string;
  content: string;
  isDefault: boolean;  // true for context, description, constraints
  isRequired: boolean; // cannot be deleted if true
  order: number;
}
```

**Default Sections:**
| ID | Title | Required |
|----|-------|----------|
| context | Contexte & Justification | Yes |
| description | Description du besoin | Yes |
| constraints | Contraintes identifiées | No |

**Drag & Drop:**
- Uses @dnd-kit for accessible drag and drop
- PointerSensor and KeyboardSensor for mouse and keyboard support
- verticalListSortingStrategy for vertical reordering
- Visual feedback during drag (opacity, border)

**Section Features:**
- Collapsible content (chevron toggle)
- Inline title editing (click to edit, Enter to save, Escape to cancel)
- AI generation button (maps to legacy section types)
- Delete button with confirmation (only for non-required sections)
- Drag handle (grip icon)

**Autosave:**
- Debounced save (1 second) on section changes
- updateSections mutation syncs with legacy fields for compatibility
- Separate mutation for sections to avoid full project update

**Backward Compatibility:**
- Existing demands without sections are initialized with default sections from legacy fields
- updateSections mutation writes to both sections jsonb and legacy fields

### File Size Impact

The `/demandes/[id]` page increased from 140 kB to 157 kB due to @dnd-kit libraries.

### Files Created/Modified

**New:**
- `src/components/demands/section-editor.tsx` - SectionEditor component

**Modified:**
- `src/server/db/schema/demands.ts` - Added DemandSection interface and sections field
- `src/server/api/routers/demandProjects.ts` - Added sectionSchema and updateSections mutation
- `src/components/demands/demand-workspace.tsx` - Integrated SectionEditor

### References

- [Source: epics-demande-v1.md#Story 6.3]
- @dnd-kit docs: https://dndkit.com/
- SectionEditor: `src/components/demands/section-editor.tsx`
