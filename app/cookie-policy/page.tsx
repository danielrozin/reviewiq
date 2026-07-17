import { buildMetadata } from "@/lib/seo/metadata";
import { CookiePolicyContent } from "./CookiePolicyContent";
import { breadcrumbSchema } from "@/lib/schema/jsonld";

export const metadata = buildMetadata({
  title: "Cookie Policy",
  description: "Learn how ReviewIQ uses cookies and similar tracking technologies.",
  path: "/cookie-policy",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

const cookiePolicySchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/cookie-policy#page`,
  name: "Cookie Policy — ReviewIQ",
  url: `${SITE_URL}/cookie-policy`,
  inLanguage: "en-US",
  isAccessibleForFree: true,
  datePublished: "2024-01-01",
  dateModified: "2026-07-17",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["[data-speakable='cookie-policy-intro']"],
  },
};

export default function CookiePolicyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cookiePolicySchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Cookie Policy", url: "/cookie-policy" }])) }}
      />
      <CookiePolicyContent />
    </>
  );
}
