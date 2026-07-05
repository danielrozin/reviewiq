import { NextResponse } from "next/server";
import { getIndexNowKey } from "@/lib/seo/indexnow";

export const dynamic = "force-dynamic";

/**
 * Serves the IndexNow ownership key for verification. Search engines fetch this
 * URL (referenced as `keyLocation` in every submission) to confirm we own the
 * host. The response body must be exactly the key value.
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
