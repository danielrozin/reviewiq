"use client";

import Link from "next/link";
import type { Product } from "@/types";
import { SmartScore } from "@/components/ui/SmartScore";
import { RatingStars } from "@/components/ui/RatingStars";
import { formatNumber } from "@/lib/utils";
import { useCompare } from "@/lib/context/CompareContext";
import { useExperiment } from "@/lib/experiments";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { add, remove, has, isFull } = useCompare();
  const isSelected = has(product.id);
  const { variant: badgeVariant } = useExperiment("social-proof-badges");

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  function handleCompare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isSelected) {
      remove(product.id);
    } else {
      add(product);
    }
  }

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-200">
      <Link
        href={`/category/${product.categorySlug}/${product.slug}`}
        className="block"
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
          {badgeVariant === "treatment" && product.reviewCount >= 50 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-full border border-amber-200">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
              </svg>
              Popular
            </span>
          )}
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

      {/* Compare button */}
      <button
        type="button"
        onClick={handleCompare}
        disabled={!isSelected && isFull}
        className={`absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
          isSelected
            ? "bg-brand-600 text-white shadow-sm"
            : isFull
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-white/90 text-gray-500 border border-gray-200 opacity-0 group-hover:opacity-100 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 shadow-sm backdrop-blur-sm"
        }`}
        title={isSelected ? "Remove from comparison" : isFull ? "Max 4 products" : "Add to compare"}
      >
        {isSelected ? (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Compare
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Compare
          </>
        )}
      </button>
    </div>
  );
}
