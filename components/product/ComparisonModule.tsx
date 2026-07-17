import Link from "next/link";
import type { ComparisonRef } from "@/types";
import { getComparisonSlugForProducts } from "@/data/comparisons";

interface ComparisonModuleProps {
  currentProduct: string;
  currentProductSlug: string;
  comparisons: ComparisonRef[];
  categorySlug: string;
}

function formatSearchVolume(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return n.toLocaleString();
}

export function ComparisonModule({
  currentProduct,
  currentProductSlug,
  comparisons,
  categorySlug,
}: ComparisonModuleProps) {
  if (comparisons.length === 0) return null;

  return (
    <section aria-labelledby="compare-with-heading" data-speakable="compare-with">
      <div className="flex items-center gap-2.5 mb-4">
        <div aria-hidden="true" className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
          </svg>
        </div>
        <h2 id="compare-with-heading" className="text-lg font-semibold text-gray-900">Compare With</h2>
      </div>
      <ul role="list" className="space-y-2.5 list-none p-0 m-0">
        {comparisons.map((comp) => {
          const compSlug = getComparisonSlugForProducts(
            currentProductSlug,
            comp.productSlug
          );
          return (
            <li key={comp.productId}>
            <Link
              href={`/compare/${compSlug}`}
              aria-label={`Compare ${currentProduct} vs ${comp.productName}`}
              className="block bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-brand-200 hover:bg-brand-50/30 motion-safe:hover:-translate-y-0.5 motion-safe:transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
            >
              <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div aria-hidden="true" className="w-9 h-9 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                  <span className="text-brand-600 text-xs font-bold tracking-tight">VS</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors truncate">
                    {currentProduct} vs {comp.productName}
                  </p>
                  {comp.searchVolume && (
                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                      <svg aria-hidden="true" className="w-3 h-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                      {formatSearchVolume(comp.searchVolume)}/mo
                    </p>
                  )}
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-brand-600 text-xs font-medium shrink-0 ml-3">
                Compare
                <svg aria-hidden="true" className="w-3.5 h-3.5 group-hover:translate-x-0.5 motion-safe:transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </span>
              </div>
            </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
