import { env } from "~/env";

/**
 * Subscription tier definitions and limits
 * Used for displaying tier info and enforcing limits
 */

export const SUBSCRIPTION_TIERS = ["FREE", "PRO", "BUSINESS"] as const;
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

export interface TierLimits {
  maxProjects: number | null; // null = unlimited
  maxDocuments: number | null; // null = unlimited
  maxTeamMembers: number;
  aiAssistance: "basic" | "full" | "priority";
  exportFormats: string[];
  supportLevel: "email" | "priority" | "dedicated";
}

export interface TierInfo {
  id: SubscriptionTier;
  name: string;
  description: string;
  priceMonthly: number; // in euros
  priceYearly: number; // in euros (annual total)
  limits: TierLimits;
  features: string[];
  highlighted?: boolean; // for recommended tier
}

/**
 * Complete tier definitions with limits and features
 */
export const TIER_DEFINITIONS: Record<SubscriptionTier, TierInfo> = {
  FREE: {
    id: "FREE",
    name: "Gratuit",
    description: "Pour découvrir la plateforme",
    priceMonthly: 0,
    priceYearly: 0,
    limits: {
      maxProjects: 1,
      maxDocuments: 10,
      maxTeamMembers: 1,
      aiAssistance: "basic",
      exportFormats: ["PDF"],
      supportLevel: "email",
    },
    features: [
      "1 projet AO par mois",
      "10 documents dans le coffre-fort",
      "Assistance IA basique",
      "Export PDF",
      "Support par email",
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    description: "Pour les PME actives",
    priceMonthly: 49,
    priceYearly: 490, // ~2 mois gratuits
    limits: {
      maxProjects: 10,
      maxDocuments: 100,
      maxTeamMembers: 5,
      aiAssistance: "full",
      exportFormats: ["PDF", "Word"],
      supportLevel: "priority",
    },
    features: [
      "10 projets AO par mois",
      "100 documents dans le coffre-fort",
      "5 membres d'équipe",
      "Assistance IA complète",
      "Export PDF et Word",
      "Support prioritaire",
    ],
    highlighted: true,
  },
  BUSINESS: {
    id: "BUSINESS",
    name: "Business",
    description: "Pour les grandes entreprises",
    priceMonthly: 149,
    priceYearly: 1490, // ~2 mois gratuits
    limits: {
      maxProjects: null, // unlimited
      maxDocuments: null, // unlimited
      maxTeamMembers: 20,
      aiAssistance: "priority",
      exportFormats: ["PDF", "Word", "ZIP"],
      supportLevel: "dedicated",
    },
    features: [
      "Projets AO illimités",
      "Documents illimités",
      "20 membres d'équipe",
      "Assistance IA prioritaire",
      "Export PDF, Word et ZIP",
      "Support dédié",
    ],
  },
};

/**
 * Get tier info by tier ID
 */
export function getTierInfo(tier: SubscriptionTier): TierInfo {
  return TIER_DEFINITIONS[tier];
}

/**
 * Get tier limits by tier ID
 */
export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return TIER_DEFINITIONS[tier].limits;
}

/**
 * Check if a limit is reached
 * Returns true if the current count exceeds the limit
 */
export function isLimitReached(
  tier: SubscriptionTier,
  limitKey: "maxProjects" | "maxDocuments",
  currentCount: number
): boolean {
  const limit = TIER_DEFINITIONS[tier].limits[limitKey];
  if (limit === null) return false; // unlimited
  return currentCount >= limit;
}

/**
 * Get usage percentage for a limit
 * Returns 0-100 (capped at 100), or null for unlimited
 */
export function getUsagePercentage(
  tier: SubscriptionTier,
  limitKey: "maxProjects" | "maxDocuments",
  currentCount: number
): number | null {
  const limit = TIER_DEFINITIONS[tier].limits[limitKey];
  if (limit === null) return null; // unlimited
  return Math.min(Math.round((currentCount / limit) * 100), 100);
}

/**
 * Format limit display value
 */
export function formatLimit(value: number | null): string {
  return value === null ? "Illimité" : value.toString();
}

/**
 * Stripe price ID mapping
 * Maps subscription tiers to their Stripe price IDs
 */
export function getStripePriceId(tier: SubscriptionTier): string | null {
  switch (tier) {
    case "PRO":
      return env.STRIPE_PRO_PRICE_ID ?? null;
    case "BUSINESS":
      return env.STRIPE_BUSINESS_PRICE_ID ?? null;
    default:
      return null;
  }
}

/**
 * Get subscription tier from Stripe price ID
 */
export function getTierFromPriceId(priceId: string): SubscriptionTier {
  if (priceId === env.STRIPE_PRO_PRICE_ID) {
    return "PRO";
  }
  if (priceId === env.STRIPE_BUSINESS_PRICE_ID) {
    return "BUSINESS";
  }
  return "FREE";
}

/**
 * Check if tier upgrade requires payment
 */
export function requiresPayment(tier: SubscriptionTier): boolean {
  return tier !== "FREE";
}
