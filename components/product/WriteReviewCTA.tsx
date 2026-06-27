import Link from "next/link";

interface WriteReviewCTAProps {
  productName: string;
  productSlug: string;
}

export function WriteReviewCTA({ productName, productSlug }: WriteReviewCTAProps) {
  return (
    <section className="bg-brand-50 border border-brand-100 rounded-2xl p-6 sm:p-8 text-center">
      <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Own {productName}? Share your experience
      </h3>
      <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
        Help other buyers make informed decisions. Your honest review matters.
      </p>
      <Link
        href={`/write-review?product=${encodeURIComponent(productSlug)}`}
        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
        </svg>
        Write a Review
      </Link>
    </section>
  );
}
