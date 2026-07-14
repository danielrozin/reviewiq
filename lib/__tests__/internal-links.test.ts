import { describe, it, expect } from "vitest";
import { products, resolveProductRef } from "@/data/products";
import {
  getAllComparisonPairs,
  getComparisonLinksForProduct,
} from "@/data/comparisons";
import { discussions } from "@/data/discussions";

/**
 * Every internal href the site renders must resolve to a page the site generates.
 *
 * Product pages used to build `/compare/{a}-vs-{b}` straight from the partner slug
 * stored on `product.comparisons`, and community cards built
 * `/category/{cat}/{slug}` straight from the strings on a thread. Both are
 * denormalized copies that drifted from the catalog, so both shipped 404s into the
 * internal link graph (24 + 4, confirmed by crawling prod).
 */
describe("internal link graph", () => {
  const catalogSlugs = new Set(products.map((p) => p.slug));
  const generatedPairs = new Set(getAllComparisonPairs().map((pair) => pair.slug));

  describe("negative control — the drifted data these guards exist for", () => {
    // If these ever go to zero the data was cleaned up, and the assertions below
    // would start passing for the wrong reason. Delete these guards deliberately,
    // not by accident.
    it("product.comparisons still names partners by a slug not in the catalog", () => {
      const drifted = products.flatMap((p) =>
        p.comparisons.filter((c) => !catalogSlugs.has(c.productSlug)),
      );
      expect(drifted.length).toBeGreaterThan(0);
    });

    it("some threads still name a product that exists under no catalog key", () => {
      const unresolvable = discussions.filter(
        (t) => t.productSlug && !resolveProductRef(t),
      );
      expect(unresolvable.length).toBeGreaterThan(0);
    });
  });

  it("every comparison link on every product page has a generated page", () => {
    const dead: string[] = [];

    for (const product of products) {
      for (const link of getComparisonLinksForProduct(product)) {
        if (!generatedPairs.has(link.slug)) {
          dead.push(`/compare/${link.slug} (on ${product.slug})`);
        }
      }
    }

    expect(dead).toEqual([]);
  });

  it("resolves comparison partners by id, so a drifted slug still links correctly", () => {
    // `sw-pixel-watch-2` is stored on some refs as the slug "pixel-watch-2";
    // its catalog slug is "google-pixel-watch-2". The link must use the catalog's.
    const ticwatch = products.find((p) => p.slug === "ticwatch-pro-5");
    expect(ticwatch).toBeDefined();

    const links = getComparisonLinksForProduct(ticwatch!);
    const pixel = links.find((l) => l.partner.id === "sw-pixel-watch-2");

    expect(pixel).toBeDefined();
    expect(pixel!.partner.slug).toBe("google-pixel-watch-2");
    expect(pixel!.slug).toBe("google-pixel-watch-2-vs-ticwatch-pro-5");
    expect(generatedPairs.has(pixel!.slug)).toBe(true);
  });

  it("names the partner from the catalog, not the ref's stale copy", () => {
    // The ref on tempur-pedic-proadapt calls product `mt-purple-4` "Purple Mattress 4";
    // the catalog calls that same row "Purple Mattress Original". The page shows the catalog's.
    const tempur = products.find((p) => p.slug === "tempur-pedic-proadapt");
    const purple = getComparisonLinksForProduct(tempur!).find(
      (l) => l.partner.id === "mt-purple-4",
    );

    expect(purple).toBeDefined();
    expect(purple!.partner.name).toBe("Purple Mattress Original");
  });

  it("never emits the naive slug the old renderer built from the stale ref", () => {
    // The regression itself: `[product.slug, ref.productSlug].sort().join("-vs-")`
    // produced hrefs like /compare/pixel-watch-2-vs-ticwatch-pro-5 — no such page
    // exists, and none should. Assert both halves so this can't rot.
    const naive: string[] = [];

    for (const product of products) {
      for (const ref of product.comparisons) {
        if (catalogSlugs.has(ref.productSlug)) continue; // ref was never drifted
        naive.push([product.slug, ref.productSlug].sort().join("-vs-"));
      }
    }

    expect(naive.length).toBeGreaterThan(0);

    const rendered = new Set(
      products.flatMap((p) => getComparisonLinksForProduct(p).map((l) => l.slug)),
    );

    for (const slug of naive) {
      expect(generatedPairs.has(slug)).toBe(false); // it 404s
      expect(rendered.has(slug)).toBe(false); // and we never link to it
    }
  });

  it("every product page a comparison links to exists in the catalog", () => {
    for (const pair of getAllComparisonPairs()) {
      expect(catalogSlugs.has(pair.productA.slug)).toBe(true);
      expect(catalogSlugs.has(pair.productB.slug)).toBe(true);
      expect(pair.productA.slug).not.toBe(pair.productB.slug);
    }
  });

  it("only links a thread's product when it resolves to a catalog page", () => {
    for (const thread of discussions) {
      const resolved = resolveProductRef(thread);
      if (!resolved) continue; // rendered as no link at all — that's the fix
      expect(catalogSlugs.has(resolved.slug)).toBe(true);
      expect(resolved.categorySlug).toBeTruthy();
    }
  });
});
