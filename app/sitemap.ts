import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { discussions } from "@/data/discussions";
import { getAllBlogPosts, getBlogCategories } from "@/data/blog-posts";
import { getAllComparisonPairs } from "@/data/comparisons";
import { faqPages } from "@/data/faq-pages";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/write-review`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/site-map`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${siteUrl}/category/${cat.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Static product pages
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/category/${p.categorySlug}/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Static community discussion threads
  const communityPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/community`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    ...discussions.map((thread) => ({
      url: `${siteUrl}/community/thread/${thread.id}`,
      lastModified: thread.lastActivityAt ? new Date(thread.lastActivityAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];

  // Dynamic DB products and discussions (if Prisma is available)
  let dbProductPages: MetadataRoute.Sitemap = [];
  let dbDiscussionPages: MetadataRoute.Sitemap = [];
  try {
    const { prisma } = await import("@/lib/prisma");

    // DB-backed products not in static data
    const staticSlugs = new Set(products.map((p) => p.slug));
    const dbProducts = await prisma.product.findMany({
      select: { slug: true, updatedAt: true, category: { select: { slug: true } } },
    });
    dbProductPages = dbProducts
      .filter((p: { slug: string }) => !staticSlugs.has(p.slug))
      .map((p: { slug: string; updatedAt: Date; category: { slug: string } }) => ({
        url: `${siteUrl}/category/${p.category.slug}/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));

    // DB-backed discussion threads not in static data
    const staticThreadIds = new Set(discussions.map((d) => d.id));
    const dbDiscussions = await prisma.discussionThread.findMany({
      where: { status: "active" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 500,
    });
    dbDiscussionPages = dbDiscussions
      .filter((d: { id: string }) => !staticThreadIds.has(d.id))
      .map((d: { id: string; updatedAt: Date }) => ({
        url: `${siteUrl}/community/thread/${d.id}`,
        lastModified: d.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.5,
      }));
  } catch {
    // DB unavailable — static data only
  }

  // Comparison pages
  const comparisonPairs = getAllComparisonPairs();
  const comparisonPages: MetadataRoute.Sitemap = comparisonPairs.map((pair) => ({
    url: `${siteUrl}/compare/${pair.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Blog posts
  const blogPosts = getAllBlogPosts();
  const blogCategories = getBlogCategories();
  const blogPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...blogCategories.map((cat) => ({
      url: `${siteUrl}/blog/category/${cat.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  // FAQ landing pages
  const faqLandingPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/faq`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...faqPages.map((page) => ({
      url: `${siteUrl}/faq/${page.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];

  return [
    ...staticPages,
    ...categoryPages,
    ...productPages,
    ...comparisonPages,
    ...communityPages,
    ...blogPages,
    ...faqLandingPages,
    ...dbProductPages,
    ...dbDiscussionPages,
  ];
}
