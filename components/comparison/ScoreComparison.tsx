import type { Product } from "@/types";
import { cn, getScoreBgColor, getScoreLabel, getScoreColor } from "@/lib/utils";

interface ScoreComparisonProps {
  productA: Product;
  productB: Product;
}

export function ScoreComparison({ productA, productB }: ScoreComparisonProps) {
  const diff = productA.smartScore - productB.smartScore;
  const winner =
    diff > 0 ? "A" : diff < 0 ? "B" : null;

  return (
    <section className="bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200 rounded-2xl p-6 lg:p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
        SmartScore Comparison
      </h2>
      <div className="flex items-center justify-center gap-6 md:gap-12">
        <ScoreBlock
          product={productA}
          isWinner={winner === "A"}
        />
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold text-gray-300">VS</span>
          {diff !== 0 && (
            <span className="text-xs text-gray-400">
              {Math.abs(diff)} pt{Math.abs(diff) !== 1 ? "s" : ""} diff
            </span>
          )}
        </div>
        <ScoreBlock
          product={productB}
          isWinner={winner === "B"}
        />
      </div>
    </section>
  );
}

function ScoreBlock({
  product,
  isWinner,
}: {
  product: Product;
  isWinner: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 flex-1 max-w-[200px]">
      <div className="relative">
        <div
          className={cn(
            "w-20 h-20 rounded-2xl font-bold text-white flex items-center justify-center text-2xl",
            getScoreBgColor(product.smartScore)
          )}
        >
          {product.smartScore}
        </div>
        {isWinner && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.161c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.37-2.447a1 1 0 00-1.175 0l-3.37 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.064 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.285-3.958z" />
            </svg>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-900 line-clamp-2">
          {product.name}
        </p>
        <p className={cn("text-xs font-medium", getScoreColor(product.smartScore))}>
          {getScoreLabel(product.smartScore)}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {product.reviewCount} reviews
        </p>
      </div>
    </div>
  );
}
