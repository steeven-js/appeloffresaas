# Story 7.6: Nommage Automatique des Fichiers

Status: done

## Story

As a **CHEF**,
I want **files to be named automatically**,
So that **I follow a clear naming convention**.

## Acceptance Criteria

1. [x] Format: `DEMANDE_[REF]_[TITRE]_YYYYMMDD.ext`
2. [x] Special characters cleaned (accents removed, spaces to underscores)
3. [x] Date in YYYYMMDD format
4. [ ] Configurable in preferences (deferred - requires settings system)

5. [x] `pnpm typecheck` passes
6. [x] `pnpm lint` passes
7. [x] `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Create Filename Generator Utility
  - [x] 1.1 Create `src/lib/utils/filename.ts`
  - [x] 1.2 Implement `sanitizeForFilename()` function
    - Remove accented characters (NFD normalization)
    - Remove special characters
    - Replace spaces with underscores
    - Limit length
  - [x] 1.3 Implement `formatDateForFilename()` function
  - [x] 1.4 Implement `generateExportFilename()` function

- [x] Task 2: Update PDF Export
  - [x] 2.1 Import generateExportFilename in PDF route
  - [x] 2.2 Replace old filename generation with new utility

- [x] Task 3: Update DOCX Export
  - [x] 3.1 Import generateExportFilename in DOCX route
  - [x] 3.2 Replace old filename generation with new utility

- [x] Task 4: Verification
  - [x] 4.1 Run `pnpm typecheck`
  - [x] 4.2 Run `pnpm lint`
  - [x] 4.3 Run `pnpm build`

## Dev Notes

### Implementation Details

**Filename Format:**
```
DEMANDE_[REF]_[TITRE]_YYYYMMDD.ext
```

**Examples:**
- With reference: `DEMANDE_REF2024001_Achat_fournitures_bureau_20260118.pdf`
- Without reference: `DEMANDE_Renovation_salle_reunion_20260118.docx`

**Sanitization Rules:**
1. Normalize Unicode (NFD) to decompose accented characters
2. Remove diacritical marks (accents: é→e, à→a, ç→c)
3. Keep only alphanumeric, spaces, and hyphens
4. Replace spaces/hyphens with underscores
5. Remove leading/trailing underscores
6. Limit reference to 20 chars, title to 40 chars

**Utility Functions:**
```typescript
// Sanitize text for filename
sanitizeForFilename(text: string, maxLength?: number): string

// Format date as YYYYMMDD
formatDateForFilename(date?: Date): string

// Generate complete filename
generateExportFilename(
  title: string,
  reference: string | null | undefined,
  extension: "pdf" | "docx",
  date?: Date
): string
```

### Files Created/Modified

**New:**
- `src/lib/utils/filename.ts` - Filename generation utilities

**Modified:**
- `src/app/api/export/pdf/[demandId]/route.tsx` - Use new filename generator
- `src/app/api/export/docx/[demandId]/route.ts` - Use new filename generator

### Deferred

- **Configurable naming in preferences**: This would require a user settings/preferences system. The current implementation uses a sensible default that follows the convention. This can be added in a future story if needed.

### References

- [Source: epics-demande-v1.md#Story 7.6]
- Filename utility: `src/lib/utils/filename.ts`
