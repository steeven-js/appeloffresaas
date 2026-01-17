# Story 2.13: Suppression Documents

Status: done

## Story

As a **user**,
I want **to delete documents from my vault**,
So that **I can remove outdated or incorrect files**.

## Acceptance Criteria

1. Given I have a document in my vault
2. When I click delete and confirm
3. Then the document is permanently removed
4. And any references to it in tenders show "Document deleted"
5. `pnpm typecheck` passes
6. `pnpm lint` passes
7. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Verify backend delete procedure (AC: #3)
  - [x] 1.1 Verify ownership check before delete
  - [x] 1.2 Delete from R2 storage
  - [x] 1.3 Delete from database

- [x] Task 2: Verify UI delete with confirmation (AC: #2, #3)
  - [x] 2.1 Trash2 delete button exists
  - [x] 2.2 AlertDialog confirmation dialog
  - [x] 2.3 French text for confirmation
  - [x] 2.4 deleteMutation on confirm

- [x] Task 3: Verify tender references handling (AC: #4)
  - [x] 3.1 Check relationship with tenders
  - [x] 3.2 Note: No tender-document link yet (Epic 3 is backlog)

- [x] Task 4: Verification (AC: #5, #6, #7)
  - [x] 4.1 Run `pnpm typecheck`
  - [x] 4.2 Run `pnpm lint`
  - [x] 4.3 Run `pnpm build`

## Dev Notes

### Delete Implementation

The delete functionality was implemented as part of Story 2.8 (Upload Documents). This story verifies and documents the existing implementation.

### Confirmation Dialog

Uses shadcn AlertDialog with French localization:
- Title: "Supprimer ce document ?"
- Description: "Cette action est irréversible. Le document [name] sera définitivement supprimé."
- Actions: "Annuler" / "Supprimer"

### Backend Flow

1. Verify ownership (user owns the company profile)
2. Delete file from Cloudflare R2 storage
3. Delete record from database
4. Return success

### Tender References (AC #4)

The acceptance criteria mentions "references to it in tenders show 'Document deleted'". Currently:
- Epic 3 (Création Projet AO) is still in backlog
- No relationship exists between `companyDocuments` and `tenderProjects` tables
- This will be addressed when Epic 3 is implemented

When Epic 3 is implemented, options include:
- Soft delete with `deletedAt` timestamp
- Foreign key with `SET NULL` on delete
- Store document metadata snapshot in tender

### References

- [Source: epics.md#Story 2.13: Suppression Documents]
- [FR19: Document deletion from vault]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/server/api/routers/companyDocuments.ts` | Verified | Delete procedure (lines 257-303) |
| `src/components/documents/document-vault.tsx` | Verified | AlertDialog confirmation (lines 569-597) |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story verification | Epic 2 Story 2.13 - Document deletion |

### Completion Notes

- All acceptance criteria satisfied (except AC #4 which depends on Epic 3)
- Delete functionality was already implemented in Story 2.8
- Confirmation dialog with French text
- Deletes from both R2 storage and database
- All validations pass: typecheck, lint, build
