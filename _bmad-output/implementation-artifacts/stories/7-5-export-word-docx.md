# Story 7.5: Export Word (DOCX)

Status: done

## Story

As a **CHEF**,
I want **to export in Word format**,
So that **I can make modifications later**.

## Acceptance Criteria

1. [x] DOCX export faithful to content
2. [x] Word styles applied (headings, paragraphs, lists)
3. [x] Tables preserved (metadata section)
4. [x] Editable in Microsoft Word

5. [x] `pnpm typecheck` passes
6. [x] `pnpm lint` passes
7. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Install DOCX Library
  - [x] 1.1 Install `docx` package

- [x] Task 2: Create DOCX Document Template
  - [x] 2.1 Create `src/lib/docx/demand-docx-document.ts`
  - [x] 2.2 Define color palette and styles
  - [x] 2.3 Create cover page with title, info, company name
  - [x] 2.4 Create table of contents with section list
  - [x] 2.5 Create metadata section as 2-column table
  - [x] 2.6 Create sections rendering with headings
  - [x] 2.7 Create annexes list
  - [x] 2.8 Add header with title and reference
  - [x] 2.9 Add footer with label, date, page numbers
  - [x] 2.10 Implement HTML to plain text converter

- [x] Task 3: Create Export API Endpoint
  - [x] 3.1 Create `/api/export/docx/[demandId]/route.ts`
  - [x] 3.2 Authenticate user and verify ownership
  - [x] 3.3 Fetch demand project data
  - [x] 3.4 Fetch annexes list
  - [x] 3.5 Fetch company profile
  - [x] 3.6 Generate DOCX using Packer.toBuffer
  - [x] 3.7 Return DOCX with proper headers for download

- [x] Task 4: Add Export Button to Workspace
  - [x] 4.1 Add FileType icon import
  - [x] 4.2 Add isExportingDocx state
  - [x] 4.3 Create handleExportDocx function
  - [x] 4.4 Add Export Word button next to Export PDF

- [x] Task 5: Verification
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**Library:**
- Using `docx` package (v9.5.1) for Word document generation
- Server-side generation with `Packer.toBuffer()`

**Document Structure:**
| Section | Content |
|---------|---------|
| Cover Page | Document type, title, info box, company name, date |
| Table of Contents | Manual list of sections |
| Header/Footer | Title, reference, page numbers, date |
| Metadata | 2-column table with project info |
| Sections | Heading 2 + content paragraphs |
| Annexes | Numbered list of documents |

**Styles:**
- Font: Calibri
- Heading 1: 18pt, primary blue, bold
- Heading 2: 14pt, primary blue, bold
- Body: 11pt
- Colors match PDF export (primary: #0066CC)

**API Endpoint:**
- Route: `GET /api/export/docx/[demandId]`
- Authentication required
- Returns DOCX file with download headers
- Filename: `{title}_{date}.docx`
- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

**Export Button:**
- Located next to PDF export button
- Uses FileType icon
- Shows loading spinner during export

### Files Created/Modified

**New:**
- `src/lib/docx/demand-docx-document.ts` - DOCX document generator
- `src/app/api/export/docx/[demandId]/route.ts` - Export API endpoint

**Modified:**
- `src/components/demands/demand-workspace.tsx`
  - Added FileType icon import
  - Added isExportingDocx state
  - Added handleExportDocx function
  - Added Export Word button

### Dependencies Added

- `docx` (v9.5.1) - Word document generation library

### References

- [Source: epics-demande-v1.md#Story 7.5]
- docx library docs: https://docx.js.org/
- DemandDocxDocument: `src/lib/docx/demand-docx-document.ts`
