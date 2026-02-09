type SubscriptionMeta = {
  subscriptionStatus?: string | null;
  subscriptionEndsAt?: Date | string | null;
  subscriptionPlan?: string | null;
};

export function isSubscriptionActive(meta: SubscriptionMeta) {
  if (meta.subscriptionStatus !== "premium") {
    return false;
  }
  if (meta.subscriptionPlan !== "referral") {
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

export function getEffectiveSubscriptionStatus(meta: SubscriptionMeta) {
  return isSubscriptionActive(meta) ? "premium" : "free";
}
