# Story 7.3: Sommaire Automatique

Status: done

## Story

As a **CHEF**,
I want **an automatically generated table of contents**,
So that **I can easily navigate the document**.

## Acceptance Criteria

1. [x] Table of contents with section listing
2. [x] Clickable links (interactive PDF)
3. [x] Automatic update based on sections
4. [x] Consistent numbering (1. / 2. / 3. etc.)

5. [x] `pnpm typecheck` passes
6. [x] `pnpm lint` passes
7. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Add TOC Styles
  - [x] 1.1 Add tocPage style for page layout
  - [x] 1.2 Add tocHeader and tocTitle styles
  - [x] 1.3 Add tocEntry style for each TOC item
  - [x] 1.4 Add tocNumber and tocText styles
  - [x] 1.5 Add tocLink style for clickable entries
  - [x] 1.6 Add tocSectionMeta for document info
  - [x] 1.7 Add tocFooter style

- [x] Task 2: Import Link Component
  - [x] 2.1 Add Link import from @react-pdf/renderer

- [x] Task 3: Create TableOfContentsPage Component
  - [x] 3.1 Create header with "Sommaire" title
  - [x] 3.2 Add document info section (title, reference)
  - [x] 3.3 Create TOC entries with Link wrappers
  - [x] 3.4 Generate entry for each section with number
  - [x] 3.5 Add Annexes entry if annexes exist
  - [x] 3.6 Add footer with section/annexe count

- [x] Task 4: Add Anchor IDs to Content
  - [x] 4.1 Add id attribute to each section View
  - [x] 4.2 Add id="section-annexes" to annexes section

- [x] Task 5: Update Document Structure
  - [x] 5.1 Add TableOfContentsPage between CoverPage and ContentPage

- [x] Task 6: Verification
  - [x] 6.1 Run `pnpm typecheck`
  - [x] 6.2 Run `pnpm lint`
  - [x] 6.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**TOC Structure:**
| Element | Description |
|---------|-------------|
| Header | "Sommaire" title with primary color border |
| Document Info | Title and reference at top |
| TOC Entries | Clickable links to each section |
| Footer | Section and annexe count summary |

**Clickable Links:**
- Using `Link` component from @react-pdf/renderer
- Links use `src="#section-{id}"` format
- Section Views have matching `id` attributes
- Works in most PDF viewers (Adobe Reader, Preview, etc.)

**TOC Entry Format:**
```
[1.] [Section Title]
[2.] [Section Title]
...
[N.] Annexes (X documents)
```

**Anchor IDs:**
- Sections: `id={`section-${section.id}`}`
- Annexes: `id="section-annexes"`

**Styles:**
- TOC page uses same padding and fonts as other pages
- Entries have gray background with rounded corners
- Numbers in primary blue color
- Links have no text decoration

### PDF Structure

After this story, the PDF has 3 types of pages:
1. **Cover Page** - Logo, title, info box
2. **Table of Contents** - Clickable navigation
3. **Content Pages** - Metadata, sections, annexes

### Files Modified

**Modified:**
- `src/lib/pdf/demand-pdf-document.tsx`
  - Added `Link` import
  - Added TOC styles (tocPage, tocHeader, tocTitle, tocEntry, etc.)
  - Added TableOfContentsPage component
  - Added `id` attributes to section Views
  - Updated DemandPdfDocument to include TOC page

### Note on Page Numbers

@react-pdf/renderer does not support automatic page number references in TOC (like LaTeX \pageref). The clickable links provide equivalent navigation functionality, which is the standard approach for interactive PDFs generated with this library.

### References

- [Source: epics-demande-v1.md#Story 7.3]
- @react-pdf/renderer Link docs: https://react-pdf.org/components#link
- DemandPdfDocument: `src/lib/pdf/demand-pdf-document.tsx`
