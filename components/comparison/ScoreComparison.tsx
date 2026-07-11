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
        <div className="flex flex-col items-center gap-1" aria-hidden="true">
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
    <div
      role="group"
      aria-label={product.name}
      className="flex flex-col items-center gap-3 flex-1 max-w-[200px]"
    >
      <div className="relative">
        <div
          aria-label={`SmartScore: ${product.smartScore}`}
          className={cn(
            "w-20 h-20 rounded-2xl font-bold text-white flex items-center justify-center text-2xl",
            getScoreBgColor(product.smartScore)
          )}
        >
          {product.smartScore}
        </div>
        {isWinner && (
          <div
            className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs"
            aria-label="Winner"
          >
            <span aria-hidden="true">&#9733;</span>
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
