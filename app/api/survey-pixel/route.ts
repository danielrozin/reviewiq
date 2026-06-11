import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EMAIL_CHANNEL, EmailFunnelEvent, EmailFunnelStep } from "@/lib/survey/email-channel";

// 1x1 transparent GIF.
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

/**
 * Open-tracking pixel for the survey-invite email (DAN-984).
 *
 * The invite email embeds <img src="/api/survey-pixel?b=<batch>">. When the
 * client loads images, this records an `email_open` funnel row in the shared
 * survey table so opens are measurable the same way the on-site funnel is —
 * satisfying DAN-984 funnel requirement #5 ("open, if available").
 *
 * Caveats: opens require image loading (many clients block by default) and some
 * clients/proxies prefetch images, so this is a directional signal, not exact.
 * No PII is stored — only the channel tag and an optional opaque batch label.
 */
export async function GET(request: NextRequest) {
  const batch = request.nextUrl.searchParams.get("b")?.slice(0, 64) || undefined;

  // Fire-and-forget; never block or fail the pixel response.
  prisma.smartreviewSurvey
    .create({
      data: {
        event: EmailFunnelEvent.Open,
        reachedStep: EmailFunnelStep.Open,
        referralSource: EMAIL_CHANNEL,
        actionType: batch ? `batch:${batch}` : null,
      },
    })
    .catch(() => {});

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(PIXEL.length),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
    },
  });
}
