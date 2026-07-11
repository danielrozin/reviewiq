import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductSearch } from "@/components/product/ProductSearch";
import { breadcrumbSchema } from "@/lib/schema/jsonld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

const productsPageSchema = {
  "@context": "https://schema.org",
  "@type": "SearchResultsPage",
  "@id": `${SITE_URL}/products#page`,
  name: "Browse All Products — ReviewIQ",
  url: `${SITE_URL}/products`,
  inLanguage: "en",
  isAccessibleForFree: true,
  description:
    "Search and filter products across all categories on ReviewIQ. Every SmartScore is based on verified buyer reviews.",
  mainEntity: { "@type": "ItemList", "@id": `${SITE_URL}/products#product-list`, name: "All Reviewed Products", url: `${SITE_URL}/products` },
  datePublished: "2024-01-01",
  dateModified: "2026-07-05",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["[data-speakable='products-intro']"],
  },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/products?q={query}`,
    "query-input": "required name=query",
  },
};

export const metadata = buildMetadata({
  title: "Browse All Products — Search & Filter",
  description:
    "Search and filter products across all categories. Sort by SmartScore, price, ratings, and more. Find the perfect product with ReviewIQ.",
  path: "/products",
});

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ name: "Products", url: "/products" }]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Products", url: "/products" }])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productsPageSchema) }} />

      <div className="mt-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Browse Products
        </h1>
        <p data-speakable="products-intro" className="mt-2 text-gray-600 max-w-2xl">
          Search and filter across all categories to find the right product for
          you. Every score is based on verified buyer reviews.
        </p>
      </div>

      <Suspense fallback={<ProductSearchSkeleton />}>
        <ProductSearch />
      </Suspense>
    </div>
  );
}

function ProductSearchSkeleton() {
  return (
    <div role="status" aria-label="Loading products" className="motion-safe:animate-pulse space-y-6">
      <div className="h-12 bg-gray-100 rounded-xl" />
      <ul aria-hidden="true" className="flex gap-3 list-none p-0 m-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="h-10 w-28 bg-gray-100 rounded-lg" />
        ))}
      </ul>
      <ul aria-hidden="true" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="h-64 bg-gray-100 rounded-2xl" />
        ))}
      </ul>
    </div>
  );
}
