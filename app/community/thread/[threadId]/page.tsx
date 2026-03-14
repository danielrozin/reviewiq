import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CommentThread } from "@/components/community/CommentThread";
import { VoteControls } from "@/components/community/VoteControls";
import { UserChip } from "@/components/community/UserChip";
import { TrustBadge } from "@/components/community/TrustBadge";
import { ThreadCard } from "@/components/community/ThreadCard";
import {
  discussions,
  getDiscussionById,
  getCommentsByThread,
  getDiscussionsByCategory,
} from "@/data/discussions";
import { getUserById } from "@/data/users";
import { THREAD_TYPE_LABELS, THREAD_TYPE_COLORS } from "@/types";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatNumber } from "@/lib/utils";

interface Props {
  params: Promise<{ threadId: string }>;
}

export async function generateStaticParams() {
  return discussions.map((d) => ({ threadId: d.id }));
}

export async function generateMetadata({ params }: Props) {
  const { threadId } = await params;
  const thread = getDiscussionById(threadId);
  if (!thread) return {};

  return buildMetadata({
    title: `${thread.title} — SmartReview Community`,
    description: thread.body.slice(0, 160),
    path: `/community/thread/${threadId}`,
  });
}

export default async function ThreadPage({ params }: Props) {
  const { threadId } = await params;
  const thread = getDiscussionById(threadId);

  if (!thread) notFound();

  const author = getUserById(thread.authorId);
  const threadComments = getCommentsByThread(thread.id);

  // Related threads from same category
  const related = getDiscussionsByCategory(thread.categorySlug || "")
    .filter((d) => d.id !== thread.id)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { name: "Community", url: "/community" },
          { name: thread.title.slice(0, 40) + (thread.title.length > 40 ? "..." : ""), url: `/community/thread/${threadId}` },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Thread header */}
          <article>
            <div className="flex gap-4">
              {/* Vote column */}
              <div className="shrink-0 pt-2">
                <VoteControls
                  upvotes={thread.upvotes}
                  downvotes={thread.downvotes}
                  layout="vertical"
                  size="md"
                />
              </div>

              <div className="flex-1 min-w-0">
                {/* Type + status badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${THREAD_TYPE_COLORS[thread.threadType]}`}>
                    {THREAD_TYPE_LABELS[thread.threadType]}
                  </span>
                  {thread.isPinned && (
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      Pinned
                    </span>
                  )}
                  {thread.isResolved && (
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Resolved
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
                  {thread.title}
                </h1>

                {/* Author info */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {author && (
                    <UserChip user={author} showTrustLevel size="md" />
                  )}
                  <span className="text-sm text-gray-400">
                    {thread.createdAt}
                  </span>
                  <span className="text-sm text-gray-400">
                    {formatNumber(thread.viewCount)} views
                  </span>
                </div>

                {/* Body */}
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed mb-6">
                  {thread.body.split("\n").map((line, i) => {
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return (
                        <h3 key={i} className="text-base font-semibold text-gray-900 mt-4 mb-1">
                          {line.replace(/\*\*/g, "")}
                        </h3>
                      );
                    }
                    if (line.startsWith("**")) {
                      const parts = line.split(/\*\*(.*?)\*\*/g);
                      return (
                        <p key={i} className="mb-1">
                          {parts.map((part, j) =>
                            j % 2 === 1 ? (
                              <strong key={j} className="font-semibold text-gray-900">{part}</strong>
                            ) : (
                              <span key={j}>{part}</span>
                            )
                          )}
                        </p>
                      );
                    }
                    if (line.match(/^\d+\./)) {
                      const parts = line.split(/\*\*(.*?)\*\*/g);
                      return (
                        <p key={i} className="mb-1 pl-2">
                          {parts.map((part, j) =>
                            j % 2 === 1 ? (
                              <strong key={j} className="font-semibold text-gray-900">{part}</strong>
                            ) : (
                              <span key={j}>{part}</span>
                            )
                          )}
                        </p>
                      );
                    }
                    if (line === "") return <br key={i} />;
                    return <p key={i} className="mb-2">{line}</p>;
                  })}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {thread.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Product link */}
                {thread.productSlug && thread.categorySlug && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">
                      Related Product
                    </p>
                    <Link
                      href={`/category/${thread.categorySlug}/${thread.productSlug}`}
                      className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      View {thread.productSlug.replace(/-/g, " ")} →
                    </Link>
                  </div>
                )}

                {/* Actions bar */}
                <div className="flex items-center gap-4 py-4 border-t border-b border-gray-100 mb-8">
                  <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium">
                    Share
                  </button>
                  <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium">
                    Save
                  </button>
                  <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium">
                    Report
                  </button>
                  <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium">
                    Follow
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Comments section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {thread.commentCount} Replies
              </h2>
              <div className="flex items-center gap-1">
                {["Top", "Recent", "Verified"].map((tab, i) => (
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

            {/* Comment composer */}
            <div className="border border-gray-200 rounded-xl p-4 mb-6">
              <textarea
                placeholder="Share your experience or answer this question..."
                className="w-full text-sm text-gray-700 placeholder-gray-400 resize-none border-0 focus:ring-0 focus:outline-none min-h-[80px]"
                rows={3}
              />
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Be helpful, specific, and respectful
                </p>
                <button className="px-4 py-1.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors">
                  Reply
                </button>
              </div>
            </div>

            {/* Comments */}
            <CommentThread comments={threadComments} />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          {/* Thread stats */}
          <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">
              Thread Info
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Views</span>
                <span className="font-medium text-gray-900">{formatNumber(thread.viewCount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Replies</span>
                <span className="font-medium text-gray-900">{thread.commentCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Upvotes</span>
                <span className="font-medium text-brand-600">{thread.upvotes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created</span>
                <span className="font-medium text-gray-900">{thread.createdAt}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Activity</span>
                <span className="font-medium text-gray-900">{thread.lastActivityAt}</span>
              </div>
            </div>

            {/* Author card */}
            {author && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">
                  Posted by
                </p>
                <UserChip user={author} showTrustLevel showReputation size="md" />
                <p className="text-xs text-gray-500 mt-2 ml-10 leading-relaxed">
                  {author.bio.slice(0, 100)}...
                </p>
                <div className="flex flex-wrap gap-1 mt-2 ml-10">
                  {author.badges.slice(0, 3).map((badge) => (
                    <TrustBadge key={badge} badge={badge} size="sm" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Related threads */}
          {related.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Related Discussions
              </h3>
              <div className="space-y-1">
                {related.map((t) => (
                  <ThreadCard key={t.id} thread={t} compact />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
