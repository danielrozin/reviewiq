import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqPages } from "@/data/faq-pages";

export const metadata = buildMetadata({
  title: "Frequently Asked Questions",
  description:
    "Find answers about product review platforms, fake reviews, and how ReviewIQ provides verified, AI-powered product intelligence.",
  path: "/faq",
});

export default function FAQIndexPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ name: "FAQ", url: "/faq" }]} />

      <header className="mt-8 mb-12 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Honest answers about product review platforms, fake reviews, and why
          ReviewIQ does things differently.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
        {faqPages.map((page) => (
          <Link
            key={page.slug}
            href={`/faq/${page.slug}`}
            className="block bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {page.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
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
