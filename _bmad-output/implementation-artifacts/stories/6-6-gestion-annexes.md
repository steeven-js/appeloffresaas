# Story 6.6: Gestion des Annexes

Status: done

## Story

As a **CHEF**,
I want **to add annexes to my demand file**,
So that **I can attach complementary documents**.

## Acceptance Criteria

1. [x] Dedicated "Annexes" section
2. [x] File upload (PDF, images, Excel)
3. [x] Customizable annex order (drag & drop)
4. [x] Automatic numbering for referencing in document body

5. [x] `pnpm typecheck` passes
6. [x] `pnpm lint` passes
7. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Update Database Schema
  - [x] 1.1 Add `displayOrder` field to demandDocuments table
  - [x] 1.2 Add `description` field for optional captions
  - [x] 1.3 Push schema changes with `pnpm db:push`

- [x] Task 2: Update tRPC Router
  - [x] 2.1 Update `list` query to order by displayOrder
  - [x] 2.2 Update `create` mutation to accept displayOrder and description
  - [x] 2.3 Add auto-increment logic for displayOrder
  - [x] 2.4 Add `updateOrder` mutation for reordering
  - [x] 2.5 Add `updateDescription` mutation

- [x] Task 3: Create AnnexesManager Component
  - [x] 3.1 Create `src/components/demands/annexes-manager.tsx`
  - [x] 3.2 Implement file upload with drag & drop zone
  - [x] 3.3 Display annexes list with file icons
  - [x] 3.4 Add drag & drop reordering with @dnd-kit
  - [x] 3.5 Add preview button (for images and PDFs)
  - [x] 3.6 Add download button
  - [x] 3.7 Add delete with confirmation dialog
  - [x] 3.8 Show automatic numbering (Annexe 1, 2, 3...)

- [x] Task 4: Integrate into Workspace
  - [x] 4.1 Import AnnexesManager in demand-workspace.tsx
  - [x] 4.2 Replace placeholder in "Documents" tab
  - [x] 4.3 Pass demandProjectId prop

- [x] Task 5: Verification
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**Database Schema Changes:**
- Added `displayOrder` (integer, default 0) for sorting
- Added `description` (text, nullable) for optional captions
- Existing "annexe" document type in DEMAND_DOCUMENT_TYPES is reused

**tRPC Router Updates:**
| Procedure | Changes |
|-----------|---------|
| `list` | Now orders by displayOrder ASC, createdAt DESC |
| `create` | Accepts displayOrder, description; auto-increments order if not provided |
| `updateOrder` | New mutation for bulk reordering |
| `updateDescription` | New mutation for updating descriptions |

**AnnexesManager Features:**
- Upload zone with drag & drop support
- Accepts: PDF, Word, Excel, images (max 10 MB)
- File icons based on MIME type (PDF, spreadsheet, image, generic)
- Drag & drop reordering using @dnd-kit
- Automatic numbering (Annexe 1, Annexe 2, ...)
- Preview for images and PDFs (opens in new tab)
- Download button for all file types
- Delete with confirmation dialog
- Error handling for upload failures

**File Type Icons:**
| MIME Type | Icon |
|-----------|------|
| application/pdf | FileText |
| *spreadsheet*, *excel* | FileSpreadsheet |
| image/* | FileImage |
| Other | File |

**Referencing Info:**
The component displays a note about automatic numbering so users can reference "Annexe 1", "Annexe 2", etc. in the document body.

### File Size Impact

The `/demandes/[id]` page increased from 176 kB to 178 kB.

### Files Created/Modified

**New:**
- `src/components/demands/annexes-manager.tsx` - AnnexesManager component

**Modified:**
- `src/server/db/schema/demands.ts` - Added displayOrder, description fields
- `src/server/api/routers/demandDocuments.ts` - Updated list, create; added updateOrder, updateDescription
- `src/components/demands/demand-workspace.tsx` - Integrated AnnexesManager in Documents tab

### References

- [Source: epics-demande-v1.md#Story 6.6]
- @dnd-kit docs: https://dndkit.com/
- AnnexesManager: `src/components/demands/annexes-manager.tsx`
