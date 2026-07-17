import { buildMetadata } from "@/lib/seo/metadata";
import { CompareBuilder } from "./CompareBuilder";
import { breadcrumbSchema } from "@/lib/schema/jsonld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

const compareHubJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/compare#page`,
  name: "Compare Products Side-by-Side — Up to 4 Products | ReviewIQ",
  description:
    "Search and add 2–4 products to compare SmartScores, specs, pros & cons, and get an AI verdict in one view. Free, no sign-in needed.",
  url: `${SITE_URL}/compare`,
  inLanguage: "en-US",
  isAccessibleForFree: true,
  datePublished: "2024-01-01",
  dateModified: "2026-07-17",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  abstract: "Compare any 2–4 products side-by-side on ReviewIQ. See SmartScores, specs, pros and cons, and an AI-generated verdict to make a confident buying decision.",
  accessMode: ["textual", "visual"],
  accessibilityFeature: ["readingOrder", "structuralNavigation", "tableOfContents"],
  accessibilityHazard: "none",
  copyrightHolder: { "@id": `${SITE_URL}/#organization` },
  author: { "@id": `${SITE_URL}/#organization` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["[data-speakable='compare-intro']"],
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/compare?ids={product_ids}`,
      actionPlatform: ["https://schema.org/DesktopWebPlatform", "https://schema.org/MobileWebPlatform"],
    },
    "query-input": "required name=product_ids",
    description: "Search for products to compare side-by-side on ReviewIQ",
  },
};

export const metadata = buildMetadata({
  title: "Compare Products Side-by-Side — Up to 4 Products | ReviewIQ",
  description:
    "Search and add 2–4 products to compare SmartScores, specs, pros & cons, and get an AI verdict in one view. Free, no sign-in needed.",
  path: "/compare",
});

export default function ComparePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(compareHubJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([{ name: "Compare", url: "/compare" }])),
        }}
      />
      <CompareBuilder />
    </>
  );
}
