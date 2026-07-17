import Link from "next/link";
import { SmartScore } from "@/components/ui/SmartScore";
import { ProductImage } from "@/components/ui/ProductImage";
import { getCategoryBySlug } from "@/data/categories";
import type { Product } from "@/types";

interface PeopleAlsoReviewedProps {
  products: Product[];
}

export function PeopleAlsoReviewed({ products }: PeopleAlsoReviewedProps) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="people-also-reviewed-heading" data-speakable="people-also-reviewed" className="mt-12">
      <div className="flex items-center gap-2.5 mb-1">
        <div aria-hidden="true" className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </div>
        <h2 id="people-also-reviewed-heading" className="text-xl font-semibold text-gray-900">People Also Reviewed</h2>
      </div>
      <p className="text-sm text-gray-600 mb-6 ml-9">
        Popular products in related categories
      </p>

      {/* ItemList JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "People Also Reviewed",
            numberOfItems: products.length,
            isPartOf: { "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com"}/#website` },
            publisher: { "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com"}/#organization` },
            itemListElement: products.map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: product.name,
              url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com"}/category/${product.categorySlug}/${product.slug}`,
            })),
          }),
        }}
      />

      <ul role="list" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 list-none p-0 m-0">
        {products.map((product) => {
          const category = getCategoryBySlug(product.categorySlug);
          return (
            <li key={product.id}>
            <Link
              href={`/category/${product.categorySlug}/${product.slug}`}
              aria-label={`${product.name} by ${product.brand} — SmartScore ${product.smartScore}/100, ${product.reviewCount.toLocaleString()} reviews`}
              className="group flex flex-col border border-gray-100 rounded-xl overflow-hidden hover:border-brand-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
            >
              {/* Hover accent strip */}
              <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <ProductImage
                src={product.image}
                alt={product.name}
                brand={product.brand}
                size="md"
              />
              <div className="p-3 flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <SmartScore score={product.smartScore} size="sm" />
                  <span className="text-xs text-brand-600 font-medium">
                    {category?.name ?? product.categorySlug}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                  {product.name}
                </p>
                <p className="text-xs text-gray-600">{product.brand}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-auto">
                  <svg aria-hidden="true" className="w-3 h-3 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="currentColor" focusable="false">
                    <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                  <span>{product.reviewCount.toLocaleString()}</span>
                  <span aria-hidden="true" className="text-gray-200">·</span>
                  <span>${product.priceRange.min}–${product.priceRange.max}</span>
                </div>
              </div>
            </Link>
            </li>
          );
        })}
      </ul>

      {/* Cross-category links */}
      <ul role="list" className="flex flex-wrap gap-2 mt-5 list-none p-0 m-0">
        {[...new Set(products.map((p) => p.categorySlug))].map((slug) => {
          const cat = getCategoryBySlug(slug);
          if (!cat) return null;
          return (
            <li key={slug}>
            <Link
              href={`/category/${slug}`}
              className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 min-h-[44px] py-2.5 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
            >
              Browse all {cat.name}
              <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
