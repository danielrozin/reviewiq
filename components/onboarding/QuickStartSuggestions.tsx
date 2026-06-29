"use client";

import Link from "next/link";
import { useOnboarding } from "./OnboardingProvider";

const POPULAR_CATEGORIES = [
  { name: "Smartphones", slug: "smartphones", icon: "M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 9 1.5 1.5 3-3" },
  { name: "Laptops", slug: "laptops", icon: "M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" },
  { name: "Headphones", slug: "headphones", icon: "M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" },
  { name: "Cameras", slug: "cameras", icon: "m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" },
  { name: "Tablets", slug: "tablets", icon: "M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-15a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v15a2.25 2.25 0 0 0 2.25 2.25Z" },
  { name: "Smartwatches", slug: "smartwatches", icon: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
];

export function QuickStartSuggestions() {
  const { state, isNewVisitor } = useOnboarding();

  // Show only for new visitors who dismissed the welcome modal
  if (!state.welcomeDismissed || state.pageViews > 5) return null;
  // Don't show if user already has recently viewed products
  if (state.recentlyViewed.length > 2) return null;

  return (
    <div className="bg-gradient-to-br from-brand-50/60 to-white border border-brand-100 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div aria-hidden="true" className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center">
          <svg aria-hidden="true" className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Quick Start</h3>
          <p className="text-xs text-gray-600">Popular categories to explore</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {POPULAR_CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all group"
          >
            <div aria-hidden="true" className="w-6 h-6 bg-brand-50 rounded-md flex items-center justify-center shrink-0">
              <svg aria-hidden="true" className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-brand-600 transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/products"
        className="inline-flex items-center gap-1 mt-4 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        Browse all products
        <svg aria-hidden="true" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </div>
  );
}
