# Story 2.2: Gestion Informations Légales

Status: done

## Story

As a **user**,
I want **to add and manage my company's legal information (Kbis, capital, NAF code)**,
So that **I have all administrative data ready for tenders**.

## Acceptance Criteria

1. Given I have a company profile
2. When I add legal information (capital social, code NAF, date création, forme juridique)
3. Then the information is saved and displayed in my profile
4. And I can upload a Kbis extract document (deferred to Story 2.8+ - Document Vault)
5. And the profile completeness score updates
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Add legal information fields to database schema (AC: #2, #3)
  - [x] 1.1 Add `legalForm` field (varchar, 50)
  - [x] 1.2 Add `capitalSocial` field (integer)
  - [x] 1.3 Add `nafCode` field (varchar, 10) with validation format 1234A
  - [x] 1.4 Add `creationDate` field (date)
  - [x] 1.5 Add `rcsCity` field (varchar, 255)

- [x] Task 2: Update tRPC router for legal fields (AC: #3, #5)
  - [x] 2.1 Add Zod validation schemas for legal fields
  - [x] 2.2 Update `upsertProfile` mutation to handle legal fields
  - [x] 2.3 Update `calculateCompleteness` function with legal info weight
  - [x] 2.4 Update `getCompleteness` to track legal info section

- [x] Task 3: Create UI section for legal information (AC: #2, #3)
  - [x] 3.1 Add "Informations légales" section to CompanyProfileForm
  - [x] 3.2 Add legalForm Select with French legal forms
  - [x] 3.3 Add capitalSocial number input
  - [x] 3.4 Add nafCode input with format validation and uppercase
  - [x] 3.5 Add creationDate date picker
  - [x] 3.6 Add rcsCity input

- [x] Task 4: Verification (AC: #6, #7, #8)
  - [x] 4.1 Run `pnpm typecheck`
  - [x] 4.2 Run `pnpm lint`
  - [x] 4.3 Run `pnpm build`

## Dev Notes

### Legal Forms List (French)

```typescript
const LEGAL_FORMS = [
  { value: "SAS", label: "SAS - Société par Actions Simplifiée" },
  { value: "SASU", label: "SASU - SAS Unipersonnelle" },
  { value: "SARL", label: "SARL - Société à Responsabilité Limitée" },
  { value: "EURL", label: "EURL - Entreprise Unipersonnelle à RL" },
  { value: "SA", label: "SA - Société Anonyme" },
  { value: "SNC", label: "SNC - Société en Nom Collectif" },
  { value: "EI", label: "EI - Entreprise Individuelle" },
  { value: "EIRL", label: "EIRL - Entreprise Individuelle à RL" },
  { value: "AUTO", label: "Auto-entrepreneur / Micro-entreprise" },
  { value: "SCOP", label: "SCOP - Société Coopérative" },
  { value: "ASSOCIATION", label: "Association loi 1901" },
  { value: "OTHER", label: "Autre" },
];
```

### NAF Code Validation

- French business activity code
- Format: 4 digits + 1 uppercase letter (e.g., 6201Z)
- Regex: `/^(\d{4}[A-Z])?$/`

### Profile Completeness Update

Legal info section weight: 15% of total (when 3+ of 4 fields are completed)

Fields counted:
- legalForm
- capitalSocial
- nafCode
- creationDate

### Kbis Upload Note

Kbis document upload functionality is deferred to Epic 2 Document Vault stories (2.8+).
This story focuses on the legal information data fields only.

### Previous Story Learnings (2.1)

- Use lazy initialization for external services
- French error messages for user-facing errors
- Loading states for all async operations
- Use consistent layout pattern

### References

- [Source: epics.md#Story 2.2: Gestion Informations Légales]
- [FR9: User can add and manage company legal information]
- [FR15: User can view profile completeness score]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/server/db/schema/company.ts` | Modified | Added legal fields (legalForm, capitalSocial, nafCode, creationDate, rcsCity) |
| `src/server/api/routers/companyProfile.ts` | Modified | Added legal fields validation, upsert handling, and completeness calculation |
| `src/components/company/company-profile-form.tsx` | Modified | Added "Informations légales" section with all legal form fields |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story created | Epic 2 Story 2.2 implementation |
| 2026-01-17 | Implementation verified | All acceptance criteria satisfied |

### Completion Notes

- All acceptance criteria satisfied
- Legal information fields added to schema: legalForm, capitalSocial, nafCode, creationDate, rcsCity
- NAF code validation (format 1234A) implemented with auto-uppercase
- French legal forms dropdown with 12 common forms
- Profile completeness includes legal info section (15% weight)
- Kbis upload deferred to Document Vault stories (Epic 2.8+)
- All validations pass: typecheck, lint, build
