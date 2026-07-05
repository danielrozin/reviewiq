import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqPages } from "@/data/faq-pages";
import { breadcrumbSchema } from "@/lib/schema/jsonld";

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

export const metadata = buildMetadata({
  title: "Frequently Asked Questions",
  description:
    "Find answers about product review platforms, fake reviews, and how ReviewIQ provides verified, AI-powered product intelligence.",
  path: "/faq",
});

export default function FAQIndexPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqIndexJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqIndexWebPageJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([{ name: "FAQ", url: "/faq" }])),
        }}
      />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
        {faqPages.map((page) => (
          <Link
            key={page.slug}
            href={`/faq/${page.slug}`}
            className="block bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
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
                {page.faqs.length} questions &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
