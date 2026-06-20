/**
 * Shared constants for consent-clean email opt-in (DAN-1085).
 *
 * `EmailSubscription` is keyed on `[email, productId]`, so a non-product
 * newsletter opt-in (the on-site survey funnel) still needs a stable sentinel
 * "product" to dedupe one general-updates subscription per address. These are
 * NOT a real catalog product — they exist so the survey-funnel opt-in can reuse
 * the existing `POST /api/subscribe` -> `EmailSubscription` path unchanged.
 */
export const NEWSLETTER_PRODUCT = {
  productId: "reviewiq-updates",
  productSlug: "reviewiq-updates",
  productName: "ReviewIQ Product Updates",
} as const;

/**
 * Consent-basis source recorded on each `EmailSubscription` row (the `source`
 * column, DAN-1085). Paired with `createdAt`, this is the defensible record of
 * what the subscriber opted into.
 *  - PRODUCT_ALERT: per-product SmartScore alert opt-in (EmailCaptureCTA). Default.
 *  - SURVEY_FUNNEL: on-site survey-funnel newsletter opt-in.
 */
export const SUBSCRIPTION_SOURCE = {
  PRODUCT_ALERT: "product_alert",
  SURVEY_FUNNEL: "survey_funnel",
} as const;

export type SubscriptionSource =
  (typeof SUBSCRIPTION_SOURCE)[keyof typeof SUBSCRIPTION_SOURCE];

/** Allowed values for the `/api/subscribe` `source` field (zod enum source). */
export const SUBSCRIPTION_SOURCE_VALUES = Object.values(
  SUBSCRIPTION_SOURCE
) as [SubscriptionSource, ...SubscriptionSource[]];
