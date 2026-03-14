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
    title: `${user.displayName} — SmartReview Community`,
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
          <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
            {/* Avatar + name */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-brand-100 text-brand-600 font-bold text-2xl flex items-center justify-center mx-auto mb-4">
                {initials}
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {user.displayName}
              </h1>
              <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full mt-2 ${TRUST_LEVEL_COLORS[user.trustLevel]}`}>
                {TRUST_LEVEL_LABELS[user.trustLevel]}
              </span>
            </div>

            {/* Bio */}
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {user.bio}
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { value: user.reputationScore, label: "Reputation" },
                { value: user.reviewCount, label: "Reviews" },
                { value: user.commentCount, label: "Comments" },
                { value: user.threadCount, label: "Discussions" },
                { value: user.verifiedProductCount, label: "Verified Products" },
                { value: user.helpfulVotesReceived, label: "Helpful Votes" },
              ].map((stat) => (
                <div key={stat.label} className="text-center py-2">
                  <p className="text-lg font-bold text-gray-900">
                    {formatNumber(stat.value)}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="border-t border-gray-200 pt-4 mb-4">
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
              <div className="border-t border-gray-200 pt-4 mb-4">
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
            <div className="border-t border-gray-200 pt-4 text-xs text-gray-400 space-y-1">
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
              <p className="text-sm text-gray-400 py-8 text-center">
                No discussions yet
              </p>
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
                        className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                      >
                        View thread →
                      </Link>
                      <span className="text-xs text-gray-400">{comment.createdAt}</span>
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
                      <span>▲ {comment.upvotes}</span>
                      <span>{comment.helpfulCount} helpful</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-8 text-center">
                No comments yet
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
