import Link from "next/link";
import type { WatchlistItem } from "@/types";
import { getScoreColor } from "@/lib/utils";

interface WatchlistPanelProps {
  items: WatchlistItem[];
}

export function WatchlistPanel({ items }: WatchlistPanelProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-10 px-6 bg-white border border-gray-100 rounded-2xl">
        <div aria-hidden="true" className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg aria-hidden="true" className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-900 mb-1">Nothing on your watchlist yet</p>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Follow products to track SmartScore changes over time.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100 transition-colors"
        >
          Browse Products
          <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const scoreDiff = item.currentScore - item.lastKnownScore;
        return (
          <Link
            key={item.id}
            href={`/category/${item.categorySlug}/${item.productSlug}`}
            className="block bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-brand-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-brand-400 text-xs font-bold">
                {item.productName.slice(0, 2).toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
                {item.productName}
              </h3>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Watching since {item.addedAt}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className={`text-lg font-bold ${getScoreColor(item.currentScore)}`}>
                {item.currentScore}
              </p>
              {scoreDiff !== 0 && (
                <p
                  className={`text-xs font-medium ${
                    scoreDiff > 0 ? "text-trust-green" : "text-trust-red"
                  }`}
                >
                  {scoreDiff > 0 ? "+" : ""}
                  {scoreDiff} pts
                </p>
              )}
              {scoreDiff === 0 && (
                <p className="text-[10px] text-gray-500">No change</p>
              )}
            </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
