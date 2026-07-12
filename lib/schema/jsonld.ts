import type { Product, Review, Category, FAQItem, BlogPost, YouTubeVideo, BuyingGuideStep, DiscussionThread, Comment, UserProfile, MerchantOffer } from "@/types";
import type { FAQEntry } from "@/data/faq-pages";
import { productAverageRating, productDisplayName } from "@/lib/utils";

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

// The /about page carried only the site-wide Organization/WebSite nodes — the
// page itself had no schema. Google treats the About page as a primary
// E-E-A-T / entity-trust surface, so emit an AboutPage that is explicitly
// "about" the canonical Organization. We reference ORG_ID / WEBSITE_ID (never
// re-declare the Organization inline) so answer engines merge this into the
// same ReviewIQ node instead of spawning a duplicate, unlinked entity.
export function aboutPageSchema() {
  const aboutUrl = `${SITE_URL}/about`;
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${aboutUrl}#webpage`,
    url: aboutUrl,
    name: "About ReviewIQ",
    description:
      "ReviewIQ is an AI-powered product review platform built to fix the broken review ecosystem. SmartScores run entirely on verified buyer data — affiliate commissions are never an input.",
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": ORG_ID },
    about: { "@id": ORG_ID },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "About", item: aboutUrl },
      ],
    },
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
  // Average over the full review population (ratingDistribution), not the small
  // sample in product.reviews — so ratingValue matches the reviewCount it is
  // paired with and the on-page rating summary / OG card.
  const avgRating = productAverageRating(product);

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

  // Fold the "Best For / Not Ideal For" buyer-fit signals into this single
  // canonical Product node. These previously rendered as a SEPARATE, second
  // Product JSON-LD node (components/product/BestFor.tsx) whose url pointed at a
  // non-www /category/{slug} path that 404s — a duplicate, unlinked entity with
  // an invalid URL. Attaching them here keeps one Product entity per page and
  // hangs the fit signals off the node that also carries offers/rating/reviews.
  const additionalProperty = [
    ...(product.aiSummary?.bestFor ?? []).map((value) => ({
      "@type": "PropertyValue",
      name: "Best For",
      value,
    })),
    ...(product.aiSummary?.notFor ?? []).map((value) => ({
      "@type": "PropertyValue",
      name: "Not Ideal For",
      value,
    })),
  ];
  if (additionalProperty.length > 0) schema.additionalProperty = additionalProperty;

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

/**
 * Product node for a "Where to buy X" page, carrying one Offer per live merchant.
 *
 * Built ONLY from `offers` the page actually renders — never from product.priceRange —
 * so every marked-up price is one a visitor can see. Returns null when there are no
 * live offers (the panel's empty state), because a Product/Offer node on a page that
 * shows no prices is markup that contradicts the page.
 */
export function whereToBuySchema(product: Product, offers: MerchantOffer[]) {
  if (offers.length === 0) return null;

  const url = `${SITE_URL}/category/${product.categorySlug}/${product.slug}/where-to-buy`;
  const avgRating = productAverageRating(product);
  const ratingCount = product.reviewCount || product.reviews.length;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    description: product.description,
    image: `${SITE_URL}/category/${product.categorySlug}/${product.slug}/opengraph-image`,
    url,
    offers: offers.map((o) => ({
      "@type": "Offer",
      price: o.price,
      priceCurrency: o.currency,
      url: o.url,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: o.merchantName },
    })),
  };

  if (ratingCount > 0 && avgRating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      reviewCount: ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
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

// CollectionPage node for /category/[slug] — gives the category hub a typed
// WebPage node with full GEO signals so AI crawlers can classify this page as a
// curated product index (vs a bare ItemList with no page context).
export function categoryPageSchema(opts: {
  slug: string;
  name: string;
  description: string;
  productCount: number;
  today: string;
}) {
  const url = `${SITE_URL}/category/${opts.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#webpage`,
    url,
    name: `Best ${opts.name} — Reviews & Comparisons`,
    alternativeHeadline: `Top-Rated ${opts.name} Ranked by Verified Buyers`,
    description: opts.description,
    abstract: `${opts.productCount} ${opts.name} ranked by SmartScore from verified buyer reviews. Honest, affiliate-free comparisons for 2026.`,
    inLanguage: "en-US",
    genre: "Product Review Index",
    isAccessibleForFree: true,
    creativeWorkStatus: "Published",
    datePublished: "2024-01-01",
    dateModified: opts.today,
    contentReferenceTime: opts.today,
    publisher: { "@type": "Organization", "@id": ORG_ID, name: "ReviewIQ", url: SITE_URL },
    isPartOf: { "@id": WEBSITE_ID },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "p:first-of-type"],
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Categories", item: `${SITE_URL}/categories` },
        { "@type": "ListItem", position: 3, name: opts.name, item: url },
      ],
    },
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

