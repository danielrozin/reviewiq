const APIFY_BASE_URL = "https://api.apify.com/v2";

function getToken(): string {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error("APIFY_API_TOKEN not configured. Set it in .env.local");
  }
  return token;
}

export interface ApifyRunResult {
  runId: string;
  datasetId: string;
  status: string;
}

export interface ApifyItem {
  url?: string;
  title?: string;
  text?: string;
  [key: string]: unknown;
}

async function startActor(
  actorId: string,
  input: Record<string, unknown>
): Promise<ApifyRunResult> {
  const token = getToken();
  const response = await fetch(
    `${APIFY_BASE_URL}/acts/${actorId}/runs?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    throw new Error(`Apify start error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { data: { id: string; defaultDatasetId: string; status: string } };
  return {
    runId: data.data.id,
    datasetId: data.data.defaultDatasetId,
    status: data.data.status,
  };
}

async function waitForRun(runId: string, maxWaitMs: number = 120000): Promise<string> {
  const token = getToken();
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const response = await fetch(
      `${APIFY_BASE_URL}/actor-runs/${runId}?token=${token}`
    );
    const data = (await response.json()) as { data: { status: string; defaultDatasetId: string } };

    if (data.data.status === "SUCCEEDED") return data.data.defaultDatasetId;
    if (data.data.status === "FAILED" || data.data.status === "ABORTED") {
      throw new Error(`Apify run ${runId} ${data.data.status}`);
    }

    await new Promise((r) => setTimeout(r, 5000));
  }

  throw new Error(`Apify run ${runId} timed out after ${maxWaitMs}ms`);
}

async function fetchDatasetItems(datasetId: string): Promise<ApifyItem[]> {
  const token = getToken();
  const response = await fetch(
    `${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${token}`
  );

  if (!response.ok) {
    throw new Error(`Apify dataset error: ${response.status}`);
  }

  return response.json() as Promise<ApifyItem[]>;
}

export async function runActorAndCollect(
  actorId: string,
  input: Record<string, unknown>,
  maxWaitMs: number = 120000
): Promise<ApifyItem[]> {
  const run = await startActor(actorId, input);
  const datasetId = await waitForRun(run.runId, maxWaitMs);
  return fetchDatasetItems(datasetId);
}

export async function scrapeCompetitorReviewUrls(
  competitorDomains: string[],
  categorySlug: string
): Promise<ApifyItem[]> {
  const startUrls = competitorDomains.map((domain) => ({
    url: `https://${domain}/search?q=${encodeURIComponent(categorySlug + " review")}`,
  }));

  try {
    return await runActorAndCollect(
      "apify~cheerio-scraper",
      {
        startUrls,
        maxRequestsPerCrawl: 20,
        pageFunction: `async function pageFunction(context) {
          const { $, request } = context;
          const results = [];
          $('a[href*="review"], a[href*="vs"], a[href*="comparison"]').each((i, el) => {
            results.push({
              url: $(el).attr('href'),
              title: $(el).text().trim(),
              sourceUrl: request.url,
            });
          });
          return results;
        }`,
      },
      60000
    );
  } catch (err) {
    console.error(`Apify competitor scrape failed for ${categorySlug}:`, (err as Error).message);
    return [];
  }
}

export async function scrapeYouTubeReviews(
  category: string,
  maxResults: number = 20
): Promise<ApifyItem[]> {
  try {
    return await runActorAndCollect(
      "streamers~youtube-scraper",
      {
        searchKeywords: [`${category} review 2026`, `best ${category} 2026`],
        maxResults,
      },
      60000
    );
  } catch (err) {
    console.error(`Apify YouTube scrape failed for ${category}:`, (err as Error).message);
    return [];
  }
}

export async function scrapeRedditDiscussions(
  category: string,
  maxResults: number = 20
): Promise<ApifyItem[]> {
  try {
    return await runActorAndCollect(
      "apify~cheerio-scraper",
      {
        startUrls: [
          { url: `https://www.reddit.com/search/?q=${encodeURIComponent(category + " review vs")}&sort=new` },
        ],
        maxRequestsPerCrawl: maxResults,
        pageFunction: `async function pageFunction(context) {
          const { $, request } = context;
          return [{
            url: request.url,
            title: $('title').text(),
            text: $('body').text().substring(0, 500),
          }];
        }`,
      },
      60000
    );
  } catch (err) {
    console.error(`Apify Reddit scrape failed for ${category}:`, (err as Error).message);
    return [];
  }
}
