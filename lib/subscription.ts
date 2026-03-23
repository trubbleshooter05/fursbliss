import { isFeatureUnlockActive } from "./feature-unlock";

type SubscriptionMeta = {
  subscriptionStatus?: string | null;
  subscriptionEndsAt?: Date | string | null;
  subscriptionPlan?: string | null;
};

export function isSubscriptionActive(meta: SubscriptionMeta) {
  if (meta.subscriptionStatus !== "premium") {
    return false;
  }
  if (meta.subscriptionPlan !== "referral" && meta.subscriptionPlan !== "trial_extension") {
    return true;
  }
  if (!meta.subscriptionEndsAt) {
    return false;
  }

  const endsAt =
    meta.subscriptionEndsAt instanceof Date
      ? meta.subscriptionEndsAt
      : new Date(meta.subscriptionEndsAt);
  return endsAt.getTime() > Date.now();
}

export function getEffectiveSubscriptionStatus(
  meta: SubscriptionMeta,
  options?: { featureUnlock?: boolean }
) {
  if (isSubscriptionActive(meta)) return "premium";
  if (options?.featureUnlock !== false && isFeatureUnlockActive()) return "premium";
  return "free";
}

/** Use in API routes when checking premium access (includes Feature Unlock Days) */
export function isEffectivePremium(
  meta: SubscriptionMeta,
  options?: { featureUnlock?: boolean }
): boolean {
  return getEffectiveSubscriptionStatus(meta, options) === "premium";
}

// Tier restriction constants
export const TIER_LIMITS = {
  FREE: {
    MAX_PETS: 1,
    HISTORY_DAYS: 30,
    HEALTH_ALERTS: false,
    PATTERN_DETECTION: false,
    VET_REPORTS: false,
    MEDICATION_TRACKING: false,
  },
  PREMIUM: {
    MAX_PETS: Infinity,
    HISTORY_DAYS: Infinity,
    HEALTH_ALERTS: true,
    PATTERN_DETECTION: true,
    VET_REPORTS: true,
    MEDICATION_TRACKING: true,
  },
} as const;

// Helper functions for tier checks
export function canAddPet(currentPetCount: number, isPremium: boolean): boolean {
  const limit = isPremium ? TIER_LIMITS.PREMIUM.MAX_PETS : TIER_LIMITS.FREE.MAX_PETS;
  return currentPetCount < limit;
}

export function canAccessHealthAlerts(isPremium: boolean): boolean {
  return isPremium && TIER_LIMITS.PREMIUM.HEALTH_ALERTS;
}

export function canAccessPatternDetection(isPremium: boolean): boolean {
  return isPremium && TIER_LIMITS.PREMIUM.PATTERN_DETECTION;
}

export function canDownloadVetReport(isPremium: boolean): boolean {
  return isPremium && TIER_LIMITS.PREMIUM.VET_REPORTS;
}

export function canAccessMedicationTracking(isPremium: boolean): boolean {
  return isPremium && TIER_LIMITS.PREMIUM.MEDICATION_TRACKING;
}

export function getHistoryDaysLimit(isPremium: boolean): number {
  return isPremium ? TIER_LIMITS.PREMIUM.HISTORY_DAYS : TIER_LIMITS.FREE.HISTORY_DAYS;
}