// The /compare hub is a client-side comparison builder, so it emitted no
// structured data at all. This gives the hub a CollectionPage whose ItemList
// enumerates every curated "X vs Y" money page — helping answer engines discover
// and treat the comparison set as one curated collection (potential sitelinks /
// list treatment) and reinforcing internal links to the highest-intent pages.
export function comparisonHubSchema(
  pairs: { slug: string; productA: Product; productB: Product }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Product Comparisons",
    description:
      "Head-to-head product comparisons scored on SmartScore, specs, and verified buyer reviews.",
    url: `${SITE_URL}/compare`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: pairs.length,
      itemListElement: pairs.map((pair, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${pair.productA.name} vs ${pair.productB.name}`,
        url: `${SITE_URL}/compare/${pair.slug}`,
      })),
    },
  };
}

// The /faq index is a hub linking to individual FAQ topic pages — it holds no
// Q&A pairs itself, so FAQPage schema would be wrong here (Google requires the
// Q&A to be visible on the page emitting FAQPage). CollectionPage + ItemList is
// the correct, truthful type for a directory of topic pages — mirrors
// comparisonHubSchema so Google can surface the hub and its sitelinks.
export function faqHubSchema(pages: { slug: string; title: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Frequently Asked Questions",
    description:
      "Honest answers about product review platforms, fake reviews, and how ReviewIQ provides verified, AI-powered product intelligence.",
    url: `${SITE_URL}/faq`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: pages.length,
      itemListElement: pages.map((page, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: page.title,
        url: `${SITE_URL}/faq/${page.slug}`,
      })),
    },
  };
}

// The /products catalog hub enumerates every catalog product's canonical page so
// answer engines can treat the catalog as one curated collection (potential
// list/sitelink treatment). URLs mirror the sitemap exactly:
// /category/{categorySlug}/{slug}. The page must also render a crawlable <a> to
// each of these URLs — structured data has to match what the page actually shows,
// and the list is only a discovery path if the links are in the HTML.
export function productsHubSchema(products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Browse All Products",
    description:
      "Every product on ReviewIQ, scored on SmartScore, price, and verified buyer reviews across all categories.",
    url: `${SITE_URL}/products`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: productDisplayName(product),
        url: `${SITE_URL}/category/${product.categorySlug}/${product.slug}`,
      })),
    },
  };
}

// The /community index is a forum listing. Each thread already emits its own
// QAPage / DiscussionForumPosting node on /community/thread/[id] (see
// communityThreadSchema); the hub itself was schema-less. A CollectionPage +
// ItemList of every thread lets answer engines treat the index as the canonical
// entry point to the discussion set and surface it in list-style rich results,
// matching the pattern used for the /compare, /products, and /faq hubs.
export function communityHubSchema(threads: DiscussionThread[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ReviewIQ Community",
    description:
      "Real conversations about real products. Ask questions, share experiences, and help others make smarter buying decisions on ReviewIQ.",
    url: `${SITE_URL}/community`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: threads.length,
      itemListElement: threads.map((thread, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: thread.title,
        url: `${SITE_URL}/community/thread/${thread.id}`,
      })),
    },
  };
}

// Every field here describes a third-party video we merely embed, so every field has to
// come from YouTube rather than from us. The seeded data got this backwards: it carried
// hand-written titles for IDs that mostly did not exist, and stamped uploadDate with the
// build date — so the markup re-dated itself on every deploy and described videos that
// were never checked. scripts/verify-youtube-videos.mts is what keeps the data honest;
// this function must never invent a field the data does not have.
export function videoObjectSchema(video: YouTubeVideo, productName: string) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: `${video.title} — video review for ${productName}`,
    thumbnailUrl: `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
    contentUrl: `https://www.youtube.com/watch?v=${video.id}`,
    embedUrl: `https://www.youtube.com/embed/${video.id}`,
  };
  // Required by Google for a video rich result, but an invented date is worse than an
  // absent one: omit it when the real date is unknown.
  if (video.uploadDate) schema.uploadDate = video.uploadDate;
  // We are not the publisher — credit the channel that actually made the video.
  if (video.channel) schema.creator = { "@type": "Person", name: video.channel };
  return schema;
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
  // The on-page AI analysis (AISummaryCard / key facts / smart score) is authored
  // by ReviewIQ's analysis team. Expose that as the WebPage author so the editorial
  // review content carries an identifiable author entity (schema.org WebPage.author)
  // — an E-E-A-T signal answer engines look for on review pages. Drop the nested
  // @context; only the root node needs it.
  const { "@context": _ctx, ...author } = analysisAuthorSchema();
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${productName} Review`,
    url: `${SITE_URL}${productUrl}`,
    author,
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

// Community author profile pages (/community/user/[username]) are already in the
// sitemap but carried only BreadcrumbList/Organization schema, so they were
// ineligible for Google's Profile Page rich result (the card that surfaces a
// creator's name, bio and post/vote counts). ProfilePage requires dateCreated,
// dateModified and a mainEntity Person; per the spec, agentInteractionStatistic
// counts content the person AUTHORED (reviews/comments/discussions) and
// interactionStatistic counts interactions they RECEIVED (helpful votes).
export function profilePageSchema(user: UserProfile) {
  const profileUrl = `${SITE_URL}/community/user/${user.username}`;
  const authored = user.reviewCount + user.commentCount + user.threadCount;

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: profileUrl,
    dateCreated: user.joinedAt,
    dateModified: user.lastActiveAt,
    mainEntity: {
      "@type": "Person",
      "@id": `${profileUrl}#person`,
      name: user.displayName,
      alternateName: `@${user.username}`,
      identifier: user.username,
      description: user.bio,
      url: profileUrl,
      ...(user.expertiseCategories.length > 0
        ? { knowsAbout: user.expertiseCategories.map((c) => c.replace(/-/g, " ")) }
        : {}),
      // Content this member authored on ReviewIQ.
      agentInteractionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/WriteAction",
          userInteractionCount: authored,
        },
      ],
      // Recognition this member received from the community.
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/LikeAction",
          userInteractionCount: user.helpfulVotesReceived,
        },
      ],
    },
  };
}

