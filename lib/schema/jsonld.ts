import type { Product, Review, Category, FAQItem, BlogPost, YouTubeVideo, BuyingGuideStep, DiscussionThread } from "@/types";
import type { FAQEntry } from "@/data/faq-pages";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

function toBrandSlug(brand: string): string {
  return brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "Corporation"],
    "@id": `${SITE_URL}/#organization`,
    name: "ReviewIQ",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: `${SITE_URL}/logo.png`,
      contentUrl: `${SITE_URL}/logo.png`,
      width: 200,
      height: 60,
      name: "ReviewIQ Logo",
      caption: "ReviewIQ — Real Reviews, Real Intelligence",
      creator: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "ReviewIQ", url: SITE_URL },
      copyrightHolder: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "ReviewIQ", url: SITE_URL },
      isAccessibleForFree: true,
    },
    description:
      "AI-powered product review platform providing honest, structured insights from verified buyers.",
    email: "hello@reviewiq.com",
    areaServed: ["US", "CA", "GB", "AU"],
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@reviewiq.com",
      contactType: "customer support",
      availableLanguage: "English",
      url: `${SITE_URL}/about`,
    },
    foundingDate: "2023",
    numberOfEmployees: { "@type": "QuantitativeValue", value: 4 },
    legalName: "ReviewIQ",
    slogan: "Real Reviews. Real Intelligence.",
    publishingPrinciples: `${SITE_URL}/about`,
    ethicsPolicy: `${SITE_URL}/acceptable-use`,
    knowsAbout: [
      "Product Reviews",
      "Consumer Electronics",
      "Buyer Guidance",
      "AI-Powered Analysis",
      "Comparative Product Research",
      "Verified Purchase Reviews",
    ],
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
    description: "AI-powered product review platform providing honest, structured insights from verified buyers.",
    url: SITE_URL,
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
    copyrightHolder: { "@id": `${SITE_URL}/#organization` },
    license: `${SITE_URL}/terms`,
    publishingPrinciples: `${SITE_URL}/about`,
    potentialAction: {
      "@type": "SearchAction",
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
  const lastItem = items[items.length - 1];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    ...(lastItem && { "@id": `${SITE_URL}${lastItem.url}#breadcrumb` }),
    inLanguage: "en",
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
    sku: product.slug,
    ...(product.mpn && { mpn: product.mpn }),
    ...(product.gtin12 && { gtin12: product.gtin12 }),
    ...(product.gtin13 && { gtin13: product.gtin13 }),
    ...(product.gtin14 && { gtin14: product.gtin14 }),
    brand: { "@type": "Brand", "@id": `${SITE_URL}/brand/${toBrandSlug(product.brand)}#brand`, name: product.brand },
    ...(product.categorySlug && { category: product.categorySlug }),
    description: product.description,
    image: product.image ? {
      "@type": "ImageObject",
      ...(canonicalUrl && { "@id": `${canonicalUrl}#primary-image` }),
      url: product.image,
      contentUrl: product.image,
      name: product.name,
      caption: product.description,
      creditText: "ReviewIQ",
      creator: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "ReviewIQ", url: SITE_URL },
      copyrightHolder: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "ReviewIQ", url: SITE_URL },
      license: `${SITE_URL}/terms`,
      acquireLicensePage: `${SITE_URL}/about`,
      isAccessibleForFree: true,
      ...(canonicalUrl && { isPartOf: { "@id": `${canonicalUrl}#page` } }),
    } : undefined,
    inLanguage: "en",
    ...(product.createdAt ? { datePublished: product.createdAt } : {}),
    ...(product.updatedAt || product.createdAt ? { dateModified: product.updatedAt || product.createdAt } : {}),
    ...(canonicalUrl && {
      url: canonicalUrl,
      mainEntityOfPage: { "@type": "ItemPage", "@id": `${canonicalUrl}#page` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      publisher: { "@id": `${SITE_URL}/#organization` },
    }),
  };

  const offers = aggregateOfferFromProduct(product);
  if (offers) schema.offers = canonicalUrl ? { ...offers, url: canonicalUrl } : offers;

  if (ratingCount > 0 && avgRating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ...(canonicalUrl && { "@id": `${canonicalUrl}#aggregate-rating` }),
      ratingValue: avgRating.toFixed(1),
      ratingCount: ratingCount,
      reviewCount: ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const reviewsWithBody = product.reviews.filter((r) => r.body && r.body.trim());
  if (reviewsWithBody.length > 0) {
    const productRef = canonicalUrl ? { name: product.name, url: pageUrl! } : undefined;
    schema.review = reviewsWithBody.slice(0, 5).map((r) => reviewSchema(r, productRef));
  }

  const additionalProps: Record<string, unknown>[] = [];

  if (product.smartScore > 0) {
    additionalProps.push({
      "@type": "PropertyValue",
      propertyID: "SmartScore",
      name: "SmartScore",
      value: product.smartScore,
      minValue: 0,
      maxValue: 100,
      description: "AI-aggregated score from verified buyer reviews (0-100)",
      url: canonicalUrl,
    });
  }

  if (product.specs && product.specs.length > 0) {
    product.specs.forEach((spec) => {
      additionalProps.push({
        "@type": "PropertyValue",
        name: spec.label,
        value: spec.value,
      });
    });
  }

  if (additionalProps.length > 0) {
    schema.additionalProperty = additionalProps;
  }

  return schema;
}

