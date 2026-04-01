import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    stripePriceId: null as string | null,
    features: [
      "Browse all product reviews",
      "Read AI-powered summaries",
      "Basic search & filters",
      "Community discussions",
      "Up to 5 reviews per month",
    ],
  },
  pro: {
    name: "Pro",
    price: 999, // $9.99 in cents
    get stripePriceId() {
      return process.env.STRIPE_PRO_PRICE_ID || "";
    },
    features: [
      "Everything in Free",
      "Ad-free experience",
      "Price tracking alerts",
      "Advanced comparison tools",
      "Early access to new reviews",
      "Weekly expert digest email",
      "Priority expert consultation",
      "Unlimited reviews",
      "Export comparison data",
    ],
  },
} as const;

export type PlanKey = "free" | "pro";

const PRO_FEATURES = new Set([
  "price_tracking",
  "advanced_comparison",
  "early_access",
  "weekly_digest",
  "expert_consultation",
  "unlimited_reviews",
  "export_data",
  "ad_free",
]);

export function isProFeature(feature: string): boolean {
  return PRO_FEATURES.has(feature);
}
