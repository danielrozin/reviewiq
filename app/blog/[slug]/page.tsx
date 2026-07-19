import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getAllBlogPosts, getBlogPostBySlug, getBlogPostsByCategory } from "@/data/blog-posts";
import { getProductsByCategory, getAffinityProducts } from "@/data/products";
import { getAffinityCategorySlugs } from "@/data/category-affinity";
import { getCategoryBySlug } from "@/data/categories";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { blogPostSchema, faqSchema, blogPostSpeakableSchema, productListSchema, breadcrumbSchema } from "@/lib/schema/jsonld";
import { BlogTableOfContents, type TocHeading } from "@/components/home/BlogTableOfContents";
import { FeedbackWidget } from "@/components/ui/FeedbackWidget";

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

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
      images: [{ url: post.coverImage || `${siteUrl}/opengraph-image`, width: 1200, height: 630, alt: post.seo.metaTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo.metaTitle,
      description: post.seo.metaDescription,
      images: [post.coverImage || `${siteUrl}/opengraph-image`],
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
  const tocHeadings = extractHeadings(post.content);
  const categoryProducts = getProductsByCategory(post.categorySlug).slice(0, 4);
  const crossCategoryProducts = getAffinityProducts(post.categorySlug, undefined, 4);
  const affinitySlugs = getAffinityCategorySlugs(post.categorySlug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostSchema(post)),
        }}
      />
      {post.faq && post.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema(post.faq, `/blog/${post.slug}`)),
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostSpeakableSchema(post.title, `/blog/${post.slug}`, post.publishedAt, post.updatedAt)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: "Blog", url: "/blog" },
            { name: post.title, url: `/blog/${post.slug}` },
          ])),
        }}
      />

      <div className="mt-8 max-w-6xl mx-auto lg:flex lg:gap-10 lg:items-start">
        {tocHeadings.length >= 2 && (
          <aside aria-label="Table of contents" className="hidden lg:block lg:w-56 xl:w-64 shrink-0 sticky top-24 self-start">
            <BlogTableOfContents headings={tocHeadings} />
          </aside>
        )}
      <article className="flex-1 min-w-0 max-w-4xl" aria-labelledby="blog-post-title">
        {/* Cover image */}
        {post.coverImage && (
          <div className="relative aspect-[2/1] rounded-2xl overflow-hidden mb-8 bg-gray-100">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href={`/category/${post.categorySlug}`}
              className="text-sm font-medium text-brand-600 bg-brand-50 px-3 py-1 rounded-full hover:bg-brand-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
            >
              {post.categoryName}
            </Link>
            <span className="text-sm text-gray-600">
              {post.readingTime} min read
            </span>
          </div>
          <h1 id="blog-post-title" className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4" data-speakable="blog-headline">
            {post.title}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed" data-speakable="blog-intro">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
            <div aria-hidden="true" className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
              <span className="text-brand-600 font-bold text-sm">SR</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {post.author.name}
              </p>
              <p className="text-xs text-gray-600">
                Published{" "}
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
                {post.updatedAt !== post.publishedAt && (
                  <>
                    {" "}
                    &middot; Updated{" "}
                    <time dateTime={post.updatedAt}>
                      {new Date(post.updatedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  </>
                )}
              </p>
            </div>
          </div>
        </header>

        {/* Tags */}
        <ul role="list" aria-label="Tags" className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <li
              key={tag}
              className="text-xs text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full"
            >
              {tag}
            </li>
          ))}
        </ul>

        {/* Content */}
        <div
          data-speakable="blog-body"
          className="prose prose-lg max-w-prose prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-brand-600 prose-strong:text-gray-900 prose-li:text-gray-600 prose-table:text-sm"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
        />

        {/* FAQ Section */}
        {post.faq.length > 0 && (
          <section aria-labelledby="blog-faqs-heading" className="mt-12 border-t border-gray-100 pt-8">
            <div className="flex items-center gap-3 mb-6">
              <div aria-hidden="true" className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                <svg aria-hidden="true" className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <h2 id="blog-faqs-heading" className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-3">
              {post.faq.map((item, i) => (
                <details
                  key={i}
                  className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors"
                >
                  <summary className="font-medium text-gray-900 cursor-pointer list-none flex items-center justify-between gap-4 px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-inset">
                    <span>{item.question}</span>
                    <svg
                      aria-hidden="true"
                      className="w-5 h-5 text-gray-500 group-open:rotate-180 motion-safe:transition-transform shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <p data-speakable="faq-answer" className="mt-3 text-gray-600 leading-relaxed text-sm">
                      {item.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {categoryProducts.length > 0 && (
          <section aria-labelledby="blog-top-products-heading" className="mt-12 border-t border-gray-100 pt-8">
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema(categoryProducts, post.categoryName, post.categorySlug)) }}
            />
            <div className="flex items-center gap-2.5 mb-6">
              <div aria-hidden="true" className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                <svg aria-hidden="true" className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
              </div>
              <h2 id="blog-top-products-heading" className="text-2xl font-bold text-gray-900">Top {post.categoryName} on ReviewIQ</h2>
            </div>
            <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 m-0">
              {categoryProducts.map((product) => (
                <li key={product.id}>
                <Link
                  href={`/category/${product.categorySlug}/${product.slug}`}
                  aria-label={`${product.name} — SmartScore ${product.smartScore}`}
                  className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-brand-200 hover:shadow-sm motion-safe:hover:-translate-y-0.5 motion-safe:transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
                >
                  <div
                    aria-label={`SmartScore ${product.smartScore}`}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-base ${
                    product.smartScore >= 85 ? "bg-emerald-50 text-emerald-700" :
                    product.smartScore >= 70 ? "bg-brand-50 text-brand-700" :
                    product.smartScore >= 55 ? "bg-amber-50 text-amber-700" :
                    "bg-gray-50 text-gray-600"
                  }`}>
                    <span aria-hidden="true">{product.smartScore}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      ${product.priceRange.min}–${product.priceRange.max} <span aria-hidden="true">&middot;</span>{" "}
                      {product.reviewCount} reviews
                    </p>
                  </div>
                  <svg aria-hidden="true" className="w-4 h-4 text-gray-400 group-hover:text-brand-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Cross-Category Products — Affinity Linking */}
        {crossCategoryProducts.length > 0 && (
          <section aria-labelledby="blog-also-like-heading" className="mt-12 border-t border-gray-100 pt-8">
            <h2 id="blog-also-like-heading" className="text-2xl font-bold text-gray-900 mb-1">
              You Might Also Like
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Top-rated products in related categories
            </p>
            <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 m-0">
              {crossCategoryProducts.map((product) => {
                const cat = getCategoryBySlug(product.categorySlug);
                return (
                  <li key={product.id}>
                  <Link
                    href={`/category/${product.categorySlug}/${product.slug}`}
                    aria-label={`${product.name} — ${cat?.name ?? product.categorySlug}, SmartScore ${product.smartScore}`}
                    className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-brand-200 hover:shadow-sm motion-safe:hover:-translate-y-0.5 motion-safe:transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
                  >
                    <div
                      aria-label={`SmartScore ${product.smartScore}`}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-base ${
                      product.smartScore >= 85 ? "bg-emerald-50 text-emerald-700" :
                      product.smartScore >= 70 ? "bg-brand-50 text-brand-700" :
                      product.smartScore >= 55 ? "bg-amber-50 text-amber-700" :
                      "bg-gray-50 text-gray-600"
                    }`}>
                      <span aria-hidden="true">{product.smartScore}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        <span className="text-brand-600 font-medium"><span aria-hidden="true">{cat?.icon} </span>{cat?.name}</span>
                        {" "}<span aria-hidden="true">&middot;</span> ${product.priceRange.min}–${product.priceRange.max}
                      </p>
                    </div>
                    <svg aria-hidden="true" className="w-4 h-4 text-gray-400 group-hover:text-brand-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                  </li>
                );
              })}
            </ul>
            {affinitySlugs.length > 0 && (
              <ul role="list" className="flex flex-wrap gap-2 mt-4 list-none p-0 m-0">
                {affinitySlugs.slice(0, 3).map((s) => {
                  const cat = getCategoryBySlug(s);
                  if (!cat) return null;
                  return (
                    <li key={s}>
                      <Link
                        href={`/category/${s}`}
                        className="text-xs text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
                      >
                        Explore {cat.name} <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {/* Related Blog Posts */}
        {relatedPosts.length > 0 && (
          <section aria-labelledby="blog-related-articles-heading" className="mt-12 border-t border-gray-100 pt-8">
            <h2 id="blog-related-articles-heading" className="text-2xl font-bold text-gray-900 mb-6">
              Related Articles
            </h2>
            <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 m-0">
              {relatedPosts.map((rp) => (
                <li key={rp.id}>
                <Link
                  href={`/blog/${rp.slug}`}
                  className="group p-5 bg-white border border-gray-100 rounded-xl hover:border-brand-200 hover:shadow-sm motion-safe:hover:-translate-y-0.5 motion-safe:transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
                >
                  <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                    {rp.categoryName}
                  </span>
                  <p className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors mt-3 leading-snug">
                    {rp.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                    {rp.excerpt}
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-xs text-brand-600 font-medium sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 motion-safe:transition-opacity">
                    Read article
                    <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {/* Feedback */}
        <div className="mt-10 pt-6 border-t border-gray-100">
          <FeedbackWidget context={`blog:${post.slug}`} />
        </div>
      </article>
      </div>
    </div>
  );
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function extractHeadings(md: string): TocHeading[] {
  const headings: TocHeading[] = [];
  for (const line of md.split("\n")) {
    const h2 = line.match(/^## (.+)$/);
    const h3 = line.match(/^### (.+)$/);
    if (h2) headings.push({ id: slugify(h2[1]), text: h2[1], level: 2 });
    else if (h3) headings.push({ id: slugify(h3[1]), text: h3[1], level: 3 });
  }
  return headings;
}

function markdownToHtml(md: string): string {
  let html = md;

  // Convert markdown tables
  html = html.replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)*)/gm, (_match, header, _sep, body) => {
    const colNames = header.split("|").filter((c: string) => c.trim()).map((c: string) => c.trim());
    const captionText = colNames.join(", ");
    const headers = colNames.map((c: string) => `<th scope="col" class="px-4 py-2 text-left font-medium text-gray-900 bg-gray-50">${c}</th>`).join("");
    const rows = body.trim().split("\n").map((row: string) => {
      const cells = row.split("|").filter((c: string) => c.trim()).map((c: string) => `<td class="px-4 py-2 border-t border-gray-100">${c.trim()}</td>`).join("");
      return `<tr>${cells}</tr>`;
    }).join("");
    return `<div class="overflow-x-auto my-6"><table class="w-full border border-gray-200 rounded-lg overflow-hidden"><caption class="sr-only">${captionText}</caption><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
  });

  // Headers — add tabIndex=-1 + id for TOC anchor targeting (WCAG 2.4.1)
  html = html.replace(/^### (.+)$/gm, (_m, t) => `<h3 id="${slugify(t)}" tabindex="-1" class="text-xl font-semibold text-gray-900 mt-8 mb-3 scroll-mt-20 focus-visible:outline-none">${t}</h3>`);
  html = html.replace(/^## (.+)$/gm, (_m, t) => `<h2 id="${slugify(t)}" tabindex="-1" class="text-2xl font-bold text-gray-900 mt-10 mb-4 scroll-mt-20 focus-visible:outline-none">${t}</h2>`);

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // External links (http/https) — open in new tab with security attributes
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 rounded">$1<span class="sr-only"> (opens in new tab)</span></a>'
  );
  // Internal links — same-tab navigation, no rel override
  html = html.replace(
    /\[([^\]]+)\]\((?!https?:\/\/)([^)]+)\)/g,
    '<a href="$2" class="text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 rounded">$1</a>'
  );

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>');
  html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul class="list-disc pl-4 my-4 space-y-1">$1</ul>');

  // Paragraphs
  html = html.replace(/^(?!<[hultd]|<\/|<div|<a)(.+)$/gm, '<p class="my-4">$1</p>');

  // Clean up empty paragraphs
  html = html.replace(/<p class="my-4"><\/p>/g, "");

  return html;
}
