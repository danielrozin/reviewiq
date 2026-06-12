"use client";

import { useEffect } from "react";
import { AffiliateLink } from "@/components/affiliate/AffiliateLink";
import { AffiliateDisclosure } from "@/components/affiliate/AffiliateDisclosure";
import {
  formatPrice,
  lowestPrice,
  merchantCtaLabel,
  merchantLogo,
  sortOffers,
} from "@/lib/affiliate/merchants";
import {
  trackWhereToBuyImpression,
  trackWhereToBuyMerchantClick,
} from "@/lib/analytics";
import type { MerchantOffer } from "@/types";
import type { ManufacturerInfo } from "@/lib/affiliate/offers";

interface WhereToBuyPanelProps {
  productSlug: string;
  offers: MerchantOffer[];
  manufacturer: ManufacturerInfo;
}

/**
 * WhereToBuyPanel — DAN-974 / DAN-600 Component 1 (go-live).
 *
 * Renders live merchant offers as accessible, single-tab-stop rows, sorted
 * lowest-price-first with the lowest-price flag computed at render time. Always
 * renders the affiliate DisclosureBlock footnote (DAN-973) beneath the rows, and
 * an honest empty state when no live deals are available — the panel is never
 * hidden. Fires impression + per-merchant click analytics (DAN-600 Component 4).
 */
export function WhereToBuyPanel({
  productSlug,
  offers,
  manufacturer,
}: WhereToBuyPanelProps) {
  // Computed at render time (not cached) so the flag always reflects current prices.
  const sorted = sortOffers(offers);
  const minPrice = lowestPrice(sorted);

  useEffect(() => {
    trackWhereToBuyImpression({
      product_slug: productSlug,
      merchant_count: sorted.length,
      lowest_price: minPrice ?? 0,
    });
    // Fire once per mount for this product.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSlug]);

  return (
    <section
      aria-label="Where to buy"
      className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900">Where to buy</h2>

      {sorted.length === 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Currently unavailable from our partner merchants — check directly at{" "}
          {manufacturer.url ? (
            <a
              href={manufacturer.url}
              target="_blank"
              rel="noopener nofollow"
              className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
            >
              {manufacturer.name}
            </a>
          ) : (
            <span className="font-medium text-gray-900">{manufacturer.name}</span>
          )}
          .
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {sorted.map((offer, i) => {
            const isLowest = minPrice !== null && offer.price === minPrice;
            return (
              <li key={`${offer.merchantSlug}-${i}`}>
                <AffiliateLink
                  href={offer.url}
                  onClick={() =>
                    trackWhereToBuyMerchantClick({
                      product_slug: productSlug,
                      merchant_slug: offer.merchantSlug,
                      displayed_price: offer.price,
                      position: i,
                    })
                  }
                  className="group flex flex-col gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-brand-300 hover:bg-brand-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Merchant identity */}
                  <span className="flex min-w-0 items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={merchantLogo(offer)}
                      alt={`${offer.merchantName} logo`}
                      width={24}
                      height={24}
                      className="h-6 w-6 shrink-0 rounded"
                    />
                    <span className="truncate font-medium text-gray-900">
                      {offer.merchantName}
                    </span>
                    {/* Mobile: lowest-price flag as a top-right green pill */}
                    {isLowest && (
                      <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 sm:hidden">
                        Lowest price
                      </span>
                    )}
                  </span>

                  {/* Price + CTA */}
                  <span className="flex items-center justify-between gap-4 sm:justify-end">
                    <span className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatPrice(offer.price, offer.currency)}
                      </span>
                      {/* Desktop: lowest-price flag as an inline text node */}
                      {isLowest && (
                        <span className="hidden text-xs font-semibold text-emerald-700 sm:inline">
                          Lowest price
                        </span>
                      )}
                    </span>
                    <span className="w-full rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white transition group-hover:bg-brand-700 sm:w-auto">
                      {merchantCtaLabel(offer)}
                    </span>
                  </span>
                </AffiliateLink>
              </li>
            );
          })}
        </ul>
      )}

      {/* DisclosureBlock footnote — always visible whenever the panel is (DAN-973). */}
      <AffiliateDisclosure source="panel_footnote" className="mt-5" />
    </section>
  );
}
