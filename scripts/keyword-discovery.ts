/**
 * DataForSEO Keyword Discovery for SmartReview
 *
 * Uses DataForSEO Labs keyword_suggestions and related_keywords APIs
 * to discover high-volume product review queries across all 5 categories.
 *
 * Usage: DATAFORSEO_LOGIN=xxx DATAFORSEO_PASSWORD=yyy npx tsx scripts/keyword-discovery.ts
 * Output: data/keyword-discoveries.json
 */

const DATAFORSEO_BASE_URL = "https://api.dataforseo.com/v3";

// SmartReview categories and seed products
const CATEGORY_SEEDS = [
  {
    category: "robot-vacuums",
    seeds: [
      "robot vacuum review 2026",
      "best robot vacuum 2026",
      "robot vacuum vs stick vacuum",
      "Roborock S8 vs Roomba j9",
      "Ecovacs Deebot vs Roborock",
      "robot vacuum for pets",
      "self-emptying robot vacuum review",
    ],
    products: [
      "Roborock S8 MaxV Ultra",
      "iRobot Roomba j9+",
      "Ecovacs Deebot X2 Omni",
      "Dreame L20 Ultra",
    ],
  },
  {
    category: "coffee-machines",
    seeds: [
      "coffee machine review 2026",
      "best coffee machine 2026",
      "espresso machine vs drip coffee",
      "Breville Barista Express review",
      "Nespresso vs Keurig",
      "best home espresso machine",
      "coffee machine buying guide",
    ],
    products: [
      "Breville Barista Express",
      "De'Longhi Magnifica",
      "Nespresso Vertuo",
      "Keurig K-Supreme",
    ],
  },
  {
    category: "air-fryers",
    seeds: [
      "air fryer review 2026",
      "best air fryer 2026",
      "air fryer vs oven",
      "Ninja air fryer vs Cosori",
      "large air fryer review",
      "air fryer for family",
      "dual basket air fryer review",
    ],
    products: [
      "Ninja Foodi DualZone",
      "Cosori Pro LE",
      "Philips Airfryer XXL",
      "Instant Vortex Plus",
    ],
  },
  {
    category: "wireless-earbuds",
    seeds: [
      "wireless earbuds review 2026",
      "best wireless earbuds 2026",
      "AirPods Pro vs Sony WF-1000XM5",
      "noise cancelling earbuds review",
      "wireless earbuds for running",
      "best earbuds under 100",
      "earbuds vs over ear headphones",
    ],
    products: [
      "Apple AirPods Pro 2",
      "Sony WF-1000XM5",
      "Samsung Galaxy Buds3 Pro",
      "Bose QuietComfort Ultra Earbuds",
    ],
  },
  {
    category: "mattresses",
    seeds: [
      "mattress review 2026",
      "best mattress 2026",
      "memory foam vs hybrid mattress",
      "Purple mattress vs Casper",
      "best mattress for back pain",
      "mattress buying guide",
      "mattress in a box review",
    ],
    products: [
      "Purple Hybrid Premier",
      "Casper Original",
      "Tempur-Pedic Adapt",
      "Saatva Classic",
    ],
  },
];

interface KeywordResult {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  difficulty: number;
  category: string;
  source: string;
  opportunityScore: number;
}

function getAuth(): string {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) {
    throw new Error(
      "Missing DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables"
    );
  }
  return Buffer.from(`${login}:${password}`).toString("base64");
}

async function apiRequest(endpoint: string, body: Record<string, unknown>[]): Promise<any> {
  const auth = getAuth();
  const response = await fetch(`${DATAFORSEO_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DataForSEO ${response.status}: ${text}`);
  }

  return response.json();
}

function calculateOpportunityScore(
  volume: number,
  difficulty: number,
  cpc: number,
  competition: number
): number {
  return (
    Math.log10(Math.max(volume, 1)) * 20 +
    (100 - difficulty) * 0.3 +
    Math.min(cpc * 5, 25) +
    (1 - competition) * 15
  );
}

async function fetchKeywordSuggestions(
  seed: string,
  category: string
): Promise<KeywordResult[]> {
  try {
    const data = await apiRequest(
      "/dataforseo_labs/google/keyword_suggestions/live",
      [
        {
          keyword: seed,
          location_code: 2840,
          language_code: "en",
          include_seed_keyword: true,
          limit: 100,
          filters: [
            ["keyword_info.search_volume", ">", 500],
            "and",
            ["keyword_properties.keyword_difficulty", "<", 60],
          ],
          order_by: ["keyword_info.search_volume,desc"],
        },
      ]
    );

    const items = data?.tasks?.[0]?.result?.[0]?.items || [];
    return items.map((item: any) => ({
      keyword: item.keyword || "",
      searchVolume: item.keyword_info?.search_volume || 0,
      cpc: item.keyword_info?.cpc || 0,
      competition: item.keyword_info?.competition || 0,
      difficulty: item.keyword_properties?.keyword_difficulty || 0,
      category,
      source: "keyword_suggestions",
      opportunityScore: calculateOpportunityScore(
        item.keyword_info?.search_volume || 0,
        item.keyword_properties?.keyword_difficulty || 0,
        item.keyword_info?.cpc || 0,
        item.keyword_info?.competition || 0
      ),
    }));
  } catch (err) {
    console.error(`  [WARN] keyword_suggestions failed for "${seed}":`, (err as Error).message);
    return [];
  }
}

