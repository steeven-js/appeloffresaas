# Story 1.4: Gestion Profil Utilisateur

Status: done

## Story

As a **logged-in user**,
I want **to update my account information (name, email)**,
So that **my profile reflects accurate information**.

## Acceptance Criteria

1. Account settings page exists at `/settings`
2. User can update their name - saved immediately
3. User can request email change - verification email sent to new address
4. Email is updated only after clicking verification link
5. Verification link valid for 1 hour
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Create account settings page (AC: #1)
  - [x] 1.1 Create `/settings/page.tsx`
  - [x] 1.2 Add navigation from dashboard

- [x] Task 2: Implement profile name update (AC: #2)
  - [x] 2.1 Create profile form component
  - [x] 2.2 Create `updateProfile` tRPC mutation
  - [x] 2.3 Update session to reflect new name (via page refresh)

- [x] Task 3: Implement email change flow (AC: #3, #4, #5)
  - [x] 3.1 Add `emailChangeTokens` table to schema
  - [x] 3.2 Create email change form component
  - [x] 3.3 Create `requestEmailChange` tRPC mutation
  - [x] 3.4 Create email verification page `/verify-email`
  - [x] 3.5 Create `verifyEmailChange` tRPC mutation
  - [x] 3.6 Add email template for verification

- [x] Task 4: Verification (AC: #6, #7, #8)
  - [x] 4.1 Run `pnpm typecheck` - passes
  - [x] 4.2 Run `pnpm lint` - passes
  - [x] 4.3 Run `pnpm build` - passes

## Dev Notes

### Technical Requirements

- **Auth**: Protected route (requires session)
- **Email**: Resend (already configured in Story 1.3)
- **Token**: 1 hour expiry for email verification
- **Session**: Sessions invalidated on email change (force re-login)

### Email Change Token Schema

```typescript
export const emailChangeTokens = createTable("email_change_tokens", {
  id: varchar("id", { length: 255 }).notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  newEmail: varchar("new_email", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

### File Structure

```
src/
├── app/
│   └── (auth)/
│       ├── settings/
│       │   └── page.tsx
│       └── verify-email/
│           └── page.tsx
├── components/
│   └── settings/
│       ├── profile-form.tsx
│       └── email-change-form.tsx
└── server/
    └── api/
        └── routers/
            └── user.ts  # New router for user operations
```

### References

- [Story 1.3] - Resend email service pattern
- [NextAuth session update](https://authjs.dev/guides/basics/refresh-token-rotation)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Build initially failed due to useSearchParams not wrapped in Suspense - fixed
- All verifications passed after fix

### Completion Notes List

1. **Settings Page**: Created `/settings` with profile and email change forms
2. **Profile Update**: Name saved immediately via tRPC mutation
3. **Email Change**: Verification email sent to new address, token valid 1 hour
4. **Session Management**: Sessions invalidated on email change (force re-login with new email)
5. **Security**: Duplicate email check, token expiry, session invalidation

### File List

**New Files:**
- `src/server/api/routers/user.ts` - User router with profile operations
- `src/components/settings/profile-form.tsx` - Profile name form
- `src/components/settings/email-change-form.tsx` - Email change form
- `src/app/(auth)/settings/page.tsx` - Settings page
- `src/app/(auth)/verify-email/page.tsx` - Email verification page

**Modified Files:**
- `src/server/db/schema/auth.ts` - Added emailChangeTokens table
- `src/server/api/root.ts` - Added user router
- `src/server/services/email/resend.ts` - Added sendEmailChangeVerification
- `src/app/(auth)/dashboard/page.tsx` - Added link to settings

## Senior Developer Review (AI)

**Review Date:** 2026-01-17
**Reviewer:** Claude Opus 4.5 (adversarial code review)
**Review Outcome:** Approved

### Review Summary

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | INFO | Session not auto-updated after name change | User must refresh page or re-login |
| 2 | INFO | Email change requires re-login | By design for security |

### Security Analysis

| Check | Result |
|-------|--------|
| Protected routes | ✅ protectedProcedure used |
| Duplicate email check | ✅ Before sending and on verification |
| Token expiry (1 hour) | ✅ Implemented |
| Session invalidation | ✅ On email change |

### Verification Checklist

| Check | Result |
|-------|--------|
| `pnpm typecheck` | ✅ Passes |
| `pnpm lint` | ✅ Passes |
| `pnpm build` | ✅ Passes |
| AC #1: Settings page | ✅ `/settings` |
| AC #2: Name update | ✅ Immediate save |
| AC #3: Email change request | ✅ Sends verification |
| AC #4: Verification required | ✅ Token validation |
| AC #5: Token expiry | ✅ 1 hour |

### Notes for Production

1. **Database Migration**: User must run `pnpm db:push` to create `email_change_tokens` table
2. **Session Refresh**: Name changes require page refresh to reflect in UI (JWT limitation)

**Verdict:** Complete implementation of profile management with proper security measures.
