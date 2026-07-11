import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqPages } from "@/data/faq-pages";
import { faqHubSchema } from "@/lib/schema/jsonld";

export const metadata = buildMetadata({
  title: "Frequently Asked Questions",
  description:
    "Find answers about product review platforms, fake reviews, and how ReviewIQ provides verified, AI-powered product intelligence.",
  path: "/faq",
});

export default function FAQIndexPage() {
  const hubSchema = faqHubSchema(faqPages);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubSchema) }}
      />
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
            className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-brand-300 hover:shadow-md transition-all"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {page.title}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {page.heroSubtext}
            </p>
            <span className="inline-block mt-3 text-sm text-brand-600 font-medium">
              {page.faqs.length} questions &rarr;
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