function aggregateOfferFromProduct(product: Product) {
  const { min, max, currency } = product.priceRange;
  if (!currency || min == null || min <= 0) return null;
  const highPrice = max && max >= min ? max : min;
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  return {
    "@type": "AggregateOffer",
    lowPrice: min,
    highPrice,
    priceCurrency: currency,
    priceValidUntil,
    offerCount: 1,
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@type": "Organization", name: "ReviewIQ", "@id": `${SITE_URL}/#organization` },
  };
}

export function reviewSchema(review: Review, productRef?: { name: string; url: string }) {
  return {
    "@type": "Review",
    ...(productRef && { "@id": `${SITE_URL}${productRef.url}#review-${review.id}` }),
    headline: review.headline,
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    author: (() => {
      const authorSlug = encodeURIComponent(review.authorName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
      const profileUrl = `${SITE_URL}/community/user/${authorSlug}`;
      return {
        "@type": "Person",
        "@id": `${profileUrl}#person`,
        name: review.authorName,
        sameAs: [profileUrl],
        ...(review.aiTopics && review.aiTopics.length > 0 && {
          knowsAbout: review.aiTopics,
        }),
      };
    })(),
    datePublished: review.createdAt,
    copyrightYear: new Date(review.createdAt).getFullYear(),
    copyrightHolder: { "@id": `${SITE_URL}/#organization` },
    license: `${SITE_URL}/terms`,
    accessMode: ["textual"],
    accessibilityFeature: ["readingOrder"],
    reviewBody: review.body,
    inLanguage: "en",
    isAccessibleForFree: true,
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(review.pros && review.pros.length > 0 && {
      positiveNotes: {
        "@type": "ItemList",
        itemListElement: review.pros.map((pro, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: pro,
        })),
      },
    }),
    ...(review.cons && review.cons.length > 0 && {
      negativeNotes: {
        "@type": "ItemList",
        itemListElement: review.cons.map((con, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: con,
        })),
      },
    }),
    ...(productRef && {
      itemReviewed: {
        "@type": "Product",
        "@id": `${SITE_URL}${productRef.url}#product`,
        name: productRef.name,
      },
      isPartOf: { "@id": `${SITE_URL}${productRef.url}#page` },
    }),
  };
}

