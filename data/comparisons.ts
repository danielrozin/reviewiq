import { products, getAllProducts } from "@/data/products";
import { formatPrice } from "@/lib/affiliate/merchants";
import type { ComparisonRef, Product, FAQItem } from "@/types";

export interface ComparisonPair {
  slug: string; // e.g. "roborock-s8-maxv-ultra-vs-irobot-roomba-j7-plus"
  productA: Product;
  productB: Product;
  searchVolume: number;
}

/** A comparison link that is guaranteed to resolve to a real /compare/[slug] page. */
export interface ComparisonLink {
  slug: string;
  partner: Product;
  searchVolume: number;
}

function makeComparisonSlug(slugA: string, slugB: string): string {
  return [slugA, slugB].sort().join("-vs-");
}

/**
 * `ComparisonRef.productSlug` and `.productName` are denormalized copies of the
 * partner's catalog fields, and 15 of them have drifted out of sync (the ref for
 * product `sw-pixel-watch-2` says `pixel-watch-2`; its catalog slug is
 * `google-pixel-watch-2`). `productId` is the actual foreign key, so it — not the
 * copied slug — decides which product a ref points at. Resolve through here and
 * take the name/slug off the returned Product; a ref that resolves to nothing has
 * no page and must never be rendered as a link.
 */
function resolvePartner(ref: ComparisonRef): Product | undefined {
  return (
    products.find((p) => p.id === ref.productId) ??
    products.find((p) => p.slug === ref.productSlug)
  );
}

export function getAllComparisonPairs(): ComparisonPair[] {
  const seen = new Set<string>();
  const pairs: ComparisonPair[] = [];

  for (const product of products) {
    for (const comp of product.comparisons) {
      const other = resolvePartner(comp);
      if (!other || other.slug === product.slug) continue;

      const slug = makeComparisonSlug(product.slug, other.slug);
      if (seen.has(slug)) continue;
      seen.add(slug);

      // Ensure consistent A/B ordering (alphabetical by slug)
      const [productA, productB] =
        product.slug < other.slug ? [product, other] : [other, product];

      pairs.push({
        slug,
        productA,
        productB,
        searchVolume: comp.searchVolume ?? 0,
      });
    }
  }

  return pairs.sort((a, b) => b.searchVolume - a.searchVolume);
}

/**
 * The comparison links to render on a product page. Every entry is backed by a
 * pair that `getAllComparisonPairs()` actually generates a page for, so this can
 * never emit a 404. Anything rendering a `/compare/` href must go through here
 * rather than reading `product.comparisons` directly.
 */
export function getComparisonLinksForProduct(product: Product): ComparisonLink[] {
  const generated = new Set(getAllComparisonPairs().map((pair) => pair.slug));
  const links: ComparisonLink[] = [];
  const seen = new Set<string>();

  for (const comp of product.comparisons) {
    const partner = resolvePartner(comp);
    if (!partner || partner.slug === product.slug) continue;

    const slug = makeComparisonSlug(product.slug, partner.slug);
    if (!generated.has(slug) || seen.has(slug)) continue;
    seen.add(slug);

    links.push({ slug, partner, searchVolume: comp.searchVolume ?? 0 });
  }

  return links;
}

export function getComparisonBySlug(slug: string): ComparisonPair | undefined {
  return getAllComparisonPairs().find((pair) => pair.slug === slug);
}

export function getComparisonSlugForProducts(
  slugA: string,
  slugB: string
): string {
  return makeComparisonSlug(slugA, slugB);
}

export function generateVerdict(a: Product, b: Product): string {
  const diff = a.smartScore - b.smartScore;
  if (Math.abs(diff) <= 3) {
    return `The ${a.name} and ${b.name} are extremely close in overall quality. Your choice should come down to which features matter most to you and your specific use case.`;
  }
  const winner = diff > 0 ? a : b;
  const loser = diff > 0 ? b : a;
  if (Math.abs(diff) <= 8) {
    return `The ${winner.name} edges out the ${loser.name} with a SmartScore of ${winner.smartScore} vs ${loser.smartScore}. While both are solid choices, the ${winner.name} offers a slightly better overall experience based on verified buyer feedback.`;
  }
  return `The ${winner.name} is the clear winner with a SmartScore of ${winner.smartScore} compared to ${loser.smartScore} for the ${loser.name}. Based on hundreds of verified reviews, the ${winner.name} consistently delivers a superior experience.`;
}

/**
 * Build a comparison FAQ derived entirely from guaranteed, on-page product
 * fields (name, SmartScore, price, review counts) — never invented content.
 * These target "X vs Y" People-Also-Ask / AI-answer-engine queries. The answers
 * mirror what is rendered visibly on the comparison page, so the accompanying
 * FAQPage JSON-LD satisfies Google's content-match policy.
 */
export function comparisonFaq(a: Product, b: Product): FAQItem[] {
  const scoreWinner =
    a.smartScore >= b.smartScore ? a : b;
  const scoreLoser = scoreWinner === a ? b : a;
  const scoreTie = a.smartScore === b.smartScore;

  const aLow = a.priceRange.min;
  const bLow = b.priceRange.min;
  const cheaper = aLow <= bLow ? a : b;
  const pricier = cheaper === a ? b : a;
  const priceTie = aLow === bLow;

  const faq: FAQItem[] = [];

  // Q1 — the headline "which is better" question.
  faq.push({
    question: `Which is better, the ${a.name} or the ${b.name}?`,
    answer: scoreTie
      ? `The ${a.name} and ${b.name} are tied on our SmartScore (${a.smartScore}/100 each), so the right pick comes down to which features and price matter most for your needs.`
      : `The ${scoreWinner.name} scores higher overall with a SmartScore of ${scoreWinner.smartScore}/100 versus ${scoreLoser.smartScore}/100 for the ${scoreLoser.name}, based on verified buyer reviews. See the full verdict and spec-by-spec breakdown below.`,
  });

  // Q2 — price/value, another top comparison intent.
  faq.push({
    question: `Which is cheaper, the ${a.name} or the ${b.name}?`,
    answer: priceTie
      ? `Both the ${a.name} and the ${b.name} start at around ${formatPrice(aLow, a.priceRange.currency)}, so price is unlikely to be the deciding factor between them.`
      : `The ${cheaper.name} is the more affordable option, starting at ${formatPrice(cheaper.priceRange.min, cheaper.priceRange.currency)} versus ${formatPrice(pricier.priceRange.min, pricier.priceRange.currency)} for the ${pricier.name}.`,
  });

  // Q3 — how the comparison is backed (trust / E-E-A-T signal).
  faq.push({
    question: `How many reviews is the ${a.name} vs ${b.name} comparison based on?`,
    answer: `This comparison draws on ${(a.reviewCount + b.reviewCount).toLocaleString()} verified buyer reviews — ${a.reviewCount.toLocaleString()} for the ${a.name} and ${b.reviewCount.toLocaleString()} for the ${b.name} — condensed into each product's SmartScore.`,
  });

  return faq;
}
