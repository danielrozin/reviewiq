import type { Product } from "@/types";
import { generateVerdict } from "@/data/comparisons";

interface VerdictCardProps {
  productA: Product;
  productB: Product;
}

export function VerdictCard({ productA, productB }: VerdictCardProps) {
  const verdict = generateVerdict(productA, productB);
  const winner =
    productA.smartScore > productB.smartScore
      ? productA
      : productB.smartScore > productA.smartScore
        ? productB
        : null;

  return (
    <section className="bg-gradient-to-br from-brand-50 to-indigo-50/30 border border-brand-200 rounded-2xl p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">AI</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            AI Verdict
          </h2>
          <p className="text-xs text-gray-500">
            Based on verified buyer reviews
          </p>
        </div>
      </div>
      <p
        data-speakable="ai-verdict"
        className="text-gray-700 text-sm leading-relaxed mb-4"
      >
        {verdict}
      </p>
      {winner && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-yellow-500">&#9733;</span>
          <span className="font-medium text-gray-900">
            Winner: {winner.name}
          </span>
          <span className="text-gray-400">
            (SmartScore {winner.smartScore}/100)
          </span>
        </div>
      )}
    </section>
  );
}
