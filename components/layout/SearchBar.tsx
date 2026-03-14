"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { discussions } from "@/data/discussions";

interface SearchResult {
  type: "product" | "category" | "discussion";
  name: string;
  subtitle: string;
  href: string;
  score?: number;
}

export function SearchBar() {
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

    setResults(matched.slice(0, 8));
    setOpen(matched.length > 0);
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
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
          placeholder="Search products, discussions, categories..."
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-colors"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
          {results.map((result, i) => (
            <button
              key={result.href}
              onClick={() => navigate(result.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                i === selectedIndex
                  ? "bg-brand-50"
                  : "hover:bg-gray-50"
              } ${i > 0 ? "border-t border-gray-50" : ""}`}
            >
              <span
                className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  result.type === "category"
                    ? "bg-gray-100 text-gray-500"
                    : result.type === "discussion"
                    ? "bg-purple-50 text-purple-600"
                    : "bg-brand-50 text-brand-600"
                }`}
              >
                {result.type === "category" ? "CAT" : result.type === "discussion" ? "💬" : result.score}
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
          <p className="text-sm text-gray-500 text-center">
            No products found for &ldquo;{query}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
