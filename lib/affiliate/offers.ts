/**
 * Live merchant-offer provider for WhereToBuyPanel (DAN-974 / DAN-600 Component 1).
 *
 * The affiliate backend (Impact.com / CJ / Amazon Associates) is provisioned per
 * DAN-365 / DAN-368 — this module is the seam the panel consumes, NOT a
 * re-implementation of that backend. Until the per-product catalog mapping from
 * DAN-368 lands, there is no live per-product deal feed, so in production we
 * return no offers and the panel renders its empty state (with a manufacturer
 * fallback link) rather than fabricating prices/links.
 *
 * Set `NEXT_PUBLIC_WTB_SAMPLE_OFFERS=1` (off in prod) to exercise the populated
 * panel — used for design QA, Lighthouse a11y runs, and analytics verification.
 */

import type { MerchantOffer, Product } from "@/types";

export interface ManufacturerInfo {
  name: string;
  /** Official store/product URL when known — used by the empty-state fallback. */
  url?: string;
}

/** Known brand homepages for the empty-state "check directly at …" fallback link. */
const BRAND_HOMEPAGE: Record<string, string> = {
  apple: "https://www.apple.com",
  samsung: "https://www.samsung.com",
  sony: "https://www.sony.com",
  dyson: "https://www.dyson.com",
  irobot: "https://www.irobot.com",
  bose: "https://www.bose.com",
  breville: "https://www.breville.com",
  "de'longhi": "https://www.delonghi.com",
  delonghi: "https://www.delonghi.com",
  ninja: "https://www.ninjakitchen.com",
  philips: "https://www.usa.philips.com",
  garmin: "https://www.garmin.com",
  nectar: "https://www.nectarsleep.com",
  saatva: "https://www.saatva.com",
  purple: "https://purple.com",
};

/** Manufacturer name + (when known) official URL for a product. */
export function getManufacturerInfo(product: Product): ManufacturerInfo {
  const key = product.brand.trim().toLowerCase();
  return { name: product.brand, url: BRAND_HOMEPAGE[key] };
}

/**
 * Returns the live merchant offers for a product. Async by design so the live
 * Impact/CJ fetch can drop in without touching callers.
 */
export async function getMerchantOffers(product: Product): Promise<MerchantOffer[]> {
  // Live affiliate feed wiring lands with the DAN-368 catalog mapping. Until then,
  // return no offers in production (empty state) instead of fabricating deals.
  if (process.env.NEXT_PUBLIC_WTB_SAMPLE_OFFERS === "1") {
    return sampleOffers(product);
  }
  return [];
}

/**
 * Deterministic sample offers derived from a product's price range. NOT live
 * affiliate data — gated behind NEXT_PUBLIC_WTB_SAMPLE_OFFERS for QA only.
 */
function sampleOffers(product: Product): MerchantOffer[] {
  const { min, max, currency } = product.priceRange;
  const brandSlug = product.brand.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const span = Math.max(0, max - min);
  const at = (frac: number) => Math.round(min + span * frac);

  return [
    {
      merchantSlug: "amazon",
      merchantName: "Amazon",
      url: `https://www.amazon.com/s?k=${encodeURIComponent(product.name)}`,
      price: at(0.0), // lowest
      currency,
      isFirstParty: false,
    },
    {
      merchantSlug: brandSlug,
      merchantName: product.brand,
      url: getManufacturerInfo(product).url ?? `https://www.google.com/search?q=${encodeURIComponent(product.name)}`,
      price: at(0.0), // ties Amazon → first-party wins tie-break
      currency,
      isFirstParty: true,
    },
    {
      merchantSlug: "best-buy",
      merchantName: "Best Buy",
      url: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(product.name)}`,
      price: at(0.5),
      currency,
      isFirstParty: false,
    },
    {
      merchantSlug: "walmart",
      merchantName: "Walmart",
      url: `https://www.walmart.com/search?q=${encodeURIComponent(product.name)}`,
      price: at(1.0),
      currency,
      isFirstParty: false,
    },
  ];
}
