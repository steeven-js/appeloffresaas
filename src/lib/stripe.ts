import Stripe from "stripe";
import { env } from "~/env";

// Lazy initialization to avoid build-time errors when STRIPE_SECRET_KEY is not set
let stripeClient: Stripe | null = null;

/**
 * Get Stripe client instance (lazy initialization)
 * Used for: checkout sessions, webhooks, customer management
 */
export function getStripeClient(): Stripe {
  if (!stripeClient) {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }
  return stripeClient;
}

/**
 * Stripe client for direct usage (throws at runtime if not configured)
 * @deprecated Use getStripeClient() for lazy initialization
 */
export const stripe = {
  get customers() {
    return getStripeClient().customers;
  },
  get checkout() {
    return getStripeClient().checkout;
  },
  get billingPortal() {
    return getStripeClient().billingPortal;
  },
  get subscriptions() {
    return getStripeClient().subscriptions;
  },
  get webhooks() {
    return getStripeClient().webhooks;
  },
};
