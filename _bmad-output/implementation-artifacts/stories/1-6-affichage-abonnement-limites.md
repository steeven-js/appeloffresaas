# Story 1.6: Affichage Abonnement & Limites

Status: done

## Story

As a **user**,
I want **to see my current subscription tier and usage limits**,
So that **I know what features I can access and when I need to upgrade**.

## Acceptance Criteria

1. Billing page exists at `/billing` route
2. Page displays current tier (Free, Pro, or Business)
3. Page displays usage metrics (projects created, documents stored)
4. Page displays limits for current tier
5. Page displays comparison table with all tiers
6. Free tier is the default for new users
7. `pnpm typecheck` passes
8. `pnpm lint` passes
9. `pnpm build` succeeds

**Note:** This story focuses on displaying subscription info. Actual Stripe payment integration is in Story 1.7.

## Tasks / Subtasks

- [x] Task 1: Add subscription schema (AC: #6)
  - [x] 1.1 Add `subscriptionTier` enum to schema (FREE, PRO, BUSINESS)
  - [x] 1.2 Add `subscriptionTier` field to users table (default: FREE)
  - [x] 1.3 Run `pnpm db:push` to sync schema

- [x] Task 2: Define tier limits configuration (AC: #4)
  - [x] 2.1 Create `lib/subscription-tiers.ts` with tier definitions
  - [x] 2.2 Define limits: maxProjects, maxDocuments, maxTeamMembers, features

- [x] Task 3: Create billing API (AC: #2, #3)
  - [x] 3.1 Add `getSubscription` query to user router
  - [x] 3.2 Return tier, limits, and usage stats

- [x] Task 4: Create billing page UI (AC: #1, #2, #3, #4, #5)
  - [x] 4.1 Create `/billing` page with auth protection
  - [x] 4.2 Create `SubscriptionCard` component showing current tier
  - [x] 4.3 Create `UsageDisplay` component showing usage vs limits
  - [x] 4.4 Create `TierComparison` component with all tiers table
  - [x] 4.5 Add upgrade CTA buttons (disabled for now, enabled in 1.7)

- [x] Task 5: Verification (AC: #7, #8, #9)
  - [x] 5.1 Run `pnpm typecheck`
  - [x] 5.2 Run `pnpm lint`
  - [x] 5.3 Run `pnpm build`

## Dev Notes

### Tier Definitions (from PRD)

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| Projects/mois | 1 | 10 | Illimité |
| Documents coffre-fort | 10 | 100 | Illimité |
| Team members | 1 | 5 | 20 |
| AI assistance | Basic | Full | Full + Priority |
| Export formats | PDF | PDF, Word | PDF, Word, ZIP |
| Support | Email | Priority | Dedicated |

### Technical Requirements

- **Database**: Add `subscription_tier` enum and field to users table
- **Default tier**: All new users start on FREE tier
- **Usage tracking**: For MVP, count existing records (projects, documents)
- **UI pattern**: Use shadcn/ui Card components for tier display
- **Route**: `/billing` in `(auth)` route group (protected)

### File Structure

```
src/
├── app/
│   └── (auth)/
│       └── billing/
│           ├── page.tsx              # New
│           ├── loading.tsx           # New - loading skeleton
│           └── error.tsx             # New - error boundary
├── components/
│   └── billing/
│       ├── subscription-card.tsx     # New
│       ├── usage-display.tsx         # New
│       └── tier-comparison.tsx       # New
├── lib/
│   └── subscription-tiers.ts         # New - tier definitions
└── server/
    ├── api/
    │   └── routers/
    │       └── user.ts               # Modified - add getSubscription
    └── db/
        └── schema/
            └── auth.ts               # Modified - add subscriptionTier
```

### Previous Story Learnings (1.5)

- Use transactions for multi-table operations
- Add dark mode support to custom color classes (`dark:bg-*`)
- French error messages for user-facing errors
- Settings components go in `components/settings/`

### Architecture Compliance

- **Route group**: Use `(auth)` for protected routes
- **Server Components**: Page should be server component, fetch data via tRPC
- **Client Components**: Interactive components marked with `"use client"`
- **tRPC pattern**: Add query to existing `userRouter`
- **Naming**: `getSubscription` for query, `SubscriptionTier` for enum

### References

- [Source: epics.md#Story 1.6: Affichage Abonnement & Limites]
- [Source: architecture.md#ARCH-6 - Stripe integration]
- [Source: project-context.md#tRPC API patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/server/db/schema/auth.ts` | Modified | Added `subscriptionTierEnum` and `subscriptionTier` field to users |
| `src/lib/subscription-tiers.ts` | Created | Tier definitions with limits, features, and helper functions |
| `src/server/api/routers/user.ts` | Modified | Added `getSubscription` query with teamMembers percentage |
| `src/app/(auth)/billing/page.tsx` | Created | Billing page with subscription info |
| `src/app/(auth)/billing/loading.tsx` | Created | Loading skeleton for billing page |
| `src/app/(auth)/billing/error.tsx` | Created | Error boundary for billing page |
| `src/components/billing/subscription-card.tsx` | Created | Current tier display card |
| `src/components/billing/usage-display.tsx` | Created | Usage metrics with progress bars |
| `src/components/billing/tier-comparison.tsx` | Created | Tier comparison table with mobile overflow |
| `src/app/(auth)/settings/page.tsx` | Modified | Added link to billing page |
| `src/components/ui/badge.tsx` | Created | shadcn/ui Badge component |
| `src/components/ui/progress.tsx` | Created | shadcn/ui Progress component |
| `src/components/ui/table.tsx` | Created | shadcn/ui Table component |
| `src/components/ui/skeleton.tsx` | Created | shadcn/ui Skeleton component |
| `package.json` | Modified | Added @radix-ui/react-progress dependency |
| `pnpm-lock.yaml` | Modified | Updated lock file with new dependencies |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Initial implementation | Story 1.6 development |
| 2026-01-17 | Layout fix | Fixed page centering to match other pages |
| 2026-01-17 | Code review fixes | Added loading/error states, fixed consistency issues, mobile overflow |

### Completion Notes

- All acceptance criteria satisfied
- Billing page accessible at `/billing` with auth protection
- Current tier displayed with subscription card showing price and features
- Usage metrics displayed with progress bars (0 for MVP since no projects/documents yet)
- Tier comparison table with all three tiers (Free, Pro, Business)
- Upgrade buttons disabled (will be enabled in Story 1.7 with Stripe)
- Database schema updated with subscription_tier enum (default: FREE)
- Link to billing page added from settings page
- Loading skeleton and error boundary added for better UX
- Mobile-responsive table with overflow-x-auto
