import { buildMetadata } from "@/lib/seo/metadata";
import { PrivacyContent } from "./PrivacyContent";
import { breadcrumbSchema } from "@/lib/schema/jsonld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

const privacyWebPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/privacy#page`,
  name: "Privacy Policy — ReviewIQ",
  url: `${SITE_URL}/privacy`,
  inLanguage: "en",
  datePublished: "2024-01-01",
  dateModified: "2026-07-05",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["[data-speakable='privacy-intro']"],
  },
};

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "Read the ReviewIQ Privacy Policy to understand how we collect, use, and protect your personal information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyWebPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Privacy Policy", url: "/privacy" }])) }}
      />
      <PrivacyContent />
    </>
  );
}
