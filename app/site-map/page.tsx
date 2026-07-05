import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/schema/jsonld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

const siteMapWebPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/site-map#page`,
  name: "Site Map — ReviewIQ",
  url: `${SITE_URL}/site-map`,
  inLanguage: "en",
  description: "Browse all content on ReviewIQ — product reviews, blog articles, comparisons, and community discussions organized by date and category.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  dateModified: new Date().toISOString().split("T")[0],
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["[data-speakable='sitemap-intro']"],
  },
};
import { categories } from "@/data/categories";
import { getAllBlogPosts, getBlogCategories } from "@/data/blog-posts";
import { discussions } from "@/data/discussions";
import { products } from "@/data/products";
import { getAllComparisonPairs } from "@/data/comparisons";

export const metadata = buildMetadata({
  title: "Site Map",
  description:
    "Browse all content on ReviewIQ — product reviews, blog articles, comparisons, and community discussions organized by date and category.",
  path: "/site-map",
});

export const revalidate = 3600;

interface ContentItem {
  slug: string;
  title: string;
  href: string;
  type: "blog" | "discussion" | "product" | "comparison";
  date: Date;
}

function getTimeBoundaries() {
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const thisWeekStart = new Date(todayStart);
  const dayOfWeek = thisWeekStart.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  thisWeekStart.setDate(thisWeekStart.getDate() - daysToMonday);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  return { todayStart, yesterdayStart, thisWeekStart, lastWeekStart };
}

function bucketItems(items: ContentItem[]) {
  const boundaries = getTimeBoundaries();
  const buckets = {
    today: [] as ContentItem[],
    yesterday: [] as ContentItem[],
    thisWeek: [] as ContentItem[],
    lastWeek: [] as ContentItem[],
  };

  for (const item of items) {
    if (item.date >= boundaries.todayStart) {
      buckets.today.push(item);
    } else if (item.date >= boundaries.yesterdayStart) {
      buckets.yesterday.push(item);
    } else if (item.date >= boundaries.thisWeekStart) {
      buckets.thisWeek.push(item);
    } else if (item.date >= boundaries.lastWeekStart) {
      buckets.lastWeek.push(item);
    }
  }

  return buckets;
}

function getRecentContent() {
  const items: ContentItem[] = [];

  // Blog posts
  const blogPosts = getAllBlogPosts();
  for (const post of blogPosts) {
    items.push({
      slug: post.slug,
      title: post.title,
      href: `/blog/${post.slug}`,
      type: "blog",
      date: new Date(post.updatedAt || post.publishedAt),
    });
  }

  // Discussion threads
  for (const thread of discussions) {
    items.push({
      slug: thread.id,
      title: thread.title,
      href: `/community/thread/${thread.id}`,
      type: "discussion",
      date: new Date(thread.lastActivityAt || thread.createdAt),
    });
  }

  return bucketItems(items);
}

function ContentSection({
  title,
  items,
}: {
  title: string;
  items: ContentItem[];
}) {
  if (items.length === 0) return null;

  const blogs = items.filter((i) => i.type === "blog");
  const threadItems = items.filter((i) => i.type === "discussion");

  const headingId = `sitemap-${title.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <section aria-labelledby={headingId} className="mb-10">
      <h2 id={headingId} className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        {title}
      </h2>

      {blogs.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Articles</h3>
          <ul className="space-y-1.5">
            {blogs.map((item) => (
              <li key={item.slug} className="border-b border-gray-100 pb-1.5">
                <Link
                  href={item.href}
                  className="text-gray-600 hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {threadItems.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Community Discussions
          </h3>
          <ul className="space-y-1.5">
            {threadItems.map((item) => (
              <li key={item.slug} className="border-b border-gray-100 pb-1.5">
                <Link
                  href={item.href}
                  className="text-gray-600 hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default function SiteMapPage() {
  const { today, yesterday, thisWeek, lastWeek } = getRecentContent();
  const blogCategories = getBlogCategories();
  const comparisonPairs = getAllComparisonPairs();

  const hasRecentContent =
    today.length > 0 ||
    yesterday.length > 0 ||
    thisWeek.length > 0 ||
    lastWeek.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteMapWebPageJsonLd) }}
      />
      <Breadcrumbs items={[{ name: "Site Map", url: "/site-map" }]} />

      <div className="mt-8 max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Site Map
        </h1>
        <p data-speakable="sitemap-intro" className="text-lg text-gray-600 leading-relaxed mb-10">
          Browse all recently published content on ReviewIQ, organized by date.
          For the XML sitemap, see{" "}
          <a
            href="/sitemap.xml"
            className="text-brand-600 hover:text-brand-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
          >
            sitemap.xml
          </a>
          .
        </p>

        {/* Time-based sections (NYT-style) */}
        <ContentSection title="Today" items={today} />
        <ContentSection title="Yesterday" items={yesterday} />
        <ContentSection title="This Week" items={thisWeek} />
        <ContentSection title="Last Week" items={lastWeek} />

        {!hasRecentContent && (
          <p className="text-gray-600 italic mb-10">
            No recently published content. Browse by category below.
          </p>
        )}

        {/* Browse by Category */}
        <section aria-labelledby="sitemap-categories-heading" className="mb-10">
          <h2 id="sitemap-categories-heading" className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Browse by Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const catProducts = products.filter(
                (p) => p.categorySlug === cat.slug
              );
              return (
                <div key={cat.slug}>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <Link
                      href={`/category/${cat.slug}`}
                      className="hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
                    >
                      {cat.name}
                    </Link>
                  </h3>
                  <ul className="space-y-1">
                    {catProducts.slice(0, 8).map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/category/${cat.slug}/${p.slug}`}
                          className="text-sm text-gray-600 hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
                        >
                          {p.name}
                        </Link>
                      </li>
                    ))}
                    {catProducts.length > 8 && (
                      <li>
                        <Link
                          href={`/category/${cat.slug}`}
                          className="text-sm text-brand-600 hover:text-brand-700 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
                        >
                          View all {catProducts.length} products →
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Blog Categories */}
        {blogCategories.length > 0 && (
          <section aria-labelledby="sitemap-blog-categories-heading" className="mb-10">
            <h2 id="sitemap-blog-categories-heading" className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Blog Categories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Link
                href="/blog"
                className="text-gray-600 hover:text-brand-600 transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
              >
                All Articles
              </Link>
              {blogCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/blog/category/${cat.slug}`}
                  className="text-gray-600 hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Comparisons */}
        {comparisonPairs.length > 0 && (
          <section aria-labelledby="sitemap-comparisons-heading" className="mb-10">
            <h2 id="sitemap-comparisons-heading" className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Comparisons
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
              {comparisonPairs.map((pair) => (
                <li key={pair.slug}>
                  <Link
                    href={`/compare/${pair.slug}`}
                    className="text-sm text-gray-600 hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
                  >
                    {pair.productA.name} vs {pair.productB.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Pages */}
        <section aria-labelledby="sitemap-pages-heading" className="mb-10">
          <h2 id="sitemap-pages-heading" className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Pages
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { href: "/", label: "Home" },
              { href: "/categories", label: "All Categories" },
              { href: "/blog", label: "Blog" },
              { href: "/community", label: "Community" },
              { href: "/compare", label: "Compare Products" },
              { href: "/write-review", label: "Write a Review" },
              { href: "/search", label: "Search" },
              { href: "/how-it-works", label: "How It Works" },
              { href: "/about", label: "About" },
              { href: "/pricing", label: "Pricing" },
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/terms", label: "Terms of Service" },
            ].map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="text-gray-600 hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
              >
                {page.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
