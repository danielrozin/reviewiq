import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ThreadCard } from "@/components/community/ThreadCard";
import { UserChip } from "@/components/community/UserChip";
import { TrustBadge } from "@/components/community/TrustBadge";
import { discussions, getTrendingDiscussions, getRecentDiscussions, getTopDiscussions, getPinnedDiscussions } from "@/data/discussions";
import { SortableDiscussions } from "@/components/community/SortableDiscussions";
import { getTopContributors } from "@/data/users";
import { categories } from "@/data/categories";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Community — ReviewIQ",
  description:
    "Join the ReviewIQ community. Ask questions, share experiences, and help others make smarter buying decisions.",
  path: "/community",
});

export default function CommunityPage() {
  const trending = getTrendingDiscussions(10);
  const recent = getRecentDiscussions(10);
  const top = getTopDiscussions(10);
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

      {/* Hero — gradient banner */}
      <header className="mt-6 mb-10">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-500 rounded-2xl px-6 sm:px-10 py-8 sm:py-10 text-white mb-6">
          {/* Background orb */}
          <div className="pointer-events-none absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/5 blur-2xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-indigo-400/20 blur-2xl" aria-hidden="true" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 px-3 py-1 rounded-full text-xs font-medium mb-3 border border-white/20">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                {stats.activeContributors} contributors active now
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Community</h1>
              <p className="text-brand-100 max-w-lg leading-relaxed text-sm sm:text-base">
                Real conversations about real products. Ask questions, share your experience, and help others make smarter buying decisions.
              </p>
            </div>
            <Link
              href="/community/new"
              className="inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 bg-white text-brand-600 text-sm font-semibold rounded-xl hover:bg-brand-50 transition-colors shadow-sm shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Start Discussion
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: stats.threads, label: "Discussions", iconBg: "bg-brand-50", iconColor: "text-brand-600", icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>
            )},
            { value: stats.totalComments, label: "Comments", iconBg: "bg-emerald-50", iconColor: "text-emerald-600", icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>
            )},
            { value: stats.totalVotes, label: "Upvotes", iconBg: "bg-amber-50", iconColor: "text-amber-600", icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" /></svg>
            )},
            { value: stats.activeContributors, label: "Contributors", iconBg: "bg-purple-50", iconColor: "text-purple-600", icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0z" /></svg>
            )},
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 hover:shadow-sm hover:border-gray-200 transition-all">
              <div className={`w-9 h-9 ${stat.iconBg} ${stat.iconColor} rounded-lg flex items-center justify-center shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 leading-none">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
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
          <SortableDiscussions trending={trending} recent={recent} top={top} />
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
