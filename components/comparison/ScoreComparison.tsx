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
    <section aria-labelledby="smartscore-comparison" className="bg-gradient-to-br from-brand-50/40 to-white border border-brand-100 rounded-2xl p-6 lg:p-8">
      <div className="flex items-center justify-center gap-2.5 mb-6">
        <div className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
          </svg>
        </div>
        <h2 id="smartscore-comparison" className="text-lg font-semibold text-gray-900">SmartScore Comparison</h2>
      </div>
      <div className="flex items-center justify-center gap-6 md:gap-12">
        <ScoreBlock
          product={productA}
          isWinner={winner === "A"}
        />
        <div className="flex flex-col items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-gray-400 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full tracking-wider">VS</span>
          {diff !== 0 && (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              {Math.abs(diff)} pt{Math.abs(diff) !== 1 ? "s" : ""}
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
            <svg aria-hidden="true" className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.161c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.37-2.447a1 1 0 00-1.175 0l-3.37 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.064 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.285-3.958z" />
            </svg>
            <span className="sr-only">Winner</span>
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
