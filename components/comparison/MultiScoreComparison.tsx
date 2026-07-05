import type { Product } from "@/types";
import { cn, getScoreBgColor, getScoreLabel, getScoreColor } from "@/lib/utils";
import Link from "next/link";

interface MultiScoreComparisonProps {
  products: Product[];
}

export function MultiScoreComparison({ products }: MultiScoreComparisonProps) {
  const maxScore = Math.max(...products.map((p) => p.smartScore));

  const colClass =
    products.length === 2 ? "grid-cols-2" :
    products.length === 3 ? "grid-cols-3" :
    "grid-cols-4";

  const minWidth = products.length > 2 ? `${products.length * 140}px` : undefined;

  return (
    <section aria-labelledby="multi-smartscore-comparison" data-speakable="score-comparison" className="bg-gradient-to-br from-brand-50/40 to-white border border-brand-100 rounded-2xl p-4 lg:p-8">
      <div className="flex items-center justify-center gap-2.5 mb-6">
        <div aria-hidden="true" className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
          </svg>
        </div>
        <h2 id="multi-smartscore-comparison" className="text-lg font-semibold text-gray-900">SmartScore Comparison</h2>
      </div>

      {/* Horizontal scroll on mobile for 3+ products */}
      <div className="overflow-x-auto -mx-4 px-4 lg:overflow-visible lg:mx-0 lg:px-0">
        {/* Score cards */}
        <div className={cn("grid gap-4 lg:gap-6", colClass)} style={{ minWidth }}>
          {products.map((product) => {
            const isWinner = product.smartScore === maxScore;
            return (
              <div key={product.id} className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div
                    role="meter"
                    aria-valuenow={product.smartScore}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuetext={`${product.smartScore}/100 — ${getScoreLabel(product.smartScore)}`}
                    aria-label={`SmartScore for ${product.name}`}
                    className={cn(
                      "w-20 h-20 rounded-2xl font-bold text-white flex items-center justify-center text-2xl",
                      getScoreBgColor(product.smartScore)
                    )}
                  >
                    <span aria-hidden="true">{product.smartScore}</span>
                  </div>
                  {isWinner && products.length > 1 && (
                    <div role="img" aria-label="Winner" className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
                      <svg aria-hidden="true" className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.161c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.37-2.447a1 1 0 00-1.175 0l-3.37 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.064 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.285-3.958z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <Link
                    href={`/category/${product.categorySlug}/${product.slug}`}
                    className="text-sm font-semibold text-gray-900 hover:text-brand-600 transition-colors line-clamp-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
                  >
                    {product.name}
                  </Link>
                  <p className={cn("text-xs font-medium", getScoreColor(product.smartScore))}>
                    {getScoreLabel(product.smartScore)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {product.reviewCount} reviews
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Price comparison row */}
        <div className="mt-6 pt-6 border-t border-brand-100/60">
          <div className={cn("grid gap-4 lg:gap-6 text-center", colClass)} style={{ minWidth }}>
            {products.map((product) => {
              const lowestPrice = Math.min(...products.map((p) => p.priceRange.min));
              const isLowest = product.priceRange.min === lowestPrice;
              return (
                <div key={product.id}>
                  <p className="text-xs text-gray-600 mb-1">Price Range</p>
                  <p className={cn("text-sm font-semibold", isLowest ? "text-emerald-600" : "text-gray-900")}>
                    ${product.priceRange.min}–${product.priceRange.max}
                    {isLowest && products.length > 1 && (
                      <span className="ml-1 text-xs text-emerald-600 font-normal">Best</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
