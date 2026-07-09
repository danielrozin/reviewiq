import { NextResponse } from "next/server";
import { getIndexNowKey } from "@/lib/seo/indexnow";

export const dynamic = "force-dynamic";

/**
 * Serves the IndexNow ownership key at the SITE ROOT for verification.
 *
 * IndexNow only authorizes submission of URLs at or below the directory of the
 * `keyLocation`. A key served from a subfolder (e.g. `/api/indexnow/key.txt`)
 * therefore cannot authorize whole-site submissions — engines reject them with
 * HTTP 422 "URLs are not related to your site verified through the keylocation".
 * Serving the key from the root (`/indexnow-key.txt`) authorizes every URL on
 * the host. The response body must be exactly the key value.
 */
export async function GET() {
  const key = getIndexNowKey();
  if (!key) {
    return new NextResponse("IndexNow key not configured", { status: 404 });
  }
  return new NextResponse(key, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
