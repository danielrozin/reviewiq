const DATAFORSEO_BASE_URL = "https://api.dataforseo.com/v3";

function getCredentials() {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  if (!login || !password) {
    throw new Error(
      "DataForSEO credentials not configured. Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in .env.local"
    );
  }

  return Buffer.from(`${login}:${password}`).toString("base64");
}

export async function dataForSeoRequest<T>(
  endpoint: string,
  body: Record<string, unknown>[]
): Promise<T> {
  const auth = getCredentials();

  const response = await fetch(`${DATAFORSEO_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`DataForSEO API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
