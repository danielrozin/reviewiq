import { getAllBlogPosts } from "@/data/blog-posts";
import { getAllProducts } from "@/data/products";

async function getRecentReviews() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.review.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        product: {
          select: { name: true, slug: true, category: { select: { slug: true } } },
        },
        user: { select: { name: true } },
      },
    });
  } catch {
    return [];
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";
  const posts = getAllBlogPosts();
  const products = getAllProducts();
  const reviews = await getRecentReviews();

  const blogItems = posts.map(
    (post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <category>${escapeXml(post.categoryName)}</category>
      <author>${escapeXml(post.author.name)}</author>
    </item>`
  );

  const productItems = products.slice(0, 30).map(
    (product) => `    <item>
      <title><![CDATA[${product.name} — SmartScore ${product.smartScore}/100]]></title>
      <link>${siteUrl}/category/${product.categorySlug}/${product.slug}</link>
      <guid isPermaLink="true">${siteUrl}/category/${product.categorySlug}/${product.slug}</guid>
      <description><![CDATA[${product.description}]]></description>
      <category>${escapeXml(product.categorySlug)}</category>
    </item>`
  );

  const reviewItems = reviews.map(
    (review) => {
      const categorySlug = review.product.category?.slug || "products";
      return `    <item>
      <title><![CDATA[Review: ${review.product.name} — ${review.rating}/5 stars]]></title>
      <link>${siteUrl}/category/${categorySlug}/${review.product.slug}</link>
      <guid isPermaLink="false">review-${review.id}</guid>
      <description><![CDATA[${review.headline}]]></description>
      <pubDate>${new Date(review.createdAt).toUTCString()}</pubDate>
      <author>${escapeXml(review.user?.name || "Anonymous")}</author>
    </item>`;
    }
  );

  const allItems = [...blogItems, ...productItems, ...reviewItems].join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ReviewIQ — Reviews, Products &amp; Guides</title>
    <link>${siteUrl}</link>
    <description>Expert buying guides, product reviews, and comparisons backed by real owner data.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${allItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
