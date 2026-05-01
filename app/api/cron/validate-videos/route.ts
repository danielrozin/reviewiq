import { NextRequest, NextResponse } from "next/server";
import { validateYouTubeVideos } from "@/lib/videos/validate-youtube-videos";

export const maxDuration = 120;

async function handle(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await validateYouTubeVideos();
    return NextResponse.json({
      ...result,
      // Back-compat keys for any consumers of the old shape.
      deactivated: result.deactivated,
      reactivated: result.reactivated,
    });
  } catch (error) {
    console.error("Failed to validate videos:", error);
    return NextResponse.json(
      { error: "Failed to validate videos" },
      { status: 500 }
    );
  }
}

// Vercel Cron invokes scheduled paths with GET; expose both so the same
// route works from Vercel's scheduler and from manual POST callers.
export { handle as GET, handle as POST };
