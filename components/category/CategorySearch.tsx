"use client";

import { useState } from "react";
import Link from "next/link";
import type { Category } from "@/types";

interface CategorySearchProps {
  categories: Category[];
}

export function CategorySearch({ categories }: CategorySearchProps) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase())
      )
    : categories;

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-8 max-w-md">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search categories…"
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
          aria-label="Search categories"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results count when filtering */}
      {query && (
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length === 0
            ? "No categories match your search"
            : `${filtered.length} categor${filtered.length === 1 ? "y" : "ies"} found`}
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-brand-100 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-4xl group-hover:scale-110 transition-transform duration-200 inline-block">
                {cat.icon}
              </span>
              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                {cat.productCount} products
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 group-hover:text-brand-600 transition-colors mb-2">
              {cat.name}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
              {cat.description}
            </p>
            <div className="flex items-center gap-1.5 text-sm font-medium text-brand-600 group-hover:gap-2.5 transition-all">
              <span>Explore reviews</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-gray-500 text-sm">Try a different search — or <button onClick={() => setQuery("")} className="text-brand-600 hover:underline">browse all categories</button></p>
        </div>
      )}
    </div>
  );
}
