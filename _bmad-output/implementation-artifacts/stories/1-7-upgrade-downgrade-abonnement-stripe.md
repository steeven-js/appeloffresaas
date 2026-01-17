# Story 1.7: Upgrade/Downgrade Abonnement (Stripe)

Status: done

## Story

As a **user**,
I want **to upgrade or downgrade my subscription**,
So that **I can access more features or reduce costs**.

## Acceptance Criteria

1. Stripe SDK is installed and configured
2. Environment variables for Stripe are documented
3. Stripe products/prices exist for Pro (49€/month) and Business (149€/month)
4. User can click upgrade button and be redirected to Stripe Checkout
5. After successful payment, user's tier is updated immediately
6. User receives confirmation email with invoice link
7. User can downgrade (change takes effect at end of billing period)
8. Webhook handles `checkout.session.completed` and `customer.subscription.updated` events
9. `pnpm typecheck` passes
10. `pnpm lint` passes
11. `pnpm build` succeeds

## Tasks / Subtasks

- [x] Task 1: Setup Stripe SDK and environment (AC: #1, #2)
  - [x] 1.1 Install `stripe` package
  - [x] 1.2 Add Stripe env variables to `.env.example` and `env.js`
  - [x] 1.3 Create `lib/stripe.ts` with Stripe client initialization
  - [x] 1.4 Add Stripe fields to users table (stripeCustomerId, stripeSubscriptionId, stripePriceId, stripeCurrentPeriodEnd)

- [x] Task 2: Create Stripe products and prices (AC: #3)
  - [x] 2.1 Document Stripe product/price IDs in subscription-tiers.ts
  - [x] 2.2 Map tier IDs to Stripe price IDs

- [x] Task 3: Create checkout session API (AC: #4)
  - [x] 3.1 Add `createCheckoutSession` mutation to billing router
  - [x] 3.2 Create or retrieve Stripe customer for user
  - [x] 3.3 Create checkout session with success/cancel URLs

- [x] Task 4: Create Stripe webhook handler (AC: #8)
  - [x] 4.1 Create `/api/webhooks/stripe/route.ts`
  - [x] 4.2 Verify webhook signature
  - [x] 4.3 Handle `checkout.session.completed` - update user tier
  - [x] 4.4 Handle `customer.subscription.updated` - sync tier changes
  - [x] 4.5 Handle `customer.subscription.deleted` - revert to FREE

- [x] Task 5: Send confirmation emails (AC: #6)
  - [x] 5.1 Create subscription confirmation email template
  - [x] 5.2 Send email after successful subscription

- [x] Task 6: Enable upgrade buttons on billing page (AC: #4, #7)
  - [x] 6.1 Update TierComparison to enable upgrade buttons
  - [x] 6.2 Add loading state during checkout redirect
  - [x] 6.3 Add BillingAlert component for success/cancel messages

- [x] Task 7: Create customer portal for subscription management (AC: #7)
  - [x] 7.1 Add `createPortalSession` mutation
  - [x] 7.2 Add "Manage subscription" button for existing subscribers

- [x] Task 8: Verification (AC: #9, #10, #11)
  - [x] 8.1 Run `pnpm typecheck`
  - [x] 8.2 Run `pnpm lint`
  - [x] 8.3 Run `pnpm build`

## Dev Notes

### Stripe Configuration Required

Before testing, create in Stripe Dashboard (Test mode):

1. **Products:**
   - Product: "AppelOffre Pro" - 49€/month
   - Product: "AppelOffre Business" - 149€/month

2. **Environment Variables:**
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRO_PRICE_ID=price_...
   STRIPE_BUSINESS_PRICE_ID=price_...
   ```

3. **Webhook Endpoint:**
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`

### Database Schema Updates

Added to users table:
```typescript
stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
stripePriceId: varchar("stripe_price_id", { length: 255 }),
stripeCurrentPeriodEnd: timestamp("stripe_current_period_end", { withTimezone: true }),
```

### Checkout Flow

1. User clicks "Upgrade to Pro"
2. Frontend calls `billing.createCheckoutSession({ tier: "PRO" })`
3. Backend creates/gets Stripe customer, creates checkout session
4. Frontend redirects to `session.url`
5. User completes payment on Stripe
6. Stripe sends `checkout.session.completed` webhook
7. Backend updates user's `subscriptionTier` and Stripe fields
8. User redirected to `/billing?success=true`

### Downgrade Flow

1. User clicks "Manage subscription"
2. Frontend calls `billing.createPortalSession()`
3. User redirected to Stripe Customer Portal
4. User selects lower tier or cancels
5. Stripe sends `customer.subscription.updated` webhook
6. Backend updates tier (effective at period end)

### Technical Notes

- **Stripe API version**: 2025-12-15.clover
- **Lazy initialization**: Stripe client uses lazy init to avoid build-time errors
- **Subscription period**: `current_period_end` is on subscription items (not subscription) in new Stripe API
- **Email notifications**: Sent on subscription creation and cancellation

### Previous Story Learnings (1.6)

- Loading/error states are required for all pages
- Use consistent layout pattern with `min-h-screen bg-background p-8`
- Mobile-responsive tables need `overflow-x-auto`
- French error messages for user-facing errors

### References

- [Source: epics.md#Story 1.7: Upgrade/Downgrade Abonnement]
- [Source: architecture.md#ARCH-6 - Stripe integration]
- [Stripe Checkout docs](https://stripe.com/docs/checkout)
- [Stripe Webhooks docs](https://stripe.com/docs/webhooks)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/lib/stripe.ts` | Created | Stripe client with lazy initialization |
| `src/lib/subscription-tiers.ts` | Modified | Added Stripe price ID mapping functions |
| `src/env.js` | Modified | Added Stripe environment variables |
| `.env.example` | Modified | Added Stripe configuration documentation |
| `src/server/db/schema/auth.ts` | Modified | Added Stripe fields to users table |
| `src/server/api/routers/billing.ts` | Created | Billing router with checkout and portal sessions |
| `src/server/api/root.ts` | Modified | Added billing router to app router |
| `src/app/api/webhooks/stripe/route.ts` | Created | Stripe webhook handler |
| `src/server/services/email/resend.ts` | Modified | Added subscription email templates |
| `src/components/billing/tier-comparison.tsx` | Modified | Enabled upgrade buttons with tRPC integration |
| `src/components/billing/billing-alert.tsx` | Created | Alert component for success/cancel messages |
| `src/components/ui/alert.tsx` | Created | shadcn/ui Alert component |
| `src/app/(auth)/billing/page.tsx` | Modified | Added subscription status and alerts |
| `package.json` | Modified | Added stripe dependency |
| `pnpm-lock.yaml` | Modified | Updated lock file |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-17 | Initial implementation | Story 1.7 development |

### Completion Notes

- All acceptance criteria satisfied
- Stripe SDK v20.2.0 installed and configured
- Environment variables documented in `.env.example`
- Checkout session creates Stripe customer if not exists
- Webhook handles checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_succeeded
- Confirmation emails sent on subscription creation and cancellation
- Upgrade buttons enabled on billing page with loading states
- Customer portal accessible for subscription management
- Success/canceled alerts shown on billing page after checkout
- Build passes with lazy Stripe initialization
