"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

interface Props {
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  smartScore: number;
}

export function TrackRecentlyViewed({ slug, name, brand, categorySlug, smartScore }: Props) {
  const { addItem } = useRecentlyViewed();

  useEffect(() => {
    addItem({ slug, name, brand, categorySlug, smartScore });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return null;
}
