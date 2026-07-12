import type { Metadata } from "next";

const SITE_NAME = "ReviewIQ";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com").trim();
const SITE_DESCRIPTION =
  "Honest, AI-powered product reviews. See what real buyers love, hate, and wish they knew before purchasing.";

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
      ...(overrides.image && { images: [{ url: overrides.image }] }),
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
