"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { discussions } from "@/data/discussions";
import { trackSearch, trackSearchResultClicked } from "@/lib/tracking/analytics";

interface SearchResult {
  type: "product" | "category" | "discussion";
  name: string;
  subtitle: string;
  href: string;
  score?: number;
}

interface SearchBarProps {
  size?: "default" | "lg";
  placeholder?: string;
  className?: string;
}

export function SearchBar({ size = "default", placeholder, className }: SearchBarProps = {}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ⌘K / Ctrl+K global shortcut — only wire up on the default-size bar (header bar)
  useEffect(() => {
    if (size !== "default") return;
    function handleGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    document.addEventListener("keydown", handleGlobalKey);
    return () => document.removeEventListener("keydown", handleGlobalKey);
  }, [size]);

  function search(q: string) {
    setQuery(q);
    setSelectedIndex(-1);

    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const lower = q.toLowerCase();
    const matched: SearchResult[] = [];

    // Search categories
    for (const cat of categories) {
      if (cat.name.toLowerCase().includes(lower) || cat.slug.includes(lower)) {
        matched.push({
          type: "category",
          name: cat.name,
          subtitle: `${cat.productCount} products`,
          href: `/category/${cat.slug}`,
        });
      }
    }

    // Search products
    for (const p of products) {
      const searchable = `${p.name} ${p.brand} ${p.description}`.toLowerCase();
      if (searchable.includes(lower)) {
        matched.push({
          type: "product",
          name: p.name,
          subtitle: `${p.brand} — SmartScore ${p.smartScore}`,
          href: `/category/${p.categorySlug}/${p.slug}`,
          score: p.smartScore,
        });
      }
    }

    // Search discussions
    for (const d of discussions) {
      const searchable = `${d.title} ${d.tags.join(" ")}`.toLowerCase();
      if (searchable.includes(lower)) {
        matched.push({
          type: "discussion",
          name: d.title,
          subtitle: `${d.commentCount} replies · ${d.upvotes} upvotes`,
          href: `/community/thread/${d.id}`,
          score: d.upvotes,
        });
      }
    }

    // Sort: categories first, then products by score, then discussions
    matched.sort((a, b) => {
      const order = { category: 0, product: 1, discussion: 2 };
      if (a.type !== b.type) return order[a.type] - order[b.type];
      return (b.score || 0) - (a.score || 0);
    });

    const sliced = matched.slice(0, 8);
    setResults(sliced);
    setOpen(sliced.length > 0);
    if (q.trim().length >= 2) {
      trackSearch(q.trim(), sliced.length);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        navigate(results[selectedIndex].href);
      } else if (query.trim().length >= 2) {
        // Navigate to full search page with query
        setOpen(false);
        setQuery("");
        router.push(`/products?q=${encodeURIComponent(query.trim())}`);
      } else if (results.length > 0) {
        navigate(results[0].href);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div ref={wrapperRef} className={`relative w-full ${className || (size === "lg" ? "max-w-xl" : "max-w-md")}`}>
      <div className="relative">
        <svg
          className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${size === "lg" ? "left-4 w-5 h-5" : "left-3 w-4 h-4"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => query.length >= 2 && results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Search products, discussions, categories..."}
          className={`w-full border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-colors ${
            size === "lg"
              ? "pl-12 pr-5 py-3.5 text-base rounded-2xl shadow-sm"
              : "pl-10 pr-20 py-2 text-sm rounded-xl"
          }`}
        />
        {size === "default" && !query && (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded pointer-events-none">
            <span className="text-[11px]">⌘</span>K
          </kbd>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
          {results.map((result, i) => (
            <button
              key={result.href}
              onClick={() => {
                trackSearchResultClicked(query, result.type, result.name, i);
                navigate(result.href);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                i === selectedIndex
                  ? "bg-brand-50"
                  : "hover:bg-gray-50"
              } ${i > 0 ? "border-t border-gray-50" : ""}`}
            >
              <span
                className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                  result.type === "category"
                    ? "bg-gray-100"
                    : result.type === "discussion"
                    ? "bg-purple-50"
                    : "bg-brand-50"
                }`}
              >
                {result.type === "category" ? (
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                  </svg>
                ) : result.type === "discussion" ? (
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold text-brand-600">{result.score}</span>
                )}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {result.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {result.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50">
          <p className="text-sm text-gray-600 text-center">
            No products found for &ldquo;{query}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
