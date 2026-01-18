# Story 6.4: Preview Temps Réel

Status: done

## Story

As a **CHEF**,
I want **to see a PDF preview during editing**,
So that **I can visualize the final rendering**.

## Acceptance Criteria

1. [x] Preview panel on the right or in split view
2. [x] Real-time updates as content changes
3. [x] Zoom and navigation in preview
4. [x] Toggle to show/hide preview

5. [x] `pnpm typecheck` passes
6. [x] `pnpm lint` passes
7. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Create DocumentPreview Component
  - [x] 1.1 Create `src/components/demands/document-preview.tsx`
  - [x] 1.2 Implement PDF-like layout with A4 dimensions
  - [x] 1.3 Render document header with title and metadata
  - [x] 1.4 Render sections with numbered headings
  - [x] 1.5 Add document footer with date

- [x] Task 2: Implement Zoom Controls
  - [x] 2.1 Add zoom in/out buttons (50%-200%)
  - [x] 2.2 Add zoom reset button
  - [x] 2.3 Display current zoom percentage
  - [x] 2.4 Scale content using CSS transform

- [x] Task 3: Add Page Navigation
  - [x] 3.1 Calculate approximate page count
  - [x] 3.2 Add previous/next page buttons
  - [x] 3.3 Display current page / total pages
  - [x] 3.4 Smooth scroll to page

- [x] Task 4: Add Fullscreen Mode
  - [x] 4.1 Add fullscreen toggle button
  - [x] 4.2 Use Fullscreen API
  - [x] 4.3 Listen for fullscreen state changes

- [x] Task 5: Integrate into Workspace
  - [x] 5.1 Add previewOpen state
  - [x] 5.2 Add toggle button in header
  - [x] 5.3 Add preview panel (fixed position)
  - [x] 5.4 Adjust main content margin when preview is open
  - [x] 5.5 Handle co-existence with chat panel

- [x] Task 6: Verification
  - [x] 6.1 Run `pnpm typecheck`
  - [x] 6.2 Run `pnpm lint`
  - [x] 6.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**DocumentPreview Component:**
- PDF-like layout with A4 page dimensions (210mm × 297mm)
- White background with shadow for page effect
- Document header with title, reference, border
- Metadata grid showing key project information
- Numbered section headings with primary color
- HTML content rendering using dangerouslySetInnerHTML (for rich text)
- Footer with generation date

**Zoom Features:**
| Control | Action |
|---------|--------|
| Zoom In (+) | Increase by 25%, max 200% |
| Zoom Out (-) | Decrease by 25%, min 50% |
| Reset | Return to 100% |
| Display | Shows current percentage |

**Page Navigation:**
- Approximate page calculation based on content height
- Previous/Next buttons
- Current page / total pages display
- Smooth scroll animation

**Panel Layout:**
- Fixed position on the right side
- 500px width
- Positioned to the left of chat panel when both are open
- Z-index layering: Preview (30), Chat (40), FAB (50)
- Main content margin adjusts dynamically

**Real-time Updates:**
- Preview receives sections prop directly from state
- Updates automatically when sections change
- No debounce needed (UI is already responsive)

### File Size Impact

The `/demandes/[id]` page increased from 157 kB to 160 kB due to DocumentPreview component.

### Files Created/Modified

**New:**
- `src/components/demands/document-preview.tsx` - DocumentPreview component

**Modified:**
- `src/components/demands/demand-workspace.tsx` - Added preview toggle and panel

### References

- [Source: epics-demande-v1.md#Story 6.4]
- DocumentPreview: `src/components/demands/document-preview.tsx`
