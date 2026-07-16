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
    <section aria-labelledby="recently-viewed-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-4">
        <h2 id="recently-viewed-heading" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <div aria-hidden="true" className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
            <svg aria-hidden="true" className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          Recently Viewed
        </h2>
        <button
          type="button"
          onClick={() => {
            // Move focus before unmounting so keyboard users don't lose position (WCAG 2.4.3)
            const main = document.querySelector<HTMLElement>("main");
            if (main) {
              main.setAttribute("tabindex", "-1");
              main.focus({ preventScroll: true });
              main.addEventListener("blur", () => main.removeAttribute("tabindex"), { once: true });
            }
            localStorage.removeItem(KEY);
            setItems([]);
          }}
          aria-label="Clear recently viewed products"
          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 transition-colors min-h-[44px] px-2 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded-lg"
        >
          <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
          Clear
        </button>
      </div>
      <div className="relative">
        {/* Right fade gradient — scroll hint on mobile */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-white to-transparent z-10 sm:hidden" />
        <ul role="list" aria-label="Recently viewed products" className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
          {items.map((item) => (
            <li key={item.slug} className="snap-start shrink-0 w-44">
            <Link
              href={`/category/${item.categorySlug}/${item.slug}`}
              aria-label={`${item.name} by ${item.brand} — SmartScore ${item.smartScore}`}
              className="block bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-brand-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
            >
              <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-600 font-medium truncate max-w-[80px] uppercase tracking-wider">{item.brand}</span>
                <SmartScore score={item.smartScore} size="sm" />
              </div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-brand-600 line-clamp-2 leading-snug transition-colors mb-1.5">
                {item.name}
              </p>
              {item.categorySlug && (
                <p className="text-xs text-gray-600 truncate capitalize">
                  {item.categorySlug.replace(/-/g, " ")}
                </p>
              )}
              </div>
            </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
