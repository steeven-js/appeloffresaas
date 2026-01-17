# Story 2.10: Dates Expiration Documents

Status: done

## Story

As a **user**,
I want **to set expiration dates on my documents**,
So that **I am alerted before they become invalid**.

## Acceptance Criteria

1. Given I have a document in my vault
2. When I set an expiration date
3. Then the date is saved and displayed on the document
4. And documents expiring within 30 days are highlighted in orange
5. And expired documents are highlighted in red
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Verify existing schema has expiryDate support (AC: #2, #3)
  - [x] 1.1 Confirm companyDocuments.expiryDate field exists in schema
  - [x] 1.2 Confirm update mutation supports expiryDate changes

- [x] Task 2: Add expiry status helpers (AC: #4, #5)
  - [x] 2.1 Create ExpiryStatus type ("valid" | "expiring-soon" | "expired" | "none")
  - [x] 2.2 Create getExpiryStatus function (30 days threshold)
  - [x] 2.3 Create getDaysUntilExpiry function
  - [x] 2.4 Create getExpiryBadgeClass function (red/orange/green styling)
  - [x] 2.5 Create formatExpiryMessage function

- [x] Task 3: Update DocumentCard interface (AC: #2, #3)
  - [x] 3.1 Add expiryDate to document interface
  - [x] 3.2 Rename onCategoryChange to onUpdate
  - [x] 3.3 Add state for expiry date editing

- [x] Task 4: Add expiry date UI (AC: #2, #3, #4, #5)
  - [x] 4.1 Add expiry date edit dialog with date input
  - [x] 4.2 Display expiry badge with colored highlighting
  - [x] 4.3 Show warning icon for expired documents
  - [x] 4.4 Show clock icon for expiring-soon documents
  - [x] 4.5 Show "Définir une date d'expiration" link for documents without date
  - [x] 4.6 Add "Supprimer" button to remove expiry date

- [x] Task 5: Verification (AC: #6, #7, #8)
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Expiry Status Logic

```typescript
type ExpiryStatus = "valid" | "expiring-soon" | "expired" | "none";

function getExpiryStatus(expiryDate: string | null): ExpiryStatus {
  if (!expiryDate) return "none";
  const diffDays = getDaysUntilExpiry(expiryDate);
  if (diffDays < 0) return "expired";
  if (diffDays <= 30) return "expiring-soon";
  return "valid";
}
```

### Visual Indicators

| Status | Background | Text Color | Icon |
|--------|------------|------------|------|
| Expired | `bg-red-100` | `text-red-800` | AlertTriangle |
| Expiring Soon (≤30 days) | `bg-orange-100` | `text-orange-800` | Clock |
| Valid (>30 days) | `bg-green-100` | `text-green-800` | - |
| No date | - | - | Calendar |

### Expiry Messages

- "Expiré depuis X jour(s)" - for past dates
- "Expire aujourd'hui" - for today
- "Expire demain" - for tomorrow
- "Expire dans X jours" - for future dates

### References

- [Source: epics.md#Story 2.10: Dates Expiration Documents]
- [FR16: User can set expiration dates on documents]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/components/documents/document-vault.tsx` | Modified | Added expiry date helpers, UI for editing and displaying expiry dates with colored badges |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story implementation | Epic 2 Story 2.10 - Expiration dates |

### Completion Notes

- All acceptance criteria satisfied
- Expiry date edit dialog with native date input
- Color-coded badges: red (expired), orange (≤30 days), green (>30 days)
- Icons for quick visual identification
- Human-readable expiry messages in French
- Option to remove expiry date
- All validations pass: typecheck, lint, build
