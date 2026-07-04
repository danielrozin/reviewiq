import { buildMetadata } from "@/lib/seo/metadata";
import { CookiePolicyContent } from "./CookiePolicyContent";

export const metadata = buildMetadata({
  title: "Cookie Policy",
  description: "Learn how ReviewIQ uses cookies and similar tracking technologies.",
  path: "/cookie-policy",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

const cookiePolicySchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/cookie-policy`,
  name: "Cookie Policy — ReviewIQ",
  url: `${SITE_URL}/cookie-policy`,
  inLanguage: "en",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export default function CookiePolicyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cookiePolicySchema) }}
      />
      <CookiePolicyContent />
    </>
  );
}
