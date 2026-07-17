import { buildMetadata } from "@/lib/seo/metadata";
import { TermsContent } from "./TermsContent";
import { breadcrumbSchema } from "@/lib/schema/jsonld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

const termsWebPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/terms#page`,
  name: "Terms of Service — ReviewIQ",
  url: `${SITE_URL}/terms`,
  inLanguage: "en-US",
  isAccessibleForFree: true,
  datePublished: "2024-01-01",
  dateModified: "2026-07-17",
  abstract: "ReviewIQ's Terms of Service govern your use of the platform, including review submission, account conduct, intellectual property, and dispute resolution.",
  accessMode: ["textual"],
  accessibilityFeature: ["readingOrder", "structuralNavigation"],
  accessibilityHazard: "none",
  copyrightHolder: { "@id": `${SITE_URL}/#organization` },
  author: { "@id": `${SITE_URL}/#organization` },
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["[data-speakable='terms-intro']"],
  },
};

export const metadata = buildMetadata({
  title: "Terms of Service",
  description: "Read the ReviewIQ Terms of Service. Understand your rights and responsibilities as a user.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsWebPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Terms of Service", url: "/terms" }])) }}
      />
      <TermsContent />
    </>
  );
}
