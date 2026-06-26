"use client";

import { useEffect, useState, useCallback } from "react";

export interface RecentlyViewedItem {
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  smartScore: number;
  viewedAt: number;
}

const KEY = "riq_recently_viewed";
const MAX = 8;

function readStorage(): RecentlyViewedItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    setItems(readStorage());
  }, []);

  const addItem = useCallback((item: Omit<RecentlyViewedItem, "viewedAt">) => {
    const next = [
      { ...item, viewedAt: Date.now() },
      ...readStorage().filter((i) => i.slug !== item.slug),
    ].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    setItems(next);
  }, []);

  const clearItems = useCallback(() => {
    localStorage.removeItem(KEY);
    setItems([]);
  }, []);

  return { items, addItem, clearItems };
}
