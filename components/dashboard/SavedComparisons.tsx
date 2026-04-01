import Link from "next/link";
import type { SavedComparison } from "@/types";
import { getScoreColor, getScoreLabel } from "@/lib/utils";

interface SavedComparisonsProps {
  items: SavedComparison[];
}

export function SavedComparisons({ items }: SavedComparisonsProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl">
        <p className="text-gray-400 text-sm">No saved comparisons yet</p>
        <Link
          href="/categories"
          className="text-sm text-brand-600 hover:text-brand-700 font-medium mt-2 inline-block"
        >
          Browse products →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/category/${item.categorySlug}/${item.productSlug}`}
          className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-brand-200 hover:shadow-sm transition-all group"
        >
          <div className="w-14 h-14 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
              <span className="text-brand-400 text-xs font-bold">
                {item.productName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
              {item.productName}
            </h3>
            {item.note && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">{item.note}</p>
            )}
            <p className="text-[10px] text-gray-400 mt-1">
              Saved {item.savedAt}
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className={`text-lg font-bold ${getScoreColor(item.productScore)}`}>
              {item.productScore}
            </p>
            <p className="text-[10px] text-gray-400">
              {getScoreLabel(item.productScore)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
