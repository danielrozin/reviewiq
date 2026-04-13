import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 120;

async function isYouTubeVideoAvailable(videoId: string): Promise<boolean> {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&format=json`;
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const videos = await prisma.youTubeVideo.findMany({
      select: { id: true, videoId: true, isActive: true },
    });

    let deactivated = 0;
    let reactivated = 0;
    let checked = 0;

    const BATCH_SIZE = 10;
    for (let i = 0; i < videos.length; i += BATCH_SIZE) {
      const batch = videos.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (video) => {
          const available = await isYouTubeVideoAvailable(video.videoId);
          return { ...video, available };
        })
      );

      for (const { id, isActive, available } of results) {
        if (isActive && !available) {
          await prisma.youTubeVideo.update({
            where: { id },
            data: { isActive: false, lastChecked: new Date() },
          });
          deactivated++;
        } else if (!isActive && available) {
          await prisma.youTubeVideo.update({
            where: { id },
            data: { isActive: true, lastChecked: new Date() },
          });
          reactivated++;
        } else {
          await prisma.youTubeVideo.update({
            where: { id },
            data: { lastChecked: new Date() },
          });
        }
        checked++;
      }
    }

    return NextResponse.json({
      checked,
      deactivated,
      reactivated,
      total: videos.length,
    });
  } catch (error) {
    console.error("Failed to validate videos:", error);
    return NextResponse.json({ error: "Failed to validate videos" }, { status: 500 });
  }
}
