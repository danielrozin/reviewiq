import { NextRequest, NextResponse } from "next/server";
import { dataForSeoRequest } from "@/lib/dataforseo/client";
import { searchTavily, discoverQuoraQuestions, discoverRedditThreads } from "@/lib/tavily/client";
import { scrapeYouTubeReviews } from "@/lib/apify/client";
import { categories } from "@/data/categories";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export const maxDuration = 300;

interface DataForSEOResponse {
  tasks: Array<{
    result: Array<{
      items: Array<Record<string, unknown>>;
    }>;
  }>;
}

interface TrendOpportunity {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  difficulty: number;
  category: string;
  type: "review" | "comparison" | "buyer_guide" | "complaint";
  source: "dataforseo" | "tavily" | "apify" | "reddit" | "quora" | "youtube";
  opportunityScore: number;
  url?: string;
}

// Extended seeds covering all 10 categories
const CATEGORY_SEEDS: Record<string, string[]> = {
  "robot-vacuums": ["best robot vacuum", "robot vacuum review", "roomba vs roborock", "robot vacuum problems"],
  "coffee-machines": ["best coffee machine", "espresso machine review", "nespresso vs keurig", "coffee maker worth it"],
  "air-fryers": ["best air fryer", "air fryer review", "ninja vs cosori air fryer", "air fryer problems"],
  "wireless-earbuds": ["best wireless earbuds", "earbuds review", "airpods vs galaxy buds", "earbuds worth it"],
  "mattresses": ["best mattress", "mattress review", "purple vs casper mattress", "mattress problems"],
  "smart-watches": ["best smart watch", "smartwatch review", "apple watch vs galaxy watch", "smartwatch worth it"],
  "standing-desks": ["best standing desk", "standing desk review", "uplift vs flexispot", "standing desk problems"],
  "blenders": ["best blender", "blender review", "vitamix vs ninja blender", "blender comparison"],
  "laptops": ["best laptop", "laptop review 2026", "macbook vs dell xps", "laptop buying guide"],
  "electric-toothbrushes": ["best electric toothbrush", "oral-b vs sonicare", "electric toothbrush review", "electric toothbrush worth it"],
};

// Products per category for Tavily enrichment
const CATEGORY_PRODUCTS: Record<string, string[]> = {
  "robot-vacuums": ["Roborock S8 MaxV Ultra", "iRobot Roomba j9+", "Ecovacs Deebot X2 Omni"],
  "coffee-machines": ["Breville Barista Express", "De'Longhi Magnifica", "Nespresso Vertuo"],
  "air-fryers": ["Ninja Foodi DualZone", "Cosori Pro LE", "Philips Airfryer XXL"],
  "wireless-earbuds": ["Apple AirPods Pro 2", "Sony WF-1000XM5", "Samsung Galaxy Buds3 Pro"],
  "mattresses": ["Purple Hybrid Premier", "Casper Original", "Tempur-Pedic Adapt"],
  "smart-watches": ["Apple Watch Ultra 2", "Samsung Galaxy Watch 6", "Garmin Venu 3"],
  "standing-desks": ["Uplift V2", "FlexiSpot E7", "Jarvis Bamboo"],
  "blenders": ["Vitamix A3500", "Ninja Professional Plus", "KitchenAid K400"],
  "laptops": ["MacBook Pro M4", "Dell XPS 15", "ThinkPad X1 Carbon"],
  "electric-toothbrushes": ["Oral-B iO Series 9", "Philips Sonicare DiamondClean", "Quip Smart Brush"],
};

function scoreOpportunity(volume: number, cpc: number, competition: number, difficulty: number): number {
  return (
    Math.log10(Math.max(volume, 1)) * 20 +
    (100 - difficulty) * 0.3 +
    Math.min(cpc * 5, 25) +
    (1 - competition) * 15
  );
}

function classifyKeyword(keyword: string): TrendOpportunity["type"] {
  const kw = keyword.toLowerCase();
  if (/\bvs\b|versus|compared?\s+to|difference between/.test(kw)) return "comparison";
  if (/problem|issue|complaint|defect|broken|bad/.test(kw)) return "complaint";
  if (/guide|how to choose|what to look|before buying/.test(kw)) return "buyer_guide";
  return "review";
}

