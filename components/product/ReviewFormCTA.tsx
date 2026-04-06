"use client";

import Link from "next/link";
import { useExperiment } from "@/lib/experiments";
import { trackEvent } from "@/lib/tracking/analytics";

interface ReviewFormCTAProps {
  productName: string;
  productSlug: string;
  categorySlug: string;
}

export function ReviewFormCTA({ productName, productSlug, categorySlug }: ReviewFormCTAProps) {
  const { variant, isActive } = useExperiment("review-form-placement");

  // Only show above-fold CTA in treatment variant
  if (!isActive || variant !== "above-fold") return null;

  return (
    <div className="bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-100 rounded-xl p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-900">
          Own this product?
        </p>
        <p className="text-xs text-gray-500">
          Share your experience to help other buyers
        </p>
      </div>
      <Link
        href={`/write-review?product=${productSlug}&category=${categorySlug}`}
        onClick={() => {
          trackEvent("review_cta_clicked", {
            product_slug: productSlug,
            placement: "above-fold",
            experiment_variant: variant,
          });
        }}
        className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
        Write a Review
      </Link>
    </div>
  );
}
