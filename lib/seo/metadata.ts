import type { Metadata } from "next";

const SITE_NAME = "ReviewIQ";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com").trim();
const SITE_DESCRIPTION =
  "Honest, AI-powered product reviews. See what real buyers love, hate, and wish they knew before purchasing.";

/**
 * Absolute URL of the `opengraph-image` route generated for a segment, e.g.
 * ogImageForSegment("/compare/a-vs-b") -> ".../compare/a-vs-b/opengraph-image".
 * Pass the result to `buildMetadata({ image })` from any segment that ships its own
 * opengraph-image.tsx: the explicit openGraph block below would otherwise fall back
 * to the generic site card and throw that segment's richer image away.
 */
export function ogImageForSegment(path: string): string {
  return `${SITE_URL}${path}/opengraph-image`;
}

/**
 * Google renders roughly 600px of the <title> in a SERP — about 60 characters at
 * typical glyph widths — and about 160 characters of the description. Past that the
 * tail is replaced with an ellipsis, so anything we put there never reaches the
 * searcher: the CTA, the differentiator, and the brand all silently disappear.
 */
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 160;

const BRAND_SUFFIX = ` | ${SITE_NAME}`;

/** Characters a title may use and still leave room for the " | ReviewIQ" suffix. */
export const TITLE_BUDGET = TITLE_MAX - BRAND_SUFFIX.length;

const hasBrand = (title: string) =>
  title.toLowerCase().includes(SITE_NAME.toLowerCase());

/**
 * Pick the richest title that still survives the SERP, given candidates ordered
 * longest (most informative) to shortest: the first one inside Google's render
 * budget wins, and buildMetadata appends the brand only if it still fits. A longer
 * candidate is worth more than the brand suffix — a dropped "| ReviewIQ" costs
 * nothing, a dropped "Which Is Better?" costs the click.
 *
 * When nothing fits, the last candidate is returned even though it overflows: on a
 * comparison page that floor is the "A vs B" keyword itself, and a truncated keyword
 * still ranks and reads, where a mid-word-chopped one does neither. So keep the
 * keyword at the head of every candidate.
 */
export function fitTitle(candidates: string[]): string {
  return (
    candidates.find((c) => c.length <= TITLE_MAX) ?? candidates[candidates.length - 1]
  );
}

/**
 * Drop a trailing category descriptor from a product name: "Colgate hum Smart Electric
 * Toothbrush" in Electric Toothbrushes becomes "Colgate hum Smart". Only safe where the
 * category is already established by the surrounding page — on a comparison of two
 * toothbrushes the word "Toothbrush" in each name buys nothing but eats SERP budget.
 *
 * The suffix is matched against the category name itself rather than a hand-written stop
 * list, so it can only ever remove a word the page already states. Names that don't end in
 * their category ("Philips Sonicare DiamondClean Smart 9700") come back untouched.
 *
 * Only the LONGEST matching phrase is ever removed, and a rejected match ends the search
 * instead of falling through to a shorter one: dropping "Fryer" but not "Air" off "Ninja
 * Air Fryer" would invent "Ninja Air", a product that does not exist. A name we cannot
 * shorten honestly is returned whole.
 */
export function dropCategorySuffix(name: string, categoryName?: string): string {
  if (!categoryName) return name;
  // "Batteries" -> "Battery", "Toothbrushes" -> "Toothbrush" (a bare `s$` rule would
  // leave "Toothbrushe" and silently match nothing), "Laptops" -> "Laptop".
  const singular = categoryName
    .replace(/ies$/, "y")
    .replace(/(ch|sh|[sxz])es$/, "$1")
    .replace(/([^s])s$/, "$1");
  const words = singular.split(" ");
  for (let i = 0; i < words.length; i++) {
    const phrase = words.slice(i).join(" ");
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // A name may carry either the singular ("…Electric Toothbrush") or the plural
    // ("…Wireless Headphones") form of its category.
    const trailing = new RegExp(`\\s+${escaped}(?:e?s)?$`, "i");
    if (!trailing.test(name)) continue;
    const stripped = name.replace(trailing, "").trim();
    // Never strip down to a bare brand — "Ninja" alone is not a product. Stop here rather
    // than trying a shorter phrase, which would mangle the name instead of shortening it.
    return stripped.includes(" ") ? stripped : name;
  }
  return name;
}

/**
 * Trim free text (a thread body, a user bio) to `max` characters on a word boundary,
 * with an ellipsis standing in for what was cut. Used where the copy is authored by
 * someone else and cannot be re-written into a shorter candidate.
 */
export function truncateAtWord(text: string, max: number = DESCRIPTION_MAX): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  // Leave room for the ellipsis. If the character we stop before is a space the cut
  // already landed on a word boundary; otherwise back up to the previous one so we
  // never publish half a word.
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const body = clean[max - 1] === " " || lastSpace <= 0 ? cut : cut.slice(0, lastSpace);
  return `${body.replace(/[\s,;:.—-]+$/, "")}…`;
}

export function buildMetadata(overrides: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  // The brand suffix is the first thing to go when a title would otherwise truncate:
  // a cut-off product name costs a click, a missing "| ReviewIQ" costs nothing.
  // Titles that already carry the brand keep it and are never branded twice.
  const base = overrides.title?.trim();
  const title = !base
    ? `${SITE_NAME} — Real Reviews, Real Intelligence`
    : hasBrand(base) || base.length + BRAND_SUFFIX.length > TITLE_MAX
      ? base
      : `${base}${BRAND_SUFFIX}`;
  const description = overrides.description || SITE_DESCRIPTION;
  const url = overrides.path ? `${SITE_URL}${overrides.path}` : SITE_URL;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      // Declaring `openGraph` here replaces whatever a parent segment resolved, so a
      // page that passes no image ends up with NO og:image at all — the root
      // `app/opengraph-image.tsx` is not inherited through an explicit openGraph block.
      // Fall back to the site card so every page ships one. Segments with their own
      // opengraph-image route pass that URL in `image` and keep their richer card.
      images: [{ url: overrides.image || `${SITE_URL}/opengraph-image` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    // noindex stays `follow`: a de-indexed page should still pass crawlers (and link
    // equity) through to the pages it links to, not dead-end them.
    robots: overrides.noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}
