# Story 2.4: Gestion Certifications & Qualifications

Status: done

## Story

As a **user**,
I want **to add and manage my certifications and qualifications**,
So that **I can prove my expertise and compliance**.

## Acceptance Criteria

1. Given I have a company profile
2. When I add a certification (name, issuer, date obtained, expiry date)
3. Then the certification is saved with its expiration date
4. And I can upload the certificate document (deferred to Document Vault - Epic 2.8+)
5. And certifications nearing expiry are highlighted
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Create database schema for certifications (AC: #2, #3)
  - [x] 1.1 Create `companyCertifications` table
  - [x] 1.2 Add fields: name, issuer, certificationNumber, obtainedDate, expiryDate
  - [x] 1.3 Add documentId field for future document vault integration
  - [x] 1.4 Add foreign key to companyProfiles table

- [x] Task 2: Create tRPC router for certifications (AC: #3, #5)
  - [x] 2.1 Create `companyCertifications` router
  - [x] 2.2 Add `list` query with expiration status
  - [x] 2.3 Add `get` query for single certification
  - [x] 2.4 Add `create` mutation
  - [x] 2.5 Add `update` mutation
  - [x] 2.6 Add `delete` mutation
  - [x] 2.7 Implement `getExpirationStatus()` helper (valid/expiring/expired/unknown)

- [x] Task 3: Create UI for certifications management (AC: #2, #3, #5)
  - [x] 3.1 Create `CertificationsForm` main component
  - [x] 3.2 Create `CertificationFormDialog` for create/edit
  - [x] 3.3 Create `CertificationCard` with status badges
  - [x] 3.4 Add visual indicators: green (valid), orange (expiring), red (expired)
  - [x] 3.5 Add alert summary for expiring/expired certifications
  - [x] 3.6 Add delete functionality with confirmation dialog

- [x] Task 4: Verification (AC: #6, #7, #8)
  - [x] 4.1 Run `pnpm typecheck`
  - [x] 4.2 Run `pnpm lint`
  - [x] 4.3 Run `pnpm build`

## Dev Notes

### Database Schema

```typescript
export const companyCertifications = createTable("company_certifications", {
  id: varchar("id", { length: 255 }).notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
  companyProfileId: varchar("company_profile_id", { length: 255 }).notNull().references(() => companyProfiles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  issuer: varchar("issuer", { length: 255 }),
  certificationNumber: varchar("certification_number", { length: 100 }),
  obtainedDate: date("obtained_date"),
  expiryDate: date("expiry_date"),
  documentId: varchar("document_id", { length: 255 }), // Future document vault ref
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

### Expiration Status Logic

```typescript
function getExpirationStatus(expiryDate: string | null): "valid" | "expiring" | "expired" | "unknown" {
  if (!expiryDate) return "unknown";

  const today = new Date();
  const expiry = new Date(expiryDate);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  if (expiry < today) return "expired";
  if (expiry < thirtyDaysFromNow) return "expiring";
  return "valid";
}
```

### Status Visual Indicators

| Status | Badge Color | Border | Description |
|--------|-------------|--------|-------------|
| valid | Green | Default | Certification is valid |
| expiring | Orange | Orange border | Expires within 30 days |
| expired | Red | Red border | Already expired |
| unknown | Gray outline | Default | No expiration date set |

### Common Certifications (France)

- ISO 9001, ISO 14001, ISO 45001
- Qualibat, RGE (Reconnu Garant de l'Environnement)
- MASE (Manuel d'Amélioration Sécurité des Entreprises)
- CEFRI (nucléaire)
- Qualifelec (électricité)

### Certificate Upload Note

Document upload functionality is deferred to Document Vault stories (Epic 2.8+).
The `documentId` field is already present in the schema for future integration.

### References

- [Source: epics.md#Story 2.4: Gestion Certifications & Qualifications]
- [FR11: User can add and manage certifications and qualifications]
- [FR15: User can view profile completeness score]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/server/db/schema/company.ts` | Modified | Added companyCertifications table |
| `src/server/api/routers/companyCertifications.ts` | Created | Certifications CRUD router |
| `src/server/api/root.ts` | Modified | Added companyCertifications router |
| `src/components/company/certifications-form.tsx` | Created | Certifications form with cards and dialog |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story created | Epic 2 Story 2.4 implementation |
| 2026-01-17 | Implementation verified | All acceptance criteria satisfied |

### Completion Notes

- All acceptance criteria satisfied
- Certifications schema with all required fields
- Expiration status detection (valid/expiring/expired/unknown)
- Visual indicators with colored badges and borders
- Alert summary showing count of expiring/expired certifications
- CRUD operations with Dialog form
- Delete confirmation with AlertDialog
- Integrated with profile completeness scoring (10% weight)
- Document upload deferred to Epic 2.8+ (Document Vault)
- All validations pass: typecheck, lint, build
