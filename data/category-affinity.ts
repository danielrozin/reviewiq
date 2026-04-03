/**
 * Category affinity map — defines which product categories are related.
 * Used for cross-category internal linking ("People Also Reviewed" sections).
 *
 * Affinity is bidirectional: if headphones → wireless-earbuds, the reverse is implied.
 * Weight (0-1) indicates strength of relationship for sorting.
 */

export interface CategoryAffinity {
  slug: string;
  weight: number; // 0-1, higher = stronger relationship
}

const affinityMap: Record<string, CategoryAffinity[]> = {
  "robot-vacuums": [
    { slug: "smart-speakers", weight: 0.7 },
    { slug: "air-fryers", weight: 0.4 },
    { slug: "portable-power-stations", weight: 0.3 },
  ],
  "coffee-machines": [
    { slug: "air-fryers", weight: 0.7 },
    { slug: "blenders", weight: 0.8 },
  ],
  "air-fryers": [
    { slug: "blenders", weight: 0.8 },
    { slug: "coffee-machines", weight: 0.7 },
    { slug: "robot-vacuums", weight: 0.4 },
  ],
  "wireless-earbuds": [
    { slug: "headphones", weight: 0.95 },
    { slug: "smart-watches", weight: 0.7 },
    { slug: "smart-speakers", weight: 0.5 },
  ],
  mattresses: [
    { slug: "standing-desks", weight: 0.5 },
  ],
  "smart-watches": [
    { slug: "wireless-earbuds", weight: 0.7 },
    { slug: "headphones", weight: 0.5 },
    { slug: "tablets", weight: 0.4 },
  ],
  "standing-desks": [
    { slug: "laptops", weight: 0.7 },
    { slug: "gaming-mice", weight: 0.5 },
    { slug: "mattresses", weight: 0.5 },
  ],
  blenders: [
    { slug: "air-fryers", weight: 0.8 },
    { slug: "coffee-machines", weight: 0.8 },
  ],
  laptops: [
    { slug: "tablets", weight: 0.85 },
    { slug: "gaming-mice", weight: 0.6 },
    { slug: "headphones", weight: 0.5 },
    { slug: "standing-desks", weight: 0.7 },
  ],
  "electric-toothbrushes": [
    { slug: "smart-watches", weight: 0.3 },
  ],
  headphones: [
    { slug: "wireless-earbuds", weight: 0.95 },
    { slug: "smart-speakers", weight: 0.6 },
    { slug: "smart-watches", weight: 0.5 },
  ],
  tablets: [
    { slug: "laptops", weight: 0.85 },
    { slug: "smart-watches", weight: 0.4 },
    { slug: "wireless-earbuds", weight: 0.4 },
  ],
  "smart-speakers": [
    { slug: "headphones", weight: 0.6 },
    { slug: "wireless-earbuds", weight: 0.5 },
    { slug: "robot-vacuums", weight: 0.7 },
  ],
  "gaming-mice": [
    { slug: "laptops", weight: 0.6 },
    { slug: "headphones", weight: 0.7 },
    { slug: "standing-desks", weight: 0.5 },
  ],
  "portable-power-stations": [
    { slug: "laptops", weight: 0.5 },
    { slug: "tablets", weight: 0.4 },
    { slug: "robot-vacuums", weight: 0.3 },
  ],
};

/**
 * Get affinity categories for a given category slug, sorted by weight descending.
 */
export function getAffinityCategories(categorySlug: string): CategoryAffinity[] {
  return (affinityMap[categorySlug] ?? []).sort((a, b) => b.weight - a.weight);
}

/**
 * Get all affinity category slugs for a given category (just the slugs).
 */
export function getAffinityCategorySlugs(categorySlug: string): string[] {
  return getAffinityCategories(categorySlug).map((a) => a.slug);
}
