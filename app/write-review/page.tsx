import { buildMetadata } from "@/lib/seo/metadata";
import { WriteReviewForm } from "./WriteReviewForm";
import { breadcrumbSchema } from "@/lib/schema/jsonld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

const writeReviewWebPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/write-review`,
  name: "Write a Product Review — Share Your Experience | ReviewIQ",
  url: `${SITE_URL}/write-review`,
  inLanguage: "en",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["[data-speakable='write-review-intro']"],
  },
  potentialAction: {
    "@type": "CreateAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/write-review`,
      actionPlatform: ["https://schema.org/DesktopWebPlatform", "https://schema.org/MobileWebPlatform"],
    },
    result: {
      "@type": "Review",
      name: "Product Review",
    },
  },
};

export const metadata = buildMetadata({
  title: "Write a Product Review — Share Your Experience | ReviewIQ",
  description:
    "Write an honest, verified product review on ReviewIQ. Help thousands of buyers make smarter decisions. Free, takes under 3 minutes.",
  path: "/write-review",
});

export default function WriteReviewPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(writeReviewWebPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([{ name: "Write a Review", url: "/write-review" }])),
        }}
      />
      <WriteReviewForm />
    </>
  );
}