export function faqSchema(items: FAQItem[], pageUrl?: string) {
  const fullUrl = pageUrl ? `${SITE_URL}${pageUrl}` : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en",
    isAccessibleForFree: true,
    copyrightHolder: { "@id": `${SITE_URL}/#organization` },
    license: `${SITE_URL}/terms`,
    accessMode: ["textual"],
    accessibilityFeature: ["readingOrder", "structuralNavigation"],
    ...(fullUrl && {
      "@id": `${fullUrl}#faq`,
      url: fullUrl,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      publisher: { "@id": `${SITE_URL}/#organization` },
    }),
    mainEntity: items.map((item, index) => ({
      "@type": "Question",
      ...(fullUrl && { "@id": `${fullUrl}#faq-${item.question.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60)}` }),
      inLanguage: "en",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        inLanguage: "en",
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
    inLanguage: "en",
    copyrightHolder: { "@id": `${SITE_URL}/#organization` },
    license: `${SITE_URL}/terms`,
    accessMode: ["textual"],
    itemListElement: categories.map((cat, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: cat.name,
      item: {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/category/${cat.slug}#page`,
        name: cat.name,
        url: `${SITE_URL}/category/${cat.slug}`,
        inLanguage: "en",
        isAccessibleForFree: true,
      },
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
    inLanguage: "en",
    copyrightHolder: { "@id": `${SITE_URL}/#organization` },
    license: `${SITE_URL}/terms`,
    accessMode: ["textual", "visual"],
    ...(avgCategoryRating > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgCategoryRating.toFixed(1),
        bestRating: 5,
        worstRating: 1,
        ratingCount: products.reduce((sum, p) => sum + p.reviewCount, 0),
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
        url: `${SITE_URL}/category/${p.categorySlug}/${p.slug}`,
        item: {
          "@type": "Product",
          "@id": `${SITE_URL}/category/${p.categorySlug}/${p.slug}#product`,
          name: p.name,
          url: `${SITE_URL}/category/${p.categorySlug}/${p.slug}`,
          brand: { "@type": "Brand", "@id": `${SITE_URL}/brand/${toBrandSlug(p.brand)}#brand`, name: p.brand },
          ...(p.image && { image: { "@type": "ImageObject", url: p.image, contentUrl: p.image, name: p.name, isAccessibleForFree: true } }),
          ...(avgRating > 0 && {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: avgRating.toFixed(1),
              bestRating: 5,
              worstRating: 1,
              ratingCount: p.reviewCount,
              reviewCount: p.reviewCount,
            },
          }),
          ...(() => { const o = aggregateOfferFromProduct(p); return o ? { offers: o } : {}; })(),
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
    ...(video.uploadDate && { uploadDate: video.uploadDate }),
    contentUrl,
    embedUrl: `https://www.youtube.com/embed/${video.id}`,
    ...(video.duration && { duration: video.duration }),
    potentialAction: {
      "@type": "WatchAction",
      target: contentUrl,
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
    isAccessibleForFree: true,
    isPartOf: { "@id": `${SITE_URL}/#website` },
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
    jobTitle: "Consumer Technology Analyst",
    description: "Data-driven consumer technology analysts who aggregate verified buyer reviews and apply AI analysis to produce honest product insights.",
    sameAs: [`${SITE_URL}/about`],
    worksFor: { "@id": `${SITE_URL}/#organization` },
    knowsAbout: ["Product Reviews", "Consumer Electronics", "Buyer Guidance", "Comparative Product Analysis"],
  };
}

export function blogPostSchema(post: BlogPost) {
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${postUrl}#article`,
    url: postUrl,
    isAccessibleForFree: true,
    headline: post.title,
    description: post.seo.metaDescription,
    image: {
      "@type": "ImageObject",
      "@id": `${postUrl}#primary-image`,
      url: post.coverImage || `${SITE_URL}/og-default.jpg`,
      contentUrl: post.coverImage || `${SITE_URL}/og-default.jpg`,
      width: 1200,
      height: 630,
      name: post.title,
      caption: post.seo.metaDescription,
      creditText: "ReviewIQ",
      creator: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "ReviewIQ", url: SITE_URL },
      copyrightHolder: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "ReviewIQ", url: SITE_URL },
      license: `${SITE_URL}/terms`,
      acquireLicensePage: `${SITE_URL}/about`,
      isAccessibleForFree: true,
      isPartOf: { "@id": `${postUrl}#page` },
    },
    inLanguage: "en",
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/about#author-${post.author.name.toLowerCase().replace(/\s+/g, "-")}`,
      name: post.author.name,
      url: `${SITE_URL}/about`,
      jobTitle: "Consumer Technology Analyst",
      sameAs: [`${SITE_URL}/about`],
      knowsAbout: ["Product Reviews", "Consumer Electronics", "Buyer Guidance", "Comparative Product Analysis"],
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
        "@id": `${SITE_URL}/#logo`,
        url: `${SITE_URL}/logo.png`,
        contentUrl: `${SITE_URL}/logo.png`,
        width: 200,
        height: 60,
        name: "ReviewIQ Logo",
        caption: "ReviewIQ — Real Reviews, Real Intelligence",
        creator: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "ReviewIQ", url: SITE_URL },
        copyrightHolder: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "ReviewIQ", url: SITE_URL },
        isAccessibleForFree: true,
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    copyrightYear: new Date(post.publishedAt).getFullYear(),
    copyrightHolder: { "@id": `${SITE_URL}/#organization` },
    license: `${SITE_URL}/terms`,
    acquireLicensePage: `${SITE_URL}/about`,
    accessMode: ["textual", "visual"],
    accessibilityFeature: ["alternativeText", "readingOrder", "structuralNavigation"],
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${postUrl}#page`,
    },
    keywords: [post.seo.focusKeyword, ...post.seo.secondaryKeywords].join(", "),
    articleSection: post.categoryName,
    wordCount: post.content.split(/\s+/).filter(Boolean).length,
    abstract: post.seo.metaDescription,
    ...(post.readingTime > 0 && {
      timeRequired: `PT${post.readingTime}M`,
    }),
    ...(post.relatedProductSlugs.length > 0 && {
      mentions: post.relatedProductSlugs.map((slug) => ({
        "@type": "Product",
        "@id": `${SITE_URL}/category/${post.categorySlug}/${slug}#product`,
        name: slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
        url: `${SITE_URL}/category/${post.categorySlug}/${slug}`,
      })),
      about: post.relatedProductSlugs.slice(0, 1).map((slug) => ({
        "@type": "Product",
        "@id": `${SITE_URL}/category/${post.categorySlug}/${slug}#product`,
        name: slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
        url: `${SITE_URL}/category/${post.categorySlug}/${slug}`,
      })),
    }),
  };
}

