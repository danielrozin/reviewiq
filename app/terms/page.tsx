import { buildMetadata } from "@/lib/seo/metadata";
import { TermsContent } from "./TermsContent";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

const termsWebPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/terms`,
  name: "Terms of Service — ReviewIQ",
  url: `${SITE_URL}/terms`,
  inLanguage: "en",
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
      <TermsContent />
    </>
  );
}
