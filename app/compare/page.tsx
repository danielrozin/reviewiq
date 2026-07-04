import { buildMetadata } from "@/lib/seo/metadata";
import { CompareBuilder } from "./CompareBuilder";
import { breadcrumbSchema } from "@/lib/schema/jsonld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

const compareHubJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/compare`,
  name: "Compare Products Side-by-Side — Up to 4 Products | ReviewIQ",
  description:
    "Search and add 2–4 products to compare SmartScores, specs, pros & cons, and get an AI verdict in one view. Free, no sign-in needed.",
  url: `${SITE_URL}/compare`,
  inLanguage: "en",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
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
