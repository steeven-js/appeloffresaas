# Story 2.3: Gestion Données Financières

Status: done

## Story

As a **user**,
I want **to add and manage financial data (CA, effectifs, bilans)**,
So that **I can demonstrate my company's financial health in tenders**.

## Acceptance Criteria

1. Given I have a company profile
2. When I add financial data for the last 3 years (CA, résultat, effectif)
3. Then the data is saved with year associations
4. And I can update or correct past entries
5. And the system flags data older than 1 year as potentially stale
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Create database schema for financial data (AC: #2, #3)
  - [x] 1.1 Create `companyFinancialData` table with year, revenue, netIncome, employeeCount
  - [x] 1.2 Add foreign key to companyProfiles table
  - [x] 1.3 Add unique constraint on (companyProfileId, year)
  - [x] 1.4 Run db:push to sync schema

- [x] Task 2: Create tRPC router for financial data (AC: #3, #4, #5)
  - [x] 2.1 Create `companyFinancial` router
  - [x] 2.2 Add `getFinancialData` query with staleness indicator
  - [x] 2.3 Add `upsertFinancialYear` mutation (create or update by year)
  - [x] 2.4 Add `deleteFinancialYear` mutation
  - [x] 2.5 Add `getSuggestedYears` query (returns last 3 years)
  - [x] 2.6 Implement `isDataStale()` helper function

- [x] Task 3: Create UI for financial data management (AC: #2, #3, #4, #5)
  - [x] 3.1 Create `FinancialDataForm` component
  - [x] 3.2 Create `YearForm` sub-component for each year's data
  - [x] 3.3 Add fields: CA, résultat net, effectif per year
  - [x] 3.4 Add visual indicator for stale data (orange border + warning)
  - [x] 3.5 Add year selection dropdown to add new years
  - [x] 3.6 Add delete functionality with confirmation dialog
  - [x] 3.7 Add loading states and success/error messages

- [x] Task 4: Verification (AC: #6, #7, #8)
  - [x] 4.1 Run `pnpm typecheck`
  - [x] 4.2 Run `pnpm lint`
  - [x] 4.3 Run `pnpm build`

## Dev Notes

### Database Schema

```typescript
export const companyFinancialData = createTable(
  "company_financial_data",
  {
    id: varchar("id", { length: 255 }).notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
    companyProfileId: varchar("company_profile_id", { length: 255 }).notNull().references(() => companyProfiles.id, { onDelete: "cascade" }),
    year: integer("year").notNull(),
    revenue: bigint("revenue", { mode: "number" }), // Chiffre d'affaires in euros
    netIncome: bigint("net_income", { mode: "number" }), // Résultat net in euros
    employeeCount: integer("employee_count"), // Effectif
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("company_year_unique_idx").on(table.companyProfileId, table.year),
  ]
);
```

### Staleness Detection

Data is considered stale if it's from more than 1 year ago from the current year:
```typescript
function isDataStale(dataYear: number): boolean {
  const currentYear = new Date().getFullYear();
  return dataYear < currentYear - 1;
}
```

Example: In 2026, data from 2024 or earlier is flagged as stale.

### Financial Data Fields

| Field | Type | Description |
|-------|------|-------------|
| year | integer | Year of the financial data |
| revenue | bigint | Chiffre d'affaires (CA) in euros |
| netIncome | bigint | Résultat net in euros (can be negative) |
| employeeCount | integer | Number of employees (effectif) |

### UI Components

- `FinancialDataForm` - Main container with year selection
- `YearForm` - Individual year form with all financial fields
- Visual stale indicator: orange border and warning icon
- AlertDialog for delete confirmation

### Previous Story Learnings (2.2)

- Use coerce for number inputs in Zod schemas
- French error messages for user-facing errors
- Handle null vs empty string carefully in number inputs
- Use cards to group related form fields

### References

- [Source: epics.md#Story 2.3: Gestion Données Financières]
- [FR10: User can add and manage financial data]
- [FR15: User can view profile completeness score]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/server/db/schema/company.ts` | Modified | Added companyFinancialData table with unique constraint |
| `src/server/api/routers/companyFinancial.ts` | Created | Financial data CRUD router with staleness detection |
| `src/server/api/root.ts` | Modified | Added companyFinancial router |
| `src/components/company/financial-data-form.tsx` | Created | Financial data form with year management |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story created | Epic 2 Story 2.3 implementation |
| 2026-01-17 | Implementation verified | All acceptance criteria satisfied |

### Completion Notes

- All acceptance criteria satisfied
- Financial data schema created with unique constraint per year
- CRUD operations implemented: get, upsert, delete
- Staleness detection implemented (data older than 1 year)
- UI with year selection, visual stale indicators (orange theme)
- Delete confirmation with AlertDialog
- Integrated with profile completeness scoring (15% weight)
- All validations pass: typecheck, lint, build
