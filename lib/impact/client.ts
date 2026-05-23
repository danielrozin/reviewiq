// Impact.com Affiliate API client (media-partner / publisher account).
//
// Auth model mirrors DataForSEO: HTTP Basic with base64(AccountSID:AuthToken).
// Impact.com media-partner endpoints are namespaced under /Mediapartners/{AccountSID}.
// Default API response format is XML; we always request JSON via the Accept header.
//
// Credentials live ONLY in env (.env locally, Vercel project env in prod).
// Never hardcode the Auth Token or commit it to git.

const IMPACT_BASE_URL = "https://api.impact.com";

interface ImpactCredentials {
  accountSid: string;
  authHeader: string; // "Basic <base64>"
}

function getCredentials(): ImpactCredentials {
  const accountSid = process.env.IMPACT_ACCOUNT_SID;
  const authToken = process.env.IMPACT_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error(
      "Impact.com credentials not configured. Set IMPACT_ACCOUNT_SID and IMPACT_AUTH_TOKEN in .env"
    );
  }

  return {
    accountSid,
    authHeader: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
  };
}

/** True when both Impact.com env vars are present (use to feature-gate affiliate code paths). */
export function isImpactConfigured(): boolean {
  return Boolean(process.env.IMPACT_ACCOUNT_SID && process.env.IMPACT_AUTH_TOKEN);
}

/**
 * Low-level request against the media-partner namespace.
 * `path` is relative to /Mediapartners/{AccountSID}, e.g. "/Campaigns".
 */
export async function impactRequest<T>(
  path: string,
  init?: { method?: string; query?: Record<string, string | number>; body?: unknown }
): Promise<T> {
  const { accountSid, authHeader } = getCredentials();

  const url = new URL(`${IMPACT_BASE_URL}/Mediapartners/${accountSid}${path}`);
  for (const [key, value] of Object.entries(init?.query ?? {})) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: authHeader,
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Impact.com API error: ${response.status} ${response.statusText}${detail ? ` — ${detail.slice(0, 200)}` : ""}`
    );
  }

  return response.json() as Promise<T>;
}

export interface ImpactVerifyResult {
  ok: boolean;
  /** HTTP status from the verification call (0 if the request never left the client). */
  status: number;
  /** Number of programs/campaigns the partner is enrolled in, when available. */
  campaignCount?: number;
  message: string;
}

/**
 * Lightweight credential check. Calls the Campaigns endpoint with PageSize=1 so a
 * valid key returns 200 (even with zero active programs) and a bad key returns 401.
 * Never throws — returns a structured result so callers/scripts can report cleanly.
 */
export async function verifyImpactCredentials(): Promise<ImpactVerifyResult> {
  if (!isImpactConfigured()) {
    return { ok: false, status: 0, message: "IMPACT_ACCOUNT_SID / IMPACT_AUTH_TOKEN not set" };
  }

  try {
    const { accountSid, authHeader } = getCredentials();
    const url = `${IMPACT_BASE_URL}/Mediapartners/${accountSid}/Campaigns?PageSize=1`;
    const response = await fetch(url, {
      headers: { Authorization: authHeader, Accept: "application/json" },
    });

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        status: response.status,
        message: "Authentication rejected — Account SID / Auth Token invalid or revoked",
      };
    }
    if (!response.ok) {
      return { ok: false, status: response.status, message: `Unexpected status ${response.status}` };
    }

    const data = (await response.json().catch(() => null)) as
      | { "@total"?: string; Campaigns?: unknown[] }
      | null;
    const campaignCount = data?.["@total"] ? Number(data["@total"]) : undefined;

    return {
      ok: true,
      status: response.status,
      campaignCount,
      message:
        campaignCount !== undefined
          ? `Authenticated. Partner is enrolled in ${campaignCount} program(s).`
          : "Authenticated.",
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      message: `Request failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
