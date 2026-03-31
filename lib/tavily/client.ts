const TAVILY_API_URL = "https://api.tavily.com/search";

function getApiKey(): string {
  const key = process.env.TAVILY_API_KEY;
  if (!key) {
    throw new Error("TAVILY_API_KEY not configured. Set it in .env.local");
  }
  return key;
}

export interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilyResponse {
  results: TavilyResult[];
  query: string;
  answer?: string;
}

export async function searchTavily(
  query: string,
  maxResults: number = 10,
  searchDepth: "basic" | "advanced" = "basic",
  includeDomains?: string[]
): Promise<TavilyResponse> {
  const body: Record<string, unknown> = {
    api_key: getApiKey(),
    query,
    max_results: maxResults,
    search_depth: searchDepth,
  };

  if (includeDomains?.length) {
    body.include_domains = includeDomains;
  }

  const response = await fetch(TAVILY_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<TavilyResponse>;
}

export async function discoverTrendingReviews(
  category: string,
  productNames: string[]
): Promise<TavilyResult[]> {
  const queries = [
    `best ${category} review 2026`,
    `${category} comparison 2026 which is better`,
    ...productNames.slice(0, 2).map((p) => `${p} review 2026`),
  ];

  const results: TavilyResult[] = [];

  for (const query of queries) {
    try {
      const response = await searchTavily(query, 5, "basic", [
        "reddit.com",
        "youtube.com",
        "wirecutter.com",
        "rtings.com",
        "tomsguide.com",
      ]);
      results.push(...response.results);
    } catch (err) {
      console.error(`Tavily search failed for "${query}":`, (err as Error).message);
    }
  }

  return results;
}

export async function discoverQuoraQuestions(
  category: string
): Promise<TavilyResult[]> {
  try {
    const response = await searchTavily(
      `site:quora.com "${category}" "which is better" OR "vs" OR "worth it"`,
      10,
      "basic"
    );
    return response.results;
  } catch (err) {
    console.error(`Tavily Quora discovery failed:`, (err as Error).message);
    return [];
  }
}

export async function discoverRedditThreads(
  category: string
): Promise<TavilyResult[]> {
  try {
    const response = await searchTavily(
      `site:reddit.com "${category}" review OR "vs" OR "which should I buy"`,
      10,
      "basic"
    );
    return response.results;
  } catch (err) {
    console.error(`Tavily Reddit discovery failed:`, (err as Error).message);
    return [];
  }
}
