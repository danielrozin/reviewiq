import type { Category } from "@/types";

export const categories: Category[] = [
  {
    id: "cat-robot-vacuums",
    name: "Robot Vacuums",
    slug: "robot-vacuums",
    description:
      "Find the best robot vacuum for your home. Compare suction power, navigation, mopping, and real owner experiences across top brands like Roborock, iRobot, and Ecovacs.",
    icon: "🤖",
    productCount: 4,
  },
  {
    id: "cat-coffee-machines",
    name: "Coffee Machines",
    slug: "coffee-machines",
    description:
      "Discover the right coffee machine for your daily routine. From espresso to drip, compare taste quality, ease of use, and long-term reliability based on real buyer feedback.",
    icon: "☕",
    productCount: 4,
  },
  {
    id: "cat-air-fryers",
    name: "Air Fryers",
    slug: "air-fryers",
    description:
      "Compare air fryers by cooking quality, capacity, and ease of cleaning. See what real owners say after months of daily use.",
    icon: "🍟",
    productCount: 4,
  },
  {
    id: "cat-wireless-earbuds",
    name: "Wireless Earbuds",
    slug: "wireless-earbuds",
    description:
      "Find your perfect wireless earbuds. Compare sound quality, noise cancellation, comfort, and battery life from verified purchaser reviews.",
    icon: "🎧",
    productCount: 4,
  },
  {
    id: "cat-mattresses",
    name: "Mattresses",
    slug: "mattresses",
    description:
      "Choose the right mattress with confidence. See real sleep quality reports, durability feedback after 6+ months, and comfort comparisons from verified owners.",
    icon: "🛏️",
    productCount: 4,
  },
  {
    id: "cat-smart-watches",
    name: "Smart Watches",
    slug: "smart-watches",
    description:
      "Compare smart watches by health tracking accuracy, battery life, and daily usability. Real owner insights on fitness features, notifications, and long-term durability.",
    icon: "⌚",
    productCount: 4,
  },
  {
    id: "cat-standing-desks",
    name: "Standing Desks",
    slug: "standing-desks",
    description:
      "Find the best standing desk for your workspace. Compare motor quality, stability, height range, and real owner experiences after months of daily use.",
    icon: "🪑",
    productCount: 4,
  },
  {
    id: "cat-blenders",
    name: "Blenders",
    slug: "blenders",
    description:
      "Discover the right blender for smoothies, soups, and meal prep. Compare blending power, noise levels, and cleanup ease from verified buyer reviews.",
    icon: "🥤",
    productCount: 4,
  },
  {
    id: "cat-laptops",
    name: "Laptops",
    slug: "laptops",
    description:
      "Choose the right laptop for work, gaming, or creative tasks. Compare real-world performance, battery life, and build quality from verified owners.",
    icon: "💻",
    productCount: 4,
  },
  {
    id: "cat-electric-toothbrushes",
    name: "Electric Toothbrushes",
    slug: "electric-toothbrushes",
    description:
      "Find the best electric toothbrush for your dental routine. Compare cleaning performance, battery life, and smart features from real user experiences.",
    icon: "🪥",
    productCount: 4,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
