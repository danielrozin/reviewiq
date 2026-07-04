import type { Product, Review, Category, FAQItem, BlogPost, YouTubeVideo, BuyingGuideStep, DiscussionThread } from "@/types";
import type { FAQEntry } from "@/data/faq-pages";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "ReviewIQ",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
      contentUrl: `${SITE_URL}/logo.png`,
    },
    description:
      "AI-powered product review platform providing honest, structured insights from verified buyers.",
    sameAs: [
      "https://twitter.com/revieweriq",
      "https://www.linkedin.com/company/revieweriq",
      "https://www.facebook.com/revieweriq",
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "ReviewIQ",
    url: SITE_URL,
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
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
  const lastItem = items[items.length - 1];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    ...(lastItem && { "@id": `${SITE_URL}${lastItem.url}#breadcrumb` }),
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function productSchema(product: Product, pageUrl?: string) {
  const ratingCount = product.reviewCount || product.reviews.length;
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  const buildDate = new Date().toISOString().split("T")[0];
  const canonicalUrl = pageUrl ? `${SITE_URL}${pageUrl}` : undefined;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    ...(canonicalUrl && { "@id": `${canonicalUrl}#product` }),
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    description: product.description,
    image: product.image,
    inLanguage: "en",
    datePublished: product.createdAt || buildDate,
    dateModified: product.updatedAt || product.createdAt || buildDate,
    ...(canonicalUrl && {
      url: canonicalUrl,
      mainEntityOfPage: { "@type": "ItemPage", "@id": canonicalUrl },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      publisher: { "@id": `${SITE_URL}/#organization` },
    }),
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

  const reviewsWithBody = product.reviews.filter((r) => r.body && r.body.trim());
  if (reviewsWithBody.length > 0) {
    schema.review = reviewsWithBody.slice(0, 5).map((r) => reviewSchema(r));
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
    inLanguage: "en",
  };
}

export function faqSchema(items: FAQItem[], pageUrl?: string) {
  const fullUrl = pageUrl ? `${SITE_URL}${pageUrl}` : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(fullUrl && {
      "@id": `${fullUrl}#faq`,
      url: fullUrl,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      publisher: { "@id": `${SITE_URL}/#organization` },
    }),
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
    "@id": `${SITE_URL}/categories#category-list`,
    name: "Product Categories",
    numberOfItems: categories.length,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    itemListElement: categories.map((cat, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: cat.name,
      url: `${SITE_URL}/category/${cat.slug}`,
    })),
  };
}

export function productListSchema(products: Product[], categoryName: string, categorySlug?: string) {
  const avgCategoryRating =
    products.length > 0
      ? products.reduce((sum, p) => {
          const avg =
            p.reviews.length > 0
              ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
              : 0;
          return sum + avg;
        }, 0) / products.length
      : 0;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    ...(categorySlug && { "@id": `${SITE_URL}/category/${categorySlug}#product-list` }),
    name: `Best ${categoryName}`,
    description: `Top-rated ${categoryName} ranked by SmartScore from verified buyer reviews`,
    numberOfItems: products.length,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(avgCategoryRating > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgCategoryRating.toFixed(1),
        bestRating: "5",
        worstRating: "1",
        reviewCount: products.reduce((sum, p) => sum + p.reviewCount, 0),
      },
    }),
    itemListElement: products.map((p, index) => {
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
          : 0;
      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          "@id": `${SITE_URL}/category/${p.categorySlug}/${p.slug}`,
          name: p.name,
          url: `${SITE_URL}/category/${p.categorySlug}/${p.slug}`,
          brand: { "@type": "Brand", name: p.brand },
          ...(avgRating > 0 && {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: avgRating.toFixed(1),
              bestRating: "5",
              worstRating: "1",
              reviewCount: p.reviewCount,
            },
          }),
        },
      };
    }),
  };
}

