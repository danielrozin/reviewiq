import type { Product, Review, Category, FAQItem, BlogPost, YouTubeVideo, BuyingGuideStep } from "@/types";
import type { FAQEntry } from "@/data/faq-pages";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com").trim();

// Static brand assets like /logo.png and /og-default.jpg do not exist in /public
// and 404 in production, which makes structured-data image/logo refs invalid and
// drops the rich result. The app DOES generate per-route OG images at runtime via
// file-based opengraph-image.tsx (verified 200 image/png), so we point structured
// data at those routes instead. BRAND_IMAGE is the site-level branded OG banner.
const BRAND_IMAGE = `${SITE_URL}/opengraph-image`;

// Stable entity @ids so every page resolves the same ReviewIQ Organization /
// WebSite node instead of emitting duplicate, unlinked entities. Answer engines
// (Google KG, ChatGPT/Perplexity) consolidate structured-data entities by @id;
// inline publisher/worksFor nodes below reference ORG_ID to merge into this one.
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "ReviewIQ",
    url: SITE_URL,
    logo: BRAND_IMAGE,
    description:
      "AI-powered product review platform providing honest, structured insights from verified buyers.",
    // Verified public contact (same address shown on /privacy, /terms,
    // /cookie-policy, /acceptable-use). Google surfaces Organization
    // email/contactPoint in the knowledge panel and answer engines use it to
    // anchor the brand entity. sameAs stays empty until real, owned social
    // profiles exist — inventing profile URLs would break the entity graph.
    email: "contact@revieweriq.com",
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "contact@revieweriq.com",
        availableLanguage: "English",
      },
    ],
    sameAs: [],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: "ReviewIQ",
    url: SITE_URL,
    // Link the site to the canonical Organization entity emitted in the same
    // <head> (root layout renders organizationSchema() on every page).
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      // Point at the real search-results surface. There is no /search page
      // (only the /api/search JSON endpoint) — a 404 target invalidates the
      // sitelinks searchbox. /products?q= is the URL the site's own SearchBar
      // navigates to on Enter and reads via searchParams.get("q").
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function productSchema(product: Product) {
  const ratingCount = product.reviewCount || product.reviews.length;
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  const buildDate = new Date().toISOString().split("T")[0];

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    description: product.description,
    // product.image points at /images/products/*.jpg which 404 (no real photos yet);
    // use the per-product generated OG card so the Product rich result has a valid image.
    image: `${SITE_URL}/category/${product.categorySlug}/${product.slug}/opengraph-image`,
    datePublished: product.createdAt || buildDate,
    dateModified: product.updatedAt || product.createdAt || buildDate,
  };

  const offers = aggregateOfferFromProduct(product);
  if (offers) schema.offers = offers;

  if (ratingCount > 0 && avgRating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      reviewCount: ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (product.reviews.length > 0) {
    schema.review = product.reviews.slice(0, 5).map((r) => reviewSchema(r));
  }

  // Google requires at least one of offers/aggregateRating/review for Product
  // rich results. Suppress the schema entirely rather than emit an invalid node.
  if (!schema.offers && !schema.aggregateRating && !schema.review) return null;

  return schema;
}

function aggregateOfferFromProduct(product: Product) {
  const { min, max, currency } = product.priceRange;
  if (!currency || min == null || min <= 0) return null;
  const highPrice = max && max >= min ? max : min;
  return {
    "@type": "AggregateOffer",
    lowPrice: min,
    highPrice,
    priceCurrency: currency,
    offerCount: 1,
    availability: "https://schema.org/InStock",
  };
}

export function reviewSchema(review: Review) {
  return {
    "@type": "Review",
    headline: review.headline,
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    author: { "@type": "Person", name: review.authorName },
    datePublished: review.createdAt,
    reviewBody: review.body,
  };
}

export function faqSchema(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function categoryListSchema(categories: Category[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Product Categories",
    itemListElement: categories.map((cat, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: cat.name,
      url: `${SITE_URL}/category/${cat.slug}`,
    })),
  };
}

export function productListSchema(products: Product[], categoryName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best ${categoryName}`,
    itemListElement: products.map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: p.name,
      url: `${SITE_URL}/category/${p.categorySlug}/${p.slug}`,
    })),
  };
}

export function videoObjectSchema(video: YouTubeVideo, productName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: `${video.title} — video review for ${productName}`,
    thumbnailUrl: `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
    uploadDate: new Date().toISOString().split("T")[0],
    contentUrl: `https://www.youtube.com/watch?v=${video.id}`,
    embedUrl: `https://www.youtube.com/embed/${video.id}`,
  };
}

export function videoObjectListSchema(videos: YouTubeVideo[], productName: string) {
  return videos
    .filter((v) => v.isActive !== false)
    .map((video) => videoObjectSchema(video, productName));
}

