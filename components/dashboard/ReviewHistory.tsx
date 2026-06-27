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
      <div className="text-center py-10 px-6 bg-white border border-gray-100 rounded-2xl">
        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-900 mb-1">No reviews written yet</p>
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          Share your experience with products you own — help other buyers make smarter decisions.
        </p>
        <Link
          href="/write-review"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-amber-700 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
        >
          Write your first review
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
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
