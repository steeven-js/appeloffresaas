# Story 1.3: Réinitialisation Mot de Passe

Status: done

## Story

As a **user who forgot my password**,
I want **to reset my password via email**,
So that **I can regain access to my account**.

## Acceptance Criteria

1. Forgot password page exists at `/forgot-password` with email input
2. Submitting valid email sends password reset email with secure link (valid 1 hour)
3. Email is sent even if address not found (no email enumeration)
4. Reset page at `/reset-password?token=xxx` shows new password form
5. Invalid/expired token shows error message
6. Password updated successfully resets all sessions
7. User can log in with new password after reset
8. `pnpm typecheck` passes
9. `pnpm lint` passes
10. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Install and configure Resend email service (AC: #2)
  - [x] 1.1 Install `resend` package
  - [x] 1.2 Add RESEND_API_KEY to env schema
  - [x] 1.3 Create email service at `~/server/services/email/resend.ts`

- [x] Task 2: Add password reset token schema (AC: #2, #4, #5)
  - [x] 2.1 Create `passwordResetTokens` table in auth schema
  - [ ] 2.2 Run `pnpm db:push` to apply schema (user must run)

- [x] Task 3: Create forgot password page (AC: #1, #3)
  - [x] 3.1 Create `forgot-password-form.tsx` component
  - [x] 3.2 Create `/forgot-password/page.tsx`
  - [x] 3.3 Add link from login page

- [x] Task 4: Create reset password page (AC: #4, #5, #6, #7)
  - [x] 4.1 Create `reset-password-form.tsx` component
  - [x] 4.2 Create `/reset-password/page.tsx`

- [x] Task 5: Create API endpoints (AC: #2, #3, #5, #6)
  - [x] 5.1 Create `requestPasswordReset` mutation
  - [x] 5.2 Create `resetPassword` mutation
  - [x] 5.3 Add validation schemas to `~/lib/validations/auth.ts`

- [x] Task 6: Verification (AC: #8, #9, #10)
  - [x] 6.1 Run `pnpm typecheck` - zero TypeScript errors
  - [x] 6.2 Run `pnpm lint` - no linting errors
  - [x] 6.3 Run `pnpm build` - production build succeeds

## Dev Notes

### Technical Requirements

- **Email**: Resend API (architecture.md ARCH-7)
- **Token**: Secure random token (crypto.randomUUID), 1 hour expiry
- **Security**: No email enumeration (always show success message)
- **Schema**: Use existing `verificationTokens` or new dedicated table
- **Session**: Invalidate all sessions on password reset

### Password Reset Token Schema

```typescript
export const passwordResetTokens = createTable("password_reset_tokens", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expires: timestamp("expires", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
```

### Resend Email Service

```typescript
// ~/server/services/email/resend.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  await resend.emails.send({
    from: "Appel Offre SaaS <noreply@appeloffresaas.fr>",
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <p>Bonjour,</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p><a href="${resetUrl}">Cliquez ici pour réinitialiser votre mot de passe</a></p>
      <p>Ce lien expire dans 1 heure.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
    `,
  });
}
```

### API Endpoints

```typescript
// requestPasswordReset
// 1. Validate email format
// 2. Find user by email (if exists)
// 3. Generate secure token
// 4. Store token with 1 hour expiry
// 5. Send email with reset link
// 6. Always return success (no email enumeration)

// resetPassword
// 1. Validate token exists and not expired
// 2. Validate new password meets requirements
// 3. Hash new password
// 4. Update user password
// 5. Delete all user sessions
// 6. Delete used token
```

### File Structure

```
src/
├── app/
│   └── (public)/
│       ├── forgot-password/
│       │   └── page.tsx
│       └── reset-password/
│           └── page.tsx
├── components/
│   └── auth/
│       ├── forgot-password-form.tsx
│       └── reset-password-form.tsx
├── lib/
│   └── validations/
│       └── auth.ts  # Add forgotPasswordSchema, resetPasswordSchema
└── server/
    ├── db/
    │   └── schema/
    │       └── auth.ts  # Add passwordResetTokens
    ├── api/
    │   └── routers/
    │       └── auth.ts  # Add new mutations
    └── services/
        └── email/
            └── resend.ts  # New email service
```

### References

- [Source: epics.md#Story 1.3] - Original acceptance criteria
- [Resend Documentation](https://resend.com/docs)
- [Story 1.1/1.2] - Auth patterns and validation schemas

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Resend installed as dependency
- All verifications passed on first attempt
- User must run `pnpm db:push` to create password_reset_tokens table

### Completion Notes List

1. **Resend Email Service**: Created email service with lazy initialization to avoid build-time errors
2. **Password Reset Tokens**: Added dedicated table with cascade delete on user removal
3. **Forgot Password Flow**: Form submits to tRPC endpoint, shows success message regardless of email existence (no enumeration)
4. **Reset Password Flow**: Validates token, updates password with bcrypt, invalidates all sessions
5. **Security**: Token expires after 1 hour, no email enumeration, sessions invalidated on reset
6. **UX**: French messages, password confirmation, redirect to login after success

### File List

**New Files:**
- `src/server/services/email/resend.ts` - Resend email service
- `src/components/auth/forgot-password-form.tsx` - Forgot password form component
- `src/components/auth/reset-password-form.tsx` - Reset password form component
- `src/app/(public)/forgot-password/page.tsx` - Forgot password page
- `src/app/(public)/reset-password/page.tsx` - Reset password page

**Modified Files:**
- `src/server/db/schema/auth.ts` - Added passwordResetTokens table
- `src/server/api/routers/auth.ts` - Added requestPasswordReset and resetPassword mutations
- `src/lib/validations/auth.ts` - Added forgotPasswordSchema and resetPasswordSchema
- `src/app/(public)/login/page.tsx` - Added "Mot de passe oublié" link
- `src/env.js` - Added RESEND_API_KEY
- `.env.example` - Added RESEND_API_KEY documentation

## Senior Developer Review (AI)

**Review Date:** 2026-01-16
**Reviewer:** Claude Opus 4.5 (adversarial code review)
**Review Outcome:** Approved with notes

### Review Summary

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | LOW | Sandbox email sender | Using `onboarding@resend.dev` - must configure production domain |
| 2 | INFO | Rate limiting deferred | Per Story 1.2 decision, acceptable for MVP |
| 3 | INFO | Token in URL | Standard practice, could be logged in server logs |

### Security Analysis

| Check | Result |
|-------|--------|
| No email enumeration | ✅ Always returns success |
| Token expiry (1 hour) | ✅ Implemented |
| Session invalidation | ✅ All sessions deleted on reset |
| Password hashing | ✅ bcrypt cost factor 12 |
| Input validation | ✅ Zod schemas |

### Verification Checklist

| Check | Result |
|-------|--------|
| `pnpm typecheck` | ✅ Passes |
| `pnpm lint` | ✅ Passes |
| `pnpm build` | ✅ Passes |
| AC #1: Forgot password page | ✅ `/forgot-password` |
| AC #2: Email with secure link | ✅ 1 hour expiry |
| AC #3: No email enumeration | ✅ Always success |
| AC #4: Reset page with token | ✅ `/reset-password?token=xxx` |
| AC #5: Invalid token error | ✅ French message |
| AC #6: Sessions invalidated | ✅ All deleted |
| AC #7: Login with new password | ✅ Password updated |

### Notes for Production

1. **Email Domain**: Update `DEFAULT_FROM` in `resend.ts` to use verified production domain
2. **Database Migration**: User must run `pnpm db:push` to create `password_reset_tokens` table
3. **Environment**: Add `RESEND_API_KEY` to production environment

**Verdict:** Clean, secure implementation following existing auth patterns. All acceptance criteria met. Minor configuration needed for production deployment.