export function blogListSchema(posts: BlogPost[]) {
  const sorted = [...posts].sort((a, b) => (a.publishedAt < b.publishedAt ? -1 : 1));
  const datePublished = sorted[0]?.publishedAt;
  const dateModified = [...posts].sort((a, b) => ((b.updatedAt || b.publishedAt) < (a.updatedAt || a.publishedAt) ? -1 : 1))[0]?.updatedAt || posts[0]?.publishedAt;
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog`,
    name: "ReviewIQ Blog",
    description: "Expert buying guides, product comparisons, and review insights from ReviewIQ.",
    url: `${SITE_URL}/blog`,
    inLanguage: "en",
    isAccessibleForFree: true,
    copyrightHolder: { "@id": `${SITE_URL}/#organization` },
    license: `${SITE_URL}/terms`,
    accessMode: ["textual", "visual"],
    accessibilityFeature: ["alternativeText", "readingOrder", "structuralNavigation"],
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntity: {
      "@type": "ItemList",
      "@id": `${SITE_URL}/blog#post-list`,
      name: "ReviewIQ Blog Posts",
      numberOfItems: posts.length,
      ...(posts.length > 0 && {
        itemListElement: posts.map((post, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/blog/${post.slug}`,
          item: {
            "@type": "BlogPosting",
            "@id": `${SITE_URL}/blog/${post.slug}#article`,
            headline: post.title,
            url: `${SITE_URL}/blog/${post.slug}`,
            inLanguage: "en",
            isAccessibleForFree: true,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt || post.publishedAt,
            ...(post.seo?.metaDescription && { description: post.seo.metaDescription }),
            ...(post.coverImage && {
              image: { "@type": "ImageObject", url: post.coverImage, contentUrl: post.coverImage, width: 1200, height: 630, name: post.title, ...(post.seo?.metaDescription && { caption: post.seo.metaDescription }), isAccessibleForFree: true },
            }),
            author: {
              "@type": "Person",
              "@id": `${SITE_URL}/about#author-${post.author.name.toLowerCase().replace(/\s+/g, "-")}`,
              name: post.author.name,
            },
            articleSection: post.categoryName,
            isPartOf: { "@id": `${SITE_URL}/blog#post-list` },
          },
        })),
      }),
    },
    hasPart: posts.map((post) => ({
      "@type": "BlogPosting",
      "@id": `${SITE_URL}/blog/${post.slug}#article`,
      headline: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      inLanguage: "en",
      isAccessibleForFree: true,
      datePublished: post.publishedAt,
      ...(post.seo?.metaDescription && { description: post.seo.metaDescription }),
      ...(post.coverImage && {
        image: { "@type": "ImageObject", url: post.coverImage, contentUrl: post.coverImage, width: 1200, height: 630, name: post.title, ...(post.seo?.metaDescription && { caption: post.seo.metaDescription }), isAccessibleForFree: true },
      }),
      author: {
        "@type": "Person",
        "@id": `${SITE_URL}/about#author-${post.author.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: post.author.name,
        jobTitle: "Consumer Technology Analyst",
        sameAs: [`${SITE_URL}/about`],
        knowsAbout: ["Product Reviews", "Consumer Electronics", "Buyer Guidance", "Comparative Product Analysis"],
      },
      dateModified: post.updatedAt || post.publishedAt,
      articleSection: post.categoryName,
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
    copyrightHolder: { "@id": `${SITE_URL}/#organization` },
    license: `${SITE_URL}/terms`,
    accessMode: ["textual"],
    accessibilityFeature: ["readingOrder", "structuralNavigation"],
    totalTime: `PT${Math.max(1, steps.reduce((sum, s) => sum + Math.ceil(s.text.split(/\s+/).filter(Boolean).length / 100), 0))}M`,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      url: `${schemaUrl}#step-${index + 1}`,
      ...(step.image ? { image: { "@type": "ImageObject", url: `${SITE_URL}${step.image}`, contentUrl: `${SITE_URL}${step.image}`, name: step.name, isAccessibleForFree: true } } : {}),
    })),
    url: schemaUrl,
    author: { "@id": `${SITE_URL}/about#ai-review-team` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    tool: [{
      "@type": "WebApplication",
      name: "ReviewIQ",
      url: SITE_URL,
      applicationCategory: "UtilitiesApplication",
      description: "AI-powered product review platform for verified buyer analysis",
    }],
    inLanguage: "en",
    isAccessibleForFree: true,
  };
}

