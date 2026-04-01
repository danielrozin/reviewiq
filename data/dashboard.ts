import type { SavedComparison, WatchlistItem, DashboardStats } from "@/types";
import { products } from "./products";
import { users } from "./users";

// Mock saved comparisons for demo user (Sarah K.)
const DEMO_USER_ID = "user-sarah-k";

export const savedComparisons: SavedComparison[] = [
  {
    id: "sc-1",
    productId: "rv-roborock-s8-maxv",
    productName: "Roborock S8 MaxV Ultra",
    productSlug: "roborock-s8-maxv-ultra",
    productImage: "/images/products/roborock-s8-maxv.jpg",
    productScore: 91,
    categorySlug: "robot-vacuums",
    note: "Top pick for large homes with pets",
    savedAt: "2026-03-28",
  },
  {
    id: "sc-2",
    productId: "rv-dreame-x40",
    productName: "Dreame X40 Ultra",
    productSlug: "dreame-x40-ultra",
    productImage: "/images/products/dreame-x40.jpg",
    productScore: 88,
    categorySlug: "robot-vacuums",
    note: "Great alternative, better edge cleaning",
    savedAt: "2026-03-27",
  },
  {
    id: "sc-3",
    productId: "af-ninja-foodi-xl",
    productName: "Ninja Foodi XL",
    productSlug: "ninja-foodi-xl",
    productImage: "/images/products/ninja-foodi-xl.jpg",
    productScore: 85,
    categorySlug: "air-fryers",
    savedAt: "2026-03-25",
  },
  {
    id: "sc-4",
    productId: "cm-breville-barista-express",
    productName: "Breville Barista Express Impress",
    productSlug: "breville-barista-express-impress",
    productImage: "/images/products/breville-barista-express.jpg",
    productScore: 87,
    categorySlug: "coffee-machines",
    note: "Considering for kitchen upgrade",
    savedAt: "2026-03-22",
  },
];

export const watchlistItems: WatchlistItem[] = [
  {
    id: "wl-1",
    productId: "rv-roborock-s8-maxv",
    productName: "Roborock S8 MaxV Ultra",
    productSlug: "roborock-s8-maxv-ultra",
    productImage: "/images/products/roborock-s8-maxv.jpg",
    currentScore: 91,
    lastKnownScore: 89,
    categorySlug: "robot-vacuums",
    addedAt: "2026-03-15",
  },
  {
    id: "wl-2",
    productId: "we-sony-wf-1000xm5",
    productName: "Sony WF-1000XM5",
    productSlug: "sony-wf-1000xm5",
    productImage: "/images/products/sony-wf-1000xm5.jpg",
    currentScore: 89,
    lastKnownScore: 89,
    categorySlug: "wireless-earbuds",
    addedAt: "2026-03-10",
  },
  {
    id: "wl-3",
    productId: "mt-purple-mattress",
    productName: "Purple Mattress",
    productSlug: "purple-mattress",
    productImage: "/images/products/purple-mattress.jpg",
    currentScore: 82,
    lastKnownScore: 84,
    categorySlug: "mattresses",
    addedAt: "2026-02-20",
  },
];

export function getDashboardStats(userId: string): DashboardStats {
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return {
      reviewCount: 0,
      savedCount: 0,
      watchlistCount: 0,
      helpfulVotesReceived: 0,
      reputationScore: 0,
      trustLevel: "newcomer",
    };
  }
  return {
    reviewCount: user.reviewCount,
    savedCount: savedComparisons.length,
    watchlistCount: watchlistItems.length,
    helpfulVotesReceived: user.helpfulVotesReceived,
    reputationScore: user.reputationScore,
    trustLevel: user.trustLevel,
  };
}

export function getSavedComparisons(userId: string): SavedComparison[] {
  return savedComparisons;
}

export function getWatchlistItems(userId: string): WatchlistItem[] {
  return watchlistItems;
}

// Get recommended products based on user's review history (categories they review)
export function getRecommendedProducts(userId: string, limit: number = 4) {
  const user = users.find((u) => u.id === userId);
  if (!user) return [];

  const expertCategories = new Set(user.expertiseCategories);
  return products
    .filter((p) => expertCategories.has(p.categorySlug))
    .sort((a, b) => b.smartScore - a.smartScore)
    .slice(0, limit);
}
