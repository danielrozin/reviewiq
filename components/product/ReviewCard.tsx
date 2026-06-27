import type { Review } from "@/types";
import { RatingStars } from "@/components/ui/RatingStars";
import { VerificationBadge } from "@/components/ui/VerificationBadge";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="border border-gray-100 rounded-xl p-6 hover:border-gray-200 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">{review.headline}</h4>
          <div className="flex items-center gap-3">
            <RatingStars rating={review.rating} size="sm" />
            <VerificationBadge tier={review.verificationTier} compact />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mb-4">
        <span>By {review.authorName}</span>
        <span>Owned {review.timeOwned}</span>
        <span className="capitalize">{review.experienceLevel} user</span>
        <span>{review.createdAt}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1.5">
            Pros
          </p>
          <ul className="space-y-1">
            {review.pros.map((pro, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                {pro}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-red-500 uppercase tracking-wider mb-1.5">
            Cons
          </p>
          <ul className="space-y-1">
            {review.cons.map((con, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                  </svg>
                </span>
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mb-4">{review.body}</p>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex gap-4 text-xs text-gray-400">
          <span>Reliability: {review.reliabilityRating}/5</span>
          <span>Ease of Use: {review.easeOfUseRating}/5</span>
          <span>Value: {review.valueRating}/5</span>
        </div>
        <span className="text-xs text-gray-400">
          {review.helpfulCount} found helpful
        </span>
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
