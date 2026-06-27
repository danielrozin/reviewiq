import Link from "next/link";
import type { ComparisonRef } from "@/types";
import { getComparisonSlugForProducts } from "@/data/comparisons";

interface ComparisonModuleProps {
  currentProduct: string;
  currentProductSlug: string;
  comparisons: ComparisonRef[];
  categorySlug: string;
}

export function ComparisonModule({
  currentProduct,
  currentProductSlug,
  comparisons,
  categorySlug,
}: ComparisonModuleProps) {
  if (comparisons.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Compare With</h2>
      </div>
      <div className="space-y-3">
        {comparisons.map((comp) => {
          const compSlug = getComparisonSlugForProducts(
            currentProductSlug,
            comp.productSlug
          );
          return (
            <Link
              key={comp.productId}
              href={`/compare/${compSlug}`}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-brand-200 hover:bg-brand-50/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 border border-brand-100 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-brand-600 text-xs font-bold tracking-tight">VS</span>
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
              <span className="inline-flex items-center gap-1 text-brand-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                Compare
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
