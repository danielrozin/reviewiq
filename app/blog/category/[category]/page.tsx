import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getBlogPostsByCategory,
  getBlogCategories,
} from "@/data/blog-posts";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { blogListSchema } from "@/lib/schema/jsonld";

export function generateStaticParams() {
  return getBlogCategories().map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categories = getBlogCategories();
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return {};

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://smartreview.com";

  return {
    title: `${cat.name} Buying Guides & Reviews | SmartReview Blog`,
    description: `Expert buying guides, comparisons, and review insights for ${cat.name}. Data-backed recommendations from real owner reviews.`,
    alternates: { canonical: `${siteUrl}/blog/category/${cat.slug}` },
    openGraph: {
      title: `${cat.name} Buying Guides & Reviews | SmartReview Blog`,
      description: `Expert buying guides, comparisons, and review insights for ${cat.name}. Data-backed recommendations from real owner reviews.`,
      url: `${siteUrl}/blog/category/${cat.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${cat.name} Buying Guides & Reviews`,
      description: `Expert buying guides, comparisons, and review insights for ${cat.name}.`,
    },
  };
}

const categoryEmoji: Record<string, string> = {
  Mattresses: "\uD83D\uDECF\uFE0F",
  "Coffee Machines": "\u2615",
  "Air Fryers": "\uD83C\uDF5F",
  "Robot Vacuums": "\uD83E\uDD16",
  "Wireless Earbuds": "\uD83C\uDFA7",
  "Smart Watches": "\u231A",
  "Standing Desks": "\uD83E\uDE91",
  Blenders: "\uD83E\uDD64",
  Laptops: "\uD83D\uDCBB",
  "Electric Toothbrushes": "\uD83E\uDEB9",
};

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categories = getBlogCategories();
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  const posts = getBlogPostsByCategory(category);
  if (posts.length === 0) notFound();

  const emoji = categoryEmoji[cat.name] || "\uD83D\uDCDD";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogListSchema(posts)),
        }}
      />
      <Breadcrumbs
        items={[
          { name: "Blog", url: "/blog" },
          { name: cat.name, url: `/blog/category/${cat.slug}` },
        ]}
      />

      <div className="mt-8 mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          {emoji} {cat.name} — Guides & Reviews
        </h1>
        <p className="text-gray-500 mt-2 max-w-2xl">
          Expert buying guides, in-depth comparisons, and review insights for{" "}
          {cat.name.toLowerCase()} — backed by real owner data and AI analysis.
        </p>

        {/* Category navigation */}
        <div className="flex flex-wrap gap-2 mt-6">
          <Link
            href="/blog"
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/blog/category/${c.slug}`}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                c.slug === category
                  ? "bg-brand-600 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all"
          >
            {post.coverImage && (
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
                  <span className="text-4xl opacity-40">{emoji}</span>
                </div>
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded-full">
                  {post.categoryName}
                </span>
                <span className="text-xs text-gray-400">
                  {post.readingTime} min read
                </span>
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

      {/* Link to product category */}
      <div className="mt-12 p-6 bg-gray-50 rounded-2xl text-center">
        <p className="text-gray-600 mb-3">
          Looking for specific product reviews?
        </p>
        <Link
          href={`/category/${category}`}
          className="inline-flex items-center gap-2 text-brand-600 font-medium hover:underline"
        >
          Browse all {cat.name} reviews &rarr;
        </Link>
      </div>
    </div>
  );
}
