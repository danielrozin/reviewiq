import Link from "next/link";

interface WriteReviewCTAProps {
  productName: string;
  productSlug: string;
}

export function WriteReviewCTA({ productName, productSlug }: WriteReviewCTAProps) {
  return (
    <section aria-labelledby="write-review-cta-heading" className="bg-gradient-to-br from-brand-50 via-white to-brand-50 border border-brand-100 rounded-2xl p-6 sm:p-8 text-center">
      {/* Social proof star row */}
      <div aria-hidden="true" className="flex items-center justify-center gap-0.5 mb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} aria-hidden="true" className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
          </svg>
        ))}
        <span className="text-xs text-gray-600 ml-1.5">Trusted by thousands of buyers</span>
      </div>

      <div aria-hidden="true" className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center mx-auto mb-3">
        <svg aria-hidden="true" className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
        </svg>
      </div>
      <h3 id="write-review-cta-heading" className="text-lg font-semibold text-gray-900 mb-2">
        Own {productName}? Share your experience
      </h3>
      <p className="text-sm text-gray-600 mb-5 max-w-md mx-auto">
        Help other buyers make informed decisions. Your honest review matters.
      </p>
      <Link
        href={`/write-review?product=${encodeURIComponent(productSlug)}`}
        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
      >
        <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
        </svg>
        Write a Review
      </Link>
      <p className="text-xs text-gray-500 mt-3">Free <span aria-hidden="true">·</span> No account required</p>
    </section>
  );
}
