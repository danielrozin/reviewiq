"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SmartScore } from "@/components/ui/SmartScore";

interface StickyMobileCTAProps {
  productName: string;
  productSlug: string;
  smartScore?: number;
  /** px scroll offset before bar appears — default 300 */
  threshold?: number;
}

export function StickyMobileCTA({
  productName,
  productSlug,
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

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-3 transition-transform duration-300 safe-area-bottom ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-3">
        {smartScore !== undefined && (
          <div className="shrink-0">
            <SmartScore score={smartScore} size="sm" showLabel={false} />
          </div>
        )}
        <p className="flex-1 text-sm font-semibold text-gray-800 truncate">
          {productName}
        </p>
        <Link
          href={`/write-review?product=${encodeURIComponent(productSlug)}`}
          className="shrink-0 px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors touch-manipulation"
          aria-label={`Write a review for ${productName}`}
        >
          Review
        </Link>
      </div>
    </div>
  );
}
