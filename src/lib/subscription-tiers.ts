import { env } from "~/env";

/**
 * Subscription tier definitions and limits
 * Used for displaying tier info and enforcing limits
 */

export const SUBSCRIPTION_TIERS = ["FREE", "PRO", "BUSINESS"] as const;
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

export interface TierLimits {
  maxDemands: number | null; // null = unlimited (demandes par mois)
  maxDocuments: number | null; // null = unlimited (documents coffre-fort)
  maxTeamMembers: number;
  aiAssistance: "basic" | "full" | "priority";
  exportFormats: ("PDF" | "Word" | "ZIP")[];
  templates: "basic" | "premium" | "custom";
  supportLevel: "community" | "email" | "priority";
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
 * Updated for "Dossier de Demande" pivot (2026-01-18)
 */
export const TIER_DEFINITIONS: Record<SubscriptionTier, TierInfo> = {
  FREE: {
    id: "FREE",
    name: "Gratuit",
    description: "Pour découvrir la plateforme",
    priceMonthly: 0,
    priceYearly: 0,
    limits: {
      maxDemands: 2, // 2 dossiers par mois
      maxDocuments: 10,
      maxTeamMembers: 1,
      aiAssistance: "basic",
      exportFormats: ["PDF"],
      templates: "basic",
      supportLevel: "community",
    },
    features: [
      "2 dossiers de demande par mois",
      "10 documents dans le coffre-fort",
      "Templates de base",
      "Assistance IA basique",
      "Export PDF uniquement",
      "Support communautaire",
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    description: "Pour les utilisateurs réguliers",
    priceMonthly: 19,
    priceYearly: 190, // ~2 mois gratuits
    limits: {
      maxDemands: null, // illimité
      maxDocuments: 50,
      maxTeamMembers: 1,
      aiAssistance: "full",
      exportFormats: ["PDF", "Word", "ZIP"],
      templates: "premium",
      supportLevel: "email",
    },
    features: [
      "Dossiers de demande illimités",
      "50 documents dans le coffre-fort",
      "Templates premium par secteur",
      "Profil entreprise complet",
      "Assistance IA complète",
      "Export PDF, Word et ZIP",
      "Support par email",
    ],
    highlighted: true,
  },
  BUSINESS: {
    id: "BUSINESS",
    name: "Business",
    description: "Pour les power users",
    priceMonthly: 39,
    priceYearly: 390, // ~2 mois gratuits
    limits: {
      maxDemands: null, // illimité
      maxDocuments: null, // illimité
      maxTeamMembers: 1, // multi-user en Team tier (futur)
      aiAssistance: "priority",
      exportFormats: ["PDF", "Word", "ZIP"],
      templates: "custom",
      supportLevel: "priority",
    },
    features: [
      "Dossiers de demande illimités",
      "Documents illimités",
      "Templates personnalisables",
      "Export avec branding personnalisé",
      "Assistance IA prioritaire",
      "Export PDF, Word et ZIP",
      "Support prioritaire",
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
  limitKey: "maxDemands" | "maxDocuments",
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
  limitKey: "maxDemands" | "maxDocuments",
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
