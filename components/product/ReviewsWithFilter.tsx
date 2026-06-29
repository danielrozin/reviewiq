"use client";

import { useState, useMemo } from "react";
import type { Review } from "@/types";
import { ReviewCard } from "./ReviewCard";

type SortKey = "recent" | "helpful" | "highest" | "lowest";

const INITIAL_VISIBLE = 3;

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Most Recent" },
  { key: "helpful", label: "Most Helpful" },
  { key: "highest", label: "Highest Rating" },
  { key: "lowest", label: "Lowest Rating" },
];

interface ReviewsWithFilterProps {
  reviews: Review[];
  totalCount: number;
}

export function ReviewsWithFilter({ reviews, totalCount }: ReviewsWithFilterProps) {
  const [sort, setSort] = useState<SortKey>("recent");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [visible, setVisible] = useState(INITIAL_VISIBLE);

  const filtered = useMemo(() => {
    let result = filterRating ? reviews.filter((r) => r.rating === filterRating) : reviews;
    switch (sort) {
      case "helpful":
        result = [...result].sort((a, b) => b.helpfulCount - a.helpfulCount);
        break;
      case "highest":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        result = [...result].sort((a, b) => a.rating - b.rating);
        break;
      case "recent":
      default:
        break;
    }
    return result;
  }, [reviews, sort, filterRating]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <section id="section-reviews" aria-labelledby="verified-reviews-heading">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div aria-hidden="true" className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
            <svg aria-hidden="true" className="w-3.5 h-3.5 text-amber-600 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.161c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.37-2.447a1 1 0 00-1.175 0l-3.37 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.064 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.285-3.958z" />
            </svg>
          </div>
          <h2 id="verified-reviews-heading" className="text-lg font-semibold text-gray-900 shrink-0">
            Verified Reviews
          </h2>
          <span className="ml-auto text-xs text-gray-500 font-medium tabular-nums shrink-0">
            {totalCount.toLocaleString()} total
          </span>
        </div>

        {/* Star filter pills */}
        <div className="flex items-center gap-1">
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => {
                setFilterRating(filterRating === star ? null : star);
                setVisible(INITIAL_VISIBLE);
              }}
              className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterRating === star
                  ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
              aria-pressed={filterRating === star}
              aria-label={`Filter by ${star} stars`}
            >
              <svg aria-hidden="true" className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.161c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.37-2.447a1 1 0 00-1.175 0l-3.37 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.064 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.285-3.958z" />
              </svg>
              {star}
            </button>
          ))}
          {filterRating && (
            <button
              type="button"
              onClick={() => { setFilterRating(null); setVisible(INITIAL_VISIBLE); }}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort select */}
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value as SortKey); setVisible(INITIAL_VISIBLE); }}
          className="text-sm text-gray-600 bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent cursor-pointer"
          aria-label="Sort reviews"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Review list */}
      {shown.length === 0 ? (
        <div className="text-center py-10 px-6 bg-white border border-gray-100 rounded-2xl">
          <div aria-hidden="true" className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg aria-hidden="true" className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.161c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.37-2.447a1 1 0 00-1.175 0l-3.37 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.064 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.285-3.958z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">No reviews match this filter</p>
          <p className="text-xs text-gray-500 mb-3">Try a different star rating</p>
          <button
            type="button"
            onClick={() => setFilterRating(null)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 bg-brand-50 px-3 py-1.5 rounded-xl hover:bg-brand-100 transition-colors"
          >
            <svg aria-hidden="true" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            Clear filter
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-100" />
          <button
            type="button"
            onClick={() => setVisible((v) => v + 5)}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-100 rounded-full hover:bg-brand-100 transition-colors shrink-0"
          >
            <svg aria-hidden="true" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
            Show {Math.min(5, filtered.length - visible)} more reviews
          </button>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
      )}
    </section>
  );
}
