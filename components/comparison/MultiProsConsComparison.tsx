import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MultiProsConsComparisonProps {
  products: Product[];
}

export function MultiProsConsComparison({ products }: MultiProsConsComparisonProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        What People Love & Hate
      </h2>

      <div className={cn(
        "grid gap-4",
        products.length === 2 ? "grid-cols-1 md:grid-cols-2" :
        products.length === 3 ? "grid-cols-1 md:grid-cols-3" :
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      )}>
        {products.map((product) => (
          <div
            key={product.id}
            className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all"
          >
            {/* Product header */}
            <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg font-bold text-white text-sm flex items-center justify-center shrink-0 ${
                product.smartScore >= 85 ? "bg-emerald-500" :
                product.smartScore >= 70 ? "bg-brand-500" :
                product.smartScore >= 55 ? "bg-amber-500" : "bg-gray-400"
              }`}>
                {product.smartScore}
              </div>
              <Link
                href={`/category/${product.categorySlug}/${product.slug}`}
                className="text-sm font-semibold text-gray-900 hover:text-brand-600 transition-colors truncate"
              >
                {product.name}
              </Link>
            </div>

            {/* Pros */}
            <div className="p-4">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                What People Love
              </p>
              <ul className="space-y-2">
                {product.aiSummary.whatPeopleLove.slice(0, 3).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                    <span className="line-clamp-2">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="p-4 pt-0">
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">
                What People Hate
              </p>
              <ul className="space-y-2">
                {product.aiSummary.whatPeopleHate.slice(0, 3).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                      </svg>
                    </span>
                    <span className="line-clamp-2">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Best For */}
            <div className="px-4 pb-4">
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">
                Best For
              </p>
              <div className="flex flex-wrap gap-1">
                {product.aiSummary.bestFor.slice(0, 3).map((item, i) => (
                  <span
                    key={i}
                    className="inline-block px-2 py-0.5 text-xs bg-brand-50 text-brand-700 rounded-md"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