async function discoverFromDataForSEO(categorySlug: string, seeds: string[]): Promise<TrendOpportunity[]> {
  const opportunities: TrendOpportunity[] = [];

  for (const seed of seeds) {
    try {
      const data = await dataForSeoRequest<DataForSEOResponse>(
        "/dataforseo_labs/google/keyword_suggestions/live",
        [
          {
            keyword: seed,
            location_code: 2840,
            language_code: "en",
            limit: 50,
            filters: [["keyword_info.search_volume", ">", 100]],
            order_by: ["keyword_info.search_volume,desc"],
          },
        ]
      );

      const items = data.tasks?.[0]?.result?.[0]?.items || [];
      for (const item of items) {
        const keyword = (item.keyword as string) || "";
        const kwInfo = item.keyword_info as Record<string, unknown> | undefined;
        const volume = (kwInfo?.search_volume as number) || 0;
        const cpc = (kwInfo?.cpc as number) || 0;
        const competition = (kwInfo?.competition as number) || 0;
        const kwProps = item.keyword_properties as Record<string, unknown> | undefined;
        const difficulty = (kwProps?.keyword_difficulty as number) || 50;

        if (volume < 100 || difficulty > 80) continue;

        opportunities.push({
          keyword,
          searchVolume: volume,
          cpc,
          competition,
          difficulty,
          category: categorySlug,
          type: classifyKeyword(keyword),
          source: "dataforseo",
          opportunityScore: Math.round(scoreOpportunity(volume, cpc, competition, difficulty) * 100) / 100,
        });
      }
    } catch (err) {
      console.error(`DataForSEO failed for seed "${seed}":`, (err as Error).message);
    }
  }

  return opportunities;
}

async function discoverFromTavily(categorySlug: string, products: string[]): Promise<TrendOpportunity[]> {
  const opportunities: TrendOpportunity[] = [];

  try {
    // Trending review searches
    const trendingResponse = await searchTavily(
      `best ${categorySlug.replace(/-/g, " ")} review 2026`,
      10,
      "basic"
    );

    for (const result of trendingResponse.results) {
      const title = result.title.toLowerCase();
      opportunities.push({
        keyword: result.title.slice(0, 80),
        searchVolume: 0, // Tavily doesn't provide volume — scored on engagement
        cpc: 0,
        competition: 0,
        difficulty: 30,
        category: categorySlug,
        type: classifyKeyword(title),
        source: "tavily",
        opportunityScore: Math.round(result.score * 60),
        url: result.url,
      });
    }

    // Quora questions (link building opportunities)
    const quoraResults = await discoverQuoraQuestions(categorySlug.replace(/-/g, " "));
    for (const result of quoraResults) {
      opportunities.push({
        keyword: result.title.slice(0, 80),
        searchVolume: 0,
        cpc: 0,
        competition: 0,
        difficulty: 20,
        category: categorySlug,
        type: classifyKeyword(result.title),
        source: "quora",
        opportunityScore: Math.round(result.score * 50),
        url: result.url,
      });
    }

    // Reddit threads
    const redditResults = await discoverRedditThreads(categorySlug.replace(/-/g, " "));
    for (const result of redditResults) {
      opportunities.push({
        keyword: result.title.slice(0, 80),
        searchVolume: 0,
        cpc: 0,
        competition: 0,
        difficulty: 25,
        category: categorySlug,
        type: classifyKeyword(result.title),
        source: "reddit",
        opportunityScore: Math.round(result.score * 55),
        url: result.url,
      });
    }
  } catch (err) {
    console.error(`Tavily discovery failed for ${categorySlug}:`, (err as Error).message);
  }

  return opportunities;
}

async function discoverFromApify(categorySlug: string): Promise<TrendOpportunity[]> {
  const opportunities: TrendOpportunity[] = [];

  try {
    const ytResults = await scrapeYouTubeReviews(categorySlug.replace(/-/g, " "), 10);
    for (const item of ytResults) {
      const title = (item.title as string) || "";
      if (!title) continue;
      opportunities.push({
        keyword: title.slice(0, 80),
        searchVolume: 0,
        cpc: 0,
        competition: 0,
        difficulty: 30,
        category: categorySlug,
        type: classifyKeyword(title),
        source: "youtube",
        opportunityScore: 40,
        url: item.url as string,
      });
    }
  } catch (err) {
    console.error(`Apify discovery failed for ${categorySlug}:`, (err as Error).message);
  }

  return opportunities;
}

function persistResults(opportunities: TrendOpportunity[]): string {
  const dataDir = join(process.cwd(), "data");
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  const date = new Date().toISOString().split("T")[0];
  const filePath = join(dataDir, `trend-discoveries-${date}.json`);

  const output = {
    generatedAt: new Date().toISOString(),
    totalOpportunities: opportunities.length,
    bySource: {
      dataforseo: opportunities.filter((o) => o.source === "dataforseo").length,
      tavily: opportunities.filter((o) => o.source === "tavily").length,
      quora: opportunities.filter((o) => o.source === "quora").length,
      reddit: opportunities.filter((o) => o.source === "reddit").length,
      youtube: opportunities.filter((o) => o.source === "youtube").length,
    },
    byType: {
      review: opportunities.filter((o) => o.type === "review").length,
      comparison: opportunities.filter((o) => o.type === "comparison").length,
      buyer_guide: opportunities.filter((o) => o.type === "buyer_guide").length,
      complaint: opportunities.filter((o) => o.type === "complaint").length,
    },
    byCategory: Object.fromEntries(
      categories.map((c) => [c.slug, opportunities.filter((o) => o.category === c.slug).length])
    ),
    opportunities,
  };

  writeFileSync(filePath, JSON.stringify(output, null, 2));

  // Also write latest pointer
  writeFileSync(join(dataDir, "trend-discoveries-latest.json"), JSON.stringify(output, null, 2));

  return filePath;
}

