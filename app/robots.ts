import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Low-value / non-indexable routes. Keeping crawlers out of these preserves
// crawl budget for the content that actually ranks (products, comparisons,
// categories, blog, community) and stops gated/transactional pages from
// being fetched or indexed. Keep in sync with app/ routes that are either
// auth-gated, user-specific, transactional, or funnel-only.
const DISALLOW = [
  "/api/",
  "/admin/",
  "/auth/", // OAuth flows + callbacks — no content
  "/dashboard", // authenticated user area
  "/settings", // authenticated user area
  "/unsubscribe", // tokenized transactional page
  "/survey", // survey funnel — not standalone content
];

// AI answer-engine / training crawlers we explicitly welcome for AEO/GEO
// visibility (ChatGPT, Claude, Gemini, Perplexity, Apple Intelligence, Meta
// AI, Amazon, Mistral, DuckAssist, etc.). Listing the current agent names
// keeps us discoverable as these vendors rotate/retire user-agents. They get
// the same crawl-budget disallow as everyone else so they don't waste fetches
// on gated pages.
const AI_BOTS = [
  // OpenAI
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  // Anthropic (current + legacy)
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "Anthropic-AI",
  "Claude-Web",
  // Google (Gemini / Vertex)
  "Google-Extended",
  "Google-CloudVertexBot",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Apple Intelligence
  "Applebot-Extended",
  // Meta AI
  "meta-externalagent",
  "FacebookBot",
  // Others
  "Amazonbot",
  "Bytespider",
  "CCBot",
  "cohere-ai",
  "DuckAssistBot",
  "MistralAI-User",
  "YouBot",
  "Timpibot",
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com").trim();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
      ...AI_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
