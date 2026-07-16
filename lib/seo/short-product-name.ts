import type { Product } from "@/types";
import { getAllProducts } from "@/data/products";
import { getCategoryBySlug } from "@/data/categories";
import { dropCategorySuffix } from "./metadata";

/**
 * The catalog-aware half of the SERP title budget: `dropCategorySuffix` decides whether a
 * trailing category word is grammatically removable, this decides whether removing it is
 * still *honest* given every other product we publish.
 *
 * The two are separate because a suffix is only redundant when it isn't the thing telling
 * two products apart. "Bose QuietComfort Ultra Earbuds" and "Bose QuietComfort Ultra
 * Headphones" both shorten to "Bose QuietComfort Ultra", so for that pair the category word
 * carries the entire distinction and both names must stay whole — otherwise two different
 * comparison pages would publish the same title and Google could not tell them apart.
 */
const ambiguousShortNames = (() => {
  let cache: Set<string> | null = null;
  return () => {
    if (cache) return cache;
    const byShort = new Map<string, Set<string>>();
    for (const product of getAllProducts()) {
      const short = rawShortName(product);
      if (short === product.name) continue;
      if (!byShort.has(short)) byShort.set(short, new Set());
      byShort.get(short)!.add(product.name);
    }
    cache = new Set(
      [...byShort.entries()].filter(([, names]) => names.size > 1).map(([short]) => short),
    );
    return cache;
  };
})();

const rawShortName = (product: Product) =>
  dropCategorySuffix(product.name, getCategoryBySlug(product.categorySlug)?.name);

/**
 * The shortest name for `product` that is still unambiguous across the whole catalog.
 * Falls back to the full name whenever shortening would collide with another product.
 */
export function shortProductName(product: Product): string {
  const short = rawShortName(product);
  return ambiguousShortNames().has(short) ? product.name : short;
}
