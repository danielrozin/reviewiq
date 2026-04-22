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
    <section className="mt-12">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        People Also Reviewed
      </h2>
      <p className="text-sm text-gray-500 mb-6">
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
            itemListElement: products.map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: product.name,
              url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com"}/category/${product.categorySlug}/${product.slug}`,
            })),
          }),
        }}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const category = getCategoryBySlug(product.categorySlug);
          return (
            <Link
              key={product.id}
              href={`/category/${product.categorySlug}/${product.slug}`}
              title={`${product.name} review — SmartScore ${product.smartScore}/100`}
              className="group flex flex-col border border-gray-100 rounded-xl overflow-hidden hover:border-brand-200 hover:shadow-md transition-all"
            >
              <ProductImage
                src={product.image}
                alt={product.name}
                brand={product.brand}
                size="md"
              />
              <div className="p-3 flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <SmartScore score={product.smartScore} size="sm" />
                  <span className="text-xs text-brand-500 font-medium">
                    {category?.name ?? product.categorySlug}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500">{product.brand}</p>
                <p className="text-xs text-gray-400 mt-auto">
                  {product.reviewCount.toLocaleString()} reviews &middot; $
                  {product.priceRange.min}&ndash;${product.priceRange.max}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Cross-category links */}
      <div className="flex flex-wrap gap-2 mt-5">
        {[...new Set(products.map((p) => p.categorySlug))].map((slug) => {
          const cat = getCategoryBySlug(slug);
          if (!cat) return null;
          return (
            <Link
              key={slug}
              href={`/category/${slug}`}
              className="text-xs text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-full font-medium transition-colors"
            >
              Browse all {cat.name} &rarr;
            </Link>
          );
        })}
      </div>
    </section>
  );
}
