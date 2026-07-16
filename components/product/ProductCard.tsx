"use client";

import Link from "next/link";
import type { Product } from "@/types";
import { SmartScore } from "@/components/ui/SmartScore";
import { RatingStars } from "@/components/ui/RatingStars";
import { ProductImage } from "@/components/ui/ProductImage";
import { formatNumber } from "@/lib/utils";
import { useCompare } from "@/lib/context/CompareContext";
import { useExperiment } from "@/lib/experiments";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
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
    <article aria-labelledby={`product-${product.id}`} className="group relative bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:border-brand-200 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Product color accent strip at top */}
      <div aria-hidden="true" className="h-1 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <Link
        href={`/category/${product.categorySlug}/${product.slug}`}
        aria-label={`View ${product.brand} ${product.name} — SmartScore ${product.smartScore}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
      >
        {/* Product image thumbnail */}
        <ProductImage
          src={product.image}
          alt={product.name}
          brand={product.brand}
          size="md"
          priority={priority}
          className="rounded-t-2xl"
        />

        <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
              {product.brand}
            </p>
            <h3 id={`product-${product.id}`} className="text-base font-semibold text-gray-900 group-hover:text-brand-600 transition-colors leading-snug line-clamp-2">
              {product.name}
            </h3>
          </div>
          <SmartScore score={product.smartScore} size="sm" showLabel={false} />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <RatingStars rating={avgRating} size="sm" showValue />
          <span className="text-xs text-gray-600">
            {formatNumber(product.reviewCount)} reviews
          </span>
          {badgeVariant === "treatment" && product.reviewCount >= 50 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-full border border-amber-200">
              <svg aria-hidden="true" className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
              </svg>
              Popular
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
          <div className="flex items-center gap-1.5">
            <svg aria-hidden="true" className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            <span className="text-sm font-medium text-emerald-700">
              {product.verifiedPurchaseRate}%
            </span>
            <span className="text-xs text-gray-600">verified buyers</span>
          </div>
          <div className="text-sm font-medium text-gray-600">
            ${product.priceRange.min}–${product.priceRange.max}
          </div>
        </div>

        <ul role="list" className="space-y-2 list-none p-0 m-0" aria-label="Top review highlights">
          <li className="flex items-start gap-2">
            <span aria-hidden="true" className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg aria-hidden="true" className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
            <p title={product.aiSummary.whatPeopleLove[0]} className="text-sm text-gray-600 line-clamp-1 leading-relaxed">
              <span className="sr-only">Pro: </span>
              {product.aiSummary.whatPeopleLove[0]}
            </p>
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden="true" className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg aria-hidden="true" className="w-2.5 h-2.5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
              </svg>
            </span>
            <p title={product.aiSummary.whatPeopleHate[0]} className="text-sm text-gray-600 line-clamp-1 leading-relaxed">
              <span className="sr-only">Con: </span>
              {product.aiSummary.whatPeopleHate[0]}
            </p>
          </li>
        </ul>
        </div>{/* end p-5 */}
      </Link>

      {/* Compare button — always visible on mobile, hover-reveal on desktop */}
      <div className="px-5 pb-4">
        <button
          type="button"
          onClick={handleCompare}
          disabled={!isSelected && isFull}
          className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-medium rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${
            isSelected
              ? "bg-brand-600 text-white shadow-sm"
              : isFull
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-50 text-gray-600 border border-gray-400 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          }`}
          aria-label={isSelected ? `Remove ${product.name} from comparison` : isFull ? "Comparison list full — max 4 products" : `Add ${product.name} to compare`}
          aria-pressed={isSelected}
          title={isSelected ? "Remove from comparison" : isFull ? "Max 4 products" : "Add to compare"}
        >
          {isSelected ? (
            <>
              <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Added to compare
            </>
          ) : (
            <>
              <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
              </svg>
              Compare
            </>
          )}
        </button>
      </div>
    </article>
  );
}