export function communityPageSchema(threads?: DiscussionThread[], datePublished?: string, dateModified?: string) {
  const pageUrl = `${SITE_URL}/community`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}#page`,
    name: "ReviewIQ Community",
    description: "Real conversations about real products. Ask questions, share experiences, and help others make smarter buying decisions.",
    url: pageUrl,
    inLanguage: "en",
    isAccessibleForFree: true,
    copyrightHolder: { "@id": `${SITE_URL}/#organization` },
    license: `${SITE_URL}/terms`,
    accessMode: ["textual"],
    accessibilityFeature: ["readingOrder"],
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    about: { "@id": `${SITE_URL}/#organization` },
    mentions: [{ "@id": `${SITE_URL}/#organization` }],
    mainEntity: {
      "@type": "ItemList",
      "@id": `${pageUrl}#thread-list`,
      name: "Community Discussion Threads",
      url: pageUrl,
      ...(threads && threads.length > 0 && {
        numberOfItems: threads.length,
        itemListElement: threads.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/community/thread/${t.id}`,
          item: {
            "@type": "DiscussionForumPosting",
            "@id": `${SITE_URL}/community/thread/${t.id}#discussion`,
            headline: t.title,
            url: `${SITE_URL}/community/thread/${t.id}`,
            inLanguage: "en",
            isAccessibleForFree: true,
            datePublished: t.createdAt,
            dateModified: t.lastActivityAt,
            ...(t.productSlug && t.categorySlug ? {
              about: {
                "@type": "Product",
                "@id": `${SITE_URL}/category/${t.categorySlug}/${t.productSlug}#product`,
                name: t.productSlug.replace(/-/g, " "),
              },
            } : {}),
            interactionStatistic: [
              { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: t.upvotes },
              { "@type": "InteractionCounter", interactionType: "https://schema.org/CommentAction", userInteractionCount: t.commentCount },
            ],
            isPartOf: { "@id": `${pageUrl}#page` },
          },
        })),
      }),
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["[data-speakable='community-hero']", "[data-speakable='community-discussions']"],
    },
  };
}

export function homePageSchema(featuredPosts?: BlogPost[]) {
  return {
    "@context": "https://schema.org",
    "@type": ["WebPage", "CollectionPage"],
    "@id": `${SITE_URL}/#page`,
    name: "ReviewIQ — Real Reviews, Real Intelligence",
    description: "AI-powered product reviews for smart buyers. Honest data. Verified buyers. No affiliate bias.",
    url: SITE_URL,
    inLanguage: "en",
    isAccessibleForFree: true,
    copyrightHolder: { "@id": `${SITE_URL}/#organization` },
    license: `${SITE_URL}/terms`,
    accessMode: ["textual", "visual"],
    accessibilityFeature: ["alternativeText", "readingOrder", "structuralNavigation"],
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    about: { "@id": `${SITE_URL}/#organization` },
    mainEntity: { "@id": `${SITE_URL}/categories#category-list` },
    ...(featuredPosts && featuredPosts.length > 0 && {
      mentions: featuredPosts.map((post) => ({
        "@type": "BlogPosting",
        "@id": `${SITE_URL}/blog/${post.slug}#article`,
        headline: post.title,
        url: `${SITE_URL}/blog/${post.slug}`,
        datePublished: post.publishedAt,
        inLanguage: "en",
        isAccessibleForFree: true,
        ...(post.seo?.metaDescription && { description: post.seo.metaDescription }),
        author: {
          "@type": "Person",
          "@id": `${SITE_URL}/about#author-${post.author.name.toLowerCase().replace(/\s+/g, "-")}`,
          name: post.author.name,
        },
        isPartOf: { "@id": `${SITE_URL}/blog#blog` },
      })),
    }),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [
        "[data-speakable='hero-tagline']",
        "[data-speakable='hero-stats']",
        "[data-speakable='featured-guides']",
        "[data-speakable='faq-answer']",
      ],
    },
  };
}