export function videoObjectSchema(video: YouTubeVideo, productName: string) {
  const contentUrl = `https://www.youtube.com/watch?v=${video.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": contentUrl,
    name: video.title,
    description: `${video.title} — video review for ${productName}`,
    thumbnailUrl: `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
    uploadDate: new Date().toISOString().split("T")[0],
    contentUrl,
    embedUrl: `https://www.youtube.com/embed/${video.id}`,
    publisher: { "@id": `${SITE_URL}/#organization` },
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
    "@id": `${SITE_URL}/about#ai-review-team`,
    name: "ReviewIQ AI Analysis Team",
    url: `${SITE_URL}/about`,
    worksFor: { "@id": `${SITE_URL}/#organization` },
    knowsAbout: ["Product Reviews", "Consumer Electronics", "Buyer Guidance"],
  };
}

export function blogPostSchema(post: BlogPost) {
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${postUrl}#article`,
    url: postUrl,
    headline: post.title,
    description: post.seo.metaDescription,
    image: {
      "@type": "ImageObject",
      url: post.coverImage || `${SITE_URL}/og-default.jpg`,
      width: 1200,
      height: 630,
    },
    inLanguage: "en",
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/about#author-${post.author.name.toLowerCase().replace(/\s+/g, "-")}`,
      name: post.author.name,
      url: `${SITE_URL}/about`,
      ...(post.author.bio && { description: post.author.bio }),
    },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "ReviewIQ",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
        width: 200,
        height: 60,
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    keywords: [post.seo.focusKeyword, ...post.seo.secondaryKeywords].join(", "),
    ...(post.readingTime > 0 && {
      timeRequired: `PT${post.readingTime}M`,
    }),
  };
}

export function blogListSchema(posts: BlogPost[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog`,
    name: "ReviewIQ Blog",
    description: "Expert buying guides, product comparisons, and review insights from ReviewIQ.",
    url: `${SITE_URL}/blog`,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    hasPart: posts.map((post) => ({
      "@type": "BlogPosting",
      "@id": `${SITE_URL}/blog/${post.slug}`,
      headline: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.publishedAt,
    })),
  };
}

export function howToSchema(title: string, steps: BuyingGuideStep[], categorySlug: string) {
  const schemaUrl = `${SITE_URL}/category/${categorySlug}`;
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${schemaUrl}#howto`,
    name: title,
    description: `Step-by-step guide to choosing the best ${title.replace(/^How to Choose the (?:Best |Right )?/i, "").toLowerCase()}.`,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image ? { image: `${SITE_URL}${step.image}` } : {}),
    })),
    url: schemaUrl,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function communityPageSchema() {
  const pageUrl = `${SITE_URL}/community`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": pageUrl,
    name: "ReviewIQ Community",
    description: "Real conversations about real products. Ask questions, share experiences, and help others make smarter buying decisions.",
    url: pageUrl,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["[data-speakable='community-hero']", "[data-speakable='community-discussions']"],
    },
  };
}

export function homePageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["WebPage", "CollectionPage"],
    "@id": `${SITE_URL}/`,
    name: "ReviewIQ — Real Reviews, Real Intelligence",
    description: "AI-powered product reviews for smart buyers. Honest data. Verified buyers. No affiliate bias.",
    url: SITE_URL,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    about: { "@id": `${SITE_URL}/#organization` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["[data-speakable='hero-tagline']", "[data-speakable='hero-stats']"],
    },
  };
}

export function speakableSchema(productName: string, productUrl: string) {
  const pageUrl = `${SITE_URL}${productUrl}`;
  return {
    "@context": "https://schema.org",
    "@type": ["WebPage", "ItemPage"],
    "@id": pageUrl,
    name: `${productName} Review`,
    url: pageUrl,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [
        "[data-speakable='ai-summary']",
        "[data-speakable='verdict']",
        "[data-speakable='key-facts']",
        "[data-speakable='smart-score']",
        "[data-speakable='best-for']",
        "[data-speakable='faq-answer']",
        "[data-speakable='specifications']",
        "[data-speakable='compare-with']",
        "[data-speakable='recurring-issues']",
        "[data-speakable='people-also-reviewed']",
        "[data-speakable='related-products']",
        "[data-speakable='review-list']",
        "[data-speakable='video-reviews']",
      ],
    },
  };
}

