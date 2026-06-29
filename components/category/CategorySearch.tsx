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
          aria-hidden="true"
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
          className="w-full pl-10 pr-4 py-2.5 border border-gray-400 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
          aria-label="Search categories"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results count — always in DOM so aria-live is registered before first change */}
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`text-sm text-gray-600 ${query ? "mb-4" : ""}`}
      >
        {query
          ? filtered.length === 0
            ? "No categories match your search"
            : `${filtered.length} categor${filtered.length === 1 ? "y" : "ies"} found`
          : ""}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-brand-200 hover:-translate-y-0.5 transition-all duration-200"
          >
            {/* Hover accent strip */}
            <div className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <span className="text-4xl group-hover:scale-110 transition-transform duration-200 inline-block">
                {cat.icon}
              </span>
              <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-1 rounded-full">
                {cat.productCount} products
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 group-hover:text-brand-600 transition-colors mb-2">
              {cat.name}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
              {cat.description}
            </p>
            <div className="flex items-center gap-1.5 text-sm font-medium text-brand-600">
              <span>Explore reviews</span>
              <svg aria-hidden="true" className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 px-6 bg-white border border-gray-100 rounded-2xl">
          <div aria-hidden="true" className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg aria-hidden="true" className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">No categories found</p>
          <p className="text-xs text-gray-500 mb-3">Try a different search term</p>
          <button type="button" onClick={() => setQuery("")} className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 bg-brand-50 px-3 py-1.5 rounded-xl hover:bg-brand-100 transition-colors">
            <svg aria-hidden="true" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
            Browse all categories
          </button>
        </div>
      )}
    </div>
  );
}
