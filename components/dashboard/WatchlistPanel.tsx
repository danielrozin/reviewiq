import Link from "next/link";
import type { WatchlistItem } from "@/types";
import { getScoreColor } from "@/lib/utils";

interface WatchlistPanelProps {
  items: WatchlistItem[];
}

export function WatchlistPanel({ items }: WatchlistPanelProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl">
        <p className="text-gray-400 text-sm">Your watchlist is empty</p>
        <p className="text-xs text-gray-400 mt-1">
          Follow products to track SmartScore changes
        </p>
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
            className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-brand-200 hover:shadow-sm transition-all group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-brand-50 to-brand-100 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-brand-400 text-xs font-bold">
                {item.productName.slice(0, 2).toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
                {item.productName}
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
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
                <p className="text-[10px] text-gray-400">No change</p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
