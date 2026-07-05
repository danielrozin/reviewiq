import type { RatingDistribution as RatingDistType } from "@/types";

interface RatingDistributionProps {
  distribution: RatingDistType;
  totalReviews: number;
}

export function RatingDistribution({ distribution, totalReviews }: RatingDistributionProps) {
  return (
    <div className="space-y-2">
      {([5, 4, 3, 2, 1] as const).map((star) => {
        const count = distribution[star];
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        return (
          <div key={star} className="flex items-center gap-3 text-sm">
            <span className="w-8 text-right text-gray-600 font-medium" aria-hidden="true">
              {star}★
            </span>
            <div
              className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden"
              role="meter"
              aria-valuenow={Math.round(percentage)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`${Math.round(percentage)}% — ${count} ${count !== 1 ? "reviews" : "review"}`}
              aria-label={`${star} star ratings`}
            >
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-10 text-right text-gray-600 text-xs" aria-hidden="true">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
