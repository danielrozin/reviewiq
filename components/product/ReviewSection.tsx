"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, CheckCircle2, Lock } from "lucide-react";
import type { Review, RatingDistribution as RatingDistType } from "@/types";
import { RatingStars } from "@/components/ui/RatingStars";
import { VerificationBadge } from "@/components/ui/VerificationBadge";
import { averageRatingFromDistribution } from "@/lib/utils";
import { ReviewVoting } from "./ReviewVoting";
import { useSubscription } from "@/lib/context/SubscriptionContext";
import { UpgradePrompt } from "@/components/premium/UpgradePrompt";

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

  const averageRating = averageRatingFromDistribution(ratingDistribution, totalReviews);

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
    <section>
      {/* Rating Summary Stats */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Average rating */}
          <div className="flex flex-col items-center justify-center sm:min-w-[140px]">
            <span className="text-4xl font-bold text-gray-900">
              {totalReviews > 0 ? averageRating.toFixed(1) : "0.0"}
            </span>
            <RatingStars rating={averageRating} size="sm" />
            <span className="text-xs text-gray-400 mt-1">
              {totalReviews} reviews
            </span>
          </div>

          {/* Rating distribution bars */}
          <div className="flex-1 space-y-1.5">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const count = ratingDistribution[star];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-6 text-right text-gray-500 text-xs font-medium">
                    {star}&#9733;
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-gray-400 text-xs">
                    {count}
                  </span>
                  <span className="w-10 text-right text-gray-400 text-xs">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Header with sort controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Verified Reviews
          <span className="text-sm font-normal text-gray-400 ml-2">
            {reviews.length} shown
          </span>
        </h2>

        <div className="relative">
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-sm text-gray-600 bg-transparent border border-gray-200 rounded-lg px-3 py-1.5 pr-8 appearance-none cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <ReviewCardWithVoting key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}

function ReviewCardWithVoting({ review }: { review: Review }) {
  return (
    <article className="border border-gray-100 rounded-xl p-6 hover:border-gray-200 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{review.headline}</h4>
            {review.verifiedPurchase && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full">
                <CheckCircle2 className="w-3 h-3" />
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

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mb-4">
        <span>By {review.authorName}</span>
        {review.timeOwned && <span>Owned {review.timeOwned}</span>}
        <span className="capitalize">{review.experienceLevel} user</span>
        <span>{review.createdAt}</span>
      </div>

      {(review.pros.length > 0 || review.cons.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {review.pros.length > 0 && (
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1.5">
                Pros
              </p>
              <ul className="space-y-1">
                {review.pros.map((pro, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-1 shrink-0">+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {review.cons.length > 0 && (
            <div>
              <p className="text-xs font-medium text-red-500 uppercase tracking-wider mb-1.5">
                Cons
              </p>
              <ul className="space-y-1">
                {review.cons.map((con, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                    <span className="text-red-400 mt-1 shrink-0">-</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p className="text-sm text-gray-700 leading-relaxed mb-4">{review.body}</p>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex gap-4 text-xs text-gray-400">
          {review.reliabilityRating != null && (
            <span>Reliability: {review.reliabilityRating}/5</span>
          )}
          {review.easeOfUseRating != null && (
            <span>Ease of Use: {review.easeOfUseRating}/5</span>
          )}
          {review.valueRating != null && (
            <span>Value: {review.valueRating}/5</span>
          )}
        </div>
        <ReviewVoting
          reviewId={review.id}
          initialHelpfulCount={review.helpfulCount}
        />
      </div>

      {review.aiTopics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {review.aiTopics.map((topic) => (
            <span
              key={topic}
              className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full text-xs"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
