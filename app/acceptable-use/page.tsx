import { buildMetadata } from "@/lib/seo/metadata";
import { AcceptableUseContent } from "./AcceptableUseContent";
import { breadcrumbSchema } from "@/lib/schema/jsonld";

export const metadata = buildMetadata({
  title: "Acceptable Use Policy",
  description: "Read the ReviewIQ Acceptable Use Policy. Understand the rules for using our platform responsibly.",
  path: "/acceptable-use",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

const acceptableUseSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/acceptable-use#page`,
  name: "Acceptable Use Policy — ReviewIQ",
  url: `${SITE_URL}/acceptable-use`,
  inLanguage: "en",
  datePublished: "2024-01-01",
  dateModified: "2026-07-05",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["[data-speakable='acceptable-use-intro']"],
  },
};

export default function AcceptableUsePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(acceptableUseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Acceptable Use Policy", url: "/acceptable-use" }])) }}
      />
      <AcceptableUseContent />
    </>
  );
}