// Community thread pages carried only BreadcrumbList/Organization schema — the
// discussion content itself (question, answers, replies) was invisible to Google
// and AI answer engines. Emit QAPage for question threads (the type Google shows
// with the Q&A rich result and mines for "People also ask") and
// DiscussionForumPosting for every other thread type (forum rich result +
// interaction counts). Both are attached to the same URL; only one is emitted.
export function communityThreadSchema(
  thread: DiscussionThread,
  comments: Comment[],
  resolveAuthorName: (authorId: string) => string
) {
  const threadUrl = `${SITE_URL}/community/thread/${thread.id}`;
  const authorName = resolveAuthorName(thread.authorId) || "Community Member";

  // getCommentsByThread returns top-level comments with nested replies; flatten
  // so every reply becomes a schema answer/comment node, ordered top-level first.
  const flat: Comment[] = [];
  for (const c of comments) {
    flat.push(c);
    if (c.replies) flat.push(...c.replies);
  }

  const answerNode = (c: Comment) => ({
    "@type": "Answer",
    text: c.body,
    url: `${threadUrl}#comment-${c.id}`,
    datePublished: c.createdAt,
    upvoteCount: c.upvotes,
    author: {
      "@type": "Person",
      name: resolveAuthorName(c.authorId) || "Community Member",
    },
  });

  // A QAPage rich result needs the Question plus at least one answer. Question
  // threads with no replies fall through to DiscussionForumPosting so we never
  // emit an answer-less (invalid) QAPage node.
  if (thread.threadType === "question" && flat.length > 0) {
    // Prefer the human-marked top answer, else the highest-voted reply.
    const accepted =
      flat.find((c) => c.isTopAnswer) ||
      [...flat].sort((a, b) => b.upvotes - a.upvotes)[0];
    const suggested = flat.filter((c) => c.id !== accepted.id);

    return {
      "@context": "https://schema.org",
      "@type": "QAPage",
      mainEntity: {
        "@type": "Question",
        name: thread.title,
        text: thread.body,
        answerCount: flat.length,
        upvoteCount: thread.upvotes,
        datePublished: thread.createdAt,
        author: { "@type": "Person", name: authorName },
        acceptedAnswer: answerNode(accepted),
        ...(suggested.length > 0
          ? { suggestedAnswer: suggested.map(answerNode) }
          : {}),
      },
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: thread.title,
    articleBody: thread.body,
    url: threadUrl,
    datePublished: thread.createdAt,
    dateModified: thread.lastActivityAt,
    author: { "@type": "Person", name: authorName },
    publisher: { "@id": ORG_ID },
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
    ...(flat.length > 0
      ? {
          comment: flat.map((c) => ({
            "@type": "Comment",
            text: c.body,
            url: `${threadUrl}#comment-${c.id}`,
            datePublished: c.createdAt,
            upvoteCount: c.upvotes,
            author: {
              "@type": "Person",
              name: resolveAuthorName(c.authorId) || "Community Member",
            },
          })),
        }
      : {}),
  };
}

function comparisonProductItem(product: Product) {
  const ratingCount = product.reviewCount || product.reviews.length;
  // Full-population average (see productSchema) so the comparison Product node's
  // ratingValue is consistent with its reviewCount.
  const avgRating = productAverageRating(product);

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
