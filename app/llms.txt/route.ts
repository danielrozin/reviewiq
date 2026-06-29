import { categories } from "@/data/categories";
import { getAllComparisonPairs } from "@/data/comparisons";
import { getAllBlogPosts } from "@/data/blog-posts";
import { faqPages } from "@/data/faq-pages";

// AEO/GEO: serve an llms.txt manifest (https://llmstxt.org) so AI answer
// engines (ChatGPT, Perplexity, Claude, Google AI Overviews) can discover and
// cite our highest-value content. Static data only, so safe to fully cache.
export const dynamic = "force-static";

/** Collapse whitespace and clip a description to one tidy line. */
function oneLine(text: string | undefined, max = 160): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export function GET() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com").trim();
  const abs = (path: string) => `${siteUrl}${path}`;

  const lines: string[] = [];

  lines.push("# ReviewIQ");
  lines.push("");
  lines.push(
    "> Independent product comparisons and buying guides built from verified buyer reviews. " +
      "ReviewIQ aggregates hundreds of real owner reviews into a single SmartScore per product so " +
      "shoppers can quickly decide between similar options."
  );
  lines.push("");
  lines.push(
    "ReviewIQ compares consumer products (robot vacuums, coffee machines, air fryers, wireless " +
      "earbuds, mattresses, smart watches, standing desks and more) head-to-head using SmartScores " +
      "derived from verified buyer feedback. We disclose our methodology, AI usage and affiliate " +
      "relationships openly — see How We Work."
  );
  lines.push("");

  // Key informational pages
  lines.push("## Key pages");
  const keyPages: Array<[string, string, string]> = [
    ["Home", "/", "Product comparisons and SmartScores across every category"],
    ["How We Work", "/how-we-work", "Review methodology, AI usage, and affiliate disclosure"],
    ["How It Works", "/how-it-works", "How SmartScores are calculated from verified reviews"],
    ["All Categories", "/categories", "Browse every product category we cover"],
    ["All Comparisons", "/compare", "Head-to-head product comparison index"],
    ["Blog & Guides", "/blog", "Buying guides and in-depth comparison articles"],
    ["FAQ", "/faq", "Answers about review trust, sources, and our methodology"],
    ["Write a Review", "/write-review", "Submit a verified product review"],
  ];
  for (const [title, path, desc] of keyPages) {
    lines.push(`- [${title}](${abs(path)}): ${desc}`);
  }
  lines.push("");

  // Categories
  lines.push("## Categories");
  for (const cat of categories) {
    const desc = oneLine(cat.description);
    lines.push(`- [${cat.name}](${abs(`/category/${cat.slug}`)})${desc ? `: ${desc}` : ""}`);
  }
  lines.push("");

  // Top comparisons (already sorted by search volume, highest value first)
  const comparisons = getAllComparisonPairs().slice(0, 40);
  if (comparisons.length) {
    lines.push("## Top comparisons");
    for (const pair of comparisons) {
      const title = `${pair.productA.name} vs ${pair.productB.name}`;
      lines.push(`- [${title}](${abs(`/compare/${pair.slug}`)})`);
    }
    lines.push("");
  }

  // Blog / buying guides
  const posts = getAllBlogPosts();
  if (posts.length) {
    lines.push("## Guides & blog");
    for (const post of posts) {
      const excerpt = oneLine(post.excerpt);
      lines.push(`- [${post.title}](${abs(`/blog/${post.slug}`)})${excerpt ? `: ${excerpt}` : ""}`);
    }
    lines.push("");
  }

  // Competitor FAQ landing pages
  if (faqPages.length) {
    lines.push("## FAQ pages");
    for (const page of faqPages) {
      lines.push(`- [${page.title}](${abs(`/faq/${page.slug}`)})`);
    }
    lines.push("");
  }

  lines.push("## Optional");
  lines.push(`- [XML sitemap](${abs("/sitemap.xml")}): complete machine-readable URL index`);
  lines.push("");

  const body = lines.join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
