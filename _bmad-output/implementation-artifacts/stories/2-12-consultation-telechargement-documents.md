# Story 2.12: Consultation & Téléchargement Documents

Status: done

## Story

As a **user**,
I want **to view and download my vault documents**,
So that **I can access them when needed**.

## Acceptance Criteria

1. Given I have documents in my vault
2. When I click on a document
3. Then I see a preview (for PDF/images)
4. And I can download the original file
5. And I can see document metadata (upload date, size, category)
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Verify existing implementation (AC: #4, #5)
  - [x] 1.1 Download functionality already exists
  - [x] 1.2 Metadata display already exists (size, date, category)

- [x] Task 2: Add preview URL endpoint (AC: #3)
  - [x] 2.1 Add getPreviewUrl tRPC mutation
  - [x] 2.2 Use inline Content-Disposition for browser display
  - [x] 2.3 Return signed URL with mimeType

- [x] Task 3: Implement preview UI (AC: #2, #3)
  - [x] 3.1 Add preview state management
  - [x] 3.2 Make document name/icon clickable
  - [x] 3.3 Add Eye preview button
  - [x] 3.4 Create preview dialog

- [x] Task 4: Preview dialog content (AC: #3, #5)
  - [x] 4.1 Display images in <img> tag
  - [x] 4.2 Display PDFs in <iframe>
  - [x] 4.3 Show metadata (size, date, category, expiry)
  - [x] 4.4 Add download button in dialog
  - [x] 4.5 Add "Open in new tab" button

- [x] Task 5: Verification (AC: #6, #7, #8)
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Preview Implementation

Two ways to preview a document:
1. Click on the document name/icon
2. Click the Eye button

### Preview Dialog Features

- Full-width dialog (max-w-4xl)
- Image preview: `<img>` tag with object-contain
- PDF preview: `<iframe>` with 60vh height
- Metadata display in description area
- Download button in footer
- "Open in new tab" button for external viewing

### Signed URL Differences

| Use Case | Content-Disposition | Method |
|----------|-------------------|--------|
| Download | attachment | getDownloadUrl |
| Preview | inline | getPreviewUrl |

### Supported Preview Types

- Images: JPEG, PNG, WebP (native browser support)
- PDFs: via iframe (browser PDF viewer)
- Other types: "Preview not available" message

### References

- [Source: epics.md#Story 2.12: Consultation & Téléchargement Documents]
- [FR18: Document preview and download functionality]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/server/api/routers/companyDocuments.ts` | Modified | Added getPreviewUrl mutation |
| `src/components/documents/document-vault.tsx` | Modified | Added preview dialog and click handlers |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story implementation | Epic 2 Story 2.12 - Document preview |
| 2026-01-17 | Fixed unused import | Removed 'X' from lucide-react imports |

### Completion Notes

- All acceptance criteria satisfied
- Preview works for images and PDFs
- Download functionality was already implemented
- Metadata display was already implemented
- Added getPreviewUrl with inline disposition
- Preview dialog shows document with metadata
- All validations pass: typecheck, lint, build
