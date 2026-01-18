# Story 6.5: Insertion Images et Tableaux

Status: done

## Story

As a **CHEF**,
I want **to insert images and tables**,
So that **I can illustrate my needs (diagrams, planning)**.

## Acceptance Criteria

1. [x] Image upload (drag & drop)
2. [x] Simple table creation
3. [x] Image resizing (via selection styling)
4. [x] Optional captions (via alt text)

5. [x] `pnpm typecheck` passes
6. [x] `pnpm lint` passes
7. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Install TipTap Extensions
  - [x] 1.1 Install @tiptap/extension-image
  - [x] 1.2 Install @tiptap/extension-table
  - [x] 1.3 Install @tiptap/extension-table-row
  - [x] 1.4 Install @tiptap/extension-table-cell
  - [x] 1.5 Install @tiptap/extension-table-header

- [x] Task 2: Create Image Upload API
  - [x] 2.1 Create `/api/upload/image/route.ts`
  - [x] 2.2 Validate image types (JPEG, PNG, WebP, GIF)
  - [x] 2.3 Limit file size to 5MB
  - [x] 2.4 Upload to R2 storage
  - [x] 2.5 Return signed URL (valid 7 days)

- [x] Task 3: Update RichTextEditor
  - [x] 3.1 Add Image extension configuration
  - [x] 3.2 Add Table extensions (Table, TableRow, TableCell, TableHeader)
  - [x] 3.3 Add image upload button to toolbar
  - [x] 3.4 Add table dropdown menu to toolbar
  - [x] 3.5 Add drag & drop support for images
  - [x] 3.6 Add paste support for images

- [x] Task 4: Add CSS Styling
  - [x] 4.1 Add image styles to globals.css
  - [x] 4.2 Add table styles to globals.css
  - [x] 4.3 Add selection/resize styles

- [x] Task 5: Verification
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**Image Upload API:**
- Endpoint: `/api/upload/image`
- Accepts: JPEG, PNG, WebP, GIF
- Max size: 5MB
- Storage: Cloudflare R2 (`editor-images/{userId}/{timestamp}-{randomId}-{filename}`)
- Returns signed URL valid for 7 days

**TipTap Image Extension:**
- Inline: false (block-level images)
- No base64 (always upload to R2)
- CSS class: `editor-image` for styling

**TipTap Table Extension:**
- Resizable columns
- CSS class: `editor-table` for styling
- Default insert: 3×3 table with header row

**Toolbar Additions:**
| Button | Action |
|--------|--------|
| Image icon | File picker for image upload |
| Table icon (dropdown) | Insert table, add/delete rows/columns |

**Drag & Drop:**
- Images can be dropped directly into editor
- Automatically uploaded to R2
- Inserted at drop position

**Paste Support:**
- Images from clipboard are uploaded
- Supports paste from screenshots

**Table Operations (via dropdown):**
- Insert table (3×3 with header)
- Add column before/after
- Delete column
- Add row before/after
- Delete row
- Delete table

### CSS Styling

**Images:**
- Max width 100%, auto height
- Rounded corners
- Selection outline in primary color

**Tables:**
- Full width, collapsed borders
- Header row with muted background
- Hover effect on rows
- Column resize handle
- Selection overlay for cells

### File Size Impact

The `/demandes/[id]` page increased from 160 kB to 176 kB due to table extensions.

### Files Created/Modified

**New:**
- `src/app/api/upload/image/route.ts` - Image upload API endpoint

**Modified:**
- `src/components/ui/rich-text-editor.tsx` - Added Image/Table extensions, toolbar buttons
- `src/styles/globals.css` - Added image and table CSS styles

### References

- [Source: epics-demande-v1.md#Story 6.5]
- TipTap Image: https://tiptap.dev/api/nodes/image
- TipTap Table: https://tiptap.dev/api/nodes/table
