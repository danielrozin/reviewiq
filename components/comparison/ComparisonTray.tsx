"use client";

import Link from "next/link";
import { useCompare } from "@/lib/context/CompareContext";
import { cn, getScoreBgColor } from "@/lib/utils";

export function ComparisonTray() {
  const { items, remove, clear } = useCompare();

  if (items.length === 0) return null;

  const compareUrl = `/compare?ids=${items.map((p) => p.id).join(",")}`;

  return (
    <div
      role="region"
      aria-label="Product comparison tray"
      aria-live="polite"
      className="fixed bottom-0 inset-x-0 z-50 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="max-w-4xl mx-auto px-4 pb-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div aria-hidden="true" className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center">
                <svg aria-hidden="true" className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                Compare ({items.length}/4)
              </span>
            </div>
            <button
              type="button"
              onClick={clear}
              aria-label="Clear all products from comparison tray"
              className="text-xs text-gray-600 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1 rounded"
            >
              Clear all
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Product chips */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {items.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 shrink-0"
                >
                  <div
                    aria-hidden="true"
                    className={cn(
                      "w-6 h-6 rounded-md text-white flex items-center justify-center text-xs font-bold shrink-0",
                      getScoreBgColor(product.smartScore)
                    )}
                  >
                    {product.smartScore}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {product.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    aria-label={`Remove ${product.name} from comparison`}
                    className="text-gray-300 hover:text-red-600 transition-colors shrink-0"
                  >
                    <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: Math.max(0, 2 - items.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  aria-hidden="true"
                  className="w-[140px] h-[42px] border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center shrink-0"
                >
                  <span className="text-xs text-gray-300">+ Add product</span>
                </div>
              ))}
            </div>

            {/* Compare Now CTA */}
            <Link
              href={compareUrl}
              aria-disabled={items.length < 2}
              aria-label={items.length >= 2 ? `Compare ${items.map(p => p.name).join(" and ")}` : "Add at least 2 products to compare"}
              tabIndex={items.length < 2 ? -1 : undefined}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                items.length >= 2
                  ? "bg-brand-600 text-white hover:bg-brand-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
                  : "bg-gray-100 text-gray-400 pointer-events-none"
              )}
            >
              Compare Now
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {items.length < 2 && (
            <p className="text-xs text-gray-500 mt-2">
              Add at least 2 products to compare
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
