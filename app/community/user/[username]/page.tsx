import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { TrustBadge } from "@/components/community/TrustBadge";
import { ThreadCard } from "@/components/community/ThreadCard";
import { users, getUserByUsername } from "@/data/users";
import { getDiscussionsByUser, getCommentsByUser } from "@/data/discussions";
import { TRUST_LEVEL_LABELS, TRUST_LEVEL_COLORS } from "@/types";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatNumber } from "@/lib/utils";
import { UserProBadge } from "@/components/premium/UserProBadge";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateStaticParams() {
  return users.map((u) => ({ username: u.username }));
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  const user = getUserByUsername(username);
  if (!user) return {};

  return buildMetadata({
    title: `${user.displayName} — ReviewIQ Community`,
    description: user.bio,
    path: `/community/user/${username}`,
  });
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const user = getUserByUsername(username);

  if (!user) notFound();

  const userThreads = getDiscussionsByUser(user.id);
  const userComments = getCommentsByUser(user.id);

  const initials = user.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { name: "Community", url: "/community" },
          { name: user.displayName, url: `/community/user/${username}` },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-8">
        {/* Left column — profile */}
        <aside>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
            {/* Avatar + name */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-brand-100 text-brand-600 font-bold text-2xl flex items-center justify-center mx-auto mb-4 ring-4 ring-brand-50">
                {initials}
              </div>
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">
                  {user.displayName}
                </h1>
                <UserProBadge userId={user.id} size="md" />
              </div>
              <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full mt-2 ${TRUST_LEVEL_COLORS[user.trustLevel]}`}>
                {TRUST_LEVEL_LABELS[user.trustLevel]}
              </span>
            </div>

            {/* Bio */}
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {user.bio}
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[
                { value: user.reputationScore, label: "Reputation", color: "text-brand-600" },
                { value: user.reviewCount, label: "Reviews", color: "text-emerald-600" },
                { value: user.commentCount, label: "Comments", color: "text-gray-700" },
                { value: user.threadCount, label: "Discussions", color: "text-purple-600" },
                { value: user.verifiedProductCount, label: "Verified", color: "text-amber-600" },
                { value: user.helpfulVotesReceived, label: "Helpful Votes", color: "text-gray-700" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className={`text-lg font-bold ${stat.color}`}>
                    {formatNumber(stat.value)}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="border-t border-gray-100 pt-4 mb-4">
              <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-semibold">
                Badges
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {user.badges.map((badge) => (
                  <TrustBadge key={badge} badge={badge} size="md" />
                ))}
              </div>
            </div>

            {/* Expertise */}
            {user.expertiseCategories.length > 0 && (
              <div className="border-t border-gray-100 pt-4 mb-4">
                <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-semibold">
                  Expertise
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {user.expertiseCategories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/category/${cat}`}
                      className="text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full hover:bg-brand-100 transition-colors"
                    >
                      {cat.replace(/-/g, " ")}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="border-t border-gray-100 pt-4 text-xs text-gray-400 space-y-1">
              <p>Joined {user.joinedAt}</p>
              <p>Last active {user.lastActiveAt}</p>
            </div>
          </div>
        </aside>

        {/* Right column — activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Discussions */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Discussions ({userThreads.length})
            </h2>
            {userThreads.length > 0 ? (
              <div className="space-y-3">
                {userThreads.map((thread) => (
                  <ThreadCard key={thread.id} thread={thread} showProduct />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-6 bg-white border border-gray-100 rounded-2xl">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">No discussions started yet</p>
                <p className="text-xs text-gray-400">Discussions this user starts will appear here.</p>
              </div>
            )}
          </section>

          {/* Recent comments */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Comments ({userComments.length})
            </h2>
            {userComments.length > 0 ? (
              <div className="space-y-3">
                {userComments.slice(0, 5).map((comment) => (
                  <div
                    key={comment.id}
                    className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        href={`/community/thread/${comment.threadId}`}
                        className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
                      >
                        View thread
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </Link>
                      <time dateTime={comment.createdAt} className="text-xs text-gray-400">{new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(comment.createdAt))}</time>
                      {comment.isTopAnswer && (
                        <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full">
                          Top Answer
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                      {comment.body.replace(/\*\*/g, "").slice(0, 200)}
                      {comment.body.length > 200 && "..."}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                        <span className="tabular-nums">{comment.upvotes}</span>
                      </span>
                      <span>{comment.helpfulCount} helpful</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-6 bg-white border border-gray-100 rounded-2xl">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">No comments yet</p>
                <p className="text-xs text-gray-400">Comments this user leaves on threads will appear here.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
