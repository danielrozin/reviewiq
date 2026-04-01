import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { SavedComparisons } from "@/components/dashboard/SavedComparisons";
import { WatchlistPanel } from "@/components/dashboard/WatchlistPanel";
import { ReviewHistory } from "@/components/dashboard/ReviewHistory";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecommendedProducts } from "@/components/dashboard/RecommendedProducts";
import { TrustBadge } from "@/components/community/TrustBadge";
import {
  getDashboardStats,
  getSavedComparisons,
  getWatchlistItems,
  getRecommendedProducts,
} from "@/data/dashboard";
import { getUserById } from "@/data/users";
import { getAllProducts } from "@/data/products";
import { TRUST_LEVEL_LABELS, TRUST_LEVEL_COLORS } from "@/types";
import type { UserBadge } from "@/types";
import { buildMetadata } from "@/lib/seo/metadata";

// Demo user for initial launch — will use session auth when NextAuth is fully wired
const DEMO_USER_ID = "user-sarah-k";

export const metadata = buildMetadata({
  title: "Dashboard — SmartReview",
  description: "Your saved comparisons, review history, and product watchlist.",
  path: "/dashboard",
});

export default function DashboardPage() {
  const user = getUserById(DEMO_USER_ID);
  if (!user) return null;

  const stats = getDashboardStats(DEMO_USER_ID);
  const saved = getSavedComparisons(DEMO_USER_ID);
  const watchlist = getWatchlistItems(DEMO_USER_ID);
  const recommended = getRecommendedProducts(DEMO_USER_ID, 4);

  // Build review history from products data
  const allProducts = getAllProducts();
  const userReviews = allProducts
    .flatMap((product) =>
      product.reviews.slice(0, 1).map((review) => ({
        review,
        productName: product.name,
        productSlug: product.slug,
        categorySlug: product.categorySlug,
      }))
    )
    .slice(0, 5);

  const initials = user.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ name: "Dashboard", url: "/dashboard" }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-600 font-bold text-xl flex items-center justify-center">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.displayName.split(" ")[0]}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TRUST_LEVEL_COLORS[user.trustLevel]}`}
              >
                {TRUST_LEVEL_LABELS[user.trustLevel]}
              </span>
              <span className="text-xs text-gray-400">
                {user.reputationScore} reputation
              </span>
            </div>
          </div>
        </div>
        <Link
          href={`/community/user/${user.username}`}
          className="text-sm text-brand-600 hover:text-brand-700 font-medium"
        >
          View public profile →
        </Link>
      </div>

      {/* Quick Actions */}
      <section className="mb-8">
        <QuickActions />
      </section>

      {/* Stats */}
      <section className="mb-8">
        <StatsOverview stats={stats} />
      </section>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column — 2/3 */}
        <div className="lg:col-span-2 space-y-8">
          {/* Saved Comparisons */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Saved Products
              </h2>
              <span className="text-xs text-gray-400">
                {saved.length} saved
              </span>
            </div>
            <SavedComparisons items={saved} />
          </section>

          {/* Review History */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Reviews
              </h2>
              <Link
                href="/write-review"
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                Write a review →
              </Link>
            </div>
            <ReviewHistory reviews={userReviews} />
          </section>
        </div>

        {/* Right column — 1/3 */}
        <div className="space-y-8">
          {/* Watchlist */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                SmartScore Watchlist
              </h2>
              <span className="text-xs text-gray-400">
                {watchlist.length} watching
              </span>
            </div>
            <WatchlistPanel items={watchlist} />
          </section>

          {/* Badges */}
          <section className="bg-gray-50 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Your Badges
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {user.badges.map((badge) => (
                <TrustBadge key={badge} badge={badge as UserBadge} size="md" />
              ))}
            </div>
          </section>

          {/* Recommendations */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recommended For You
            </h2>
            <RecommendedProducts products={recommended} />
          </section>
        </div>
      </div>
    </div>
  );
}