export function analysisAuthorSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "ReviewIQ AI Analysis Team",
    url: `${SITE_URL}/about`,
    worksFor: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "ReviewIQ",
      url: SITE_URL,
    },
    knowsAbout: ["Product Reviews", "Consumer Electronics", "Buyer Guidance"],
  };
}

export function blogPostSchema(post: BlogPost) {
  // post.coverImage holds relative /images/blog/*.jpg paths that (a) are not the
  // absolute URLs schema.org requires and (b) 404 in production — the same raw-path
  // trap productSchema()/comparisonProductItem() avoid. A relative or 404 image drops
  // the Article rich result, so only trust coverImage when it is a real absolute URL;
  // otherwise fall back to the per-post generated OG route (absolute, verified 200).
  const coverIsAbsolute = !!post.coverImage && /^https?:\/\//i.test(post.coverImage);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seo.metaDescription,
    image: coverIsAbsolute ? post.coverImage : `${SITE_URL}/blog/${post.slug}/opengraph-image`,
    author: {
      "@type": "Organization",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "ReviewIQ",
      logo: { "@type": "ImageObject", url: BRAND_IMAGE },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    keywords: [post.seo.focusKeyword, ...post.seo.secondaryKeywords].join(", "),
  };
}

export function blogListSchema(posts: BlogPost[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ReviewIQ Blog",
    description: "Expert buying guides, product comparisons, and review insights from ReviewIQ.",
    url: `${SITE_URL}/blog`,
    hasPart: posts.map((post) => ({
      "@type": "Article",
      headline: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.publishedAt,
    })),
  };
}

export function howToSchema(title: string, steps: BuyingGuideStep[], categorySlug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: title,
    description: `Step-by-step guide to choosing the best ${title.replace(/^How to Choose the (?:Best |Right )?/i, "").toLowerCase()}.`,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image ? { image: `${SITE_URL}${step.image}` } : {}),
    })),
    url: `${SITE_URL}/category/${categorySlug}`,
  };
}

export function speakableSchema(productName: string, productUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${productName} Review`,
    url: `${SITE_URL}${productUrl}`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [
        "[data-speakable='ai-summary']",
        "[data-speakable='key-facts']",
        "[data-speakable='smart-score']",
      ],
    },
  };
}

export function competitorFaqPageSchema(opts: {
  faqs: FAQEntry[];
  pageUrl: string;
  pageName: string;
  competitor: { name: string; url: string; type: string };
}) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: opts.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: opts.pageName,
      url: `${SITE_URL}${opts.pageUrl}`,
      about: {
        "@type": opts.competitor.type,
        name: opts.competitor.name,
        url: opts.competitor.url,
      },
      mentions: {
        "@type": "Organization",
        name: "ReviewIQ",
        url: SITE_URL,
      },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["[data-speakable='faq-answer']"],
      },
    },
  ];
}

export function comparisonSchema(productA: Product, productB: Product) {
  const buildDate = new Date().toISOString().split("T")[0];
  const datePublished =
    productA.createdAt && productB.createdAt
      ? [productA.createdAt, productB.createdAt].sort()[0]
      : productA.createdAt || productB.createdAt || buildDate;
  const dateModified =
    productA.updatedAt && productB.updatedAt
      ? [productA.updatedAt, productB.updatedAt].sort().reverse()[0]
      : productA.updatedAt || productB.updatedAt || buildDate;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${productA.name} vs ${productB.name} — Comparison`,
    description: `Side-by-side comparison of ${productA.name} and ${productB.name} based on verified buyer reviews.`,
    url: `${SITE_URL}/compare/${[productA.slug, productB.slug].sort().join("-vs-")}`,
    datePublished,
    dateModified,
    mainEntity: {
      "@type": "ItemList",
      name: `${productA.name} vs ${productB.name}`,
      numberOfItems: 2,
      itemListElement: [
        { "@type": "ListItem", position: 1, item: comparisonProductItem(productA) },
        { "@type": "ListItem", position: 2, item: comparisonProductItem(productB) },
      ],
    },
    // AEO/voice: the AI Verdict paragraph (VerdictCard) directly answers the
    // "which is better, A or B?" query — the top intent for "X vs Y" searches.
    // Attached to the existing WebPage node so there is no duplicate entity.
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["[data-speakable='ai-verdict']"],
    },
  };
}

function comparisonProductItem(product: Product) {
  const ratingCount = product.reviewCount || product.reviews.length;
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  const item: Record<string, unknown> = {
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    description: product.description,
    // Mirror productSchema(): raw product.image paths 404, so point at the
    // per-product generated OG card. A Product node carrying aggregateRating
    // needs a valid image or Google suppresses the comparison rich result.
    image: `${SITE_URL}/category/${product.categorySlug}/${product.slug}/opengraph-image`,
    url: `${SITE_URL}/category/${product.categorySlug}/${product.slug}`,
  };

  const offers = aggregateOfferFromProduct(product);
  if (offers) item.offers = offers;

  if (ratingCount > 0 && avgRating > 0) {
    item.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      reviewCount: ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return item;
}