async function fetchRelatedKeywords(
  seed: string,
  category: string
): Promise<KeywordResult[]> {
  try {
    const data = await apiRequest(
      "/dataforseo_labs/google/related_keywords/live",
      [
        {
          keyword: seed,
          location_code: 2840,
          language_code: "en",
          limit: 50,
          filters: [
            ["keyword_info.search_volume", ">", 500],
            "and",
            ["keyword_properties.keyword_difficulty", "<", 60],
          ],
          order_by: ["keyword_info.search_volume,desc"],
        },
      ]
    );

    const items = data?.tasks?.[0]?.result?.[0]?.items || [];
    return items.map((item: any) => ({
      keyword: item.keyword_data?.keyword || "",
      searchVolume: item.keyword_data?.keyword_info?.search_volume || 0,
      cpc: item.keyword_data?.keyword_info?.cpc || 0,
      competition: item.keyword_data?.keyword_info?.competition || 0,
      difficulty: item.keyword_data?.keyword_properties?.keyword_difficulty || 0,
      category,
      source: "related_keywords",
      opportunityScore: calculateOpportunityScore(
        item.keyword_data?.keyword_info?.search_volume || 0,
        item.keyword_data?.keyword_properties?.keyword_difficulty || 0,
        item.keyword_data?.keyword_info?.cpc || 0,
        item.keyword_data?.keyword_info?.competition || 0
      ),
    }));
  } catch (err) {
    console.error(`  [WARN] related_keywords failed for "${seed}":`, (err as Error).message);
    return [];
  }
}

async function discoverForCategory(
  config: (typeof CATEGORY_SEEDS)[number]
): Promise<KeywordResult[]> {
  console.log(`\n📊 Discovering keywords for: ${config.category}`);
  const results: KeywordResult[] = [];

  // Run keyword suggestions for each seed
  for (const seed of config.seeds) {
    console.log(`  → Suggestions: "${seed}"`);
    const suggestions = await fetchKeywordSuggestions(seed, config.category);
    results.push(...suggestions);
    // Rate limit: ~1 req/sec
    await new Promise((r) => setTimeout(r, 1000));
  }

  // Run related keywords for product vs product patterns
  for (let i = 0; i < config.products.length; i++) {
    for (let j = i + 1; j < config.products.length; j++) {
      const vsQuery = `${config.products[i]} vs ${config.products[j]}`;
      console.log(`  → Related: "${vsQuery}"`);
      const related = await fetchRelatedKeywords(vsQuery, config.category);
      results.push(...related);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // Run product review suggestions
  for (const product of config.products) {
    const reviewQuery = `${product} review 2026`;
    console.log(`  → Suggestions: "${reviewQuery}"`);
    const suggestions = await fetchKeywordSuggestions(reviewQuery, config.category);
    results.push(...suggestions);
    await new Promise((r) => setTimeout(r, 1000));
  }

  return results;
}

function deduplicateAndRank(results: KeywordResult[]): KeywordResult[] {
  const seen = new Map<string, KeywordResult>();

  for (const r of results) {
    const key = r.keyword.toLowerCase().trim();
    const existing = seen.get(key);
    if (!existing || r.opportunityScore > existing.opportunityScore) {
      seen.set(key, r);
    }
  }

  return Array.from(seen.values()).sort(
    (a, b) => b.opportunityScore - a.opportunityScore
  );
}

async function main() {
  console.log("=== SmartReview Keyword Discovery ===");
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Categories: ${CATEGORY_SEEDS.length}`);
  console.log(`Filters: volume > 500, difficulty < 60\n`);

  const allResults: KeywordResult[] = [];

  for (const config of CATEGORY_SEEDS) {
    const categoryResults = await discoverForCategory(config);
    allResults.push(...categoryResults);
  }

  const ranked = deduplicateAndRank(allResults);
  const top50 = ranked.slice(0, 50);

  const output = {
    generatedAt: new Date().toISOString(),
    totalDiscovered: ranked.length,
    top50Count: top50.length,
    filters: { minVolume: 500, maxDifficulty: 60 },
    byCategory: Object.fromEntries(
      CATEGORY_SEEDS.map((c) => [
        c.category,
        ranked.filter((r) => r.category === c.category).length,
      ])
    ),
    top50Keywords: top50,
    allKeywords: ranked,
  };

  const fs = await import("fs");
  const path = await import("path");
  const outPath = path.join(process.cwd(), "data", "keyword-discoveries.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(`\n=== Results ===`);
  console.log(`Total unique keywords: ${ranked.length}`);
  console.log(`Top 50 saved to: ${outPath}`);
  console.log(`\nTop 10 keywords:`);
  top50.slice(0, 10).forEach((k, i) => {
    console.log(
      `  ${i + 1}. "${k.keyword}" — vol: ${k.searchVolume}, diff: ${k.difficulty}, score: ${k.opportunityScore.toFixed(1)} [${k.category}]`
    );
  });
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
