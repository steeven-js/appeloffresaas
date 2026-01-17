# Story 2.8: Upload Documents Coffre-fort

Status: done

## Story

As a **user**,
I want **to upload documents to my secure vault**,
So that **I can reuse them across multiple tenders**.

## Acceptance Criteria

1. Given I am on the document vault page
2. When I upload a document (PDF, Word, or image)
3. Then the document is stored securely in R2 storage
4. And I can see the document in my vault list
5. And I see upload progress and confirmation
6. Given I try to upload an unsupported file type
7. When I select the file
8. Then I see an error message listing accepted formats
9. `pnpm typecheck` passes
10. `pnpm lint` passes
11. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Create database schema for documents (AC: #3, #4)
  - [x] 1.1 Create `companyDocuments` table
  - [x] 1.2 Add fields: fileName, originalName, mimeType, fileSize, storageKey
  - [x] 1.3 Add fields: category, description, tags, expiryDate (for future stories)
  - [x] 1.4 Add foreign key to companyProfiles
  - [x] 1.5 Run db:push to sync schema

- [x] Task 2: Create tRPC router for documents (AC: #3, #4)
  - [x] 2.1 Create `companyDocuments` router
  - [x] 2.2 Add `list` query with category filtering
  - [x] 2.3 Add `get` query for single document
  - [x] 2.4 Add `create` mutation (after upload)
  - [x] 2.5 Add `update` mutation for metadata
  - [x] 2.6 Add `delete` mutation (with R2 cleanup)
  - [x] 2.7 Add `getDownloadUrl` mutation (signed URL)
  - [x] 2.8 Add `getCategoryCounts` query

- [x] Task 3: Create API upload route (AC: #2, #3, #5, #8)
  - [x] 3.1 Create POST /api/upload route
  - [x] 3.2 Validate file type against accepted MIME types
  - [x] 3.3 Validate file size (max 10MB)
  - [x] 3.4 Generate unique storage key
  - [x] 3.5 Upload to R2 with metadata
  - [x] 3.6 Return file info on success
  - [x] 3.7 Return error with accepted formats on invalid type

- [x] Task 4: Create UI components (AC: #1, #2, #4, #5)
  - [x] 4.1 Create `DocumentVault` component
  - [x] 4.2 Create upload zone with drag-and-drop
  - [x] 4.3 Add progress indicator during upload
  - [x] 4.4 Add success/error states with messages
  - [x] 4.5 Create `DocumentCard` for list display
  - [x] 4.6 Add download functionality with signed URLs
  - [x] 4.7 Add delete with confirmation dialog
  - [x] 4.8 Create /profile/documents page

- [x] Task 5: Verification (AC: #9, #10, #11)
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`
  - [x] 5.4 Run `pnpm db:push`

## Dev Notes

### Database Schema

```typescript
export const companyDocuments = createTable("company_documents", {
  id: varchar("id", { length: 255 }).notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
  companyProfileId: varchar("company_profile_id", { length: 255 }).notNull().references(() => companyProfiles.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  storageKey: varchar("storage_key", { length: 500 }).notNull(),
  category: varchar("category", { length: 50 }),
  description: text("description"),
  tags: text("tags"),
  expiryDate: date("expiry_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

### Accepted File Types

```typescript
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/webp",
];
```

### File Size Limit

- Maximum: 10 MB (10 * 1024 * 1024 bytes)
- Enforced on both client and server

### Storage Key Format

```
documents/{userId}/{timestamp}-{randomId}-{sanitizedFileName}
```

Example: `documents/user123/1705500000000-a1b2c3d4-kbis_2024.pdf`

### Document Categories (for Story 2.9)

- kbis, attestation_fiscale, attestation_sociale
- assurance_rc, assurance_decennale
- certification, reference_projet, cv
- organigramme, bilan, autre

### Signed URL for Download

- Generated using @aws-sdk/s3-request-presigner
- Valid for 1 hour (3600 seconds)
- Includes Content-Disposition header for download

### References

- [Source: epics.md#Story 2.8: Upload Documents Coffre-fort]
- [FR14: User can upload documents to document vault]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/server/db/schema/company.ts` | Modified | Added companyDocuments table and DOCUMENT_CATEGORIES |
| `src/server/api/routers/companyDocuments.ts` | Created | Documents CRUD router with R2 integration |
| `src/server/api/root.ts` | Modified | Added companyDocuments router |
| `src/app/api/upload/route.ts` | Created | File upload API route |
| `src/components/documents/document-vault.tsx` | Created | Document vault UI with upload and list |
| `src/app/(auth)/profile/documents/page.tsx` | Created | Documents page |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story implementation | Epic 2 Story 2.8 - Document Vault upload |
| 2026-01-17 | Added @aws-sdk/s3-request-presigner | For signed download URLs |

### Completion Notes

- All acceptance criteria satisfied
- Documents table created with all fields for future stories (category, expiry)
- Upload API route with validation (type, size)
- Drag-and-drop upload zone with progress indicator
- Document list with download (signed URLs) and delete
- R2 cleanup on document deletion
- Error messages in French
- All validations pass: typecheck, lint, build
- Database schema deployed
