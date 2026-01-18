# Story 7.8: Archive ZIP Complète

Status: done

## Story

As a **CHEF**,
I want **to download a ZIP with all files**,
So that **I have the complete dossier in one click**.

## Acceptance Criteria

1. [x] ZIP containing: main PDF, annexes, Word (optional)
2. [x] Clear folder structure
3. [x] README file with contents list
4. [x] Coherent ZIP naming

5. [x] `pnpm typecheck` passes
6. [x] `pnpm lint` passes
7. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Install JSZip Library
  - [x] 1.1 Add jszip dependency (already installed v3.10.1)

- [x] Task 2: Create ZIP Export API Endpoint
  - [x] 2.1 Create `src/app/api/export/zip/[demandId]/route.tsx`
  - [x] 2.2 Implement authentication and ownership verification
  - [x] 2.3 Fetch demand project and annexes from database
  - [x] 2.4 Generate PDF document in-memory
  - [x] 2.5 Generate DOCX document in-memory
  - [x] 2.6 Fetch annexes from R2 storage
  - [x] 2.7 Create README.txt with contents list
  - [x] 2.8 Bundle all files into ZIP archive
  - [x] 2.9 Return ZIP as download response

- [x] Task 3: Update Pre-Export Dialog
  - [x] 3.1 Add Archive icon import from lucide-react
  - [x] 3.2 Add onExportZip prop and isExportingZip prop
  - [x] 3.3 Add handleExportZip handler
  - [x] 3.4 Add "ZIP Complet" button to DialogFooter

- [x] Task 4: Update Demand Workspace
  - [x] 4.1 Add isExportingZip state
  - [x] 4.2 Add handleExportZip handler
  - [x] 4.3 Update PreExportDialog props
  - [x] 4.4 Update export button disabled state

- [x] Task 5: Verification
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**ZIP Structure:**
```
DEMANDE_[REF]_[TITRE]_YYYYMMDD.zip
├── DEMANDE_[REF]_[TITRE]_YYYYMMDD.pdf    (Main document PDF)
├── DEMANDE_[REF]_[TITRE]_YYYYMMDD.docx   (Main document Word)
├── LISEZMOI.txt                          (README with contents)
└── Annexes/                              (Folder with attachments)
    ├── Document1.pdf
    ├── Image1.png
    └── ...
```

**README Content (LISEZMOI.txt):**
- Title and reference
- Requester information (department, contact, email)
- Creation date
- Contents list (PDF, DOCX, annexes with sizes)
- Generation date

**ZIP Generation:**
- Uses JSZip library (v3.10.1)
- DEFLATE compression level 6
- Annexes fetched from Cloudflare R2 storage
- Filenames sanitized to remove accents/special chars

**API Endpoint:**
- `GET /api/export/zip/[demandId]`
- Returns `application/zip` with Content-Disposition header
- Requires authentication and ownership verification

### Files Created/Modified

**New:**
- `src/app/api/export/zip/[demandId]/route.tsx` - ZIP export API endpoint

**Modified:**
- `src/components/demands/pre-export-dialog.tsx` - Added ZIP export button
- `src/components/demands/demand-workspace.tsx` - Added ZIP export handler

### Dependencies

- `jszip` v3.10.1 - ZIP file creation
- `@aws-sdk/client-s3` - R2 file retrieval (GetObjectCommand)

### References

- [Source: epics-demande-v1.md#Story 7.8]
- ZIP export endpoint: `src/app/api/export/zip/[demandId]/route.tsx`
- JSZip documentation: https://stuk.github.io/jszip/
