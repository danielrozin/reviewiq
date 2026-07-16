import { describe, it, expect } from "vitest";
import { getAllProducts } from "@/data/products";
import { shortProductName } from "../seo/short-product-name";

const byName = (name: string) => {
  const product = getAllProducts().find((p) => p.name === name);
  if (!product) throw new Error(`fixture drifted: no product named "${name}"`);
  return product;
};

describe("shortProductName", () => {
  it("drops a category word the comparison page already states", () => {
    expect(shortProductName(byName("Casper Original Mattress"))).toBe("Casper Original");
  });

  it("keeps names whose category word is what distinguishes two products", () => {
    // Both of these would shorten to "Bose QuietComfort Ultra"; there the category word
    // carries the whole distinction, so shortening either would publish two different
    // comparison pages under one title.
    expect(shortProductName(byName("Bose QuietComfort Ultra Earbuds"))).toBe(
      "Bose QuietComfort Ultra Earbuds",
    );
    expect(shortProductName(byName("Bose QuietComfort Ultra Headphones"))).toBe(
      "Bose QuietComfort Ultra Headphones",
    );
  });

  it("never maps two distinct products onto the same name", () => {
    const seen = new Map<string, string>();
    for (const product of getAllProducts()) {
      const short = shortProductName(product);
      const clash = seen.get(short);
      expect(clash, `"${short}" is shared by "${clash}" and "${product.name}"`).toBeUndefined();
      seen.set(short, product.name);
    }
  });

  it("only ever removes a trailing word, never rewrites the name", () => {
    for (const product of getAllProducts()) {
      expect(product.name.startsWith(shortProductName(product))).toBe(true);
    }
  });
});
