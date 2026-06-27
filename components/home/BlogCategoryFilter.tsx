"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/types";

interface Props {
  posts: BlogPost[];
}

export function BlogCategoryFilter({ posts }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Derive unique categories from posts
  const categories = Array.from(
    new Map(
      posts.map((p) => [p.categorySlug, { slug: p.categorySlug, name: p.categoryName }])
    ).values()
  );

  const filtered =
    activeCategory === "all"
      ? posts
      : posts.filter((p) => p.categorySlug === activeCategory);

  return (
    <>
      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeCategory === "all"
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-white border border-gray-200 text-gray-600 hover:border-brand-200 hover:text-brand-700"
          }`}
        >
          All ({posts.length})
        </button>
        {categories.map((cat) => {
          const count = posts.filter((p) => p.categorySlug === cat.slug).length;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.slug
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-brand-200 hover:text-brand-700"
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Post grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all"
          >
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
                  <span className="text-5xl opacity-30">{post.categoryName?.[0] ?? "📖"}</span>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="text-xs font-semibold text-brand-700 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                  {post.categoryName}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-gray-400">{post.readingTime} min read</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors mb-2 line-clamp-2">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="text-sm font-medium text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Read more &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No posts in this category yet.</p>
        </div>
      )}
    </>
  );
}
