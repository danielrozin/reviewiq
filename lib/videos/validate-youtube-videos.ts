import { prisma } from "@/lib/prisma";

export type VideoCheckOutcome = "active" | "broken";

export interface ValidateVideosResult {
  total: number;
  checked: number;
  active: number;
  broken: number;
  reactivated: number;
  deactivated: number;
}

const OEMBED_TIMEOUT_MS = 5000;
const BATCH_SIZE = 10;

async function isYouTubeVideoAvailable(videoId: string): Promise<boolean> {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(
      videoId
    )}&format=json`;
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(OEMBED_TIMEOUT_MS),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function validateYouTubeVideos(): Promise<ValidateVideosResult> {
  const videos = await prisma.youTubeVideo.findMany({
    select: { id: true, videoId: true, isActive: true, status: true },
  });

  const result: ValidateVideosResult = {
    total: videos.length,
    checked: 0,
    active: 0,
    broken: 0,
    reactivated: 0,
    deactivated: 0,
  };

  for (let i = 0; i < videos.length; i += BATCH_SIZE) {
    const batch = videos.slice(i, i + BATCH_SIZE);
    const checked = await Promise.all(
      batch.map(async (video) => ({
        ...video,
        outcome: ((await isYouTubeVideoAvailable(video.videoId))
          ? "active"
          : "broken") as VideoCheckOutcome,
      }))
    );

    for (const video of checked) {
      const nextActive = video.outcome === "active";
      const nextStatus = video.outcome;

      // "removed" status is curator-controlled; never auto-reactivate it.
      const skipUpdate = video.status === "removed";

      if (!skipUpdate) {
        await prisma.youTubeVideo.update({
          where: { id: video.id },
          data: {
            isActive: nextActive,
            status: nextStatus,
            lastChecked: new Date(),
          },
        });

        if (video.isActive && !nextActive) result.deactivated++;
        if (!video.isActive && nextActive) result.reactivated++;
      } else {
        // Touch lastChecked even for curator-removed videos so the dashboard
        // reflects when we last looked at them.
        await prisma.youTubeVideo.update({
          where: { id: video.id },
          data: { lastChecked: new Date() },
        });
      }

      result.checked++;
      if (nextActive) result.active++;
      else result.broken++;
    }
  }

  return result;
}
