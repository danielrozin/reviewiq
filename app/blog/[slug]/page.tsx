import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllBlogPosts, getBlogPostBySlug, getBlogPostsByCategory } from "@/data/blog-posts";
import { getProductsByCategory, getAffinityProducts } from "@/data/products";
import { getAffinityCategorySlugs } from "@/data/category-affinity";
import { getCategoryBySlug } from "@/data/categories";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { blogPostSchema, faqSchema } from "@/lib/schema/jsonld";

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://smartreview.com";

  return {
    title: post.seo.metaTitle,
    description: post.seo.metaDescription,
    alternates: { canonical: `${siteUrl}/blog/${post.slug}` },
    openGraph: {
      title: post.seo.metaTitle,
      description: post.seo.metaDescription,
      url: `${siteUrl}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo.metaTitle,
      description: post.seo.metaDescription,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = getBlogPostsByCategory(post.categorySlug).filter(
    (p) => p.slug !== post.slug
  );
  const categoryProducts = getProductsByCategory(post.categorySlug).slice(0, 4);
  const crossCategoryProducts = getAffinityProducts(post.categorySlug, undefined, 4);
  const affinitySlugs = getAffinityCategorySlugs(post.categorySlug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostSchema(post)),
        }}
      />
      {post.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema(post.faq)),
          }}
        />
      )}

      <Breadcrumbs
        items={[
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` },
        ]}
      />

      <article className="mt-8 max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href={`/category/${post.categorySlug}`}
              className="text-sm font-medium text-brand-600 bg-brand-50 px-3 py-1 rounded-full hover:bg-brand-100 transition-colors"
            >
              {post.categoryName}
            </Link>
            <span className="text-sm text-gray-400">
              {post.readingTime} min read
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
              <span className="text-brand-600 font-bold text-sm">SR</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {post.author.name}
              </p>
              <p className="text-xs text-gray-400">
                Published{" "}
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                {post.updatedAt !== post.publishedAt && (
                  <>
                    {" "}
                    &middot; Updated{" "}
                    {new Date(post.updatedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </>
                )}
              </p>
            </div>
          </div>
        </header>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-brand-600 prose-strong:text-gray-900 prose-li:text-gray-600 prose-table:text-sm"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
        />

        {/* FAQ Section */}
        {post.faq.length > 0 && (
          <section className="mt-12 border-t border-gray-100 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {post.faq.map((item, i) => (
                <details
                  key={i}
                  className="group bg-gray-50 rounded-xl p-4"
                >
                  <summary className="font-medium text-gray-900 cursor-pointer list-none flex items-center justify-between">
                    {item.question}
                    <svg
                      className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </summary>
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {categoryProducts.length > 0 && (
          <section className="mt-12 border-t border-gray-100 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Top {post.categoryName} on ReviewIQ
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoryProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/category/${product.categorySlug}/${product.slug}`}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-100 shrink-0">
                    <span className="text-lg font-bold text-brand-600">
                      {product.smartScore}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${product.priceRange.min}–${product.priceRange.max} &middot;{" "}
                      {product.reviewCount} reviews
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Cross-Category Products — Affinity Linking */}
        {crossCategoryProducts.length > 0 && (
          <section className="mt-12 border-t border-gray-100 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              You Might Also Like
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Top-rated products in related categories
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {crossCategoryProducts.map((product) => {
                const cat = getCategoryBySlug(product.categorySlug);
                return (
                  <Link
                    key={product.id}
                    href={`/category/${product.categorySlug}/${product.slug}`}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-100 shrink-0">
                      <span className="text-lg font-bold text-brand-600">
                        {product.smartScore}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="text-brand-500 font-medium">{cat?.name}</span>
                        {" "}&middot; ${product.priceRange.min}&ndash;${product.priceRange.max}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
            {affinitySlugs.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {affinitySlugs.slice(0, 3).map((s) => {
                  const cat = getCategoryBySlug(s);
                  if (!cat) return null;
                  return (
                    <Link
                      key={s}
                      href={`/category/${s}`}
                      className="text-xs text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-full font-medium transition-colors"
                    >
                      Explore {cat.name} &rarr;
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Related Blog Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12 border-t border-gray-100 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/blog/${rp.slug}`}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                    {rp.categoryName}
                  </span>
                  <p className="font-medium text-gray-900 mt-2">{rp.title}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {rp.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}

function markdownToHtml(md: string): string {
  let html = md;

  // Convert markdown tables
  html = html.replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)*)/gm, (_match, header, _sep, body) => {
    const headers = header.split("|").filter((c: string) => c.trim()).map((c: string) => `<th class="px-4 py-2 text-left font-medium text-gray-900 bg-gray-50">${c.trim()}</th>`).join("");
    const rows = body.trim().split("\n").map((row: string) => {
      const cells = row.split("|").filter((c: string) => c.trim()).map((c: string) => `<td class="px-4 py-2 border-t border-gray-100">${c.trim()}</td>`).join("");
      return `<tr>${cells}</tr>`;
    }).join("");
    return `<div class="overflow-x-auto my-6"><table class="w-full border border-gray-200 rounded-lg overflow-hidden"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
  });

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-8 mb-3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand-600 hover:underline">$1</a>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>');
  html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul class="list-disc pl-4 my-4 space-y-1">$1</ul>');

  // Paragraphs
  html = html.replace(/^(?!<[hultd]|<\/|<div|<a)(.+)$/gm, '<p class="my-4">$1</p>');

  // Clean up empty paragraphs
  html = html.replace(/<p class="my-4"><\/p>/g, "");

  return html;
}
