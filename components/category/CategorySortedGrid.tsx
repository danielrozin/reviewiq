"use client";

import { useState, useEffect, useMemo } from "react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";

type SortKey = "smartScore" | "reviewCount" | "priceLow" | "priceHigh";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "smartScore", label: "SmartScore" },
  { key: "reviewCount", label: "Most Reviewed" },
  { key: "priceLow", label: "Price: Low → High" },
  { key: "priceHigh", label: "Price: High → Low" },
];

interface Props {
  products: Product[];
  categorySlug: string;
}

function readSort(slug: string): SortKey {
  try {
    return (localStorage.getItem(`riq_cat_sort_${slug}`) as SortKey) || "smartScore";
  } catch {
    return "smartScore";
  }
}

function saveSort(slug: string, key: SortKey) {
  try {
    localStorage.setItem(`riq_cat_sort_${slug}`, key);
  } catch {}
}

export function CategorySortedGrid({ products, categorySlug }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("smartScore");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSortKey(readSort(categorySlug));
    setMounted(true);
  }, [categorySlug]);

  function handleSort(key: SortKey) {
    setSortKey(key);
    saveSort(categorySlug, key);
  }

  const sorted = useMemo(() => {
    const arr = [...products];
    switch (sortKey) {
      case "reviewCount":
        return arr.sort((a, b) => b.reviewCount - a.reviewCount);
      case "priceLow":
        return arr.sort((a, b) => a.priceRange.min - b.priceRange.min);
      case "priceHigh":
        return arr.sort((a, b) => b.priceRange.max - a.priceRange.max);
      default:
        return arr.sort((a, b) => b.smartScore - a.smartScore);
    }
  }, [products, sortKey]);

  return (
    <>
      {/* Sort bar */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 font-medium mr-1 shrink-0">
          <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
          </svg>
          Sort:
        </span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            aria-pressed={sortKey === opt.key}
            onClick={() => handleSort(opt.key)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${
              sortKey === opt.key
                ? "bg-brand-600 text-white shadow-sm ring-1 ring-brand-600/30"
                : "bg-white border border-gray-200 text-gray-600 hover:border-brand-200 hover:text-brand-600"
            }`}
          >
            {opt.label}
          </button>
        ))}
        {mounted && (
          <span className="ml-auto text-xs text-gray-500 font-medium tabular-nums shrink-0">
            {sorted.length} products
          </span>
        )}
      </div>

      {/* Product grid — show skeleton bars until hydrated */}
      {!mounted ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 6).map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-80" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-stagger">
          {sorted.map((product, index) => (
            <div key={product.id} className="relative">
              {/* Top-3 rank badge — only meaningful when sorted by SmartScore */}
              {sortKey === "smartScore" && index < 3 && (
                <div
                  aria-label={`Ranked #${index + 1}`}
                  className={`absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border-2 border-white text-white ${
                    index === 0 ? "bg-amber-400" : index === 1 ? "bg-slate-400" : "bg-orange-700/80"
                  }`}
                >
                  <span aria-hidden="true">#{index + 1}</span>
                </div>
              )}
              <ProductCard product={product} priority={index < 3} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
