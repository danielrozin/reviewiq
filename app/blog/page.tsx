import { getAllBlogPosts } from "@/data/blog-posts";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { blogListSchema, breadcrumbSchema } from "@/lib/schema/jsonld";
import { BlogCategoryFilter } from "@/components/home/BlogCategoryFilter";

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([{ name: "Blog", url: "/blog" }])),
        }}
      />
      <Breadcrumbs items={[{ name: "Blog", url: "/blog" }]} />

      <div className="mt-8 mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          ReviewIQ Blog
        </h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          Expert buying guides, product comparisons, and review insights —
          all backed by real owner data and AI-powered analysis.
        </p>
      </div>

      <BlogCategoryFilter posts={posts} />
    </div>
  );
}