export function speakableSchema(productName: string, productUrl: string, datePublished?: string, dateModified?: string) {
  const pageUrl = `${SITE_URL}${productUrl}`;
  return {
    "@context": "https://schema.org",
    "@type": ["WebPage", "ItemPage"],
    "@id": `${pageUrl}#page`,
    name: `${productName} Review`,
    url: pageUrl,
    inLanguage: "en",
    isAccessibleForFree: true,
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    mainEntity: { "@type": "Product", "@id": `${pageUrl}#product` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    author: { "@id": `${SITE_URL}/about#ai-review-team` },
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

export function blogPostSpeakableSchema(title: string, url: string, datePublished?: string, dateModified?: string) {
  const pageUrl = `${SITE_URL}${url}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#page`,
    name: title,
    url: pageUrl,
    inLanguage: "en",
    isAccessibleForFree: true,
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    mainEntity: { "@id": `${pageUrl}#article` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [
        "[data-speakable='blog-headline']",
        "[data-speakable='blog-intro']",
        "[data-speakable='blog-body']",
        "[data-speakable='faq-answer']",
      ],
    },
  };
}

export function discussionForumPostingSchema(
  thread: DiscussionThread,
  authorName: string,
  authorUsername?: string
) {
  const threadUrl = `${SITE_URL}/community/thread/${thread.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "@id": `${threadUrl}#discussion`,
    headline: thread.title,
    text: thread.body,
    url: threadUrl,
    datePublished: thread.createdAt,
    dateModified: thread.lastActivityAt,
    copyrightYear: new Date(thread.createdAt).getFullYear(),
    copyrightHolder: { "@id": `${SITE_URL}/#organization` },
    license: `${SITE_URL}/terms`,
    accessMode: ["textual"],
    accessibilityFeature: ["readingOrder", "structuralNavigation"],
    inLanguage: "en",
    isAccessibleForFree: true,
    author: (() => {
      const slug = authorUsername ?? authorName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const profileUrl = `${SITE_URL}/community/user/${slug}`;
      return {
        "@type": "Person",
        "@id": `${profileUrl}#person`,
        sameAs: [profileUrl],
        name: authorName,
        ...(thread.tags.length > 0 && { knowsAbout: thread.tags.map((t) => t.replace(/-/g, " ")) }),
      };
    })(),
    ...(thread.productSlug && thread.categorySlug ? {
      about: {
        "@type": "Product",
        "@id": `${SITE_URL}/category/${thread.categorySlug}/${thread.productSlug}#product`,
        name: thread.productSlug.replace(/-/g, " "),
        url: `${SITE_URL}/category/${thread.categorySlug}/${thread.productSlug}`,
      },
      mentions: {
        "@type": "Product",
        "@id": `${SITE_URL}/category/${thread.categorySlug}/${thread.productSlug}#product`,
        name: thread.productSlug.replace(/-/g, " "),
      },
    } : thread.categorySlug ? {
      about: {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/category/${thread.categorySlug}#page`,
        name: thread.categorySlug.replace(/-/g, " "),
        url: `${SITE_URL}/category/${thread.categorySlug}`,
      },
    } : {}),
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
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/ViewAction",
        userInteractionCount: thread.viewCount,
      },
    ],
    ...(thread.tags.length > 0 && { keywords: thread.tags.join(", ") }),
    isPartOf: { "@id": `${SITE_URL}/community#page` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${threadUrl}#page` },
  };
}

export function threadPageSpeakableSchema(title: string, url: string, datePublished?: string, dateModified?: string) {
  const pageUrl = `${SITE_URL}${url}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#page`,
    name: title,
    url: pageUrl,
    inLanguage: "en",
    isAccessibleForFree: true,
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    mainEntity: { "@id": `${pageUrl}#discussion` },
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
  datePublished?: string;
  dateModified?: string;
}) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${SITE_URL}${opts.pageUrl}#faq`,
      url: `${SITE_URL}${opts.pageUrl}`,
      inLanguage: "en",
      isAccessibleForFree: true,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      mainEntity: opts.faqs.map((faq, index) => ({
        "@type": "Question",
        "@id": `${SITE_URL}${opts.pageUrl}#faq-q-${index}`,
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
      "@id": `${SITE_URL}${opts.pageUrl}#page`,
      name: opts.pageName,
      url: `${SITE_URL}${opts.pageUrl}`,
      inLanguage: "en",
      isAccessibleForFree: true,
      ...(opts.datePublished && { datePublished: opts.datePublished }),
      ...(opts.dateModified && { dateModified: opts.dateModified }),
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
        cssSelector: ["[data-speakable='faq-hero']", "[data-speakable='faq-answer']"],
      },
    },
  ];
}