export function blogPostSpeakableSchema(title: string, url: string) {
  const pageUrl = `${SITE_URL}${url}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": pageUrl,
    name: title,
    url: pageUrl,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [
        "[data-speakable='blog-headline']",
        "[data-speakable='blog-intro']",
        "[data-speakable='blog-body']",
      ],
    },
  };
}

export function discussionForumPostingSchema(
  thread: DiscussionThread,
  authorName: string
) {
  const threadUrl = `${SITE_URL}/community/thread/${thread.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "@id": `${threadUrl}#discussion`,
    headline: thread.title,
    text: thread.body,
    inLanguage: "en",
    url: threadUrl,
    datePublished: thread.createdAt,
    dateModified: thread.lastActivityAt,
    author: {
      "@type": "Person",
      name: authorName,
    },
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: thread.upvotes,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: thread.commentCount,
      },
    ],
    ...(thread.tags.length > 0 && { keywords: thread.tags.join(", ") }),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": threadUrl },
  };
}

export function threadPageSpeakableSchema(title: string, url: string) {
  const pageUrl = `${SITE_URL}${url}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": pageUrl,
    name: title,
    url: pageUrl,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [
        "[data-speakable='thread-title']",
        "[data-speakable='thread-body']",
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
      "@id": `${SITE_URL}${opts.pageUrl}#faq`,
      url: `${SITE_URL}${opts.pageUrl}`,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      publisher: { "@id": `${SITE_URL}/#organization` },
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
      "@id": `${SITE_URL}${opts.pageUrl}`,
      name: opts.pageName,
      url: `${SITE_URL}${opts.pageUrl}`,
      inLanguage: "en",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      about: {
        "@type": opts.competitor.type,
        name: opts.competitor.name,
        url: opts.competitor.url,
      },
      mentions: { "@id": `${SITE_URL}/#organization` },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["[data-speakable='faq-answer']"],
      },
    },
  ];
}

export function profilePageSchema(username: string, displayName: string, bio?: string, expertiseCategories?: string[]) {
  const pageUrl = `${SITE_URL}/community/user/${username}`;
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": pageUrl,
    name: `${displayName} — ReviewIQ Community`,
    url: pageUrl,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntity: {
      "@type": "Person",
      "@id": `${pageUrl}#person`,
      name: displayName,
      url: pageUrl,
      ...(bio && { description: bio }),
      ...(expertiseCategories && expertiseCategories.length > 0 && {
        knowsAbout: expertiseCategories.map((s) => s.replace(/-/g, " ")),
      }),
    },
  };
}

export function blogCategoryPageSchema(categoryName: string, description: string, categorySlug: string) {
  const pageUrl = `${SITE_URL}/blog/category/${categorySlug}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": pageUrl,
    name: `${categoryName} Buying Guides & Reviews`,
    description,
    url: pageUrl,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function categoryPageSchema(categoryName: string, description: string, categoryUrl: string) {
  const pageUrl = `${SITE_URL}${categoryUrl}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": pageUrl,
    name: `Best ${categoryName}`,
    description,
    url: pageUrl,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["[data-speakable='category-description']", "[data-speakable='buying-guide']"],
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Categories", item: `${SITE_URL}/categories` },
        { "@type": "ListItem", position: 3, name: categoryName, item: pageUrl },
      ],
    },
  };
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
  const pageUrl = `${SITE_URL}/compare/${[productA.slug, productB.slug].sort().join("-vs-")}`;

  return {
    "@context": "https://schema.org",
    "@type": ["WebPage", "ItemPage"],
    "@id": pageUrl,
    name: `${productA.name} vs ${productB.name} — Comparison`,
    description: `Side-by-side comparison of ${productA.name} and ${productB.name} based on verified buyer reviews.`,
    url: pageUrl,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    datePublished,
    dateModified,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [
        "[data-speakable='ai-verdict']",
        "[data-speakable='comparison-verdict']",
        "[data-speakable='best-for-comparison']",
        "[data-speakable='pros-cons']",
        "[data-speakable='score-comparison']",
        "[data-speakable='specs-comparison']",
        "[data-speakable='price-comparison']",
      ],
    },
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

  const productUrl = `${SITE_URL}/category/${product.categorySlug}/${product.slug}`;
  const item: Record<string, unknown> = {
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    url: productUrl,
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
