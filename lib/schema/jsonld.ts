import type { Product, Review, Category, FAQItem, BlogPost, YouTubeVideo } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://smartreview.com";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SmartReview",
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
    name: "SmartReview",
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
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    description: product.description,
    image: product.image,
    offers: {
      "@type": "AggregateOffer",
      lowPrice: product.priceRange.min,
      highPrice: product.priceRange.max,
      priceCurrency: product.priceRange.currency,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    review: product.reviews.slice(0, 5).map((r) => reviewSchema(r)),
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
  return videos.map((video) => videoObjectSchema(video, productName));
}

export function analysisAuthorSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "SmartReview AI Analysis Team",
    url: `${SITE_URL}/about`,
    worksFor: {
      "@type": "Organization",
      name: "SmartReview",
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
      name: "SmartReview",
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
    name: "SmartReview Blog",
    description: "Expert buying guides, product comparisons, and review insights from SmartReview.",
    url: `${SITE_URL}/blog`,
    hasPart: posts.map((post) => ({
      "@type": "Article",
      headline: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.publishedAt,
    })),
  };
}
