"use client";

import Link from "next/link";
import { useOnboarding } from "./OnboardingProvider";

const POPULAR_CATEGORIES = [
  { name: "Smartphones", slug: "smartphones", emoji: "📱" },
  { name: "Laptops", slug: "laptops", emoji: "💻" },
  { name: "Headphones", slug: "headphones", emoji: "🎧" },
  { name: "Cameras", slug: "cameras", emoji: "📷" },
  { name: "Tablets", slug: "tablets", emoji: "📲" },
  { name: "Smartwatches", slug: "smartwatches", emoji: "⌚" },
];

export function QuickStartSuggestions() {
  const { state, isNewVisitor } = useOnboarding();

  // Show only for new visitors who dismissed the welcome modal
  if (!state.welcomeDismissed || state.pageViews > 5) return null;
  // Don't show if user already has recently viewed products
  if (state.recentlyViewed.length > 2) return null;

  return (
    <div className="bg-gradient-to-r from-brand-50 to-blue-50 border border-brand-100 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Quick Start</h3>
          <p className="text-xs text-gray-500">Popular categories to explore</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {POPULAR_CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all group"
          >
            <span className="text-lg">{cat.emoji}</span>
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
        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </div>
  );
}
