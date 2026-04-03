"use client";

import Link from "next/link";
import { useOnboarding } from "./OnboardingProvider";
import { TrendingUp, ArrowRight } from "lucide-react";

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
          <TrendingUp className="w-4 h-4 text-brand-600" />
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
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
