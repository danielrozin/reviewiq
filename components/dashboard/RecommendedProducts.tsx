import Link from "next/link";
import type { Product } from "@/types";
import { getScoreColor, getScoreLabel } from "@/lib/utils";

interface RecommendedProductsProps {
  products: Product[];
}

export function RecommendedProducts({ products }: RecommendedProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/category/${product.categorySlug}/${product.slug}`}
          className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:border-brand-200 hover:shadow-sm transition-all group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-gray-400 text-xs font-bold">
              {product.name.slice(0, 2).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
              {product.name}
            </h3>
            <p className="text-[10px] text-gray-400">
              {product.brand} · {product.reviewCount} reviews
            </p>
          </div>

          <div className="shrink-0">
            <p className={`text-lg font-bold ${getScoreColor(product.smartScore)}`}>
              {product.smartScore}
            </p>
            <p className="text-[10px] text-gray-400 text-right">
              {getScoreLabel(product.smartScore)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
