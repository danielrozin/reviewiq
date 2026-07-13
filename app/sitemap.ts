import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { discussions } from "@/data/discussions";
import { users } from "@/data/users";
import { getAllBlogPosts, getBlogCategories } from "@/data/blog-posts";
import { getAllComparisonPairs } from "@/data/comparisons";
import { faqPages } from "@/data/faq-pages";
import { getMerchantOffers } from "@/lib/affiliate/offers";
import { productContentDates } from "@/lib/utils";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com").trim();

  // Truthful <lastmod> policy — do NOT stamp every URL with `new Date()`.
  // This route is `force-dynamic` + `revalidate: 3600`, so a per-request `now`
  // makes the sitemap claim ~90% of URLs changed *every hour*. Google explicitly
  // discounts lastmod when it is not a trustworthy content-change signal, and that
  // discount applies site-wide — including for the blog/product pages whose dates
  // ARE accurate. So we derive lastmod from the underlying content instead:
  //   • product / where-to-buy / category / comparison pages → the product's own
  //     updatedAt||createdAt (auto-updates only when the catalog data changes);
  //   • undated static pages (nav, faq, legal, author profiles) → a committed
  //     constant that a developer bumps when that content is materially revised.
  // A stable constant is honest ("last revised on this date") and, crucially, does
  // not churn on every hourly revalidation the way `new Date()` did.
  const SITE_CONTENT_REVISED = new Date("2026-07-10T00:00:00.000Z");

  // No product actually sets updatedAt/createdAt, so reading only those fields quietly
  // collapsed this to the SITE_CONTENT_REVISED constant for 264 of 323 URLs — honest,
  // but with none of the per-product granularity this policy is supposed to give Google.
  // productContentDates falls back to the product's own review dates, which is what its
  // page content is actually built from (62 distinct dates across the 100 products).
  const productLastMod = (p: Product): Date => {
    const { dateModified } = productContentDates(p);
    return dateModified ? new Date(dateModified) : SITE_CONTENT_REVISED;
  };
  const maxDate = (dates: Date[], fallback: Date): Date => {
    const latest = dates.reduce((max, d) => (d > max ? d : max), new Date(0));
    return latest.getTime() > 0 ? latest : fallback;
  };

  // Freshest catalog date — a defensible lastmod for catalog-surfacing index pages
  // (home, /categories, /products, /compare, /community, /blog roots), which change
  // in substance whenever a new product/analysis lands.
  const catalogLastMod = maxDate(products.map(productLastMod), SITE_CONTENT_REVISED);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: catalogLastMod, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/categories`, lastModified: catalogLastMod, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/about`, lastModified: SITE_CONTENT_REVISED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/how-it-works`, lastModified: SITE_CONTENT_REVISED, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/how-we-work`, lastModified: SITE_CONTENT_REVISED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/write-review`, lastModified: SITE_CONTENT_REVISED, changeFrequency: "monthly", priority: 0.7 },
    // NOTE: /search intentionally omitted — there is no /search page route (only the
    // /api/search handler), so listing it submitted a 404 URL and eroded crawl trust.
    { url: `${siteUrl}/site-map`, lastModified: catalogLastMod, changeFrequency: "daily", priority: 0.6 },
    // High-value indexable pages previously absent from the sitemap (discovery gap).
    { url: `${siteUrl}/products`, lastModified: catalogLastMod, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/compare`, lastModified: catalogLastMod, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/pricing`, lastModified: SITE_CONTENT_REVISED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/who-is-this-for`, lastModified: SITE_CONTENT_REVISED, changeFrequency: "monthly", priority: 0.6 },
    // Legal/policy pages — low priority but legitimate for completeness.
    { url: `${siteUrl}/privacy`, lastModified: SITE_CONTENT_REVISED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: SITE_CONTENT_REVISED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/cookie-policy`, lastModified: SITE_CONTENT_REVISED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/acceptable-use`, lastModified: SITE_CONTENT_REVISED, changeFrequency: "yearly", priority: 0.3 },
  ];

  // A category page lists its products, so its truthful lastmod is the most recent
  // product date within that category (fallback to the catalog baseline for empty
  // categories).
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${siteUrl}/category/${cat.slug}`,
    lastModified: maxDate(
      products.filter((p) => p.categorySlug === cat.slug).map(productLastMod),
      catalogLastMod
    ),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Static product pages
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/category/${p.categorySlug}/${p.slug}`,
    lastModified: productLastMod(p),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // "Where to buy X" sub-pages — commercial-intent, statically generated per product.
  // Listed ONLY while they carry live merchant offers: with no offers the route sends
  // noindex (see its generateMetadata), and a sitemap that advertises noindex URLs is a
  // conflicting signal Search Console flags. Both sides read the same getMerchantOffers
  // seam, so the pages re-enter the sitemap on their own once the affiliate feed lands.
  // Scoped to static `products` only: the route resolves via getProductBySlug (static
  // data), so DB-only products 404 here and must be excluded.
  const productOffers = await Promise.all(products.map((p) => getMerchantOffers(p)));
  const whereToBuyPages: MetadataRoute.Sitemap = products
    .filter((_, i) => productOffers[i].length > 0)
    .map((p) => ({
      url: `${siteUrl}/category/${p.categorySlug}/${p.slug}/where-to-buy`,
      lastModified: productLastMod(p),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  // Static community discussion threads
  const communityPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/community`,
      lastModified: maxDate(
        discussions
          .map((t) => t.lastActivityAt && new Date(t.lastActivityAt))
          .filter((d): d is Date => d instanceof Date),
        SITE_CONTENT_REVISED
      ),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    ...discussions.map((thread) => ({
      url: `${siteUrl}/community/thread/${thread.id}`,
      lastModified: thread.lastActivityAt ? new Date(thread.lastActivityAt) : SITE_CONTENT_REVISED,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];

  // Community author/user profile pages — statically generated for every user
  // (generateStaticParams over static `users`), self-canonical, and indexable
  // (buildMetadata defaults to index:true; no noIndex). They carry author-authority
  // / E-E-A-T signals for the analyses and comments those users author, but were
  // previously absent from the sitemap (discovery gap). Scoped to static `users`
  // only: the route resolves via getUserByUsername (static data), so any DB-only
  // username would 404 here and must be excluded — mirrors the whereToBuyPages scoping.
  const communityUserPages: MetadataRoute.Sitemap = users.map((u) => ({
    url: `${siteUrl}/community/user/${u.username}`,
    lastModified: SITE_CONTENT_REVISED,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

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
  // A comparison page is derived from its two products, so its truthful lastmod is
  // the more recent of the two product dates.
  const comparisonPairs = getAllComparisonPairs();
  const comparisonPages: MetadataRoute.Sitemap = comparisonPairs.map((pair) => ({
    url: `${siteUrl}/compare/${pair.slug}`,
    lastModified: maxDate(
      [productLastMod(pair.productA), productLastMod(pair.productB)],
      catalogLastMod
    ),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Blog posts
  const blogPosts = getAllBlogPosts();
  const blogCategories = getBlogCategories();
  // Blog index/category pages list posts, so their truthful lastmod is the newest
  // post date.
  const blogListLastMod = maxDate(
    blogPosts.map((post) => new Date(post.updatedAt)),
    SITE_CONTENT_REVISED
  );
  const blogPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/blog`,
      lastModified: blogListLastMod,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...blogCategories.map((cat) => ({
      url: `${siteUrl}/blog/category/${cat.slug}`,
      lastModified: blogListLastMod,
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
      lastModified: SITE_CONTENT_REVISED,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...faqPages.map((page) => ({
      url: `${siteUrl}/faq/${page.slug}`,
      lastModified: SITE_CONTENT_REVISED,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];

  return [
    ...staticPages,
    ...categoryPages,
    ...productPages,
    ...whereToBuyPages,
    ...comparisonPages,
    ...communityPages,
    ...communityUserPages,
    ...blogPages,
    ...faqLandingPages,
    ...dbProductPages,
    ...dbDiscussionPages,
  ];
}
