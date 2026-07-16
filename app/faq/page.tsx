import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqPages } from "@/data/faq-pages";
import { faqSchema, breadcrumbSchema } from "@/lib/schema/jsonld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

const faqIndexJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": `${SITE_URL}/faq#faq-topics`,
  name: "ReviewIQ FAQ Topics",
  description:
    "Frequently asked questions about product review platforms, fake reviews, and how ReviewIQ provides verified, AI-powered product intelligence.",
  url: `${SITE_URL}/faq`,
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  itemListElement: faqPages.map((page, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "WebPage",
      name: page.title,
      url: `${SITE_URL}/faq/${page.slug}`,
      description: page.metaDescription,
    },
  })),
};

const faqIndexWebPageJsonLd = {
  "@context": "https://schema.org",
  "@type": ["WebPage", "CollectionPage"],
  "@id": `${SITE_URL}/faq#page`,
  name: "Frequently Asked Questions — ReviewIQ",
  url: `${SITE_URL}/faq`,
  inLanguage: "en",
  isAccessibleForFree: true,
  datePublished: "2024-01-01",
  dateModified: "2026-07-05",
  mainEntity: { "@id": `${SITE_URL}/faq#faq-topics` },
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["[data-speakable='faq-intro']"],
  },
};

const faqIndexFAQPageJsonLd = faqSchema(
  [
    { question: "How does ReviewIQ verify buyer reviews?", answer: "ReviewIQ uses receipt uploads and retailer order verification to confirm purchases before publishing a review. Every review displays its verification tier — Verified Purchase, Receipt Verified, or Community Verified — so you always know how trustworthy it is." },
    { question: "What is a SmartScore?", answer: "SmartScore is ReviewIQ's 0–100 composite rating that synthesizes verified-buyer reviews, reliability data, ease-of-use ratings, and value feedback into a single comparable number — not a simple average of stars. It lets you compare products across brands on a level playing field." },
    { question: "Does ReviewIQ earn affiliate commissions?", answer: "No. ReviewIQ has zero affiliate links and earns nothing from your purchases. Our only revenue comes from the Pro subscription plan. Our sole incentive is helping you make the right buying decision." },
    { question: "Are online product reviews reliable?", answer: "Many online reviews are incentivized, fake, or from unverified purchasers. ReviewIQ addresses this by requiring purchase verification before a review can be published, by using AI to flag patterns consistent with fake or incentivized reviews, and by displaying a verification badge on every review so readers know the source." },
    { question: "How is ReviewIQ different from Amazon reviews?", answer: "Unlike Amazon, ReviewIQ has no financial stake in which products you buy — there are no affiliate links. All reviews are purchase-verified. ReviewIQ also provides AI-generated SmartScore summaries, reliability statistics, and side-by-side product comparisons that Amazon does not offer." },
    { question: "What is ReviewIQ Pro and what does it include?", answer: "ReviewIQ Pro is a paid subscription that unlocks advanced review filters (by verification tier, reviewer profile, and date range), price-drop alerts, unlimited side-by-side product comparisons, and early access to new product categories. The free tier gives full access to all reviews and SmartScores." },
  ],
  '/faq'
);

export const metadata = buildMetadata({
  title: "Frequently Asked Questions",
  description:
    "Find answers about product review platforms, fake reviews, and how ReviewIQ provides verified, AI-powered product intelligence.",
  path: "/faq",
});

export default function FAQIndexPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "FAQ", url: "/faq" }])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqIndexJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqIndexWebPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqIndexFAQPageJsonLd) }} />
      <Breadcrumbs items={[{ name: "FAQ", url: "/faq" }]} />

      <header className="mt-8 mb-12 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h1>
        <p data-speakable="faq-intro" className="text-lg text-gray-600 leading-relaxed">
          Honest answers about product review platforms, fake reviews, and why
          ReviewIQ does things differently.
        </p>
      </header>

      <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl list-none p-0">
        {faqPages.map((page) => (
          <li key={page.slug}>
          <Link
            href={`/faq/${page.slug}`}
            className="block bg-white border border-gray-400 rounded-xl overflow-hidden hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
          >
            <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {page.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {page.heroSubtext}
              </p>
              <span className="inline-block mt-3 text-sm text-brand-600 font-medium">
                {page.faqs.length} questions <span aria-hidden="true">&rarr;</span>
              </span>
            </div>
          </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
