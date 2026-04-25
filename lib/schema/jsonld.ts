import type { Product, Review, Category, FAQItem, BlogPost, YouTubeVideo, BuyingGuideStep } from "@/types";
import type { FAQEntry } from "@/data/faq-pages";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ReviewIQ",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "AI-powered product review platform providing honest, structured insights from verified buyers.",
    sameAs: [],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ReviewIQ",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
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
    image: product.image,
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
      name: "ReviewIQ",
      url: SITE_URL,
    },
    knowsAbout: ["Product Reviews", "Consumer Electronics", "Buyer Guidance"],
  };
}

export function blogPostSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seo.metaDescription,
    image: post.coverImage || `${SITE_URL}/og-default.jpg`,
    author: {
      "@type": "Organization",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "ReviewIQ",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
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
