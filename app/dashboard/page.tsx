import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
import { breadcrumbSchema } from "@/lib/schema/jsonld";
import { UserProBadge } from "@/components/premium/UserProBadge";
import { ProfileChecklist } from "@/components/onboarding/ProfileChecklist";

export const metadata = buildMetadata({
  title: "Dashboard — ReviewIQ",
  description: "Your saved comparisons, review history, and product watchlist.",
  path: "/dashboard",
});

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const userId = (session.user as { id?: string }).id || "";
  const user = getUserById(userId);
  if (!user) return null;

  const stats = getDashboardStats(userId);
  const saved = getSavedComparisons(userId);
  const watchlist = getWatchlistItems(userId);
  const recommended = getRecommendedProducts(userId, 4);

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Dashboard", url: "/dashboard" }])) }} />

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 mb-8">
        <div className="flex items-center gap-4">
          <div aria-hidden="true" className="w-14 h-14 rounded-full bg-brand-100 text-brand-600 font-bold text-xl flex items-center justify-center">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.displayName.split(" ")[0]}
              </h1>
              <UserProBadge userId={user.id} size="md" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${TRUST_LEVEL_COLORS[user.trustLevel]}`}
              >
                {TRUST_LEVEL_LABELS[user.trustLevel]}
              </span>
              <span className="text-xs text-gray-600">
                {user.reputationScore} reputation
              </span>
            </div>
          </div>
        </div>
        <Link
          href={`/community/user/${user.username}`}
          className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 rounded"
        >
          View public profile
          <svg aria-hidden="true" className="w-3.5 h-3.5 group-hover:translate-x-0.5 motion-safe:transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </header>

      {/* Onboarding Checklist */}
      <section aria-label="Getting started" aria-live="polite" aria-atomic="true" className="mb-8">
        <ProfileChecklist />
      </section>

      {/* Quick Actions */}
      <section aria-label="Quick actions" className="mb-8">
        <QuickActions />
      </section>

      {/* Stats */}
      <section aria-label="Account statistics" className="mb-8">
        <StatsOverview stats={stats} />
      </section>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column — 2/3 */}
        <div className="lg:col-span-2 space-y-8">
          {/* Saved Comparisons */}
          <section aria-labelledby="dashboard-saved-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="dashboard-saved-heading" className="text-lg font-semibold text-gray-900">
                Saved Products
              </h2>
              <span className="text-xs text-gray-600">
                {saved.length} saved
              </span>
            </div>
            <SavedComparisons items={saved} />
          </section>

          {/* Review History */}
          <section aria-labelledby="dashboard-reviews-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="dashboard-reviews-heading" className="text-lg font-semibold text-gray-900">
                Your Reviews
              </h2>
              <Link
                href="/write-review"
                className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 rounded"
              >
                Write a review
                <svg aria-hidden="true" className="w-3 h-3 group-hover:translate-x-0.5 motion-safe:transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </div>
            <ReviewHistory reviews={userReviews} />
          </section>
        </div>

        {/* Right column — 1/3 */}
        <div className="space-y-8">
          {/* Watchlist */}
          <section aria-labelledby="dashboard-watchlist-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="dashboard-watchlist-heading" className="text-lg font-semibold text-gray-900">
                SmartScore Watchlist
              </h2>
              <span className="text-xs text-gray-600">
                {watchlist.length} watching
              </span>
            </div>
            <WatchlistPanel items={watchlist} />
          </section>

          {/* Badges */}
          <section aria-labelledby="dashboard-badges-heading" className="bg-white border border-gray-100 rounded-2xl p-5">
            <h2 id="dashboard-badges-heading" className="text-sm font-semibold text-gray-900 mb-3">
              Your Badges
            </h2>
            <ul role="list" className="flex flex-wrap gap-1.5 list-none p-0 m-0">
              {user.badges.map((badge) => (
                <li key={badge}>
                  <TrustBadge badge={badge as UserBadge} size="md" />
                </li>
              ))}
            </ul>
          </section>

          {/* Recommendations */}
          <section aria-labelledby="dashboard-recommended-heading">
            <h2 id="dashboard-recommended-heading" className="text-lg font-semibold text-gray-900 mb-4">
              Recommended For You
            </h2>
            <RecommendedProducts products={recommended} />
          </section>
        </div>
      </div>
    </div>
  );
}
