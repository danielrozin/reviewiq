import type { Metadata } from "next";

const SITE_NAME = "ReviewIQ";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";
const SITE_DESCRIPTION =
  "Honest, AI-powered product reviews. See what real buyers love, hate, and wish they knew before purchasing.";

export function buildMetadata(overrides: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
}): Metadata {
  const title = overrides.title
    ? `${overrides.title} | ${SITE_NAME}`
    : `${SITE_NAME} — Real Reviews, Real Intelligence`;
  const description = overrides.description || SITE_DESCRIPTION;
  const url = overrides.path ? `${SITE_URL}${overrides.path}` : SITE_URL;
  const ogType = overrides.ogType || "website";

  const ogArticleFields =
    ogType === "article"
      ? {
          type: "article" as const,
          ...(overrides.publishedTime && { publishedTime: overrides.publishedTime }),
          ...(overrides.modifiedTime && { modifiedTime: overrides.modifiedTime }),
        }
      : { type: "website" as const };

  return {
    title,
    description,
    ...(overrides.keywords && { keywords: overrides.keywords }),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      ...ogArticleFields,
      images: [{ url: overrides.image || `${SITE_URL}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [overrides.image || `${SITE_URL}/opengraph-image`],
    },
    robots: overrides.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
