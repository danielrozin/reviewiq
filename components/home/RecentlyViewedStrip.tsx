"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SmartScore } from "@/components/ui/SmartScore";
import type { RecentlyViewedItem } from "@/hooks/useRecentlyViewed";

const KEY = "riq_recently_viewed";

function readStorage(): RecentlyViewedItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function RecentlyViewedStrip() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setMounted(true);
  }, []);

  if (!mounted || items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Recently Viewed
        </h2>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem(KEY);
            setItems([]);
          }}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/category/${item.categorySlug}/${item.slug}`}
            className="snap-start shrink-0 w-44 bg-white border border-gray-200 rounded-xl p-3.5 hover:border-brand-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium truncate max-w-[80px]">{item.brand}</span>
              <SmartScore score={item.smartScore} size="sm" />
            </div>
            <p className="text-sm font-semibold text-gray-800 group-hover:text-brand-600 line-clamp-2 leading-snug transition-colors">
              {item.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
