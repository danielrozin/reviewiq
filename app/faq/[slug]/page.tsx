import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { competitorFaqPageSchema, breadcrumbSchema } from "@/lib/schema/jsonld";
import { faqPages, getFAQPageBySlug, getAllFAQSlugs } from "@/data/faq-pages";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllFAQSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getFAQPageBySlug(slug);
  if (!page) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: `${siteUrl}/faq/${page.slug}` },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: `${siteUrl}/faq/${page.slug}`,
      siteName: "ReviewIQ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
    },
  };
}

export default async function FAQPage({ params }: Props) {
  const { slug } = await params;
  const page = getFAQPageBySlug(slug);
  if (!page) notFound();

  const schemas = competitorFaqPageSchema({
    faqs: page.faqs,
    pageUrl: `/faq/${page.slug}`,
    pageName: page.metaTitle,
    competitor: page.competitor,
    datePublished: "2024-01-01",
    dateModified: "2026-07-05",
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { name: "FAQ", url: "/faq" },
          { name: page.title, url: `/faq/${page.slug}` },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: "FAQ", url: "/faq" },
        { name: page.title, url: `/faq/${page.slug}` },
      ])) }} />

      {/* Hero */}
      <header data-speakable="faq-hero" className="mt-8 mb-12 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {page.heroHeadline}
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          {page.heroSubtext}
        </p>
      </header>

      {/* FAQ list */}
      <section aria-label="Frequently asked questions" className="max-w-3xl space-y-8 mb-16">
        {page.faqs.map((faq, i) => (
          <article
            key={i}
            aria-labelledby={`faq-q-${i}`}
            className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm"
          >
            <h2 id={`faq-q-${i}`} className="text-xl font-semibold text-gray-900 mb-3">
              {faq.question}
            </h2>
            <p
              data-speakable="faq-answer"
              className="text-gray-600 leading-relaxed"
            >
              {faq.answer}
            </p>
          </article>
        ))}
      </section>

      {/* CTA */}
      <section aria-label="Get started with ReviewIQ" className="max-w-3xl bg-brand-50 border border-brand-200 rounded-xl p-8 mb-12 text-center">
        <p className="text-lg font-semibold text-brand-900 mb-4">
          {page.ctaText}
        </p>
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
        >
          Browse Verified Reviews
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      {/* Related links */}
      <nav className="max-w-3xl" aria-label="Related pages">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
          Related Guides
        </h2>
        <ul role="list" className="flex flex-wrap gap-3 list-none p-0 m-0">
          {page.relatedLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-brand-600 hover:text-brand-800 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Cross-links to other FAQ pages */}
      {faqPages.filter((p) => p.slug !== page.slug).length > 0 && (
        <nav className="max-w-3xl mt-12 pt-8 border-t border-gray-200" aria-label="Other FAQ topics">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
            More FAQ Topics
          </h2>
          <ul role="list" className="grid grid-cols-1 sm:grid-cols-3 gap-4 list-none p-0 m-0">
            {faqPages
              .filter((p) => p.slug !== page.slug)
              .map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/faq/${p.slug}`}
                    className="block p-4 bg-white border border-gray-100 rounded-xl hover:border-brand-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
                  >
                    <span className="font-medium text-gray-900 text-sm">
                      {p.title}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
