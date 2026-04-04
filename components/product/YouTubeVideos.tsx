"use client";

import { useState } from "react";
import type { YouTubeVideo } from "@/types";

interface Props {
  videos: YouTubeVideo[];
  productName: string;
}

export function YouTubeVideos({ videos, productName }: Props) {
  const activeVideos = videos.filter((v) => v.isActive !== false);
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

  const visibleVideos = activeVideos
    .filter((v) => !failedIds.has(v.id))
    .slice(0, 3);

  if (visibleVideos.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Video Reviews
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Watch in-depth reviews and comparisons of the {productName}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleVideos.map((video) => (
          <div key={video.id} className="space-y-2">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
              <iframe
                src={`https://www.youtube.com/embed/${video.id}?rel=0`}
                title={video.title}
                width={560}
                height={315}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
                onError={() =>
                  setFailedIds((prev) => new Set(prev).add(video.id))
                }
              />
            </div>
            <p className="text-sm font-medium text-gray-700 line-clamp-2">
              {video.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
