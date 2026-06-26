import Link from "next/link";
import Image from "next/image";
import { getAllBlogPosts } from "@/data/blog-posts";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { blogListSchema } from "@/lib/schema/jsonld";

export const metadata = buildMetadata({
  title: "Blog — Buying Guides, Comparisons & Expert Reviews",
  description:
    "Expert buying guides, in-depth product comparisons, and review insights backed by real owner data. Make smarter purchase decisions with ReviewIQ.",
  path: "/blog",
});

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogListSchema(posts)),
        }}
      />
      <Breadcrumbs items={[{ name: "Blog", url: "/blog" }]} />

      <div className="mt-8 mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          ReviewIQ Blog
        </h1>
        <p className="text-gray-500 mt-2 max-w-2xl">
          Expert buying guides, product comparisons, and review insights —
          all backed by real owner data and AI-powered analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
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
              {/* Category overlay pill */}
              <div className="absolute top-3 left-3">
                <span className="text-xs font-semibold text-brand-700 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                  {post.categoryName}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
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
    </div>
  );
}
