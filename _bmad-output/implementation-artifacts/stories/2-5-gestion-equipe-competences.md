# Story 2.5: Gestion Équipe & Compétences

Status: done

## Story

As a **user**,
I want **to add team members with their CVs and competencies**,
So that **I can showcase my team's expertise in tenders**.

## Acceptance Criteria

1. Given I have a company profile
2. When I add a team member (name, role, experience, skills)
3. Then the team member is saved to my profile
4. And I can upload their CV document (deferred to Document Vault - Epic 2.8+)
5. And I can list their key competencies and years of experience
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Create database schema for team members (AC: #2, #3)
  - [x] 1.1 Create `companyTeamMembers` table
  - [x] 1.2 Add fields: firstName, lastName, email, phone, role, department
  - [x] 1.3 Add fields: yearsOfExperience, skills (JSON), education
  - [x] 1.4 Add fields: personalCertifications (JSON), bio, isKeyPerson
  - [x] 1.5 Add cvDocumentId for future document vault integration

- [x] Task 2: Create tRPC router for team members (AC: #3, #5)
  - [x] 2.1 Create `companyTeamMembers` router
  - [x] 2.2 Add `list` query with JSON parsing for skills/certifications
  - [x] 2.3 Add `get` query for single team member
  - [x] 2.4 Add `create` mutation
  - [x] 2.5 Add `update` mutation
  - [x] 2.6 Add `delete` mutation
  - [x] 2.7 Add `toggleKeyPerson` mutation

- [x] Task 3: Create UI for team members management (AC: #2, #3, #5)
  - [x] 3.1 Create `TeamMembersForm` main component
  - [x] 3.2 Create `TeamMemberFormDialog` for create/edit
  - [x] 3.3 Create `TeamMemberCard` with key person indicator
  - [x] 3.4 Add skills as secondary badges
  - [x] 3.5 Add personal certifications as outline badges
  - [x] 3.6 Add years of experience display
  - [x] 3.7 Add summary with member count and key person count
  - [x] 3.8 Add delete functionality with confirmation dialog

- [x] Task 4: Verification (AC: #6, #7, #8)
  - [x] 4.1 Run `pnpm typecheck`
  - [x] 4.2 Run `pnpm lint`
  - [x] 4.3 Run `pnpm build`

## Dev Notes

### Database Schema

```typescript
export const companyTeamMembers = createTable("company_team_members", {
  id: varchar("id", { length: 255 }).notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
  companyProfileId: varchar("company_profile_id", { length: 255 }).notNull().references(() => companyProfiles.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 255 }).notNull(),
  department: varchar("department", { length: 100 }),
  yearsOfExperience: integer("years_of_experience"),
  skills: text("skills"), // JSON array
  education: text("education"),
  personalCertifications: text("personal_certifications"), // JSON array
  cvDocumentId: varchar("cv_document_id", { length: 255 }), // Future document vault ref
  bio: text("bio"),
  isKeyPerson: integer("is_key_person").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

### Skills and Certifications Storage

- Stored as JSON arrays in text fields
- Parsed on read, stringified on write
- Displayed as badges in the UI
- Input as comma-separated values in form

### Key Person Feature

- Toggle button with star icon on each card
- Key persons appear first in the list (sorted by isKeyPerson desc)
- Visual highlighting: primary border and background tint
- Used to prioritize team members in tender responses

### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| firstName | string | Yes | Prénom |
| lastName | string | Yes | Nom |
| email | string | No | Email professionnel |
| phone | string | No | Téléphone |
| role | string | Yes | Poste / Fonction |
| department | string | No | Service / Département |
| yearsOfExperience | number | No | Années d'expérience |
| skills | string[] | No | Compétences (comma-separated) |
| education | string | No | Formation / Diplôme |
| personalCertifications | string[] | No | Certifications (comma-separated) |
| bio | string | No | Biographie courte |
| isKeyPerson | boolean | No | Personne clé pour AO |

### CV Upload Note

CV document upload functionality is deferred to Document Vault stories (Epic 2.8+).
The `cvDocumentId` field is already present in the schema for future integration.

### References

- [Source: epics.md#Story 2.5: Gestion Équipe & Compétences]
- [FR12: User can add and manage team members information]
- [FR15: User can view profile completeness score]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/server/db/schema/company.ts` | Modified | Added companyTeamMembers table |
| `src/server/api/routers/companyTeamMembers.ts` | Created | Team members CRUD router |
| `src/server/api/root.ts` | Modified | Added companyTeamMembers router |
| `src/components/company/team-members-form.tsx` | Created | Team members form with cards and dialog |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Story created | Epic 2 Story 2.5 implementation |
| 2026-01-17 | Implementation verified | All acceptance criteria satisfied |

### Completion Notes

- All acceptance criteria satisfied
- Team members schema with all required fields
- Skills and personal certifications stored as JSON arrays
- Key person toggle with star icon and visual highlighting
- Summary showing member count and key person count
- CRUD operations with Dialog form
- Delete confirmation with AlertDialog
- Integrated with profile completeness scoring (10% weight)
- CV upload deferred to Epic 2.8+ (Document Vault)
- All validations pass: typecheck, lint, build
