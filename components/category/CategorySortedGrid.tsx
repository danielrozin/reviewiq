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
        <span className="text-sm text-gray-500 font-medium mr-1 shrink-0">Sort by:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => handleSort(opt.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sortKey === opt.key
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
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
                  className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border-2 border-white"
                  style={{
                    background: index === 0 ? "#f59e0b" : index === 1 ? "#94a3b8" : "#cd7f32",
                    color: "white",
                  }}
                >
                  #{index + 1}
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
