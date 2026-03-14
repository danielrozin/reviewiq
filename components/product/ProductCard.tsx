import Link from "next/link";
import type { Product } from "@/types";
import { SmartScore } from "@/components/ui/SmartScore";
import { RatingStars } from "@/components/ui/RatingStars";
import { formatNumber } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  return (
    <Link
      href={`/category/${product.categorySlug}/${product.slug}`}
      className="group block bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-1">
            {product.brand}
          </p>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors leading-tight">
            {product.name}
          </h3>
        </div>
        <SmartScore score={product.smartScore} size="sm" showLabel={false} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <RatingStars rating={avgRating} size="sm" />
        <span className="text-sm text-gray-500">
          {formatNumber(product.reviewCount)} reviews
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-emerald-600 font-medium">
            {product.verifiedPurchaseRate}%
          </span>
          <span className="text-gray-400">verified buyers</span>
        </div>
        <div className="text-sm text-gray-500">
          ${product.priceRange.min} — ${product.priceRange.max}
        </div>
      </div>

      <div className="border-t border-gray-50 pt-4 space-y-2">
        <div className="flex items-start gap-2">
          <span className="text-emerald-500 text-xs mt-0.5">+</span>
          <p className="text-sm text-gray-600 line-clamp-1">
            {product.aiSummary.whatPeopleLove[0]}
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-red-400 text-xs mt-0.5">-</span>
          <p className="text-sm text-gray-600 line-clamp-1">
            {product.aiSummary.whatPeopleHate[0]}
          </p>
        </div>
      </div>
    </Link>
  );
}
