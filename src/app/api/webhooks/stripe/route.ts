import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { env } from "~/env";
import { stripe } from "~/lib/stripe";
import { getTierFromPriceId, getTierInfo } from "~/lib/subscription-tiers";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import {
  sendSubscriptionConfirmation,
  sendSubscriptionCanceled,
} from "~/server/services/email/resend";

/**
 * Get current period end from subscription items
 * In Stripe API 2025-12-15+, current_period_end is on subscription items
 */
function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): number | null {
  const item = subscription.items.data[0];
  return item?.current_period_end ?? null;
}

/**
 * Stripe webhook handler
 * Handles subscription events to keep user tier in sync
 */
export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session completion
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;

  if (!userId || !tier) {
    console.error("Missing userId or tier in checkout session metadata");
    return;
  }

  // Get the subscription details
  if (session.subscription) {
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const priceId = subscription.items.data[0]?.price.id;
    const periodEnd = getSubscriptionPeriodEnd(subscription);

    // Get user email for notification
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { email: true },
    });

    await db
      .update(users)
      .set({
        subscriptionTier: tier as "FREE" | "PRO" | "BUSINESS",
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    console.log(`User ${userId} upgraded to ${tier}`);

    // Send confirmation email
    if (user?.email) {
      const tierInfo = getTierInfo(tier as "FREE" | "PRO" | "BUSINESS");
      const headersList = await headers();
      const host = headersList.get("host") ?? "localhost:3000";
      const protocol = headersList.get("x-forwarded-proto") ?? "https";
      const billingUrl = `${protocol}://${host}/billing`;

      try {
        await sendSubscriptionConfirmation(
          user.email,
          tierInfo.name,
          tierInfo.priceMonthly,
          billingUrl
        );
      } catch (error) {
        console.error("Failed to send subscription confirmation email:", error);
        // Don't fail the webhook if email fails
      }
    }
  }
}

/**
 * Handle subscription updates (plan changes, cancellations scheduled)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const priceId = subscription.items.data[0]?.price.id;
  const newTier = priceId ? getTierFromPriceId(priceId) : "FREE";
  const periodEnd = getSubscriptionPeriodEnd(subscription);

  if (!userId) {
    // Try to find user by customer ID
    const user = await db.query.users.findFirst({
      where: eq(users.stripeCustomerId, customerId),
      columns: { id: true },
    });

    if (!user) {
      console.error("Could not find user for subscription update");
      return;
    }

    // Update subscription status
    await db
      .update(users)
      .set({
        subscriptionTier: subscription.status === "active" ? newTier : "FREE",
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    console.log(`User ${user.id} subscription updated to ${newTier}`);
    return;
  }

  await db
    .update(users)
    .set({
      subscriptionTier: subscription.status === "active" ? newTier : "FREE",
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  console.log(`User ${userId} subscription updated to ${newTier}`);
}

/**
 * Handle subscription deletion (cancellation completed)
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  // Get the previous tier name from the price
  const priceId = subscription.items.data[0]?.price.id;
  const previousTier = priceId ? getTierFromPriceId(priceId) : "PRO";
  const tierInfo = getTierInfo(previousTier);

  if (!userId) {
    // Try to find user by customer ID
    const user = await db.query.users.findFirst({
      where: eq(users.stripeCustomerId, customerId),
      columns: { id: true, email: true },
    });

    if (!user) {
      console.error("Could not find user for subscription deletion");
      return;
    }

    await db
      .update(users)
      .set({
        subscriptionTier: "FREE",
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Send cancellation email
    if (user.email) {
      try {
        await sendSubscriptionCanceled(user.email, tierInfo.name);
      } catch (error) {
        console.error("Failed to send subscription canceled email:", error);
      }
    }

    console.log(`User ${user.id} subscription canceled, reverted to FREE`);
    return;
  }

  // Get user email for notification
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { email: true },
  });

  await db
    .update(users)
    .set({
      subscriptionTier: "FREE",
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Send cancellation email
  if (user?.email) {
    try {
      await sendSubscriptionCanceled(user.email, tierInfo.name);
    } catch (error) {
      console.error("Failed to send subscription canceled email:", error);
    }
  }

  console.log(`User ${userId} subscription canceled, reverted to FREE`);
}

/**
 * Handle successful invoice payment (for recurring payments)
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Only process subscription invoices
  const subscriptionRef = invoice.parent?.subscription_details?.subscription;
  if (!subscriptionRef) return;

  const subscriptionId =
    typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef.id;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const userId = subscription.metadata?.userId;
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;
  const periodEnd = getSubscriptionPeriodEnd(subscription);

  if (!userId && customerId) {
    // Try to find user by customer ID
    const user = await db.query.users.findFirst({
      where: eq(users.stripeCustomerId, customerId),
      columns: { id: true },
    });

    if (user) {
      await db
        .update(users)
        .set({
          stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    }
    return;
  }

  if (userId) {
    // Update current period end for the user
    await db
      .update(users)
      .set({
        stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }
}
