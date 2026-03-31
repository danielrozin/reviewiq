import Link from "next/link";
import { SmartScore } from "@/components/ui/SmartScore";

interface RelatedProduct {
  name: string;
  slug: string;
  brand: string;
  smartScore: number;
  reviewCount: number;
  priceMin: number;
  priceMax: number;
  categorySlug: string;
}

interface RelatedProductsProps {
  products: RelatedProduct[];
  categorySlug: string;
  categoryName: string;
}

export function RelatedProducts({
  products,
  categorySlug,
  categoryName,
}: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Related Products in {categoryName}
      </h2>
      <div className="space-y-3">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/category/${categorySlug}/${product.slug}`}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-brand-200 hover:bg-brand-50/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <SmartScore score={product.smartScore} size="sm" />
              <div>
                <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors">
                  {product.name}
                </p>
                <p className="text-xs text-gray-400">
                  {product.brand} &middot; {product.reviewCount.toLocaleString()} reviews &middot; ${product.priceMin}&ndash;${product.priceMax}
                </p>
              </div>
            </div>
            <svg
              className="w-4 h-4 text-gray-300 group-hover:text-brand-600 transition-colors flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ))}
      </div>
      <Link
        href={`/category/${categorySlug}`}
        className="inline-block mt-4 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
      >
        View all {categoryName} &rarr;
      </Link>
    </section>
  );
}
