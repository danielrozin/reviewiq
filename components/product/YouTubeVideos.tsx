"use client";

import { useState, useRef, useEffect } from "react";
import type { YouTubeVideo } from "@/types";

interface Props {
  videos: YouTubeVideo[];
  productName: string;
}

export function YouTubeVideos({ videos, productName }: Props) {
  const activeVideos = videos.filter((v) => v.isActive !== false);
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
  const [playing, setPlaying] = useState<string | null>(null);
  const activeIframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (playing) {
      activeIframeRef.current?.focus();
    }
  }, [playing]);

  const visibleVideos = activeVideos
    .filter((v) => !failedIds.has(v.id))
    .slice(0, 3);

  if (visibleVideos.length === 0) return null;

  return (
    <section aria-labelledby="youtube-videos-heading" data-speakable="video-reviews">
      <div className="flex items-center gap-2.5 mb-1">
        <div aria-hidden="true" className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-3.5 h-3.5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
          </svg>
        </div>
        <h2 id="youtube-videos-heading" className="text-lg font-semibold text-gray-900">Video Reviews</h2>
      </div>
      <p className="text-sm text-gray-600 mb-6 ml-9">
        Watch in-depth reviews and comparisons of the {productName}
      </p>
      <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
        {visibleVideos.map((video) => (
          <li key={video.id} className="space-y-2 group/card hover:-translate-y-0.5 transition-transform duration-200">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 group-hover/card:shadow-md transition-shadow duration-200">
              {playing === video.id ? (
                <iframe
                  ref={activeIframeRef}
                  src={`https://www.youtube.com/embed/${video.id}?rel=0&autoplay=1`}
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
              ) : (
                <button
                  type="button"
                  className="absolute inset-0 w-full h-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-inset"
                  onClick={() => setPlaying(video.id)}
                  aria-label={`Play: ${video.title}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={() =>
                      setFailedIds((prev) => new Set(prev).add(video.id))
                    }
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-red-600 group-hover:bg-red-700 rounded-full flex items-center justify-center shadow-xl transition-all motion-safe:group-hover:scale-110">
                      <svg aria-hidden="true" className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </button>
              )}
            </div>
            <p className="text-sm font-medium text-gray-700 line-clamp-2">
              {video.title}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
