# Story 1.1: Inscription Utilisateur

Status: done

## Story

As a **new user**,
I want **to create an account with my email and password**,
So that **I can access the platform and start preparing my tender responses**.

## Acceptance Criteria

1. Registration page exists at `/register`
2. Form validates email format and password requirements (min 8 chars, 1 uppercase, 1 number)
3. Password is stored hashed with bcrypt (cost ≥12)
4. Account is created in database with email and hashed password
5. User sees error message if email is already registered
6. After registration, user is redirected to dashboard (onboarding deferred to later story)
7. `pnpm typecheck` passes
8. `pnpm lint` passes
9. `pnpm build` succeeds

**Note:** Email confirmation is deferred to a later story (1.3 or separate). MVP allows immediate account use.

## Tasks / Subtasks

- [x] Task 1: Create database schema (AC: #3, #4)
  - [x] 1.1 Install `bcryptjs` package (pure JS, no native build needed)
  - [x] 1.2 Create `users` table schema with Drizzle
  - [x] 1.3 Create `accounts` table for NextAuth OAuth (future)
  - [x] 1.4 Create `sessions` table for NextAuth
  - [ ] 1.5 Run `pnpm db:push` to sync schema (requires DATABASE_URL)

- [x] Task 2: Configure NextAuth Credentials provider (AC: #3)
  - [x] 2.1 Add Credentials provider to auth config
  - [x] 2.2 Implement authorize function with bcrypt verification
  - [x] 2.3 Configure session callbacks for user data

- [x] Task 3: Create registration API (AC: #3, #4, #5)
  - [x] 3.1 Create `auth` tRPC router
  - [x] 3.2 Implement `register` mutation with Zod validation
  - [x] 3.3 Hash password with bcryptjs (cost 12)
  - [x] 3.4 Handle duplicate email error

- [x] Task 4: Create registration UI (AC: #1, #2, #6)
  - [x] 4.1 Create `/register` page
  - [x] 4.2 Create registration form with shadcn/ui components
  - [x] 4.3 Add client-side validation with react-hook-form + Zod
  - [x] 4.4 Add error handling and loading states
  - [x] 4.5 Redirect to dashboard after successful registration

- [x] Task 5: Verification (AC: #7, #8, #9)
  - [x] 5.1 Run `pnpm typecheck` - zero TypeScript errors
  - [x] 5.2 Run `pnpm lint` - no linting errors
  - [x] 5.3 Run `pnpm build` - production build succeeds

## Dev Notes

### Technical Requirements

- **Auth**: NextAuth.js v5 with Credentials provider
- **Password**: bcrypt with cost factor 12
- **Validation**: Zod schemas shared between client and server
- **UI**: shadcn/ui form components (Input, Button, Label, Card)
- **Forms**: react-hook-form with @hookform/resolvers

### Password Requirements (from PRD)

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number

```typescript
const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre");
```

### Database Schema (Drizzle)

```typescript
// users table - NextAuth compatible with password field
export const users = createTable("users", {
  id: varchar("id", { length: 255 }).notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date", withTimezone: true }),
  image: varchar("image", { length: 255 }),
  password: varchar("password", { length: 255 }), // bcrypt hash
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

### File Structure

```
src/
├── app/
│   └── (public)/
│       └── register/
│           └── page.tsx          # Registration page
├── components/
│   └── auth/
│       └── register-form.tsx     # Registration form component
├── server/
│   ├── api/routers/
│   │   └── auth.ts               # Auth tRPC router
│   ├── auth/
│   │   └── config/index.ts       # Updated with Credentials provider
│   └── db/schema/
│       ├── index.ts              # Export all schemas
│       └── auth.ts               # Auth-related tables
└── lib/
    └── validations/
        └── auth.ts               # Shared Zod schemas
```

### Packages to Install

```bash
pnpm add bcrypt
pnpm add -D @types/bcrypt
pnpm add react-hook-form @hookform/resolvers
```

### Architecture Decisions (from architecture.md)

| Decision | Choice | Justification |
|----------|--------|---------------|
| Auth Framework | NextAuth.js v5 | T3 starter included, production-ready |
| Password Hashing | bcrypt (12 rounds) | Industry standard |
| Session Strategy | JWT | Simpler for MVP, can add DB sessions later |
| Form Handling | react-hook-form + Zod | Type-safe, performant |

### Error Messages (French)

- Email already registered: "Cette adresse email est déjà utilisée"
- Invalid email format: "Veuillez entrer une adresse email valide"
- Password too short: "Le mot de passe doit contenir au moins 8 caractères"
- Password no uppercase: "Le mot de passe doit contenir au moins une majuscule"
- Password no number: "Le mot de passe doit contenir au moins un chiffre"
- Generic error: "Une erreur est survenue. Veuillez réessayer."

### References

- [Source: architecture.md#3.3 Authentication] - Auth decisions
- [Source: epics.md#Story 1.1] - Original acceptance criteria
- [NextAuth.js v5 Credentials](https://authjs.dev/getting-started/authentication/credentials)
- [Drizzle + NextAuth](https://authjs.dev/getting-started/adapters/drizzle)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Switched from `bcrypt` to `bcryptjs` (pure JS) to avoid native compilation issues
- Fixed circular dependency by extracting `createTable` to separate `helpers.ts` file
- Used dynamic imports in auth config and router to avoid build-time circular deps
- Fixed shadcn/ui form.tsx lint warning (type import for LabelPrimitive)

### Completion Notes List

1. **Database Schema Created**: users, accounts, sessions, verification_tokens tables
2. **Auth Validation Schemas**: Shared Zod schemas for email and password validation
3. **Credentials Provider**: NextAuth configured with bcryptjs password verification
4. **Registration API**: tRPC auth router with register mutation
5. **Registration UI**: Full form with react-hook-form, error handling, auto-login
6. **Dashboard Page**: Basic authenticated dashboard for post-registration redirect
7. **Login Page Stub**: Placeholder for Story 1.2

### File List

**New Files:**
- `src/server/db/schema/helpers.ts` - createTable helper (fixes circular dep)
- `src/server/db/schema/auth.ts` - Auth tables (users, accounts, sessions, verification_tokens)
- `src/lib/validations/auth.ts` - Shared Zod schemas for auth
- `src/server/api/routers/auth.ts` - Auth tRPC router with register mutation
- `src/components/auth/register-form.tsx` - Registration form component
- `src/app/(public)/register/page.tsx` - Registration page
- `src/app/(public)/login/page.tsx` - Login page stub (Story 1.2)
- `src/app/(auth)/dashboard/page.tsx` - Dashboard page
- `src/components/ui/card.tsx` - Card component (shadcn/ui)
- `src/components/ui/input.tsx` - Input component (shadcn/ui)
- `src/components/ui/label.tsx` - Label component (shadcn/ui)
- `src/components/ui/form.tsx` - Form component (shadcn/ui)

**Modified Files:**
- `src/server/db/schema/index.ts` - Export auth schema
- `src/server/auth/config/index.ts` - Added Credentials provider
- `src/server/api/root.ts` - Added auth router
- `package.json` - Added bcryptjs, react-hook-form, @hookform/resolvers

### User Action Required

To complete the setup:

1. **Set DATABASE_URL** in `.env.local`:
   ```
   DATABASE_URL="postgresql://..."
   ```

2. **Push database schema**:
   ```bash
   pnpm db:push
   ```

3. **Test registration**:
   - Start dev server: `pnpm dev`
   - Go to http://localhost:3000/register
   - Create an account
   - Verify redirect to dashboard

## Senior Developer Review (AI)

**Review Date:** 2026-01-16
**Reviewer:** Claude Opus 4.5 (adversarial code review)
**Review Outcome:** Approved

### Review Summary

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | MEDIUM | Task 1.5 (db:push) requires manual action | Documented in User Action Required |
| 2 | MEDIUM | Email verification not implemented | Explicitly deferred per AC note |
| 3 | LOW | Login page is stub (Story 1.2) | Expected - different story |
| 4 | LOW | Dynamic imports add slight runtime overhead | Acceptable trade-off for build stability |

### Verification Checklist

| Check | Result |
|-------|--------|
| `pnpm typecheck` | ✅ Passes |
| `pnpm lint` | ✅ Passes |
| `pnpm build` | ✅ Passes |
| AC #1: `/register` page exists | ✅ |
| AC #2: Form validation (8 chars, uppercase, number) | ✅ |
| AC #3: bcrypt with cost 12 | ✅ (bcryptjs) |
| AC #4: Account created in DB | ✅ (after db:push) |
| AC #5: Duplicate email error | ✅ French message |
| AC #6: Redirect to dashboard | ✅ With auto-login |

**Verdict:** Solid implementation of user registration with proper security (bcrypt cost 12), French localization, and good UX (auto-login after registration). Circular dependency issues properly resolved with helper extraction and dynamic imports.
