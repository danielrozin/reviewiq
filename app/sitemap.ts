import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { discussions } from "@/data/discussions";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://smartreview.com";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/write-review`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${siteUrl}/category/${cat.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/category/${p.categorySlug}/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Community discussion threads
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

  return [...staticPages, ...categoryPages, ...productPages, ...communityPages];
}
