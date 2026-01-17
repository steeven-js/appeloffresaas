# Story 2.6: Gestion Références Projets

Status: done

## Story

As a **user**,
I want **to add and manage project references**,
So that **I can demonstrate past experience relevant to new tenders**.

## Acceptance Criteria

1. Given I have a company profile
2. When I add a reference (project name, client, sector, amount, dates, description)
3. Then the reference is saved with all details
4. And I can tag references by sector (BTP, IT, Conseil, etc.)
5. And I can mark references as "highlight" for priority display
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Create database schema for project references (AC: #2, #3)
  - [x] 1.1 Create `companyProjectReferences` table
  - [x] 1.2 Add fields: projectName, clientName, clientType, sector, description
  - [x] 1.3 Add fields: amount, startDate, endDate, location
  - [x] 1.4 Add fields: contactName, contactEmail, contactPhone
  - [x] 1.5 Add fields: isHighlight, tags (JSON)

- [x] Task 2: Create tRPC router for project references (AC: #3, #4, #5)
  - [x] 2.1 Create `companyProjectReferences` router
  - [x] 2.2 Add `list` query with JSON parsing for tags
  - [x] 2.3 Add `get` query for single reference
  - [x] 2.4 Add `create` mutation
  - [x] 2.5 Add `update` mutation
  - [x] 2.6 Add `delete` mutation
  - [x] 2.7 Add `toggleHighlight` mutation
  - [x] 2.8 Define `PROJECT_SECTORS` constant

- [x] Task 3: Create UI for project references management (AC: #2, #3, #4, #5)
  - [x] 3.1 Create `ProjectReferencesForm` main component
  - [x] 3.2 Create `ProjectReferenceFormDialog` for create/edit
  - [x] 3.3 Create `ProjectReferenceCard` with highlight indicator
  - [x] 3.4 Add sector select dropdown with predefined sectors
  - [x] 3.5 Add tags as secondary badges
  - [x] 3.6 Add amount display with formatAmount helper (k€, M€)
  - [x] 3.7 Add contact reference section
  - [x] 3.8 Add summary with reference count, highlights, total amount
  - [x] 3.9 Add delete functionality with confirmation dialog

- [x] Task 4: Verification (AC: #6, #7, #8)
  - [x] 4.1 Run `pnpm typecheck`
  - [x] 4.2 Run `pnpm lint`
  - [x] 4.3 Run `pnpm build`

## Dev Notes

### Database Schema

```typescript
export const companyProjectReferences = createTable("company_project_references", {
  id: varchar("id", { length: 255 }).notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
  companyProfileId: varchar("company_profile_id", { length: 255 }).notNull().references(() => companyProfiles.id, { onDelete: "cascade" }),
  projectName: varchar("project_name", { length: 255 }).notNull(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientType: varchar("client_type", { length: 20 }), // "public" | "private"
  sector: varchar("sector", { length: 100 }),
  description: text("description"),
  amount: bigint("amount", { mode: "number" }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  location: varchar("location", { length: 255 }),
  contactName: varchar("contact_name", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  isHighlight: integer("is_highlight").default(0),
  tags: text("tags"), // JSON array
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

### Project Sectors

```typescript
const PROJECT_SECTORS = [
  "BTP",
  "IT / Numérique",
  "Services",
  "Conseil",
  "Industrie",
  "Transport",
  "Énergie",
  "Santé",
  "Éducation",
  "Finance",
  "Commerce",
  "Autre",
] as const;
```

### Amount Formatting

```typescript
function formatAmount(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")} M€`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)} k€`;
  }
  return `${amount} €`;
}
```

### Highlight Feature

- Toggle button with star icon on each card
- Highlighted references appear first in the list (sorted by isHighlight desc)
- Visual highlighting: primary border and background tint
- Used to prioritize key references in tender responses

### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| projectName | string | Yes | Nom du projet |
| clientName | string | Yes | Nom du client |
| clientType | enum | No | Public/Privé |
| sector | string | No | Secteur d'activité |
| description | string | No | Description du projet |
| amount | number | No | Montant en euros |
| startDate | date | No | Date de début |
| endDate | date | No | Date de fin |
| location | string | No | Localisation |
| contactName | string | No | Nom du contact référent |
| contactEmail | string | No | Email du contact |
| contactPhone | string | No | Téléphone du contact |
| isHighlight | boolean | No | Référence phare |
| tags | string[] | No | Tags/mots-clés |

### References

- [Source: epics.md#Story 2.6: Gestion Références Projets]
- [FR13: User can add and manage project references]
- [FR15: User can view profile completeness score]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/server/db/schema/company.ts` | Modified | Added companyProjectReferences table |
| `src/server/api/routers/companyProjectReferences.ts` | Created | Project references CRUD router |
| `src/server/api/root.ts` | Modified | Added companyProjectReferences router |
| `src/components/company/project-references-form.tsx` | Created | Project references form with cards and dialog |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story created | Epic 2 Story 2.6 implementation |
| 2026-01-17 | Implementation verified | All acceptance criteria satisfied |

### Completion Notes

- All acceptance criteria satisfied
- Project references schema with all required fields
- Sector tagging with 12 predefined French sectors
- Tags stored as JSON arrays
- Highlight toggle with star icon and visual highlighting
- Amount formatting (k€, M€) for display
- Contact reference section for client testimonials
- Summary showing reference count, highlights, and total amount
- CRUD operations with Dialog form
- Delete confirmation with AlertDialog
- Integrated with profile completeness scoring (10% weight)
- All validations pass: typecheck, lint, build
