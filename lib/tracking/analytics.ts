/**
 * Centralized analytics & conversion tracking utility.
 * Supports GA4, Google Ads conversions, and Meta Pixel events.
 *
 * Usage:
 *   import { trackEvent, trackConversion } from "@/lib/tracking/analytics";
 *   trackEvent("review_submitted", { product_slug: "iphone-15" });
 *   trackConversion("google_ads", "CONVERSION_LABEL");
 */

// -- Types --

type GAEventParams = Record<string, string | number | boolean | undefined>;

interface ConversionOptions {
  value?: number;
  currency?: string;
  transactionId?: string;
}

// -- Helpers --

function getDataLayer(): unknown[] | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as Record<string, unknown>).dataLayer as unknown[] | undefined;
}

function gtag(...args: unknown[]) {
  const dl = getDataLayer();
  if (dl) dl.push(args);
}

function fbq(...args: unknown[]) {
  if (typeof window === "undefined") return;
  const f = (window as unknown as Record<string, unknown>).fbq as ((...a: unknown[]) => void) | undefined;
  if (f) f(...args);
}

// -- Public API --

/** Push a custom event to GA4 via dataLayer */
export function trackEvent(eventName: string, params?: GAEventParams) {
  gtag("event", eventName, params);
}

/** Track a Google Ads conversion or Meta Pixel event */
export function trackConversion(
  platform: "google_ads" | "meta",
  label: string,
  options?: ConversionOptions,
) {
  if (platform === "google_ads") {
    gtag("event", "conversion", {
      send_to: label, // format: AW-XXXXXXX/YYYYYYY
      value: options?.value,
      currency: options?.currency || "USD",
      transaction_id: options?.transactionId,
    });
  } else if (platform === "meta") {
    fbq("track", label, {
      value: options?.value,
      currency: options?.currency || "USD",
    });
  }
}

// -- Pre-built events for ReviewIQ --

export function trackReviewSubmitted(productSlug: string, rating: number) {
  trackEvent("review_submitted", { product_slug: productSlug, rating });
  fbq("trackCustom", "ReviewSubmitted", { product_slug: productSlug, rating });
}

export function trackVoteCast(targetType: string, voteType: string) {
  trackEvent("vote_cast", { target_type: targetType, vote_type: voteType });
}

export function trackDiscussionCreated(threadType: string) {
  trackEvent("discussion_created", { thread_type: threadType });
}

export function trackProductViewed(productSlug: string, category: string) {
  trackEvent("product_viewed", { product_slug: productSlug, category });
  fbq("track", "ViewContent", {
    content_ids: [productSlug],
    content_type: "product",
    content_category: category,
  });
}

export function trackSearch(query: string, resultsCount: number) {
  trackEvent("search", { search_term: query, results_count: resultsCount });
  fbq("track", "Search", { search_string: query });
}

export function trackNewsletterSignup(source: string) {
  trackEvent("newsletter_signup", { source });
  fbq("track", "Lead", { content_name: "newsletter", source });
}

export function trackContactFormSubmitted() {
  trackEvent("contact_form_submitted");
  fbq("track", "Contact");
}

export function trackPageEngagement(pagePath: string, timeOnPageSec: number) {
  trackEvent("page_engagement", { page_path: pagePath, time_on_page_sec: timeOnPageSec });
}

// -- Conversion funnel events --

export function trackCategoryViewed(categorySlug: string, productCount: number) {
  trackEvent("category_viewed", { category_slug: categorySlug, product_count: productCount });
}

export function trackSearchResultClicked(query: string, resultType: string, resultName: string, position: number) {
  trackEvent("search_result_clicked", { search_term: query, result_type: resultType, result_name: resultName, position });
}

export function trackWriteReviewStep(step: number, stepName: string) {
  trackEvent("write_review_step", { step, step_name: stepName });
}

export function trackCtaClicked(ctaName: string, page: string) {
  trackEvent("cta_clicked", { cta_name: ctaName, page });
}

export function trackReviewAuthGateShown(productSlug: string, trigger?: string) {
  trackEvent("review_auth_gate_shown", { product_slug: productSlug, trigger });
}
