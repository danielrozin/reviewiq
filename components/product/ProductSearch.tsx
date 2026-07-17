"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { ProductCard } from "./ProductCard";
import { formatNumber } from "@/lib/utils";

type SortOption = "smartScore" | "priceAsc" | "priceDesc" | "newest" | "mostReviewed";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "smartScore", label: "SmartScore" },
  { value: "mostReviewed", label: "Most Reviewed" },
  { value: "priceAsc", label: "Price: Low → High" },
  { value: "priceDesc", label: "Price: High → Low" },
  { value: "newest", label: "Newest" },
];

const RATING_OPTIONS = [
  { value: 4, label: "4+ Stars" },
  { value: 3, label: "3+ Stars" },
  { value: 2, label: "2+ Stars" },
];

const ITEMS_PER_PAGE = 12;

function getAvgRating(p: (typeof products)[0]) {
  const d = p.ratingDistribution;
  const total = d[5] + d[4] + d[3] + d[2] + d[1];
  if (total === 0) return 0;
  return (d[5] * 5 + d[4] * 4 + d[3] * 3 + d[2] * 2 + d[1] * 1) / total;
}

// Compute global price bounds once
const GLOBAL_MIN_PRICE = Math.min(...products.map((p) => p.priceRange.min));
const GLOBAL_MAX_PRICE = Math.max(...products.map((p) => p.priceRange.max));

