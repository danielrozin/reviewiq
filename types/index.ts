// ==========================================
// ReviewIQ Core Type System
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
  externalComparisons?: ExternalComparison[];
  faq: FAQItem[];
  reviews: Review[];
  youtubeVideos?: YouTubeVideo[];
}

export interface YouTubeVideo {
  id: string; // YouTube video ID (e.g. "dQw4w9WgXcQ")
  title: string;
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

export interface BuyingGuideStep {
  name: string;
  text: string;
  image?: string;
}

export interface ExternalComparison {
  title: string;
  url: string;
  source: string;
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

// ==========================================
// Social / Community Layer
// ==========================================

// --- User Profiles ---

export type TrustLevel = "newcomer" | "contributor" | "trusted" | "expert" | "moderator";

export const TRUST_LEVEL_LABELS: Record<TrustLevel, string> = {
  newcomer: "Newcomer",
  contributor: "Contributor",
  trusted: "Trusted Member",
  expert: "Expert",
  moderator: "Moderator",
};

export const TRUST_LEVEL_COLORS: Record<TrustLevel, string> = {
  newcomer: "text-gray-500 bg-gray-100",
  contributor: "text-blue-700 bg-blue-50",
  trusted: "text-emerald-700 bg-emerald-50",
  expert: "text-purple-700 bg-purple-50",
  moderator: "text-amber-700 bg-amber-50",
};

export type UserBadge =
  | "verified_owner"
  | "top_contributor"
  | "category_expert"
  | "long_term_owner"
  | "helpful_reviewer"
  | "early_adopter"
  | "detail_oriented";

export const BADGE_LABELS: Record<UserBadge, string> = {
  verified_owner: "Verified Owner",
  top_contributor: "Top Contributor",
  category_expert: "Category Expert",
  long_term_owner: "Long-Term Owner",
  helpful_reviewer: "Helpful Reviewer",
  early_adopter: "Early Adopter",
  detail_oriented: "Detail Oriented",
};

export const BADGE_ICONS: Record<UserBadge, string> = {
  verified_owner: "shield-check",
  top_contributor: "star",
  category_expert: "award",
  long_term_owner: "clock",
  helpful_reviewer: "thumbs-up",
  early_adopter: "zap",
  detail_oriented: "search",
};

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio: string;
  trustLevel: TrustLevel;
  reputationScore: number;
  badges: UserBadge[];
  expertiseCategories: string[];
  verifiedProductCount: number;
  reviewCount: number;
  commentCount: number;
  threadCount: number;
  helpfulVotesReceived: number;
  joinedAt: string;
  lastActiveAt: string;
}

// --- Discussion Threads ---

export type ThreadType =
  | "question"
  | "discussion"
  | "issue"
  | "recommendation"
  | "comparison"
  | "long_term_update"
  | "warning"
  | "positive_surprise"
  | "tip";

export const THREAD_TYPE_LABELS: Record<ThreadType, string> = {
  question: "Question",
  discussion: "Discussion",
  issue: "Issue Report",
  recommendation: "Recommendation",
  comparison: "Comparison",
  long_term_update: "Long-Term Update",
  warning: "Warning",
  positive_surprise: "Positive Surprise",
  tip: "Tip",
};

export const THREAD_TYPE_COLORS: Record<ThreadType, string> = {
  question: "text-blue-700 bg-blue-50 border-blue-200",
  discussion: "text-gray-700 bg-gray-50 border-gray-200",
  issue: "text-red-700 bg-red-50 border-red-200",
  recommendation: "text-emerald-700 bg-emerald-50 border-emerald-200",
  comparison: "text-purple-700 bg-purple-50 border-purple-200",
  long_term_update: "text-amber-700 bg-amber-50 border-amber-200",
  warning: "text-orange-700 bg-orange-50 border-orange-200",
  positive_surprise: "text-teal-700 bg-teal-50 border-teal-200",
  tip: "text-indigo-700 bg-indigo-50 border-indigo-200",
};

export interface DiscussionThread {
  id: string;
  title: string;
  body: string;
  threadType: ThreadType;
  authorId: string;
  productId?: string;
  productSlug?: string;
  categoryId?: string;
  categorySlug?: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  viewCount: number;
  isPinned: boolean;
  isResolved: boolean;
  tags: string[];
  createdAt: string;
  lastActivityAt: string;
}

// --- Comments ---

export interface Comment {
  id: string;
  threadId: string;
  parentId?: string; // for nested replies
  authorId: string;
  body: string;
  upvotes: number;
  downvotes: number;
  isTopAnswer: boolean;
  isOwnerVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  replies?: Comment[];
}

// --- Votes ---

export type VoteType = "upvote" | "downvote" | "helpful" | "agree" | "same_issue" | "owner_confirmed";

export const VOTE_TYPE_LABELS: Record<VoteType, string> = {
  upvote: "Upvote",
  downvote: "Downvote",
  helpful: "Helpful",
  agree: "Agree",
  same_issue: "Same Issue",
  owner_confirmed: "Owner Confirmed",
};

// --- Dashboard ---

export interface SavedComparison {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  productScore: number;
  categorySlug: string;
  note?: string;
  savedAt: string;
}

export interface WatchlistItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  currentScore: number;
  lastKnownScore: number;
  categorySlug: string;
  addedAt: string;
}

export interface DashboardStats {
  reviewCount: number;
  savedCount: number;
  watchlistCount: number;
  helpfulVotesReceived: number;
  reputationScore: number;
  trustLevel: TrustLevel;
}

// --- Moderation ---

export type ReportReason =
  | "spam"
  | "fake_review"
  | "harassment"
  | "misinformation"
  | "off_topic"
  | "duplicate"
  | "self_promotion";

export interface ModerationReport {
  id: string;
  contentType: "thread" | "comment" | "review";
  contentId: string;
  reporterId: string;
  reason: ReportReason;
  details?: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: string;
}

// ==========================================
// Blog System
// ==========================================

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  categorySlug: string;
  categoryName: string;
  tags: string[];
  author: BlogAuthor;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  seo: BlogSEO;
  faq: FAQItem[];
  relatedProductSlugs: string[];
}

export interface BlogAuthor {
  name: string;
  avatar?: string;
  bio: string;
}

export interface BlogSEO {
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
}
