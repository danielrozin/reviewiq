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
import { communityPageSchema, breadcrumbSchema } from "@/lib/schema/jsonld";

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(communityPageSchema(trending, "2024-01-01", "2026-07-06")) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Community", url: "/community" }])) }} />

      {/* Hero — gradient banner */}
      <header className="mt-6 mb-10" data-speakable="community-hero">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 rounded-2xl px-6 sm:px-10 py-8 sm:py-10 text-white mb-6">
          {/* Background orb */}
          <div className="pointer-events-none absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/5 blur-2xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-indigo-400/20 blur-2xl" aria-hidden="true" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 px-3 py-1 rounded-full text-xs font-medium mb-3 border border-white/20">
                <span aria-hidden="true" className="w-1.5 h-1.5 bg-emerald-400 rounded-full motion-safe:animate-pulse" />
                {stats.activeContributors} contributors active now
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Community</h1>
              <p className="max-w-lg leading-relaxed text-sm sm:text-base">
                Real conversations about real products. Ask questions, share your experience, and help others make smarter buying decisions.
              </p>
            </div>
            <Link
              href="/community/new"
              className="inline-flex items-center gap-2 self-start sm:self-auto px-5 py-3 min-h-[44px] bg-white text-brand-600 text-sm font-semibold rounded-xl hover:bg-brand-50 transition-colors shadow-sm shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
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
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>
            )},
            { value: stats.totalComments, label: "Comments", iconBg: "bg-emerald-50", iconColor: "text-emerald-600", icon: (
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>
            )},
            { value: stats.totalVotes, label: "Upvotes", iconBg: "bg-amber-50", iconColor: "text-amber-600", icon: (
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" /></svg>
            )},
            { value: stats.activeContributors, label: "Contributors", iconBg: "bg-purple-50", iconColor: "text-purple-600", icon: (
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0z" /></svg>
            )},
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 hover:shadow-sm hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200">
              <div aria-hidden="true" className={`w-9 h-9 ${stat.iconBg} ${stat.iconColor} rounded-lg flex items-center justify-center shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 leading-none">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left column — threads */}
        <div className="lg:col-span-2 space-y-6" data-speakable="community-discussions">
          {/* Pinned threads */}
          {pinned.length > 0 && (
            <section aria-labelledby="pinned-threads-heading">
              <h2 id="pinned-threads-heading" className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
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
          <section aria-labelledby="sidebar-categories-heading" className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-sm hover:border-gray-200 transition-all duration-200">
            <div className="flex items-center gap-2.5 mb-4">
              <div aria-hidden="true" className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                <svg aria-hidden="true" className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <h2 id="sidebar-categories-heading" className="font-semibold text-gray-900">Browse by Category</h2>
            </div>
            <ul className="space-y-1 list-none p-0 m-0">
              {categories.map((cat) => {
                const count = discussions.filter(
                  (d) => d.categorySlug === cat.slug
                ).length;
                return (
                  <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
                  >
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true" className="text-base">{cat.icon}</span>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-brand-600 transition-colors">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-600">{count}</span>
                      <svg aria-hidden="true" className="w-3 h-3 text-gray-300 group-hover:text-brand-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Top contributors */}
          <section aria-labelledby="sidebar-contributors-heading" className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-sm hover:border-gray-200 transition-all duration-200">
            <div className="flex items-center gap-2.5 mb-4">
              <div aria-hidden="true" className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                <svg aria-hidden="true" className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h2 id="sidebar-contributors-heading" className="font-semibold text-gray-900">Top Contributors</h2>
            </div>
            <ul className="space-y-3 list-none p-0 m-0">
              {topContributors.map((user, i) => (
                <li key={user.id} className="flex items-center gap-3">
                  <span
                    aria-label={`Rank ${i + 1}`}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i === 0 ? "bg-amber-400 text-white" :
                    i === 1 ? "bg-gray-500 text-white" :
                    i === 2 ? "bg-orange-400 text-white" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    <span aria-hidden="true">{i + 1}</span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <UserChip user={user} showTrustLevel showReputation size="sm" />
                    <div className="flex flex-wrap gap-1 mt-1.5 ml-7">
                      {user.badges.slice(0, 2).map((badge) => (
                        <TrustBadge key={badge} badge={badge} size="sm" />
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Community guidelines */}
          <section aria-labelledby="sidebar-guidelines-heading" className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-sm hover:border-gray-200 transition-all duration-200">
            <div className="flex items-center gap-2.5 mb-3">
              <div aria-hidden="true" className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                <svg aria-hidden="true" className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <h2 id="sidebar-guidelines-heading" className="font-semibold text-gray-900">Community Guidelines</h2>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              {[
                "Share genuine experiences based on products you own",
                "Be specific and helpful — vague opinions don't help buyers",
                "Disagree respectfully — attack arguments, not people",
                "No affiliate links, self-promotion, or astroturfing",
                "Report suspected fake reviews or spam",
              ].map((rule) => (
                <li key={rule} className="flex items-start gap-2">
                  <span aria-hidden="true" className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center">
                    <svg aria-hidden="true" className="w-2.5 h-2.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  {rule}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
