/**
 * Merchant registry + offer ordering for WhereToBuyPanel
 * (DAN-974 / DAN-600 Component 1).
 *
 * Single source of truth for merchant display metadata (logo, CTA verb) and the
 * canonical sort order. Kept framework-agnostic so it can be unit-tested without
 * React.
 */

import type { MerchantOffer } from "@/types";

/** Default 24×24 logo path for a merchant slug. First-party falls back to a generic store mark. */
const MERCHANT_LOGOS: Record<string, string> = {
  amazon: "/merchant-logos/amazon.svg",
  "best-buy": "/merchant-logos/best-buy.svg",
  walmart: "/merchant-logos/walmart.svg",
  target: "/merchant-logos/target.svg",
};

const FIRST_PARTY_LOGO = "/merchant-logos/manufacturer.svg";

/** Resolve the logo path for an offer, preferring an explicit per-offer override. */
export function merchantLogo(offer: MerchantOffer): string {
  if (offer.logo) return offer.logo;
  if (offer.isFirstParty) return FIRST_PARTY_LOGO;
  return MERCHANT_LOGOS[offer.merchantSlug] ?? FIRST_PARTY_LOGO;
}

/**
 * CTA label per the spec: "Buy direct" for first-party manufacturer stores,
 * "See on {Merchant}" for marketplaces/retailers.
 */
export function merchantCtaLabel(offer: MerchantOffer): string {
  return offer.isFirstParty ? "Buy direct" : `See on ${offer.merchantName}`;
}

/**
 * Tie-break priority when two offers share the lowest price.
 * Lower number wins: first-party manufacturer > Amazon > Best Buy > others.
 */
function tieBreakRank(offer: MerchantOffer): number {
  if (offer.isFirstParty) return 0;
  switch (offer.merchantSlug) {
    case "amazon":
      return 1;
    case "best-buy":
      return 2;
    default:
      return 3;
  }
}

/**
 * Canonical order: lowest price first; ties broken by
 * first-party manufacturer > Amazon > Best Buy > others.
 * Returns a new array — does not mutate the input.
 */
export function sortOffers(offers: MerchantOffer[]): MerchantOffer[] {
  return [...offers].sort((a, b) => {
    if (a.price !== b.price) return a.price - b.price;
    return tieBreakRank(a) - tieBreakRank(b);
  });
}

/** Lowest price across the offer set, or null when there are none. */
export function lowestPrice(offers: MerchantOffer[]): number | null {
  if (offers.length === 0) return null;
  return offers.reduce((min, o) => (o.price < min ? o.price : min), offers[0].price);
}

/** Currency-localized price string, e.g. 1099 → "$1,099". */
export function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: price % 1 === 0 ? 0 : 2,
    }).format(price);
  } catch {
    // Unknown currency code — fall back to a bare number with the code.
    return `${currency} ${price}`;
  }
}
