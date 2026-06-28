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
          <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
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
          className="bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
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
                  <svg
                    key={star}
                    className={`w-3 h-3 ${star <= review.rating ? "text-yellow-400" : "text-gray-200"}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                ))}
              </div>
              {review.verifiedPurchase && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-trust-green font-medium mt-1">
                  <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <span>{review.createdAt}</span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
              </svg>
              {review.helpfulCount} helpful
            </span>
            {review.pros.length > 0 && (
              <span className="inline-flex items-center gap-0.5 text-trust-green">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {review.pros.length} pro{review.pros.length !== 1 && "s"}
              </span>
            )}
            {review.cons.length > 0 && (
              <span className="inline-flex items-center gap-0.5 text-trust-red">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                </svg>
                {review.cons.length} con{review.cons.length !== 1 && "s"}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
