import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { headers } from "next/headers";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { stripe } from "~/lib/stripe";
import { getStripePriceId } from "~/lib/subscription-tiers";

/**
 * Get base URL for redirect URLs
 */
async function getBaseUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "https";

  if (host) {
    return `${protocol}://${host}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * Billing router for Stripe subscription management
 */
export const billingRouter = createTRPCRouter({
  /**
   * Create a Stripe checkout session for subscription upgrade
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        tier: z.enum(["PRO", "BUSINESS"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { tier } = input;
      const { eq } = await import("drizzle-orm");
      const { users } = await import("~/server/db/schema");

      // Get user with Stripe customer ID
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
        columns: {
          id: true,
          email: true,
          name: true,
          stripeCustomerId: true,
          subscriptionTier: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Utilisateur non trouvé",
        });
      }

      // Check if user already has this tier or higher
      if (user.subscriptionTier === tier) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Vous avez déjà cette formule",
        });
      }

      // Get Stripe price ID for the tier
      const priceId = getStripePriceId(tier);
      if (!priceId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Configuration Stripe manquante",
        });
      }

      // Create or retrieve Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name ?? undefined,
          metadata: {
            userId: user.id,
          },
        });
        customerId = customer.id;

        // Save customer ID to database
        await ctx.db
          .update(users)
          .set({ stripeCustomerId: customerId })
          .where(eq(users.id, user.id));
      }

      // Get base URL for redirects
      const baseUrl = await getBaseUrl();

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/billing?success=true`,
        cancel_url: `${baseUrl}/billing?canceled=true`,
        metadata: {
          userId: user.id,
          tier,
        },
        subscription_data: {
          metadata: {
            userId: user.id,
            tier,
          },
        },
      });

      if (!session.url) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Impossible de créer la session de paiement",
        });
      }

      return { url: session.url };
    }),

  /**
   * Create a Stripe customer portal session for subscription management
   */
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const { eq } = await import("drizzle-orm");
    const { users } = await import("~/server/db/schema");

    // Get user with Stripe customer ID
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
      columns: {
        id: true,
        stripeCustomerId: true,
        subscriptionTier: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Utilisateur non trouvé",
      });
    }

    if (!user.stripeCustomerId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Aucun abonnement actif",
      });
    }

    // Get base URL for redirect
    const baseUrl = await getBaseUrl();

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/billing`,
    });

    return { url: session.url };
  }),

  /**
   * Get current subscription status from Stripe
   */
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    const { eq } = await import("drizzle-orm");
    const { users } = await import("~/server/db/schema");

    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
      columns: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        subscriptionTier: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Utilisateur non trouvé",
      });
    }

    // If no Stripe subscription, return basic status
    if (!user.stripeSubscriptionId) {
      return {
        hasActiveSubscription: user.subscriptionTier !== "FREE",
        tier: user.subscriptionTier,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }

    // Get subscription from Stripe for real-time status
    try {
      const subscription = await stripe.subscriptions.retrieve(
        user.stripeSubscriptionId
      );
      // In Stripe API 2025-12-15+, current_period_end is on subscription items
      const periodEnd = subscription.items.data[0]?.current_period_end;

      return {
        hasActiveSubscription: subscription.status === "active",
        tier: user.subscriptionTier,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    } catch {
      // If subscription not found, return database values
      return {
        hasActiveSubscription: user.subscriptionTier !== "FREE",
        tier: user.subscriptionTier,
        currentPeriodEnd: user.stripeCurrentPeriodEnd,
        cancelAtPeriodEnd: false,
      };
    }
  }),
});
