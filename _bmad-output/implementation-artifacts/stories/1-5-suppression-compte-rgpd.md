# Story 1.5: Suppression Compte (RGPD)

Status: done

## Story

As a **user**,
I want **to delete my account and all associated data**,
So that **I can exercise my RGPD right to erasure**.

## Acceptance Criteria

1. Delete account button exists on settings page
2. Confirmation dialog requires password entry
3. Account and all data permanently deleted on confirmation
4. Confirmation email sent after deletion
5. User logged out after deletion
6. `pnpm typecheck` passes
7. `pnpm lint` passes
8. `pnpm build` succeeds

**Note:** For MVP, deletion is immediate. 30-day soft delete can be added later.

## Tasks / Subtasks

- [x] Task 1: Create delete account UI (AC: #1, #2)
  - [x] 1.1 Create delete account dialog component with password input
  - [x] 1.2 Add danger zone section to settings page

- [x] Task 2: Create delete account API (AC: #3, #5)
  - [x] 2.1 Create `deleteAccount` tRPC mutation
  - [x] 2.2 Delete all user data (cascade) - wrapped in transaction
  - [x] 2.3 Invalidate sessions

- [x] Task 3: Send confirmation email (AC: #4)
  - [x] 3.1 Add deletion confirmation email template

- [x] Task 4: Verification (AC: #6, #7, #8)
  - [x] 4.1 Run `pnpm typecheck`
  - [x] 4.2 Run `pnpm lint`
  - [x] 4.3 Run `pnpm build`

## Dev Notes

### Technical Requirements

- **Password verification**: Require current password for deletion
- **Cascade delete**: Use database transaction for atomic deletion
- **Session**: Invalidate all sessions and sign out
- **Email**: Send confirmation via Resend

### Delete Account Flow

```
1. User clicks "Delete account"
2. Dialog opens with password input
3. User enters password and confirms
4. API validates password
5. Delete all user data (in transaction)
6. Delete all sessions
7. Send confirmation email
8. Sign out user
9. Redirect to homepage
```

### File Structure

```
src/
├── components/
│   └── settings/
│       └── delete-account-dialog.tsx  # New
└── server/
    └── api/
        └── routers/
            └── user.ts  # Add deleteAccount mutation
```

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/components/settings/delete-account-dialog.tsx` | Created | Dialog component with password confirmation for account deletion |
| `src/components/ui/dialog.tsx` | Created | shadcn/ui Dialog component (dependency) |
| `src/app/(auth)/settings/page.tsx` | Modified | Added "Zone de danger" section with DeleteAccountDialog |
| `src/server/api/routers/user.ts` | Modified | Added `deleteAccount` mutation with transaction |
| `src/server/services/email/resend.ts` | Modified | Added `sendAccountDeletionConfirmation` email template |
| `package.json` | Modified | Added @radix-ui/react-dialog dependency |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Initial implementation | Story 1.5 development |
| 2026-01-17 | Code review fixes | Added transaction, improved OAuth error message, dark mode support |

### Review Notes

- OAuth users without password get helpful error message guiding them to set password first
- All deletions wrapped in database transaction for data integrity
- Dark mode support added to warning box
- Rate limiting deferred to infrastructure setup (future enhancement)
