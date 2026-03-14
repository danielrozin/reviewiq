import Link from "next/link";
import type { ComparisonRef } from "@/types";

interface ComparisonModuleProps {
  currentProduct: string;
  comparisons: ComparisonRef[];
  categorySlug: string;
}

export function ComparisonModule({
  currentProduct,
  comparisons,
  categorySlug,
}: ComparisonModuleProps) {
  if (comparisons.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Compare With
      </h2>
      <div className="space-y-3">
        {comparisons.map((comp) => (
          <Link
            key={comp.productId}
            href={`/category/${categorySlug}/${comp.productSlug}`}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-brand-200 hover:bg-brand-50/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs font-bold">
                VS
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors">
                  {currentProduct} vs {comp.productName}
                </p>
                {comp.searchVolume && (
                  <p className="text-xs text-gray-400">
                    {comp.searchVolume.toLocaleString()} monthly searches
                  </p>
                )}
              </div>
            </div>
            <span className="text-brand-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Compare &rarr;
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
