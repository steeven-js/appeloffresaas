# Story 7.2: Page de Garde Automatique

Status: done

## Story

As a **CHEF**,
I want **an automatically generated cover page**,
So that **I can present the demand file professionally**.

## Acceptance Criteria

1. [x] Logo (if available) or company initial placeholder
2. [x] Demand title displayed prominently
3. [x] Department/service demandeur displayed
4. [x] Creation date displayed
5. [x] Internal reference displayed

6. [x] `pnpm typecheck` passes
7. [x] `pnpm lint` passes
8. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Design Cover Page Component
  - [x] 1.1 Add cover page styles (logo, title, info box, footer)
  - [x] 1.2 Create CoverPage component in demand-pdf-document.tsx
  - [x] 1.3 Add logo placeholder with company initial
  - [x] 1.4 Add document type label
  - [x] 1.5 Add title with primary color
  - [x] 1.6 Add info box with reference, service, contact, need type, creation date
  - [x] 1.7 Add footer with company name and generation date

- [x] Task 2: Add Data Interfaces
  - [x] 2.1 Create CompanyInfo interface (name, logoUrl)
  - [x] 2.2 Add createdAt field to DemandPdfData
  - [x] 2.3 Add company field to DemandPdfData

- [x] Task 3: Update API Endpoint
  - [x] 3.1 Import companyProfiles schema
  - [x] 3.2 Fetch company profile for cover page
  - [x] 3.3 Add createdAt to pdfData
  - [x] 3.4 Add company info to pdfData

- [x] Task 4: Integrate Cover Page
  - [x] 4.1 Render CoverPage before ContentPage in Document

- [x] Task 5: Verification
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**Cover Page Design:**
| Element | Description |
|---------|-------------|
| Logo | Company logo if available, otherwise circular placeholder with company initial |
| Document Type | "Dossier de Demande" label in muted uppercase |
| Title | Demand title in primary color (28pt, bold) |
| Divider | Blue horizontal line separator |
| Info Box | Gray background box with reference, service, contact, need type, creation date |
| Footer | Company name and generation date at bottom |

**Cover Page Styles:**
- Centered layout with flex column
- Logo placeholder: 100x100px circle in primary blue with white initial
- Info box: 350px wide with 25px padding, gray background
- Footer: Absolute positioned at bottom

**Data Flow:**
1. API fetches company profile for user
2. Extracts company name (logo not yet implemented in schema)
3. Includes createdAt from demand project
4. Passes company object to PDF data

**Company Profile Lookup:**
```typescript
const companyProfile = await db.query.companyProfiles.findFirst({
  where: eq(companyProfiles.userId, session.user.id),
  columns: { name: true },
});
```

### Files Modified

**Modified:**
- `src/lib/pdf/demand-pdf-document.tsx`
  - Added cover page styles (coverPage, coverContainer, coverLogo, etc.)
  - Added CompanyInfo interface
  - Added createdAt and company fields to DemandPdfData
  - Added CoverPage component with logo, title, info box, footer
  - Updated DemandPdfDocument to render CoverPage first

- `src/app/api/export/pdf/[demandId]/route.tsx`
  - Import companyProfiles schema
  - Fetch company profile for cover page
  - Add createdAt and company to pdfData

### Future Enhancements

- Add logo field to company profile schema
- Support actual company logo upload and display on cover page

### References

- [Source: epics-demande-v1.md#Story 7.2]
- DemandPdfDocument: `src/lib/pdf/demand-pdf-document.tsx`
- PDF Export API: `src/app/api/export/pdf/[demandId]/route.tsx`
