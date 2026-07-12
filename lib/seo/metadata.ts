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

export function buildMetadata(overrides: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const title = overrides.title
    ? `${overrides.title} | ${SITE_NAME}`
    : `${SITE_NAME} — Real Reviews, Real Intelligence`;
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
