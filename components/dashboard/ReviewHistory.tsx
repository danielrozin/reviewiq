import Link from "next/link";
import type { Review } from "@/types";

interface ReviewHistoryProps {
  reviews: {
    review: Review;
    productName: string;
    productSlug: string;
    categorySlug: string;
  }[];
}

export function ReviewHistory({ reviews }: ReviewHistoryProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl">
        <p className="text-gray-400 text-sm">No reviews written yet</p>
        <Link
          href="/write-review"
          className="text-sm text-brand-600 hover:text-brand-700 font-medium mt-2 inline-block"
        >
          Write your first review →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map(({ review, productName, productSlug, categorySlug }) => (
        <div
          key={review.id}
          className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Link
                href={`/category/${categorySlug}/${productSlug}`}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                {productName}
              </Link>
              <h3 className="text-sm font-semibold text-gray-900 mt-1 truncate">
                {review.headline}
              </h3>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                {review.body.slice(0, 180)}
                {review.body.length > 180 && "..."}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-sm ${
                      star <= review.rating ? "text-yellow-400" : "text-gray-200"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              {review.verifiedPurchase && (
                <span className="text-[10px] text-trust-green font-medium mt-1 inline-block">
                  Verified
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <span>{review.createdAt}</span>
            <span>▲ {review.helpfulCount} helpful</span>
            {review.pros.length > 0 && (
              <span className="text-trust-green">
                {review.pros.length} pro{review.pros.length !== 1 && "s"}
              </span>
            )}
            {review.cons.length > 0 && (
              <span className="text-trust-red">
                {review.cons.length} con{review.cons.length !== 1 && "s"}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
