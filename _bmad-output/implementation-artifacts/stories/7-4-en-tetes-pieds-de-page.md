# Story 7.4: En-têtes et Pieds de Page

Status: done

## Story

As a **CHEF**,
I want **headers and footers on every page**,
So that **I have a professional-looking document**.

## Acceptance Criteria

1. [x] Header: document title displayed on every page
2. [x] Header: reference number displayed
3. [x] Footer: page number / total (e.g., "Page 2 / 5")
4. [x] Footer: generation date displayed
5. [x] Consistent styling across all pages (except cover)

6. [x] `pnpm typecheck` passes
7. [x] `pnpm lint` passes
8. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Add Fixed Header/Footer Styles
  - [x] 1.1 Add fixedHeader style with absolute positioning
  - [x] 1.2 Add fixedHeaderTitle and fixedHeaderRef styles
  - [x] 1.3 Add fixedFooter style with absolute positioning
  - [x] 1.4 Add fixedFooterLeft, fixedFooterCenter, fixedFooterRight styles

- [x] Task 2: Update Page Styles for Header/Footer Space
  - [x] 2.1 Update page style with paddingTop: 60 for header space
  - [x] 2.2 Update page style with paddingBottom: 50 for footer space
  - [x] 2.3 Update tocPage style similarly

- [x] Task 3: Create Reusable Components
  - [x] 3.1 Create PageHeader component with fixed prop
  - [x] 3.2 Display document title (truncated if needed)
  - [x] 3.3 Display reference number
  - [x] 3.4 Create PageFooter component with fixed prop
  - [x] 3.5 Display "Dossier de Demande" label
  - [x] 3.6 Display generation date
  - [x] 3.7 Display page number / total using render prop

- [x] Task 4: Apply to Pages
  - [x] 4.1 Add PageHeader and PageFooter to TableOfContentsPage
  - [x] 4.2 Add PageHeader and PageFooter to ContentPage
  - [x] 4.3 Remove old footer elements from ContentPage

- [x] Task 5: Verification
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**Fixed Header Layout:**
| Position | Content |
|----------|---------|
| Left | Document title (max 300px width) |
| Right | Reference number (Réf: XXX) |

**Fixed Footer Layout:**
| Position | Content |
|----------|---------|
| Left | "Dossier de Demande" label |
| Center | Generation date |
| Right | Page X / Y |

**Key Technical Details:**
- Using `fixed` prop from @react-pdf/renderer to repeat on every page
- Absolute positioning for header (top: 20) and footer (bottom: 20)
- Page content area adjusted with paddingTop: 60 and paddingBottom: 50
- Cover page does NOT have these headers/footers (keeps its own design)

**Components Created:**
```typescript
// Fixed header on every page
function PageHeader({ title, reference }: { title: string; reference?: string | null })

// Fixed footer on every page
function PageFooter({ generatedDate }: { generatedDate: string })
```

**Page Number Rendering:**
```typescript
<Text
  render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
/>
```

### Styles Added

```typescript
fixedHeader: {
  position: "absolute",
  top: 20,
  left: 50,
  right: 50,
  flexDirection: "row",
  justifyContent: "space-between",
  ...
}

fixedFooter: {
  position: "absolute",
  bottom: 20,
  left: 50,
  right: 50,
  flexDirection: "row",
  justifyContent: "space-between",
  ...
}
```

### Files Modified

**Modified:**
- `src/lib/pdf/demand-pdf-document.tsx`
  - Added fixed header/footer styles
  - Updated page and tocPage styles for proper spacing
  - Created PageHeader and PageFooter components
  - Applied to TableOfContentsPage and ContentPage
  - Removed old footer elements

### References

- [Source: epics-demande-v1.md#Story 7.4]
- @react-pdf/renderer fixed prop: https://react-pdf.org/components
- DemandPdfDocument: `src/lib/pdf/demand-pdf-document.tsx`