export function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial state from URL
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "smartScore"
  );
  const [minRating, setMinRating] = useState(
    Number(searchParams.get("rating")) || 0
  );
  const [priceMin, setPriceMin] = useState(
    Number(searchParams.get("priceMin")) || GLOBAL_MIN_PRICE
  );
  const [priceMax, setPriceMax] = useState(
    Number(searchParams.get("priceMax")) || GLOBAL_MAX_PRICE
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // Sync state → URL
  const updateUrl = useCallback(
    (overrides: Record<string, string | number>) => {
      const params = new URLSearchParams();
      const state: Record<string, string | number> = {
        q: query,
        category,
        sort,
        rating: minRating,
        priceMin,
        priceMax,
        page,
        ...overrides,
      };

      if (state.q) params.set("q", String(state.q));
      if (state.category) params.set("category", String(state.category));
      if (state.sort !== "smartScore") params.set("sort", String(state.sort));
      if (state.rating) params.set("rating", String(state.rating));
      if (Number(state.priceMin) > GLOBAL_MIN_PRICE)
        params.set("priceMin", String(state.priceMin));
      if (Number(state.priceMax) < GLOBAL_MAX_PRICE)
        params.set("priceMax", String(state.priceMax));
      if (Number(state.page) > 1) params.set("page", String(state.page));

      const qs = params.toString();
      router.replace(`/products${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [query, category, sort, minRating, priceMin, priceMax, page, router]
  );

  // Filter and sort products
  const filtered = useMemo(() => {
    let result = [...products];

    // Text search
    if (query.trim()) {
      const lower = query.toLowerCase();
      result = result.filter((p) => {
        const searchable =
          `${p.name} ${p.brand} ${p.description} ${p.categorySlug}`.toLowerCase();
        return searchable.includes(lower);
      });
    }

    // Category filter
    if (category) {
      result = result.filter((p) => p.categorySlug === category);
    }

    // Rating filter
    if (minRating > 0) {
      result = result.filter((p) => getAvgRating(p) >= minRating);
    }

    // Price filter
    if (priceMin > GLOBAL_MIN_PRICE || priceMax < GLOBAL_MAX_PRICE) {
      result = result.filter(
        (p) => p.priceRange.min >= priceMin && p.priceRange.max <= priceMax
      );
    }

    // Sort
    switch (sort) {
      case "smartScore":
        result.sort((a, b) => b.smartScore - a.smartScore);
        break;
      case "mostReviewed":
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "priceAsc":
        result.sort((a, b) => a.priceRange.min - b.priceRange.min);
        break;
      case "priceDesc":
        result.sort((a, b) => b.priceRange.max - a.priceRange.max);
        break;
      case "newest":
        // Use id as proxy since no createdAt in static data
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
    }

    return result;
  }, [query, category, sort, minRating, priceMin, priceMax]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // Reset page to 1 when filters change
  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [filtered.length, totalPages, page]);

  function setFilter(key: string, value: string | number) {
    const newPage = key === "page" ? Number(value) : 1;
    const overrides: Record<string, string | number> = { [key]: value, page: newPage };

    switch (key) {
      case "q":
        setQuery(String(value));
        break;
      case "category":
        setCategory(String(value));
        break;
      case "sort":
        setSort(value as SortOption);
        break;
      case "rating":
        setMinRating(Number(value));
        break;
      case "priceMin":
        setPriceMin(Number(value));
        break;
      case "priceMax":
        setPriceMax(Number(value));
        break;
    }
    setPage(newPage);
    updateUrl(overrides);
  }

  function clearFilters() {
    setQuery("");
    setCategory("");
    setSort("smartScore");
    setMinRating(0);
    setPriceMin(GLOBAL_MIN_PRICE);
    setPriceMax(GLOBAL_MAX_PRICE);
    setPage(1);
    router.replace("/products", { scroll: false });
  }

  const hasActiveFilters =
    query || category || sort !== "smartScore" || minRating > 0 ||
    priceMin > GLOBAL_MIN_PRICE || priceMax < GLOBAL_MAX_PRICE;

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="relative">
        <svg
          aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
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
          type="search"
          value={query}
          onChange={(e) => setFilter("q", e.target.value)}
          autoComplete="off"
          aria-label="Search by product name, brand, or keyword"
          placeholder="Search by product name, brand, or keyword..."
          className="w-full pl-12 pr-4 py-3 text-base border border-gray-500 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:border-transparent transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => setFilter("q", "")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 text-gray-600 hover:text-gray-700 rounded touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div role="group" aria-label="Filter products" className="flex flex-wrap items-center gap-3">
        {/* Category */}
        <select
          value={category}
          onChange={(e) => setFilter("category", e.target.value)}
          aria-label="Filter by category"
          className="px-3 py-2 text-sm border border-gray-500 rounded-xl bg-white text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setFilter("sort", e.target.value)}
          aria-label="Sort products"
          className="px-3 py-2 text-sm border border-gray-500 rounded-xl bg-white text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>

        {/* Rating */}
        <select
          value={minRating}
          onChange={(e) => setFilter("rating", Number(e.target.value))}
          aria-label="Filter by minimum rating"
          className="px-3 py-2 text-sm border border-gray-500 rounded-xl bg-white text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
        >
          <option value={0}>Any Rating</option>
          {RATING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Price range */}
        <div role="group" aria-label="Price range" className="flex items-center gap-2 text-sm text-gray-600">
          <span aria-hidden="true" className="text-gray-400">$</span>
          <input
            type="number"
            value={priceMin}
            min={GLOBAL_MIN_PRICE}
            max={priceMax}
            onChange={(e) => setFilter("priceMin", Number(e.target.value))}
            className="w-20 px-2 py-2 border border-gray-500 rounded-xl bg-white text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 text-sm"
            aria-label="Minimum price"
            placeholder="Min"
          />
          <span aria-hidden="true" className="text-gray-400">—</span>
          <input
            type="number"
            value={priceMax}
            min={priceMin}
            max={GLOBAL_MAX_PRICE}
            onChange={(e) => setFilter("priceMax", Number(e.target.value))}
            className="w-20 px-2 py-2 border border-gray-500 rounded-xl bg-white text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 text-sm"
            aria-label="Maximum price"
            placeholder="Max"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 px-3 min-h-[44px] touch-manipulation text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1"
          >
            <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            Clear all
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-600 font-medium" aria-hidden="true">Active filters:</span>
          <ul role="list" aria-label="Active filters" className="flex flex-wrap items-center gap-2 list-none p-0 m-0">
          {query && (
            <li><span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-medium rounded-full border border-brand-100">
              <svg aria-hidden="true" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              &ldquo;{query}&rdquo;
              <button type="button" onClick={() => setFilter("q", "")} className="ml-0.5 -m-1 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-brand-900 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded" aria-label="Remove search filter">
                <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </span></li>
          )}
          {category && (
            <li><span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-100">
              {categories.find((c) => c.slug === category)?.icon}{" "}
              {categories.find((c) => c.slug === category)?.name}
              <button type="button" onClick={() => setFilter("category", "")} className="ml-0.5 -m-1 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-purple-900 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded" aria-label="Remove category filter">
                <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </span></li>
          )}
          {minRating > 0 && (
            <li><span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-100">
              <svg aria-hidden="true" className="w-3 h-3 fill-current text-amber-600 shrink-0" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.161c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.37-2.447a1 1 0 00-1.175 0l-3.37 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.064 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.285-3.958z" />
              </svg>
              {minRating}+ stars
              <button type="button" onClick={() => setFilter("rating", 0)} className="ml-0.5 -m-1 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-amber-900 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded" aria-label="Remove rating filter">
                <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </span></li>
          )}
          {(priceMin > GLOBAL_MIN_PRICE || priceMax < GLOBAL_MAX_PRICE) && (
            <li><span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100">
              ${priceMin}–${priceMax}
              <button
                type="button"
                onClick={() => { setPriceMin(GLOBAL_MIN_PRICE); setPriceMax(GLOBAL_MAX_PRICE); updateUrl({ priceMin: GLOBAL_MIN_PRICE, priceMax: GLOBAL_MAX_PRICE }); }}
                className="ml-0.5 -m-1 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-emerald-900 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
                aria-label="Remove price filter"
              >
                <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </span></li>
          )}
          </ul>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <p className="text-sm text-gray-600" role="status" aria-live="polite" aria-atomic="true">
          <span className="font-semibold text-gray-900">
            {formatNumber(filtered.length)}
          </span>{" "}
          {filtered.length === 1 ? "product" : "products"} found
          {query && (
            <span>
              {" "}
              for &ldquo;<span className="text-brand-600">{query}</span>&rdquo;
            </span>
          )}
          {category && (
            <span>
              {" "}
              in{" "}
              <span className="text-brand-600">
                {categories.find((c) => c.slug === category)?.name || category}
              </span>
            </span>
          )}
        </p>
        {totalPages > 1 && (
          <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-gray-600">
            Page {safePage} of {totalPages}
          </p>
        )}
      </div>

      {/* Product grid */}
      {paginated.length > 0 ? (
        <ul role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
          {paginated.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <section aria-labelledby="no-products-heading" className="text-center py-14 px-6 bg-white border border-gray-100 rounded-2xl">
          <div aria-hidden="true" className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg aria-hidden="true" className="w-7 h-7 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <h2 id="no-products-heading" className="text-lg font-semibold text-gray-900 mb-1">
            No products found
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Try a different search term, or browse a popular category below.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 min-h-[44px] text-sm font-medium text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100 transition-colors mb-8 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            Clear all filters
          </button>
          <ul role="list" aria-label="Browse popular categories" className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto list-none p-0 m-0">
            {[
              { label: "Robot Vacuums", slug: "robot-vacuums" },
              { label: "Coffee Machines", slug: "coffee-machines" },
              { label: "Air Fryers", slug: "air-fryers" },
              { label: "Wireless Earbuds", slug: "wireless-earbuds" },
              { label: "Mattresses", slug: "mattresses" },
            ].map((cat) => (
              <li key={cat.slug}>
                <a
                  href={`/category/${cat.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] text-sm font-medium text-gray-700 bg-white border border-gray-500 rounded-full hover:border-brand-500 hover:text-brand-700 transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
                >
                  <svg aria-hidden="true" className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5" />
                  </svg>
                  {cat.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setFilter("page", safePage - 1)}
            aria-label="Go to previous page"
            className="px-3 py-2 min-h-[44px] text-sm font-medium rounded-xl border border-gray-500 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
          >
            Previous
          </button>
          <ul role="list" className="flex items-center gap-2 list-none p-0 m-0">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <li key={p}>
              <button
                type="button"
                onClick={() => setFilter("page", p)}
                aria-label={`Go to page ${p}`}
                aria-current={p === safePage ? "page" : undefined}
                className={`w-11 h-11 text-sm font-medium rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 ${
                  p === safePage
                    ? "bg-brand-600 text-white"
                    : "border border-gray-500 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            </li>
          ))}
          </ul>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setFilter("page", safePage + 1)}
            aria-label="Go to next page"
            className="px-3 py-2 min-h-[44px] text-sm font-medium rounded-xl border border-gray-500 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
