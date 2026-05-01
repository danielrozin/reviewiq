import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";
import { validateYouTubeVideos } from "@/lib/videos/validate-youtube-videos";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse();

  try {
    const result = await validateYouTubeVideos();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[admin] Failed to validate videos:", error);
    return NextResponse.json(
      { error: "Failed to validate videos" },
      { status: 500 }
    );
  }
}

// Allow a GET so the admin dashboard can trigger a run from a simple link/button
// without needing CSRF wiring; still gated by the admin cookie.
export async function GET(request: NextRequest) {
  return POST(request);
}
