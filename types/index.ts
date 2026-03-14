// ==========================================
// SmartReview Core Type System
// ==========================================

// --- Product & Category ---

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  productCount: number;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  categorySlug: string;
  description: string;
  image: string;
  priceRange: PriceRange;
  smartScore: number; // 0-100
  verifiedPurchaseRate: number; // 0-100
  reviewCount: number;
  ratingDistribution: RatingDistribution;
  aiSummary: AISummary;
  specs: ProductSpec[];
  recurringIssues: RecurringIssue[];
  comparisons: ComparisonRef[];
  faq: FAQItem[];
  reviews: Review[];
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface AISummary {
  whatPeopleLove: string[];
  whatPeopleHate: string[];
  bestFor: string[];
  notFor: string[];
  topComplaints: string[];
  keyFacts: string[];
}

export interface ProductSpec {
  label: string;
  value: string;
  group?: string;
}

export interface RecurringIssue {
  title: string;
  mentionCount: number;
  severity: "low" | "medium" | "high";
  description: string;
}

export interface ComparisonRef {
  productId: string;
  productName: string;
  productSlug: string;
  searchVolume?: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

// --- Reviews ---

export interface Review {
  id: string;
  productId: string;
  headline: string;
  rating: number;
  verifiedPurchase: boolean;
  verificationTier: VerificationTier;
  timeOwned: string;
  experienceLevel: "beginner" | "intermediate" | "expert";
  pros: string[];
  cons: string[];
  reliabilityRating: number;
  easeOfUseRating: number;
  valueRating: number;
  body: string;
  aiTopics: string[];
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  helpfulCount: number;
}

export type VerificationTier =
  | "receipt_upload"
  | "email_receipt"
  | "retailer_verified"
  | "user_declared"
  | "unverified";

export const VERIFICATION_LABELS: Record<VerificationTier, string> = {
  receipt_upload: "Receipt Verified",
  email_receipt: "Email Verified",
  retailer_verified: "Retailer Verified",
  user_declared: "Self-Declared",
  unverified: "Unverified",
};

export const VERIFICATION_CONFIDENCE: Record<VerificationTier, number> = {
  receipt_upload: 95,
  email_receipt: 85,
  retailer_verified: 90,
  user_declared: 40,
  unverified: 0,
};

// --- DataForSEO Models ---

export interface CategorySearchInsight {
  keyword: string;
  searchVolume: number;
  competition: number;
  cpc: number;
  trend: number[];
  relatedKeywords: string[];
}

export interface ProductSearchInsight {
  productName: string;
  brand: string;
  searchVolume: number;
  relatedSearches: string[];
}

export interface ComparisonOpportunity {
  keyword: string;
  productA: string;
  productB: string;
  searchVolume: number;
}

export interface BuyerQuestion {
  question: string;
  searchVolume: number;
  category: string;
  intent: "informational" | "commercial" | "transactional";
}

export interface ComplaintSearchSignal {
  keyword: string;
  productName: string;
  searchVolume: number;
  issueType: string;
}

export interface TrendSignal {
  keyword: string;
  searchVolume: number;
  trend: "rising" | "stable" | "declining";
  changePercent: number;
}
