export const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "paid", "approved", "current"]);

export type SubscriptionPeriod = {
  status?: string | null;
  current_period_end?: string | null;
  expires_at?: string | null;
  paid_until?: string | null;
};

export function getSubscriptionEndDate(subscription?: SubscriptionPeriod | null) {
  const endValue = subscription?.current_period_end || subscription?.expires_at || subscription?.paid_until || null;
  if (!endValue) return null;

  const endDate = new Date(endValue);
  return Number.isNaN(endDate.getTime()) ? null : endDate;
}

export function getSubscriptionDaysLeft(subscription?: SubscriptionPeriod | null) {
  const endDate = getSubscriptionEndDate(subscription);
  if (!endDate) return null;

  return Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export function isSubscriptionActive(subscription?: SubscriptionPeriod | null) {
  const status = typeof subscription?.status === "string" ? subscription.status.toLowerCase() : "";
  if (!ACTIVE_SUBSCRIPTION_STATUSES.has(status)) return false;

  const endDate = getSubscriptionEndDate(subscription);
  return !endDate || endDate.getTime() >= Date.now();
}
