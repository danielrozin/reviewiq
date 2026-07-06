import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MultiProsConsComparisonProps {
  products: Product[];
}

export function MultiProsConsComparison({ products }: MultiProsConsComparisonProps) {
  return (
    <section aria-labelledby="multi-pros-cons-heading" data-speakable="pros-cons">
      <div className="flex items-center gap-2.5 mb-4">
        <div aria-hidden="true" className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
        </div>
        <h2 id="multi-pros-cons-heading" className="text-lg font-semibold text-gray-900">What People Love & Hate</h2>
      </div>

      <div className={cn(
        "grid gap-4",
        products.length === 2 ? "grid-cols-1 md:grid-cols-2" :
        products.length === 3 ? "grid-cols-1 md:grid-cols-3" :
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      )}>
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            {/* Product header */}
            <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
              <div
                role="img"
                aria-label={`SmartScore: ${product.smartScore}`}
                className={`w-8 h-8 rounded-xl font-bold text-white text-sm flex items-center justify-center shrink-0 ${
                  product.smartScore >= 85 ? "bg-emerald-500" :
                  product.smartScore >= 70 ? "bg-brand-500" :
                  product.smartScore >= 55 ? "bg-amber-500" : "bg-gray-400"
                }`}
              >
                <span aria-hidden="true">{product.smartScore}</span>
              </div>
              <Link
                href={`/category/${product.categorySlug}/${product.slug}`}
                className="text-sm font-semibold text-gray-900 hover:text-brand-600 transition-colors truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
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
                    <span aria-hidden="true" className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg aria-hidden="true" className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                    <span title={item} className="line-clamp-2">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="p-4 pt-0">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">
                What People Hate
              </p>
              <ul className="space-y-2">
                {product.aiSummary.whatPeopleHate.slice(0, 3).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span aria-hidden="true" className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                      <svg aria-hidden="true" className="w-2.5 h-2.5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                      </svg>
                    </span>
                    <span title={item} className="line-clamp-2">{item}</span>
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
                    className="inline-block px-2 py-0.5 text-xs bg-brand-50 text-brand-700 rounded-full"
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