export function profilePageSchema(
  username: string,
  displayName: string,
  bio?: string,
  expertiseCategories?: string[],
  joinedAt?: string,
  lastActiveAt?: string,
  reviewCount?: number,
  commentCount?: number,
  threadCount?: number
) {
  const pageUrl = `${SITE_URL}/community/user/${username}`;
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${pageUrl}#page`,
    name: `${displayName} — ReviewIQ Community`,
    url: pageUrl,
    inLanguage: "en",
    isAccessibleForFree: true,
    copyrightHolder: { "@id": `${SITE_URL}/#organization` },
    license: `${SITE_URL}/terms`,
    accessMode: ["textual"],
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(joinedAt && { dateCreated: joinedAt }),
    ...(lastActiveAt && { dateModified: lastActiveAt }),
    ...(bio && {
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["[data-speakable='profile-bio']"],
      },
    }),
    mainEntity: {
      "@type": "Person",
      "@id": `${pageUrl}#person`,
      name: displayName,
      url: pageUrl,
      identifier: { "@type": "PropertyValue", propertyID: "username", value: username },
      ...(bio && { description: bio }),
      ...(expertiseCategories && expertiseCategories.length > 0 && {
        knowsAbout: expertiseCategories.map((s) => s.replace(/-/g, " ")),
      }),
      memberOf: {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "ReviewIQ",
        url: SITE_URL,
      },
      ...((reviewCount !== undefined || commentCount !== undefined || threadCount !== undefined) && {
        interactionStatistic: [
          ...(reviewCount !== undefined ? [{
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/WriteAction",
            userInteractionCount: reviewCount,
          }] : []),
          ...(commentCount !== undefined ? [{
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/CommentAction",
            userInteractionCount: commentCount,
          }] : []),
          ...(threadCount !== undefined ? [{
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/CreateAction",
            userInteractionCount: threadCount,
          }] : []),
        ],
      }),
    },
  };
}

export function blogCategoryPageSchema(categoryName: string, description: string, categorySlug: string, posts?: BlogPost[], datePublished?: string, dateModified?: string) {
  const pageUrl = `${SITE_URL}/blog/category/${categorySlug}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}#page`,
    name: `${categoryName} Buying Guides & Reviews`,
    description,
    url: pageUrl,
    inLanguage: "en",
    isAccessibleForFree: true,
    copyrightHolder: { "@id": `${SITE_URL}/#organization` },
    license: `${SITE_URL}/terms`,
    accessMode: ["textual", "visual"],
    accessibilityFeature: ["alternativeText", "readingOrder", "structuralNavigation"],
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    about: { "@type": "Thing", "@id": `${SITE_URL}/category/${categorySlug}#page`, name: categoryName, url: `${SITE_URL}/category/${categorySlug}` },
    mainEntity: {
      "@type": "ItemList",
      "@id": `${pageUrl}#post-list`,
      name: `${categoryName} Blog Posts`,
      url: pageUrl,
      ...(posts && posts.length > 0 && {
        numberOfItems: posts.length,
        itemListElement: posts.map((post, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/blog/${post.slug}`,
          item: {
            "@type": "BlogPosting",
            "@id": `${SITE_URL}/blog/${post.slug}#article`,
            headline: post.title,
            url: `${SITE_URL}/blog/${post.slug}`,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt || post.publishedAt,
            ...(post.seo?.metaDescription && { description: post.seo.metaDescription }),
            ...(post.coverImage && {
              image: { "@type": "ImageObject", url: post.coverImage, contentUrl: post.coverImage, width: 1200, height: 630, name: post.title, isAccessibleForFree: true },
            }),
            author: {
              "@type": "Person",
              "@id": `${SITE_URL}/about#author-${post.author.name.toLowerCase().replace(/\s+/g, "-")}`,
              name: post.author.name,
            },
            articleSection: post.categoryName,
            isPartOf: { "@id": `${pageUrl}#post-list` },
          },
        })),
      }),
    },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["[data-speakable='blog-category-intro']"],
    },
  };
}

