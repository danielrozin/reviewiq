"use client";

import { useEffect } from "react";
import { trackCategoryViewed } from "@/lib/tracking/analytics";

export function TrackCategoryView({ slug, productCount }: { slug: string; productCount: number }) {
  useEffect(() => {
    trackCategoryViewed(slug, productCount);
  }, [slug, productCount]);

  return null;
}
