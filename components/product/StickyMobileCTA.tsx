"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SmartScore } from "@/components/ui/SmartScore";

interface StickyMobileCTAProps {
  productName: string;
  productSlug: string;
  categorySlug?: string;
  smartScore?: number;
  /** px scroll offset before bar appears — default 300 */
  threshold?: number;
}

export function StickyMobileCTA({
  productName,
  productSlug,
  categorySlug,
  smartScore,
  threshold = 300,
}: StickyMobileCTAProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > threshold);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const compareHref = categorySlug
    ? `/compare?a=${encodeURIComponent(productSlug)}&category=${encodeURIComponent(categorySlug)}`
    : `/compare?a=${encodeURIComponent(productSlug)}`;

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-200 transition-transform duration-300 safe-area-bottom ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      {/* Mobile layout */}
      <div className="lg:hidden px-3 py-2.5">
        <div className="flex items-center gap-2">
          {smartScore !== undefined && (
            <div className="shrink-0">
              <SmartScore score={smartScore} size="sm" showLabel={false} />
            </div>
          )}
          <p className="flex-1 text-sm font-semibold text-gray-800 truncate min-w-0">
            {productName}
          </p>
          <Link
            href={compareHref}
            className="shrink-0 inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors touch-manipulation"
            aria-label={`Compare ${productName}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            Compare
          </Link>
          <Link
            href={`/write-review?product=${encodeURIComponent(productSlug)}`}
            className="shrink-0 inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors touch-manipulation"
            aria-label={`Write a review for ${productName}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
            Review
          </Link>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-4">
            {smartScore !== undefined && (
              <div className="shrink-0 flex items-center gap-2">
                <SmartScore score={smartScore} size="sm" showLabel={false} />
                <span className="text-xs text-gray-600 font-medium">SmartScore</span>
              </div>
            )}
            <div className="w-px h-5 bg-gray-200 shrink-0" />
            <p className="flex-1 text-sm font-semibold text-gray-800 truncate">
              {productName}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={compareHref}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
                aria-label={`Compare ${productName}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                Compare
              </Link>
              <Link
                href={`/write-review?product=${encodeURIComponent(productSlug)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors"
                aria-label={`Write a review for ${productName}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
                Write a Review
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
