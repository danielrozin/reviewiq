import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ThreadCard } from "@/components/community/ThreadCard";
import { UserChip } from "@/components/community/UserChip";
import { TrustBadge } from "@/components/community/TrustBadge";
import { discussions, getTrendingDiscussions, getPinnedDiscussions } from "@/data/discussions";
import { getTopContributors } from "@/data/users";
import { categories } from "@/data/categories";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Community — SmartReview",
  description:
    "Join the SmartReview community. Ask questions, share experiences, and help others make smarter buying decisions.",
  path: "/community",
});

export default function CommunityPage() {
  const trending = getTrendingDiscussions(10);
  const pinned = getPinnedDiscussions();
  const topContributors = getTopContributors(5);

  const stats = {
    threads: discussions.length,
    totalComments: discussions.reduce((sum, d) => sum + d.commentCount, 0),
    totalVotes: discussions.reduce((sum, d) => sum + d.upvotes, 0),
    activeContributors: 10,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ name: "Community", url: "/community" }]}
      />

      {/* Hero */}
      <header className="mt-8 mb-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Community
            </h1>
            <p className="text-gray-500 max-w-2xl leading-relaxed">
              Real conversations about real products. Ask questions, share your
              experience, and help others make smarter buying decisions.
            </p>
          </div>
          <Link
            href="/community/new"
            className="hidden sm:inline-flex items-center px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors shrink-0"
          >
            Start Discussion
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          {[
            { value: stats.threads, label: "Discussions" },
            { value: stats.totalComments, label: "Comments" },
            { value: stats.totalVotes, label: "Upvotes" },
            { value: stats.activeContributors, label: "Contributors" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-gray-50 rounded-xl p-4 text-center"
            >
              <p className="text-xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left column — threads */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pinned threads */}
          {pinned.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Pinned
              </h2>
              <div className="space-y-3">
                {pinned.map((thread) => (
                  <ThreadCard key={thread.id} thread={thread} />
                ))}
              </div>
            </section>
          )}

          {/* All discussions */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Trending Discussions
              </h2>
              <div className="flex items-center gap-1">
                {["Trending", "Recent", "Top"].map((tab, i) => (
                  <button
                    key={tab}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                      i === 0
                        ? "bg-brand-50 text-brand-600"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {trending.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-8">
          {/* Category discussions */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Browse by Category
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => {
                const count = discussions.filter(
                  (d) => d.categorySlug === cat.slug
                ).length;
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-brand-600 transition-colors">
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {count} threads
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Top contributors */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Top Contributors
            </h3>
            <div className="space-y-3">
              {topContributors.map((user, i) => (
                <div key={user.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-300 w-4">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <UserChip user={user} showTrustLevel showReputation size="sm" />
                    <div className="flex flex-wrap gap-1 mt-1.5 ml-7">
                      {user.badges.slice(0, 2).map((badge) => (
                        <TrustBadge key={badge} badge={badge} size="sm" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community guidelines */}
          <div className="border border-gray-100 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Community Guidelines
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-brand-500 shrink-0 mt-0.5">●</span>
                Share genuine experiences based on products you own
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-500 shrink-0 mt-0.5">●</span>
                Be specific and helpful — vague opinions don&apos;t help buyers
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-500 shrink-0 mt-0.5">●</span>
                Disagree respectfully — attack arguments, not people
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-500 shrink-0 mt-0.5">●</span>
                No affiliate links, self-promotion, or astroturfing
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-500 shrink-0 mt-0.5">●</span>
                Report suspected fake reviews or spam
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
