"use client";

import Link from "next/link";
import type { SavedComparison } from "@/types";
import { getScoreColor, getScoreLabel } from "@/lib/utils";
import { useSubscription } from "@/lib/context/SubscriptionContext";
import { UpgradePrompt } from "@/components/premium/UpgradePrompt";

const FREE_LIMIT = 3;

interface SavedComparisonsProps {
  items: SavedComparison[];
}

export function SavedComparisons({ items }: SavedComparisonsProps) {
  const { isPro } = useSubscription();

  if (items.length === 0) {
    return (
      <div className="text-center py-10 px-6 bg-white border border-gray-100 rounded-2xl">
        <div aria-hidden="true" className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg aria-hidden="true" className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-900 mb-1">No saved products yet</p>
        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
          Bookmark products you&apos;re considering to compare SmartScores side by side.
        </p>
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-purple-700 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
        >
          Browse products
          <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>
    );
  }

  const atLimit = !isPro && items.length >= FREE_LIMIT;

  return (
    <ul role="list" className="space-y-3 list-none p-0 m-0">
      {items.map((item) => (
        <li key={item.id}>
        <Link
          href={`/category/${item.categorySlug}/${item.productSlug}`}
          aria-label={`${item.productName} — SmartScore ${item.productScore}, ${getScoreLabel(item.productScore)}${item.note ? `, note: ${item.note}` : ""}`}
          className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-brand-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
        >
          <div aria-hidden="true" className="w-14 h-14 bg-gray-100 rounded-xl shrink-0 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
              <span className="text-brand-400 text-xs font-bold">
                {item.productName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 aria-hidden="true" className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
              {item.productName}
            </h3>
            {item.note && (
              <p aria-hidden="true" className="text-xs text-gray-600 mt-0.5 truncate">{item.note}</p>
            )}
            <p className="text-xs text-gray-600 mt-1">
              Saved {item.savedAt}
            </p>
          </div>

          <div aria-hidden="true" className="text-right shrink-0">
            <p className={`text-lg font-bold ${getScoreColor(item.productScore)}`}>
              {item.productScore}
            </p>
            <p className="text-xs text-gray-600">
              {getScoreLabel(item.productScore)}
            </p>
          </div>
        </Link>
        </li>
      ))}

      {atLimit && (
        <div className="mt-4">
          <UpgradePrompt gate="saved_comparisons" />
        </div>
      )}
    </ul>
  );
}
