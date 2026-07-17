import Link from "next/link";
import type { Product } from "@/types";
import { getScoreColor, getScoreLabel } from "@/lib/utils";

interface RecommendedProductsProps {
  products: Product[];
}

export function RecommendedProducts({ products }: RecommendedProductsProps) {
  if (products.length === 0) return null;

  return (
    <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 m-0">
      {products.map((product) => (
        <li key={product.id}>
        <Link
          href={`/category/${product.categorySlug}/${product.slug}`}
          aria-label={`${product.brand} ${product.name} — SmartScore ${product.smartScore}`}
          className="block bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-brand-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
        >
          <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="flex items-center gap-3 p-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-base ${
            product.smartScore >= 85 ? "bg-emerald-50 text-emerald-700" :
            product.smartScore >= 70 ? "bg-brand-50 text-brand-700" :
            product.smartScore >= 55 ? "bg-amber-50 text-amber-700" :
            "bg-gray-50 text-gray-600"
          }`}>
            {product.smartScore}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
              {product.name}
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              {product.brand} · {product.reviewCount} reviews
            </p>
          </div>

          <div className="shrink-0">
            <p className="text-xs text-gray-600 text-right">
              {getScoreLabel(product.smartScore)}
            </p>
            <svg aria-hidden="true" className="w-4 h-4 text-gray-400 group-hover:text-brand-400 transition-colors ml-auto mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
          </div>
        </Link>
        </li>
      ))}
    </ul>
  );
}
