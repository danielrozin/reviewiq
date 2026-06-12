import { describe, it, expect } from "vitest";
import {
  sortOffers,
  lowestPrice,
  merchantCtaLabel,
  formatPrice,
} from "@/lib/affiliate/merchants";
import type { MerchantOffer } from "@/types";

function offer(partial: Partial<MerchantOffer>): MerchantOffer {
  return {
    merchantSlug: "amazon",
    merchantName: "Amazon",
    url: "https://example.com",
    price: 100,
    currency: "USD",
    isFirstParty: false,
    ...partial,
  };
}

describe("sortOffers", () => {
  it("orders by lowest price first", () => {
    const sorted = sortOffers([
      offer({ merchantSlug: "walmart", merchantName: "Walmart", price: 120 }),
      offer({ merchantSlug: "amazon", merchantName: "Amazon", price: 90 }),
      offer({ merchantSlug: "best-buy", merchantName: "Best Buy", price: 110 }),
    ]);
    expect(sorted.map((o) => o.price)).toEqual([90, 110, 120]);
  });

  it("breaks price ties first-party > Amazon > Best Buy > others", () => {
    const sorted = sortOffers([
      offer({ merchantSlug: "best-buy", merchantName: "Best Buy", price: 100 }),
      offer({ merchantSlug: "walmart", merchantName: "Walmart", price: 100 }),
      offer({ merchantSlug: "amazon", merchantName: "Amazon", price: 100 }),
      offer({ merchantSlug: "dyson", merchantName: "Dyson", price: 100, isFirstParty: true }),
    ]);
    expect(sorted.map((o) => o.merchantSlug)).toEqual([
      "dyson",
      "amazon",
      "best-buy",
      "walmart",
    ]);
  });

  it("does not mutate the input array", () => {
    const input = [offer({ price: 120 }), offer({ price: 90 })];
    const copy = [...input];
    sortOffers(input);
    expect(input).toEqual(copy);
  });
});

describe("lowestPrice", () => {
  it("returns the minimum price", () => {
    expect(lowestPrice([offer({ price: 120 }), offer({ price: 90 })])).toBe(90);
  });

  it("returns null for an empty set", () => {
    expect(lowestPrice([])).toBeNull();
  });
});

describe("merchantCtaLabel", () => {
  it("uses 'Buy direct' for first-party", () => {
    expect(merchantCtaLabel(offer({ isFirstParty: true }))).toBe("Buy direct");
  });

  it("uses 'See on {Merchant}' for marketplaces", () => {
    expect(merchantCtaLabel(offer({ merchantName: "Best Buy" }))).toBe(
      "See on Best Buy"
    );
  });
});

describe("formatPrice", () => {
  it("localizes USD without cents for whole numbers", () => {
    expect(formatPrice(1099, "USD")).toBe("$1,099");
  });
});
