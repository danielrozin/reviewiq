import { NextRequest, NextResponse } from "next/server";
import { searchTavily } from "@/lib/tavily/client";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export const maxDuration = 300;

interface TrendOpportunity {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  difficulty: number;
  category: string;
  type: "review" | "comparison" | "buyer_guide" | "complaint";
  source: string;
  opportunityScore: number;
  url?: string;
}

interface GeneratedArticle {
  slug: string;
  title: string;
  category: string;
  type: string;
  keyword: string;
  enrichmentSources: string[];
  generatedAt: string;
  status: "enriched" | "ready_for_review";
}

/**
 * GET /api/cron/auto-generate
 *
 * Twice-daily cron: picks top opportunities from the latest discovery run,
 * enriches them with Tavily search, and prepares content briefs for generation.
 *
 * Pipeline: discover (discover-trends) -> enrich (this route) -> generate (manual/Claude)
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const hasTavily = !!process.env.TAVILY_API_KEY;

  // Load latest discoveries
  const dataDir = join(process.cwd(), "data");
  const latestPath = join(dataDir, "trend-discoveries-latest.json");

  if (!existsSync(latestPath)) {
    return NextResponse.json({
      error: "No discoveries found. Run /api/cron/discover-trends first.",
    }, { status: 404 });
  }

  let discoveries: { opportunities: TrendOpportunity[] };
  try {
    discoveries = JSON.parse(readFileSync(latestPath, "utf-8"));
  } catch {
    return NextResponse.json({ error: "Failed to parse discoveries file" }, { status: 500 });
  }

  if (!discoveries.opportunities?.length) {
    return NextResponse.json({
      success: true,
      message: "No opportunities to process",
      generated: 0,
    });
  }

  // Load already-generated slugs to avoid duplicates
  const generatedPath = join(dataDir, "generated-articles.json");
  let existingArticles: GeneratedArticle[] = [];
  if (existsSync(generatedPath)) {
    try {
      existingArticles = JSON.parse(readFileSync(generatedPath, "utf-8"));
    } catch {
      existingArticles = [];
    }
  }
  const existingSlugs = new Set(existingArticles.map((a) => a.slug));

  // Pick top opportunities not already generated
  const candidates = discoveries.opportunities
    .filter((opp) => {
      const slug = opp.keyword
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      return !existingSlugs.has(slug);
    })
    .slice(0, 30); // Process up to 30 per run

  const generated: GeneratedArticle[] = [];
  const errors: string[] = [];

  for (const opp of candidates) {
    const slug = opp.keyword
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const enrichmentSources: string[] = [];

    // Enrich with Tavily search for real-time data
    if (hasTavily) {
      try {
        const enrichment = await searchTavily(
          `${opp.keyword} latest review specs price 2026`,
          5,
          "advanced"
        );

        // Save enrichment data per article
        const enrichDir = join(dataDir, "enrichments");
        if (!existsSync(enrichDir)) {
          mkdirSync(enrichDir, { recursive: true });
        }
        writeFileSync(
          join(enrichDir, `${slug}.json`),
          JSON.stringify({
            keyword: opp.keyword,
            category: opp.category,
            type: opp.type,
            opportunity: opp,
            tavilyResults: enrichment.results,
            enrichedAt: new Date().toISOString(),
          }, null, 2)
        );

        enrichmentSources.push(
          ...enrichment.results.map((r) => r.url)
        );
      } catch (err) {
        errors.push(`Enrich ${slug}: ${(err as Error).message}`);
      }
    }

    const article: GeneratedArticle = {
      slug,
      title: opp.keyword
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      category: opp.category,
      type: opp.type,
      keyword: opp.keyword,
      enrichmentSources,
      generatedAt: new Date().toISOString(),
      status: enrichmentSources.length > 0 ? "enriched" : "ready_for_review",
    };

    generated.push(article);
  }

  // Persist generated articles list (append)
  const allArticles = [...existingArticles, ...generated];
  try {
    writeFileSync(generatedPath, JSON.stringify(allArticles, null, 2));
  } catch (err) {
    errors.push(`Persist articles: ${(err as Error).message}`);
  }

  // Write content queue for manual/AI generation
  const queuePath = join(dataDir, "content-queue.json");
  const queue = generated.map((a) => ({
    slug: a.slug,
    title: a.title,
    category: a.category,
    type: a.type,
    keyword: a.keyword,
    status: a.status,
    enrichmentFile: `data/enrichments/${a.slug}.json`,
  }));

  try {
    writeFileSync(queuePath, JSON.stringify(queue, null, 2));
  } catch (err) {
    errors.push(`Persist queue: ${(err as Error).message}`);
  }

  return NextResponse.json({
    success: true,
    processed: candidates.length,
    generated: generated.length,
    enriched: generated.filter((a) => a.status === "enriched").length,
    totalArticlesInDB: allArticles.length,
    contentQueuePath: "data/content-queue.json",
    errors: errors.length > 0 ? errors : undefined,
    durationMs: Date.now() - startTime,
  });
}
