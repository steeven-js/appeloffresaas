# Story 2.1: Création Profil Entreprise de Base

Status: done

## Story

As a **user**,
I want **to create my company profile with basic information (name, SIRET, address)**,
So that **my company identity is established for all future tenders**.

## Acceptance Criteria

1. User can access company profile page from navigation
2. User can fill in company name, SIRET (14 digits), address, and contact info
3. Company profile is created and saved to database
4. User sees confirmation message on save
5. Profile completeness score updates based on filled fields
6. SIRET format is validated (14 digits)
7. `pnpm typecheck` passes
8. `pnpm lint` passes
9. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Create database schema for company profiles (AC: #2, #3)
  - [x] 1.1 Create `companyProfiles` table with fields: name, siret, address, city, postalCode, country, phone, email, website
  - [x] 1.2 Add foreign key to users table
  - [x] 1.3 Run db:push to sync schema

- [x] Task 2: Create tRPC router for company profile (AC: #3)
  - [x] 2.1 Create `companyProfile` router with CRUD operations
  - [x] 2.2 Add `getProfile` query
  - [x] 2.3 Add `upsertProfile` mutation (create or update)
  - [x] 2.4 Add SIRET validation (14 digits)

- [x] Task 3: Create company profile page UI (AC: #1, #2, #4)
  - [x] 3.1 Create `/profile/company` page
  - [x] 3.2 Add form with all required fields
  - [x] 3.3 Add SIRET input with format validation
  - [x] 3.4 Add save button with loading state
  - [x] 3.5 Show success toast on save

- [x] Task 4: Add profile completeness calculation (AC: #5)
  - [x] 4.1 Create `calculateProfileCompleteness` function
  - [x] 4.2 Display completeness percentage on profile page

- [x] Task 5: Add navigation link (AC: #1)
  - [x] 5.1 Add "Profil Entreprise" link to sidebar/settings

- [x] Task 6: Verification (AC: #7, #8, #9)
  - [x] 6.1 Run `pnpm typecheck`
  - [x] 6.2 Run `pnpm lint`
  - [x] 6.3 Run `pnpm build`

## Dev Notes

### Database Schema

```typescript
export const companyProfiles = pgTable("company_profile", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }),
  siret: varchar("siret", { length: 14 }),
  address: text("address"),
  city: varchar("city", { length: 255 }),
  postalCode: varchar("postal_code", { length: 10 }),
  country: varchar("country", { length: 255 }).default("France"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

### SIRET Validation

- Must be exactly 14 digits
- French business identifier format
- Can include spaces for display but store without spaces

### Completeness Score

Basic fields for Story 2.1:
- name: 20%
- siret: 20%
- address + city + postalCode: 30%
- phone or email: 15%
- website: 15%

### Previous Story Learnings (1.7)

- Use lazy initialization for external services
- French error messages for user-facing errors
- Loading states for all async operations
- Use consistent layout pattern

### References

- [Source: epics.md#Story 2.1: Création Profil Entreprise de Base]
- [FR8: User can create and edit company profile]
- [FR15: User can view profile completeness score]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/server/db/schema/company.ts` | Created | Company profiles table schema |
| `src/server/db/schema/index.ts` | Modified | Export company schema |
| `src/server/api/routers/companyProfile.ts` | Created | Company profile CRUD router |
| `src/server/api/root.ts` | Modified | Added companyProfile router |
| `src/app/(auth)/profile/company/page.tsx` | Created | Company profile page |
| `src/components/company/company-profile-form.tsx` | Created | Company profile form component |
| `src/app/(auth)/settings/page.tsx` | Modified | Added link to company profile |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story created | Epic 2 starting |
| 2026-01-17 | Implementation complete | All tasks completed |

### Completion Notes

- All acceptance criteria satisfied
- Company profile schema created with all required fields
- SIRET validation (14 digits) implemented
- Profile completeness score calculated based on filled fields
- Navigation link added from settings page
- Build passes successfully
