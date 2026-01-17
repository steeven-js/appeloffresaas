# Story 3.2: Upload Règlement de Consultation (RC)

Status: done

## Story

As a **user**,
I want **to upload the RC (Règlement de Consultation) document for my tender project**,
So that **it can be parsed to extract requirements and generate a compliance checklist**.

## Acceptance Criteria

1. Given I am on the project workspace
2. When I access the Documents tab
3. Then I can upload a PDF file as the RC document
4. And only PDF files are accepted (with error message for invalid formats)
5. And uploading a new RC replaces the previous one
6. And I can preview, download, or delete the uploaded RC
7. `pnpm typecheck` passes
8. `pnpm lint` passes
9. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Create tender documents database schema (AC: #3, #5)
  - [x] 1.1 Define TENDER_DOCUMENT_TYPES enum (rc, cctp, ccap, etc.)
  - [x] 1.2 Create tenderDocuments table with relations
  - [x] 1.3 Add parsingStatus field for Epic 4
  - [x] 1.4 Export types TenderDocument, NewTenderDocument

- [x] Task 2: Create tenderDocuments API router (AC: #3, #5, #6)
  - [x] 2.1 Implement list procedure (with optional type filter)
  - [x] 2.2 Implement get procedure (single document by id)
  - [x] 2.3 Implement create procedure (with RC replacement logic)
  - [x] 2.4 Implement delete procedure (R2 + database)
  - [x] 2.5 Implement getPreviewUrl (signed URL for inline display)
  - [x] 2.6 Implement getDownloadUrl (signed URL for attachment)
  - [x] 2.7 Implement getRC helper procedure
  - [x] 2.8 Register router in root.ts

- [x] Task 3: Update project workspace UI (AC: #1, #2, #3, #4, #6)
  - [x] 3.1 Enable Documents tab
  - [x] 3.2 Add RC upload zone with drag-and-drop
  - [x] 3.3 Add PDF-only validation with error message
  - [x] 3.4 Add upload progress indicator
  - [x] 3.5 Display uploaded RC with preview/download/delete actions
  - [x] 3.6 Add preview modal for viewing RC

- [x] Task 4: Verification (AC: #7, #8, #9)
  - [x] 4.1 Run `pnpm typecheck`
  - [x] 4.2 Run `pnpm lint`
  - [x] 4.3 Run `pnpm build`

## Dev Notes

### Database Schema

Extended `src/server/db/schema/tenders.ts` with:
- `TENDER_DOCUMENT_TYPES` enum: rc, cctp, ccap, bpu, dpgf, acte_engagement, annexe, autre
- `tenderDocuments` table with fields for file metadata, storage key, parsing status
- Relations between tenderProjects and tenderDocuments (one-to-many)

### API Router

Created `src/server/api/routers/tenderDocuments.ts` with:
- Ownership verification on all operations
- RC replacement logic (deletes old RC from R2 and database)
- Signed URL generation for preview (inline) and download (attachment)
- 10 MB file size limit

### Upload Flow

1. User drags or selects a PDF file
2. Client validates PDF mime type
3. File is uploaded to R2 via /api/upload endpoint
4. Document record is created via tRPC mutation
5. If RC already exists, old one is deleted first
6. UI refreshes to show uploaded RC

### PDF Validation

Error message shown for non-PDF files:
- French: "Seuls les fichiers PDF sont acceptés"

### RC Preview

Preview uses signed URL with:
- `ResponseContentDisposition: inline`
- 1-hour expiration
- Opens in new browser tab

### Parsing Status

Documents are created with `parsingStatus: "pending"` for future Epic 4 implementation:
- pending: Waiting to be parsed
- processing: Currently being parsed
- completed: Successfully parsed
- failed: Parsing failed

### References

- [Source: epics.md#Story 3.2: Upload RC]
- [FR22: Upload tender documents]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/server/db/schema/tenders.ts` | Modified | Added TENDER_DOCUMENT_TYPES and tenderDocuments table |
| `src/server/api/routers/tenderDocuments.ts` | Created | Complete CRUD router for tender documents |
| `src/server/api/root.ts` | Modified | Registered tenderDocumentsRouter |
| `src/components/tenders/project-workspace.tsx` | Modified | Added Documents tab with RC upload |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story implementation | Epic 3 Story 3.2 - Upload RC document |
| 2026-01-17 | Created tenderDocuments schema | Store document metadata |
| 2026-01-17 | Created tenderDocuments router | CRUD operations with R2 storage |
| 2026-01-17 | Updated project workspace | RC upload with drag-and-drop |

### Completion Notes

- All acceptance criteria satisfied
- PDF-only validation with French error message
- RC replacement logic works (only one RC per project)
- Preview opens in new tab with signed URL
- Download triggers file download
- Delete removes from R2 and database
- All validations pass: typecheck, lint, build
