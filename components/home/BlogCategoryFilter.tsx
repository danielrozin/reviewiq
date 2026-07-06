"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/types";

interface Props {
  posts: BlogPost[];
}

export function BlogCategoryFilter({ posts }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const tablistRef = useRef<HTMLDivElement>(null);

  // Derive unique categories from posts
  const categories = Array.from(
    new Map(
      posts.map((p) => [p.categorySlug, { slug: p.categorySlug, name: p.categoryName }])
    ).values()
  );

  const allSlugs = ["all", ...categories.map((c) => c.slug)];

  const filtered =
    activeCategory === "all"
      ? posts
      : posts.filter((p) => p.categorySlug === activeCategory);

  function handleTabKeyDown(e: React.KeyboardEvent) {
    const idx = allSlugs.indexOf(activeCategory);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = allSlugs[(idx + 1) % allSlugs.length];
      setActiveCategory(next);
      (tablistRef.current?.querySelector(`[id="blog-tab-${next}"]`) as HTMLButtonElement | null)?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = allSlugs[(idx - 1 + allSlugs.length) % allSlugs.length];
      setActiveCategory(prev);
      (tablistRef.current?.querySelector(`[id="blog-tab-${prev}"]`) as HTMLButtonElement | null)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveCategory("all");
      (tablistRef.current?.querySelector('[id="blog-tab-all"]') as HTMLButtonElement | null)?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const last = allSlugs[allSlugs.length - 1];
      setActiveCategory(last);
      (tablistRef.current?.querySelector(`[id="blog-tab-${last}"]`) as HTMLButtonElement | null)?.focus();
    }
  }

  return (
    <>
      {/* Category filter tabs */}
      <div ref={tablistRef} role="tablist" aria-label="Filter posts by category" className="flex flex-wrap gap-2 mb-8" onKeyDown={handleTabKeyDown}>
        <button
          id="blog-tab-all"
          type="button"
          role="tab"
          aria-selected={activeCategory === "all"}
          aria-controls="blog-post-list"
          tabIndex={activeCategory === "all" ? 0 : -1}
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-3 rounded-full text-sm font-medium transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${
            activeCategory === "all"
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-white border border-gray-400 text-gray-600 hover:border-brand-200 hover:text-brand-700"
          }`}
        >
          All ({posts.length})
        </button>
        {categories.map((cat) => {
          const count = posts.filter((p) => p.categorySlug === cat.slug).length;
          return (
            <button
              key={cat.slug}
              id={`blog-tab-${cat.slug}`}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.slug}
              aria-controls="blog-post-list"
              tabIndex={activeCategory === cat.slug ? 0 : -1}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-3 rounded-full text-sm font-medium transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${
                activeCategory === cat.slug
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-white border border-gray-400 text-gray-600 hover:border-brand-200 hover:text-brand-700"
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Post grid */}
      <div
        id="blog-post-list"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby={`blog-tab-${activeCategory}`}
        aria-label={`Blog posts${activeCategory !== "all" ? ` in ${categories.find(c => c.slug === activeCategory)?.name ?? activeCategory}` : ""}: ${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 rounded-lg"
      >
      <ul role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((post) => (
          <li key={post.id}>
          <Link
            href={`/blog/${post.slug}`}
            aria-label={`Read: ${post.title} — ${post.readingTime} min read`}
            className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-brand-200 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
          >
            <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
              {post.coverImage ? (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
                  <svg aria-hidden="true" className="w-12 h-12 text-brand-200" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="text-xs font-semibold text-brand-700 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                  {post.categoryName}
                </span>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors mb-2 line-clamp-2 leading-snug">
                {post.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 flex-1 mb-4">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-2.5 pt-3 border-t border-gray-50">
                <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-brand-600">
                    {post.author.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <span className="text-xs text-gray-600 flex-1 truncate">{post.author.name}</span>
                <span aria-hidden="true" className="text-gray-200 text-xs shrink-0">·</span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-600 shrink-0">
                  <svg aria-hidden="true" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  {post.readingTime} min
                </span>
              </div>
            </div>
          </Link>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          <p className="text-lg">No posts in this category yet.</p>
        </div>
      )}
      </div>
    </>
  );
}