/**
 * GET /api/cron/discover-trends
 *
 * Daily cron: multi-source trend discovery using DataForSEO, Tavily, and Apify.
 * Discovers keyword opportunities, Quora/Reddit questions, and YouTube content
 * across all SmartReview categories. Persists results to data/ directory.
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
  const allOpportunities: TrendOpportunity[] = [];
  const errors: string[] = [];
  const sourceStatus: Record<string, "ok" | "skipped" | "error"> = {};

  // Check which APIs are configured
  const hasDataForSEO = !!(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD);
  const hasTavily = !!process.env.TAVILY_API_KEY;
  const hasApify = !!process.env.APIFY_API_TOKEN;

  sourceStatus.dataforseo = hasDataForSEO ? "ok" : "skipped";
  sourceStatus.tavily = hasTavily ? "ok" : "skipped";
  sourceStatus.apify = hasApify ? "ok" : "skipped";

  if (!hasDataForSEO && !hasTavily && !hasApify) {
    return NextResponse.json({
      error: "No API credentials configured. Set at least one of: DATAFORSEO_LOGIN+DATAFORSEO_PASSWORD, TAVILY_API_KEY, APIFY_API_TOKEN",
    }, { status: 500 });
  }

  for (const cat of categories) {
    const seeds = CATEGORY_SEEDS[cat.slug];
    const products = CATEGORY_PRODUCTS[cat.slug] || [];

    // DataForSEO: keyword discovery
    if (hasDataForSEO && seeds) {
      try {
        const dfResults = await discoverFromDataForSEO(cat.slug, seeds);
        allOpportunities.push(...dfResults);
      } catch (err) {
        const msg = `DataForSEO/${cat.slug}: ${(err as Error).message}`;
        errors.push(msg);
        sourceStatus.dataforseo = "error";
      }
    }

    // Tavily: trending reviews + Quora + Reddit
    if (hasTavily) {
      try {
        const tavilyResults = await discoverFromTavily(cat.slug, products);
        allOpportunities.push(...tavilyResults);
      } catch (err) {
        const msg = `Tavily/${cat.slug}: ${(err as Error).message}`;
        errors.push(msg);
        sourceStatus.tavily = "error";
      }
    }

    // Apify: YouTube reviews (only first 3 categories to stay within budget)
    if (hasApify && categories.indexOf(cat) < 3) {
      try {
        const apifyResults = await discoverFromApify(cat.slug);
        allOpportunities.push(...apifyResults);
      } catch (err) {
        const msg = `Apify/${cat.slug}: ${(err as Error).message}`;
        errors.push(msg);
        sourceStatus.apify = "error";
      }
    }
  }

  // Deduplicate by keyword (keep highest score)
  const seen = new Map<string, TrendOpportunity>();
  for (const opp of allOpportunities) {
    const key = opp.keyword.toLowerCase().trim();
    const existing = seen.get(key);
    if (!existing || opp.opportunityScore > existing.opportunityScore) {
      seen.set(key, opp);
    }
  }
  const deduped = Array.from(seen.values()).sort((a, b) => b.opportunityScore - a.opportunityScore);

  // Persist results to file
  let persistedPath = "";
  try {
    persistedPath = persistResults(deduped);
  } catch (err) {
    errors.push(`Persist: ${(err as Error).message}`);
  }

  return NextResponse.json({
    success: true,
    totalOpportunities: deduped.length,
    sourceStatus,
    bySource: {
      dataforseo: deduped.filter((o) => o.source === "dataforseo").length,
      tavily: deduped.filter((o) => o.source === "tavily").length,
      quora: deduped.filter((o) => o.source === "quora").length,
      reddit: deduped.filter((o) => o.source === "reddit").length,
      youtube: deduped.filter((o) => o.source === "youtube").length,
    },
    byType: {
      review: deduped.filter((o) => o.type === "review").length,
      comparison: deduped.filter((o) => o.type === "comparison").length,
      buyer_guide: deduped.filter((o) => o.type === "buyer_guide").length,
      complaint: deduped.filter((o) => o.type === "complaint").length,
    },
    topOpportunities: deduped.slice(0, 50),
    persistedTo: persistedPath,
    errors: errors.length > 0 ? errors : undefined,
    durationMs: Date.now() - startTime,
  });
}
