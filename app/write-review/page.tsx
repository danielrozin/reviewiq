import { buildMetadata } from "@/lib/seo/metadata";
import { WriteReviewForm } from "./WriteReviewForm";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

const writeReviewWebPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/write-review#page`,
  name: "Write a Product Review — Share Your Experience | ReviewIQ",
  url: `${SITE_URL}/write-review`,
  inLanguage: "en",
  datePublished: "2024-01-01",
  dateModified: "2026-07-05",
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
      <WriteReviewForm />
    </>
  );
}
