import type { Review } from "@/types";
import { RatingStars } from "@/components/ui/RatingStars";
import { VerificationBadge } from "@/components/ui/VerificationBadge";

interface ReviewCardProps {
  review: Review;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article aria-labelledby={`review-${review.id}-headline`} className="bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
      <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="p-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 id={`review-${review.id}-headline`} className="font-semibold text-gray-900 mb-1">{review.headline}</h3>
          <div className="flex items-center gap-3">
            <RatingStars rating={review.rating} size="sm" />
            <VerificationBadge tier={review.verificationTier} compact />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600 mb-4">
        <span className="font-medium text-gray-600">{review.authorName}</span>
        <span aria-hidden="true" className="text-gray-200">·</span>
        <span>Owned {review.timeOwned}</span>
        <span aria-hidden="true" className="text-gray-200">·</span>
        <span className="capitalize">{review.experienceLevel} user</span>
        <span aria-hidden="true" className="text-gray-200">·</span>
        <time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <h4 className="text-xs font-medium text-emerald-700 uppercase tracking-wider mb-1.5">
            Pros
          </h4>
          <ul role="list" className="space-y-1">
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
        </div>
        <div>
          <h4 className="text-xs font-medium text-red-600 uppercase tracking-wider mb-1.5">
            Cons
          </h4>
          <ul role="list" className="space-y-1">
            {review.cons.map((con, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                <span aria-hidden="true" className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                  <svg aria-hidden="true" className="w-2.5 h-2.5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
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

      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-50">
        <ul role="list" className="flex flex-wrap gap-1.5 list-none p-0 m-0" aria-label="Sub-ratings">
          <li>
            <span role="meter" aria-valuenow={review.reliabilityRating} aria-valuemin={1} aria-valuemax={5} aria-valuetext={`Reliability: ${review.reliabilityRating} out of 5`} aria-label="Reliability" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium">
              <svg aria-hidden="true" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              <span aria-hidden="true">Reliability {review.reliabilityRating}/5</span>
            </span>
          </li>
          <li>
            <span role="meter" aria-valuenow={review.easeOfUseRating} aria-valuemin={1} aria-valuemax={5} aria-valuetext={`Ease of use: ${review.easeOfUseRating} out of 5`} aria-label="Ease of use" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
              <svg aria-hidden="true" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
              <span aria-hidden="true">Ease {review.easeOfUseRating}/5</span>
            </span>
          </li>
          <li>
            <span role="meter" aria-valuenow={review.valueRating} aria-valuemin={1} aria-valuemax={5} aria-valuetext={`Value: ${review.valueRating} out of 5`} aria-label="Value" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
              <svg aria-hidden="true" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span aria-hidden="true">Value {review.valueRating}/5</span>
            </span>
          </li>
        </ul>
        {review.helpfulCount > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-600">
            <svg aria-hidden="true" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
            </svg>
            {review.helpfulCount} found helpful
          </span>
        )}
      </div>

      {review.aiTopics.length > 0 && (
        <ul role="list" aria-label="Review topics" className="flex flex-wrap gap-1.5 mt-3">
          {review.aiTopics.map((topic) => (
            <li
              key={topic}
              className="px-2 py-0.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full text-xs transition-colors border border-gray-100"
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