export function categoryPageSchema(categoryName: string, description: string, categoryUrl: string, datePublished?: string, dateModified?: string) {
  const pageUrl = `${SITE_URL}${categoryUrl}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}#page`,
    name: `Best ${categoryName}`,
    description,
    url: pageUrl,
    inLanguage: "en",
    isAccessibleForFree: true,
    copyrightHolder: { "@id": `${SITE_URL}/#organization` },
    license: `${SITE_URL}/terms`,
    accessMode: ["textual", "visual"],
    accessibilityFeature: ["alternativeText", "readingOrder", "structuralNavigation"],
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    about: {
      "@type": "Thing",
      "@id": `${pageUrl}#category-subject`,
      name: categoryName,
      description,
      url: pageUrl,
    },
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    mainEntity: { "@type": "ItemList", "@id": `${pageUrl}#product-list`, name: `Best ${categoryName}` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["[data-speakable='category-name']", "[data-speakable='category-description']", "[data-speakable='buying-guide']"],
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
    "@id": `${pageUrl}#page`,
    name: `${productA.name} vs ${productB.name} — Comparison`,
    description: `Side-by-side comparison of ${productA.name} and ${productB.name} based on verified buyer reviews.`,
    url: pageUrl,
    inLanguage: "en",
    isAccessibleForFree: true,
    copyrightHolder: { "@id": `${SITE_URL}/#organization` },
    license: `${SITE_URL}/terms`,
    accessMode: ["textual", "visual"],
    accessibilityFeature: ["alternativeText", "readingOrder", "structuralNavigation"],
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    author: { "@id": `${SITE_URL}/about#ai-review-team` },
    datePublished,
    dateModified,
    about: [
      { "@type": "Product", "@id": `${SITE_URL}/category/${productA.categorySlug}/${productA.slug}#product` },
      { "@type": "Product", "@id": `${SITE_URL}/category/${productB.categorySlug}/${productB.slug}#product` },
    ],
    mentions: [
      { "@type": "Product", "@id": `${SITE_URL}/category/${productA.categorySlug}/${productA.slug}#product`, name: productA.name },
      { "@type": "Product", "@id": `${SITE_URL}/category/${productB.categorySlug}/${productB.slug}#product`, name: productB.name },
    ],
    potentialAction: {
      "@type": "CompareAction",
      object: [
        { "@type": "Product", "@id": `${SITE_URL}/category/${productA.categorySlug}/${productA.slug}#product` },
        { "@type": "Product", "@id": `${SITE_URL}/category/${productB.categorySlug}/${productB.slug}#product` },
      ],
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [
        "[data-speakable='comparison-headline']",
        "[data-speakable='comparison-summary']",
        "[data-speakable='ai-verdict']",
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
    brand: { "@type": "Brand", "@id": `${SITE_URL}/brand/${toBrandSlug(product.brand)}#brand`, name: product.brand },
    description: product.description,
    ...(product.categorySlug && { category: product.categorySlug }),
    inLanguage: "en",
    ...(product.image && {
      image: {
        "@type": "ImageObject",
        "@id": `${productUrl}#primary-image`,
        url: product.image,
        contentUrl: product.image,
        name: product.name,
        caption: product.description,
        creditText: "ReviewIQ",
        creator: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "ReviewIQ", url: SITE_URL },
        copyrightHolder: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "ReviewIQ", url: SITE_URL },
        license: `${SITE_URL}/terms`,
        acquireLicensePage: `${SITE_URL}/about`,
        isAccessibleForFree: true,
        isPartOf: { "@id": `${productUrl}#page` },
      },
    }),
  };

  const offers = aggregateOfferFromProduct(product);
  if (offers) item.offers = offers;

  if (ratingCount > 0 && avgRating > 0) {
    item.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      ratingCount: ratingCount,
      reviewCount: ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const additionalProps: Record<string, unknown>[] = [];

  if (product.smartScore > 0) {
    additionalProps.push({
      "@type": "PropertyValue",
      propertyID: "SmartScore",
      name: "SmartScore",
      value: product.smartScore,
      minValue: 0,
      maxValue: 100,
      description: "AI-aggregated score from verified buyer reviews (0-100)",
      url: productUrl,
    });
  }

  if (product.specs && product.specs.length > 0) {
    product.specs.forEach((spec) => {
      additionalProps.push({
        "@type": "PropertyValue",
        name: spec.label,
        value: spec.value,
      });
    });
  }

  if (additionalProps.length > 0) {
    item.additionalProperty = additionalProps;
  }

  return item;
}
