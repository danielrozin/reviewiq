"use client";

import { useState, useMemo } from "react";
import type { Review, RatingDistribution as RatingDistType } from "@/types";
import { RatingStars } from "@/components/ui/RatingStars";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import { ReviewVoting } from "./ReviewVoting";
import { useSubscription } from "@/lib/context/SubscriptionContext";
import { UpgradePrompt } from "@/components/premium/UpgradePrompt";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

type SortOption = "most_helpful" | "newest" | "oldest" | "highest" | "lowest" | "reliability" | "value_rating";

const FREE_SORT_OPTIONS: SortOption[] = ["most_helpful", "newest", "oldest", "highest", "lowest"];
const PRO_SORT_OPTIONS: SortOption[] = ["reliability", "value_rating"];

const SORT_LABELS: Record<SortOption, string> = {
  most_helpful: "Most Helpful",
  newest: "Newest First",
  oldest: "Oldest First",
  highest: "Highest Rated",
  lowest: "Lowest Rated",
  reliability: "Best Reliability",
  value_rating: "Best Value",
};

interface ReviewSectionProps {
  reviews: Review[];
  ratingDistribution: RatingDistType;
  totalReviews: number;
}

export function ReviewSection({ reviews, ratingDistribution, totalReviews }: ReviewSectionProps) {
  const [sortBy, setSortBy] = useState<SortOption>("most_helpful");
  const [showFilterGate, setShowFilterGate] = useState(false);
  const { isPro } = useSubscription();

  const handleSortChange = (value: string) => {
    const option = value as SortOption;
    if (PRO_SORT_OPTIONS.includes(option) && !isPro) {
      setShowFilterGate(true);
      return;
    }
    setShowFilterGate(false);
    setSortBy(option);
  };

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
    switch (sortBy) {
      case "most_helpful":
        return sorted.sort((a, b) => b.helpfulCount - a.helpfulCount);
      case "newest":
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "oldest":
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "highest":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return sorted.sort((a, b) => a.rating - b.rating);
      case "reliability":
        return sorted.sort((a, b) => (b.reliabilityRating ?? 0) - (a.reliabilityRating ?? 0));
      case "value_rating":
        return sorted.sort((a, b) => (b.valueRating ?? 0) - (a.valueRating ?? 0));
      default:
        return sorted;
    }
  }, [reviews, sortBy]);

  return (
    <section aria-labelledby="review-section-heading" data-speakable="reviews">
      {/* Rating Summary Stats */}
      <section aria-label="Rating distribution summary" className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Average rating */}
          <div className="flex flex-col items-center justify-center sm:min-w-[140px]">
            <span className="text-4xl font-bold text-gray-900">
              {totalReviews > 0
                ? (
                    Object.entries(ratingDistribution).reduce(
                      (sum, [star, count]) => sum + Number(star) * count,
                      0
                    ) / totalReviews
                  ).toFixed(1)
                : "0.0"}
            </span>
            <RatingStars
              rating={
                totalReviews > 0
                  ? Object.entries(ratingDistribution).reduce(
                      (sum, [star, count]) => sum + Number(star) * count,
                      0
                    ) / totalReviews
                  : 0
              }
              size="sm"
            />
            <span className="text-xs text-gray-600 mt-1">
              {totalReviews} reviews
            </span>
          </div>

          {/* Rating distribution bars */}
          <ul role="list" className="flex-1 space-y-1.5 list-none p-0 m-0" aria-label="Rating distribution">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const count = ratingDistribution[star];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <li key={star} className="flex items-center gap-2 text-sm">
                  <span aria-hidden="true" className="w-8 flex items-center justify-end gap-0.5 text-gray-600 text-xs font-medium shrink-0">
                    {star}
                    <svg aria-hidden="true" className="w-2.5 h-2.5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                    </svg>
                  </span>
                  <div aria-hidden="true" className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span
                    className="w-8 text-right text-gray-600 text-xs"
                    aria-label={`${star} stars: ${count} reviews, ${percentage.toFixed(0)}%`}
                  >
                    {count}
                  </span>
                  <span aria-hidden="true" className="w-10 text-right text-gray-600 text-xs">
                    {percentage.toFixed(0)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Header with sort controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div aria-hidden="true" className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
            <svg aria-hidden="true" className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
            </svg>
          </div>
          <h2 id="review-section-heading" className="text-lg font-semibold text-gray-900">
            Verified Reviews
            <span className="text-sm font-normal text-gray-600 ml-2">{reviews.length} shown</span>
          </h2>
        </div>

        <div className="relative">
          <div className="flex items-center gap-1.5">
            <svg aria-hidden="true" className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
            </svg>
            <select
              aria-label="Sort reviews"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-sm text-gray-600 bg-transparent border border-gray-400 rounded-xl px-3 py-2.5 pr-8 min-h-[44px] appearance-none cursor-pointer hover:border-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/20 focus:border-brand-600"
            >
              {FREE_SORT_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {SORT_LABELS[value]}
                </option>
              ))}
              {PRO_SORT_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {isPro ? SORT_LABELS[value] : `${SORT_LABELS[value]} (Pro)`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showFilterGate && (
        <div className="mb-4">
          <UpgradePrompt gate="advanced_filters" compact />
        </div>
      )}

      {/* Reviews list */}
      <ul className="space-y-4" aria-label="Customer reviews">
        {sortedReviews.map((review) => (
          <li key={review.id}>
            <ReviewCardWithVoting review={review} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReviewCardWithVoting({ review }: { review: Review }) {
  return (
    <article aria-labelledby={`rs-${review.id}-headline`} className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group">
      <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="p-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 id={`rs-${review.id}-headline`} className="font-semibold text-gray-900">{review.headline}</h3>
            {review.verifiedPurchase && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full">
                <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Verified Purchase
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <RatingStars rating={review.rating} size="sm" />
            <VerificationBadge tier={review.verificationTier} compact />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 mb-4">
        <span>By {review.authorName}</span>
        {review.timeOwned && <span>Owned {review.timeOwned}</span>}
        <span className="capitalize">{review.experienceLevel} user</span>
        <time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time>
      </div>

      {(review.pros.length > 0 || review.cons.length > 0) && (
        <section aria-label="Pros and cons" className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {review.pros.length > 0 && (
            <section aria-label="Pros">
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1.5">
                Pros
              </p>
              <ul className="space-y-1">
                {review.pros.map((pro, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                    <span aria-hidden="true" className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg aria-hidden="true" className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                    {pro}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {review.cons.length > 0 && (
            <section aria-label="Cons">
              <p className="text-xs font-medium text-red-600 uppercase tracking-wider mb-1.5">
                Cons
              </p>
              <ul className="space-y-1">
                {review.cons.map((con, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                    <span aria-hidden="true" className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                      <svg aria-hidden="true" className="w-2.5 h-2.5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                      </svg>
                    </span>
                    {con}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </section>
      )}

      <p className="text-sm text-gray-700 leading-relaxed mb-4">{review.body}</p>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <dl className="flex gap-4 text-xs text-gray-600">
          {review.reliabilityRating != null && (
            <div className="inline-flex gap-0.5">
              <dt>Reliability:</dt>
              <dd>{review.reliabilityRating}/5</dd>
            </div>
          )}
          {review.easeOfUseRating != null && (
            <div className="inline-flex gap-0.5">
              <dt>Ease of Use:</dt>
              <dd>{review.easeOfUseRating}/5</dd>
            </div>
          )}
          {review.valueRating != null && (
            <div className="inline-flex gap-0.5">
              <dt>Value:</dt>
              <dd>{review.valueRating}/5</dd>
            </div>
          )}
        </dl>
        <ReviewVoting
          reviewId={review.id}
          initialHelpfulCount={review.helpfulCount}
        />
      </div>

      {review.aiTopics.length > 0 && (
        <ul role="list" aria-label="Review topics" className="flex flex-wrap gap-1.5 mt-3">
          {review.aiTopics.map((topic) => (
            <li
              key={topic}
              className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full text-xs"
            >
              {topic}
            </li>
          ))}
        </ul>
      )}
      </div>
    </article>
  );
}
