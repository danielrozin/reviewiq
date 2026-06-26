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
    <section className="bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200 rounded-2xl p-4 lg:p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
        SmartScore Comparison
      </h2>

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
                    className={cn(
                      "w-20 h-20 rounded-2xl font-bold text-white flex items-center justify-center text-2xl",
                      getScoreBgColor(product.smartScore)
                    )}
                  >
                    {product.smartScore}
                  </div>
                  {isWinner && products.length > 1 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
                      &#9733;
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <Link
                    href={`/category/${product.categorySlug}/${product.slug}`}
                    className="text-sm font-semibold text-gray-900 hover:text-brand-600 transition-colors line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  <p className={cn("text-xs font-medium", getScoreColor(product.smartScore))}>
                    {getScoreLabel(product.smartScore)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {product.reviewCount} reviews
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Price comparison row */}
        <div className="mt-6 pt-6 border-t border-slate-200/60">
          <div className={cn("grid gap-4 lg:gap-6 text-center", colClass)} style={{ minWidth }}>
            {products.map((product) => {
              const lowestPrice = Math.min(...products.map((p) => p.priceRange.min));
              const isLowest = product.priceRange.min === lowestPrice;
              return (
                <div key={product.id}>
                  <p className="text-xs text-gray-400 mb-1">Price Range</p>
                  <p className={cn("text-sm font-semibold", isLowest ? "text-emerald-600" : "text-gray-900")}>
                    ${product.priceRange.min}–${product.priceRange.max}
                    {isLowest && products.length > 1 && (
                      <span className="ml-1 text-xs text-emerald-500 font-normal">Best</span>
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
