import { getAllBlogPosts } from "@/data/blog-posts";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { blogListSchema, breadcrumbSchema } from "@/lib/schema/jsonld";
import { BlogCategoryFilter } from "@/components/home/BlogCategoryFilter";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

const blogIndexWebPageJsonLd = {
  "@context": "https://schema.org",
  "@type": ["WebPage", "CollectionPage"],
  "@id": `${SITE_URL}/blog#page`,
  name: "ReviewIQ Blog — Buying Guides, Comparisons & Expert Reviews",
  url: `${SITE_URL}/blog`,
  inLanguage: "en-US",
  isAccessibleForFree: true,
  datePublished: "2024-01-01",
  dateModified: "2026-07-17",
  abstract: "Expert buying guides, in-depth product comparisons, and review insights backed by verified buyer data from ReviewIQ — helping you make smarter purchase decisions.",
  accessMode: ["textual", "visual"],
  accessibilityFeature: ["alternativeText", "readingOrder", "structuralNavigation", "tableOfContents"],
  accessibilityHazard: "none",
  copyrightHolder: { "@id": `${SITE_URL}/#organization` },
  author: { "@id": `${SITE_URL}/#organization` },
  mainEntity: { "@type": "ItemList", "@id": `${SITE_URL}/blog#post-list`, name: "Blog Posts" },
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["[data-speakable='blog-list-intro']"],
  },
};

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
      <Breadcrumbs items={[{ name: "Blog", url: "/blog" }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogIndexWebPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema(posts)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Blog", url: "/blog" }])) }} />

      <header className="mt-8 mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          ReviewIQ Blog
        </h1>
        <p data-speakable="blog-list-intro" className="text-gray-600 mt-2 max-w-2xl">
          Expert buying guides, product comparisons, and review insights —
          all backed by real owner data and AI-powered analysis.
        </p>
      </header>

      <BlogCategoryFilter posts={posts} />
    </div>
  );
}
