import Link from "next/link";
import Image from "next/image";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { getTrendingDiscussions } from "@/data/discussions";
import { getRecentBlogPosts } from "@/data/blog-posts";
import { getUserById } from "@/data/users";
import { SmartScore } from "@/components/ui/SmartScore";
import { THREAD_TYPE_LABELS, THREAD_TYPE_COLORS } from "@/types";
import { formatNumber } from "@/lib/utils";
import { HomeOnboardingSection } from "@/components/onboarding/HomeOnboardingSection";
import { buildMetadata } from "@/lib/seo/metadata";
import { homePageSchema, categoryListSchema, productListSchema } from "@/lib/schema/jsonld";
import { HeroSearch } from "@/components/home/HeroSearch";
import { RecentlyViewedStrip } from "@/components/home/RecentlyViewedStrip";

export const metadata = buildMetadata({
  title: "AI-Powered Product Reviews & Comparisons",
  description:
    "ReviewIQ analyzes thousands of verified buyer reviews with AI to deliver SmartScores, honest summaries, and side-by-side comparisons across electronics, appliances, and more.",
  path: "/",
});

export default function HomePage() {
  const topProducts = [...products]
    .sort((a, b) => b.smartScore - a.smartScore)
    .slice(0, 6);

  const trendingDiscussions = getTrendingDiscussions(4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryListSchema(categories)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema(topProducts, "Top Rated Products")) }}
      />
      {/* Hero Section */}
      <section aria-labelledby="hero-heading" className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50/30 to-white">
        {/* Subtle background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 -right-20 w-96 h-96 rounded-full bg-brand-100/40 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-blue-100/30 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-medium mb-6 animate-fade-in border border-brand-100">
              <span aria-hidden="true" className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
              AI-Powered Review Intelligence
            </div>
            <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6 animate-fade-up">
              Reviews you can{" "}
              <span className="text-brand-600">actually trust</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto animate-fade-up delay-100" data-speakable="hero-tagline">
              AI-powered product reviews for smart buyers. Honest data. Verified buyers. No affiliate bias.
            </p>
            <div className="flex justify-center mb-8 animate-fade-up delay-200">
              <HeroSearch />
            </div>

            {/* ICP Persona Tiles — helps AI engines understand who this serves */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-2xl mx-auto text-left animate-fade-up delay-300">
              {[
                { icon: "🐾", label: "Pet owner?", desc: "Robot vacuums for pet hair", href: "/category/robot-vacuums" },
                { icon: "🛍️", label: "First-time buyer?", desc: "Buying guides", href: "/categories" },
                { icon: "💰", label: "Budget-conscious?", desc: "Best value picks", href: "/categories" },
                { icon: "☕", label: "Coffee enthusiast?", desc: "Coffee machine reviews", href: "/category/coffee-machines" },
              ].map((tile) => (
                <Link
                  key={tile.href + tile.label}
                  href={tile.href}
                  aria-label={`${tile.label} ${tile.desc}`}
                  className="group p-3 bg-white/80 hover:bg-white border border-gray-200/80 hover:border-brand-200 hover:shadow-sm rounded-xl transition-all text-sm backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
                >
                  <span aria-hidden="true" className="text-xl block mb-1">{tile.icon}</span>
                  <p className="font-semibold text-gray-800 group-hover:text-brand-600 leading-tight">{tile.label}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{tile.desc}</p>
                </Link>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up delay-400">
              <Link
                href="/categories"
                className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm hover:shadow-md text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
              >
                Browse Categories
              </Link>
              <Link
                href="/how-it-works"
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
              >
                How It Works
              </Link>
            </div>

            {/* Hero social proof — above fold trust nudge */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 animate-fade-up delay-500">
              <div className="flex items-center gap-2">
                {/* Avatar stack */}
                <div aria-hidden="true" className="flex -space-x-2">
                  {["bg-brand-400", "bg-emerald-400", "bg-amber-400", "bg-pink-400", "bg-purple-400"].map((color, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full ${color} ring-2 ring-white flex items-center justify-center text-white text-xs font-bold`}>
                      {["JL", "SA", "MK", "TR", "PW"][i]}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">20,000+</span> verified reviews written
                </span>
              </div>
              <span aria-hidden="true" className="hidden sm:block text-gray-200">|</span>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <svg aria-hidden="true" className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.161c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.37-2.447a1 1 0 00-1.175 0l-3.37 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.064 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.285-3.958z"/></svg>
                <span className="font-semibold text-gray-800">4.8/5</span> avg product rating
              </div>
              <span aria-hidden="true" className="hidden sm:block text-gray-200">|</span>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <svg aria-hidden="true" className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="font-semibold text-gray-800">78%</span> verified buyers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding — Welcome Back / Quick Start */}
      <section aria-label="Getting started" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <HomeOnboardingSection />
      </section>

      {/* Recently Viewed — returns users to where they left off */}
      <RecentlyViewedStrip />

      {/* Trust Signals */}
      <section aria-label="Site statistics" className="border-y border-gray-100 bg-white" data-speakable="hero-stats">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                value: "20K+",
                label: "Verified Reviews",
                sublabel: "From real buyers",
                iconBg: "bg-brand-50",
                iconColor: "text-brand-600",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                value: "78%",
                label: "Verified Purchase Rate",
                sublabel: "Receipt-confirmed",
                iconBg: "bg-emerald-50",
                iconColor: "text-emerald-600",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                ),
              },
              {
                value: "500+",
                label: "Products Analyzed",
                sublabel: "Across 10 categories",
                iconBg: "bg-amber-50",
                iconColor: "text-amber-600",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
              },
              {
                value: "2.4K",
                label: "Community Members",
                sublabel: "Active discussions",
                iconBg: "bg-purple-50",
                iconColor: "text-purple-600",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                ),
              },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col sm:flex-row sm:items-center gap-3 group">
                <div aria-hidden="true" className={`w-10 h-10 rounded-xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center shrink-0`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors leading-none">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-gray-700 mt-0.5">{stat.label}</p>
                  <p className="text-xs text-gray-600">{stat.sublabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section aria-labelledby="browse-categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 id="browse-categories" className="text-2xl font-bold text-gray-900">
              Browse by Category
            </h2>
            <p className="text-gray-600 mt-1">
              Deep product intelligence across popular categories
            </p>
          </div>
          <Link
            href="/categories"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 hidden sm:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:border-brand-100 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
            >
              <span aria-hidden="true" className="text-3xl mb-3 block group-hover:scale-110 transition-transform duration-200 inline-block">{cat.icon}</span>
              <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {cat.productCount} products
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Rated Products */}
      <section aria-labelledby="top-rated-products" className="bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8">
            <h2 id="top-rated-products" className="text-2xl font-bold text-gray-900">
              Highest Rated Products
            </h2>
            <p className="text-gray-600 mt-1">
              Top SmartScores across all categories
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/category/${product.categorySlug}/${product.slug}`}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-brand-100 hover:-translate-y-0.5 transition-all duration-200 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
              >
                {/* Brand accent hover strip */}
                <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                {/* Product image */}
                <div className="relative h-44 bg-gray-50 overflow-hidden">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      priority={index < 3}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-black text-gray-200">
                        {product.brand[0]}
                      </span>
                    </div>
                  )}
                  {/* Winner badge */}
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-100">
                      <SmartScore score={product.smartScore} size="sm" showLabel={false} />
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-xs text-brand-600 font-semibold uppercase tracking-wider mb-0.5">
                    {product.brand}
                  </p>
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 flex-1 mb-3">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{formatNumber(product.reviewCount)} reviews</span>
                    <span className="text-gray-600 font-medium">
                      ${product.priceRange.min}–${product.priceRange.max}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Community Discussions */}
      <section aria-labelledby="trending-discussions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-medium mb-3">
              <span aria-hidden="true" className="w-2 h-2 bg-trust-green rounded-full animate-pulse" />
              Live Community
            </div>
            <h2 id="trending-discussions" className="text-2xl font-bold text-gray-900">
              Trending Discussions
            </h2>
            <p className="text-gray-600 mt-1">
              Real conversations from verified product owners
            </p>
          </div>
          <Link
            href="/community"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 hidden sm:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trendingDiscussions.map((thread) => {
            const author = getUserById(thread.authorId);
            const netVotes = thread.upvotes - thread.downvotes;

            return (
              <Link
                key={thread.id}
                href={`/community/thread/${thread.id}`}
                className="group flex gap-4 bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-gray-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
              >
                <div className="flex flex-col items-center shrink-0 min-w-9">
                  <svg aria-hidden="true" className={`w-4 h-4 mb-0.5 ${netVotes > 0 ? "text-brand-400" : "text-gray-300"}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <span className={`text-sm font-bold tabular-nums leading-none ${netVotes > 0 ? "text-brand-600" : "text-gray-600"}`}>
                    {formatNumber(netVotes)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${THREAD_TYPE_COLORS[thread.threadType]}`}>
                      {THREAD_TYPE_LABELS[thread.threadType]}
                    </span>
                    {thread.isResolved && (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        Resolved
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug mb-2">
                    {thread.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    {author && (
                      <span className="font-medium text-gray-600">
                        {author.displayName}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <svg aria-hidden="true" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 .978-.39 48.81 48.81 0 0 0 3.196-.218c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                      </svg>
                      {thread.commentCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg aria-hidden="true" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                      {formatNumber(thread.viewCount)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="text-center mt-6 sm:hidden">
          <Link
            href="/community"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
          >
            View all discussions →
          </Link>
        </div>
      </section>

      {/* Latest from the Blog */}
      <section aria-labelledby="buying-guides" className="bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 id="buying-guides" className="text-2xl font-bold text-gray-900">
                Buying Guides & Comparisons
              </h2>
              <p className="text-gray-600 mt-1">
                Expert insights backed by real owner data
              </p>
            </div>
            <Link
              href="/blog"
              className="text-sm font-medium text-brand-600 hover:text-brand-700 hidden sm:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
            >
              View all articles &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getRecentBlogPosts(3).map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-brand-100 hover:-translate-y-0.5 transition-all duration-200 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
              >
                <div className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="p-6 flex flex-col flex-1">
                <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full self-start">
                  {post.categoryName}
                </span>
                <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors mt-3 mb-2 line-clamp-2 flex-1 leading-snug">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2.5 pt-3 border-t border-gray-50">
                  <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-brand-600">
                      {post.author.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 truncate">{post.author.name}</span>
                  <span className="text-gray-200 text-xs">·</span>
                  <span className="text-xs text-gray-600 shrink-0">{post.readingTime} min</span>
                </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6 sm:hidden">
            <Link
              href="/blog"
              className="text-sm font-medium text-brand-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
            >
              View all articles &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Editor's Picks — featured spotlight with asymmetric layout */}
      <section aria-labelledby="editors-picks" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium mb-3 border border-amber-100">
              <svg aria-hidden="true" className="w-3.5 h-3.5 fill-current text-amber-600" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.161c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.37-2.447a1 1 0 00-1.175 0l-3.37 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.064 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.285-3.958z" />
              </svg>
              Editor&apos;s Picks
            </div>
            <h2 id="editors-picks" className="text-2xl font-bold text-gray-900">
              Staff-recommended this week
            </h2>
            <p className="text-gray-600 mt-1">
              Handpicked based on outstanding SmartScores and verified buyer consensus
            </p>
          </div>
          <Link
            href="/categories"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 hidden sm:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
          >
            Browse all &rarr;
          </Link>
        </div>

        {/* Asymmetric grid: 1 large featured + 2 smaller */}
        {(() => {
          const picks = [...topProducts].slice(0, 3);
          const [featured, ...rest] = picks;
          if (!featured) return null;
          return (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* Featured pick — takes 3/5 columns */}
              <Link
                href={`/category/${featured.categorySlug}/${featured.slug}`}
                className="group lg:col-span-3 relative bg-gradient-to-br from-brand-50 via-white to-blue-50 border border-brand-100 rounded-3xl overflow-hidden hover:shadow-xl hover:border-brand-200 transition-all duration-300 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
              >
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-600 text-white text-xs font-bold rounded-full shadow-sm">
                    <svg aria-hidden="true" className="w-3 h-3 fill-current text-amber-300 shrink-0" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.161c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.37-2.447a1 1 0 00-1.175 0l-3.37 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.064 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.285-3.958z" />
                    </svg>
                    #1 Pick
                  </span>
                </div>
                <div className="relative h-56 sm:h-72 overflow-hidden flex items-center justify-center bg-white/50">
                  {featured.image ? (
                    <Image
                      src={featured.image}
                      alt={featured.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-8xl font-black text-gray-200">{featured.brand[0]}</span>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-xs text-brand-600 font-bold uppercase tracking-wider mb-1">{featured.brand}</p>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors mb-2 leading-tight">
                    {featured.name}
                  </h3>
                  <p className="text-sm text-gray-600 flex-1 line-clamp-2 mb-4">
                    AI analysis of {formatNumber(featured.reviewCount)} verified reviews. Outperforms alternatives across noise reduction, battery life, and comfort.
                  </p>
                  <div className="flex items-center justify-between">
                    <SmartScore score={featured.smartScore} size="md" />
                    <span className="text-sm font-medium text-gray-600">
                      ${featured.priceRange.min}–${featured.priceRange.max}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Two smaller picks — take 2/5 columns */}
              <div className="lg:col-span-2 flex flex-col gap-5">
                {rest.map((product, i) => (
                  <Link
                    key={product.id}
                    href={`/category/${product.categorySlug}/${product.slug}`}
                    className="group flex-1 bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-200 flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
                  >
                    <div className="relative w-28 shrink-0 bg-gray-50 overflow-hidden">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="112px"
                          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-black text-gray-200">{product.brand[0]}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                            #{i + 2} Pick
                          </span>
                        </div>
                        <p className="text-xs text-brand-600 font-bold uppercase tracking-wider">{product.brand}</p>
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 mt-0.5">
                          {product.name}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <SmartScore score={product.smartScore} size="sm" showLabel={false} />
                        <span className="text-xs text-gray-600">{formatNumber(product.reviewCount)} reviews</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      {/* How It Works */}
      <section aria-labelledby="how-reviewiq-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 id="how-reviewiq-works" className="text-2xl font-bold text-gray-900">
            How ReviewIQ Works
          </h2>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto">
            We built a review platform you can actually trust.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector lines on desktop */}
          <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-brand-100 via-brand-200 to-brand-100 pointer-events-none" aria-hidden="true" />

          {[
            {
              step: "01",
              iconBg: "bg-emerald-50",
              iconColor: "text-emerald-600",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 01.04 11.07c-.01.206-.01.41 0 .617A12.003 12.003 0 006 21.43a12 12 0 009.96-9.743c.01-.206.01-.41 0-.617A11.95 11.95 0 0020.402 6a11.959 11.959 0 01-8.402-3.036z" />
                </svg>
              ),
              title: "Verified Reviews Only",
              description:
                "Every review shows a verification tier — from receipt uploads to retailer verification. You always know how trustworthy a review is.",
            },
            {
              step: "02",
              iconBg: "bg-brand-50",
              iconColor: "text-brand-600",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              ),
              title: "AI-Powered Analysis",
              description:
                "Our AI reads thousands of reviews to surface recurring praise, complaints, and patterns that individual reviews miss.",
            },
            {
              step: "03",
              iconBg: "bg-purple-50",
              iconColor: "text-purple-600",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              ),
              title: "Structured Intelligence",
              description:
                'No walls of text. Every product shows clear "Best For / Not For" signals, recurring issues, and comparison insights.',
            },
          ].map((item) => (
            <div key={item.step} className="text-center relative">
              <div aria-hidden="true" className={`w-20 h-20 ${item.iconBg} ${item.iconColor} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm`}>
                {item.icon}
              </div>
              <span className="text-xs font-bold text-gray-600 tracking-widest uppercase mb-1 block">{item.step}</span>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section aria-labelledby="join-cta" className="bg-brand-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 id="join-cta" className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Join the conversation
          </h2>
          <p className="text-brand-200 max-w-xl mx-auto mb-6">
            Help others make smarter buying decisions. Write reviews, share your
            experience, and participate in product discussions with a community
            that values truth over hype.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/write-review"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-brand-600 font-semibold rounded-xl hover:bg-brand-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
            >
              Write a Review
            </Link>
            <Link
              href="/community"
              className="w-full sm:w-auto px-8 py-3.5 bg-brand-500 text-white font-semibold rounded-xl border border-brand-400 hover:bg-brand-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-500"
            >
              Join Community
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
