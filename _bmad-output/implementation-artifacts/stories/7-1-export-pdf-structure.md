# Story 7.1: Export PDF Structuré

Status: done

## Story

As a **CHEF**,
I want **to export my demand file as PDF**,
So that **I can send it to the Administration**.

## Acceptance Criteria

1. [x] High-quality PDF generation
2. [x] Professional layout
3. [x] Consistent fonts and margins
4. [x] Immediate download

5. [x] `pnpm typecheck` passes
6. [x] `pnpm lint` passes
7. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Install PDF Library
  - [x] 1.1 Install @react-pdf/renderer

- [x] Task 2: Create PDF Document Template
  - [x] 2.1 Create `src/lib/pdf/demand-pdf-document.tsx`
  - [x] 2.2 Register Inter font for professional look
  - [x] 2.3 Define color palette and styles
  - [x] 2.4 Create header with title and reference
  - [x] 2.5 Create metadata section with project info
  - [x] 2.6 Create sections rendering with numbering
  - [x] 2.7 Create annexes list
  - [x] 2.8 Add footer with generation date and page numbers
  - [x] 2.9 Implement HTML to plain text converter

- [x] Task 3: Create Export API Endpoint
  - [x] 3.1 Create `/api/export/pdf/[demandId]/route.tsx`
  - [x] 3.2 Authenticate user and verify ownership
  - [x] 3.3 Fetch demand project data
  - [x] 3.4 Fetch annexes list
  - [x] 3.5 Generate PDF using renderToBuffer
  - [x] 3.6 Return PDF with proper headers for download

- [x] Task 4: Add Export Button to Workspace
  - [x] 4.1 Add Download icon import
  - [x] 4.2 Add isExporting state
  - [x] 4.3 Create handleExportPdf function
  - [x] 4.4 Add Export PDF button in header actions

- [x] Task 5: Verification
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**PDF Library:**
- Using `@react-pdf/renderer` for React-based PDF generation
- Server-side rendering with `renderToBuffer`
- Supports custom fonts, styles, and complex layouts

**PDF Document Structure:**
| Section | Content |
|---------|---------|
| Header | Title with primary color, reference number |
| Metadata | Service, contact, need type, urgency, budget, date |
| Sections | Numbered sections with content (HTML stripped) |
| Annexes | Numbered list of attached documents |
| Footer | Generation date, page numbers |

**Typography:**
- Font: Inter (Google Fonts)
- Weights: 400, 500, 600, 700
- Colors: Primary blue (#0066CC), text (#1a1a2e), muted (#6b7280)

**API Endpoint:**
- Route: `GET /api/export/pdf/[demandId]`
- Authentication required
- Returns PDF file with download headers
- Filename: `{title}_{date}.pdf`

**HTML to Text Conversion:**
- Strips HTML tags while preserving structure
- Converts `<br>` to newlines
- Converts `<li>` to bullet points
- Preserves paragraphs from `<p>` tags
- Handles HTML entities

**Export Button:**
- Located in workspace header actions
- Shows loading spinner during export
- Downloads file automatically

### File Size Impact

No change to client bundle size (PDF generation is server-side).

### Files Created/Modified

**New:**
- `src/lib/pdf/demand-pdf-document.tsx` - PDF document component
- `src/app/api/export/pdf/[demandId]/route.tsx` - Export API endpoint

**Modified:**
- `src/components/demands/demand-workspace.tsx` - Added export button

### Dependencies Added

- `@react-pdf/renderer` - PDF generation library

### References

- [Source: epics-demande-v1.md#Story 7.1]
- @react-pdf/renderer docs: https://react-pdf.org/
- DemandPdfDocument: `src/lib/pdf/demand-pdf-document.tsx`
