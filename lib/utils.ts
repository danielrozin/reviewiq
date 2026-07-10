import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Product, RatingDistribution } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Authoritative average star rating.
//
// ratingDistribution + reviewCount describe the FULL review population (e.g. 342
// reviews), while product.reviews holds only a small hand-authored sample. Averaging
// the sample — as the product hero, product cards, and Product JSON-LD previously did —
// produced an inflated number that (a) disagreed with the on-page rating-distribution
// summary + OG card (both computed from the distribution) and (b) paired an inflated
// ratingValue with the full reviewCount inside aggregateRating, a Product rich-result
// mismatch Google can penalize. Deriving from the distribution makes every surface show
// one truthful number tied to reviewCount.
export function averageRatingFromDistribution(
  distribution: RatingDistribution | undefined,
  totalReviews: number
): number {
  if (!distribution || totalReviews <= 0) return 0;
  const weighted = ([5, 4, 3, 2, 1] as const).reduce(
    (sum, star) => sum + star * (distribution[star] || 0),
    0
  );
  return weighted / totalReviews;
}

export function productAverageRating(product: Product): number {
  const fromDistribution = averageRatingFromDistribution(
    product.ratingDistribution,
    product.reviewCount
  );
  if (fromDistribution > 0) return fromDistribution;
  // Fallback for products with no distribution data: sample-review average.
  if (product.reviews.length > 0) {
    return (
      product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    );
  }
  return 0;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-trust-green";
  if (score >= 60) return "text-yellow-500";
  return "text-trust-red";
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-trust-green";
  if (score >= 60) return "bg-yellow-500";
  return "bg-trust-red";
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Great";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 50) return "Mixed";
  return "Poor";
}
