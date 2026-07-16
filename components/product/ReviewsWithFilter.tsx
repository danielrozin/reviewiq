"use client";

import { useState, useMemo, useRef } from "react";
import type React from "react";
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

  const ratingGroupRef = useRef<HTMLDivElement>(null);
  const RATING_VALUES: (number | null)[] = [null, 5, 4, 3, 2, 1];

  function handleRatingKeyDown(e: React.KeyboardEvent) {
    const idx = RATING_VALUES.indexOf(filterRating);
    const effective = idx === -1 ? 0 : idx;
    const focus = (i: number) => {
      const val = RATING_VALUES[i];
      setFilterRating(val);
      setVisible(INITIAL_VISIBLE);
      const key = val === null ? "all" : String(val);
      (ratingGroupRef.current?.querySelector(`[data-ratingkey="${key}"]`) as HTMLButtonElement)?.focus();
    };
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); focus((effective + 1) % RATING_VALUES.length); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); focus((effective - 1 + RATING_VALUES.length) % RATING_VALUES.length); }
    else if (e.key === "Home") { e.preventDefault(); focus(0); }
    else if (e.key === "End") { e.preventDefault(); focus(RATING_VALUES.length - 1); }
  }

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
          <span aria-live="polite" aria-atomic="true" className="ml-auto text-xs text-gray-600 font-medium tabular-nums shrink-0">
            {filterRating ? `${filtered.length} of ${totalCount.toLocaleString()} reviews` : `${totalCount.toLocaleString()} total`}
          </span>
        </div>

        {/* Star filter pills — single-select, radiogroup pattern */}
        <div ref={ratingGroupRef} role="radiogroup" aria-label="Filter by star rating" className="flex items-center gap-1" onKeyDown={handleRatingKeyDown}>
          <button
            type="button"
            role="radio"
            data-ratingkey="all"
            aria-checked={filterRating === null}
            tabIndex={filterRating === null ? 0 : -1}
            onClick={() => { setFilterRating(null); setVisible(INITIAL_VISIBLE); }}
            className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-colors touch-manipulation min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${
              filterRating === null
                ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              data-ratingkey={String(star)}
              aria-checked={filterRating === star}
              tabIndex={filterRating === star ? 0 : -1}
              onClick={() => { setFilterRating(star); setVisible(INITIAL_VISIBLE); }}
              className={`flex items-center gap-0.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors touch-manipulation min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${
                filterRating === star
                  ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              aria-label={`Filter by ${star} stars`}
            >
              <svg aria-hidden="true" className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.161c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.37-2.447a1 1 0 00-1.175 0l-3.37 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.064 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.285-3.958z" />
              </svg>
              {star}
            </button>
          ))}
        </div>

        {/* Sort select */}
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value as SortKey); setVisible(INITIAL_VISIBLE); }}
          className="text-sm text-gray-600 bg-white border border-gray-400 rounded-xl px-3 py-3 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:border-transparent cursor-pointer"
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
          <p className="text-xs text-gray-600 mb-3">Try a different star rating</p>
          <button
            type="button"
            onClick={() => setFilterRating(null)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 bg-brand-50 px-3 py-1.5 rounded-xl hover:bg-brand-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
          >
            <svg aria-hidden="true" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            Clear filter
          </button>
        </div>
      ) : (
        <ul role="list" className="space-y-4" data-speakable="review-list" aria-label="Customer reviews">
          {shown.map((review) => (
            <li key={review.id}>
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="mt-6 flex items-center gap-4">
          <div aria-hidden="true" className="flex-1 h-px bg-gray-100" />
          <button
            type="button"
            onClick={() => setVisible((v) => v + 5)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-100 rounded-full hover:bg-brand-100 transition-colors shrink-0 touch-manipulation min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
          >
            <svg aria-hidden="true" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
            Show {Math.min(5, filtered.length - visible)} more reviews
          </button>
          <div aria-hidden="true" className="flex-1 h-px bg-gray-100" />
        </div>
      )}
    </section>
  );
}
