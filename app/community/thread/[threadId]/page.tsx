import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CommentThread } from "@/components/community/CommentThread";
import { VoteControls } from "@/components/community/VoteControls";
import { UserChip } from "@/components/community/UserChip";
import { TrustBadge } from "@/components/community/TrustBadge";
import { ThreadCard } from "@/components/community/ThreadCard";
import { ReplySortButtons } from "@/components/community/ReplySortButtons";
import { ReplyComposer } from "./ReplyComposer";
import {
  discussions,
  getDiscussionById,
  getCommentsByThread,
  getDiscussionsByCategory,
} from "@/data/discussions";
import { getUserById } from "@/data/users";
import { THREAD_TYPE_LABELS, THREAD_TYPE_COLORS } from "@/types";
import { buildMetadata } from "@/lib/seo/metadata";
import { discussionForumPostingSchema, threadPageSpeakableSchema, breadcrumbSchema } from "@/lib/schema/jsonld";
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
    title: `${thread.title} — ReviewIQ Community`,
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
          { name: thread.title, url: `/community/thread/${threadId}` },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(discussionForumPostingSchema(thread, author?.displayName ?? "Anonymous", author?.username)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(threadPageSpeakableSchema(thread.title, `/community/thread/${threadId}`, thread.createdAt, thread.lastActivityAt)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: "Community", url: "/community" },
        { name: thread.title, url: `/community/thread/${threadId}` },
      ])) }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Thread header */}
          <article aria-labelledby="thread-title">
            <div className="flex gap-4">
              {/* Vote column */}
              <div className="shrink-0 pt-2">
                <VoteControls
                  itemId={thread.id}
                  itemType="thread"
                  upvotes={thread.upvotes}
                  downvotes={thread.downvotes}
                  layout="vertical"
                  size="md"
                  ariaContext={thread.title}
                />
              </div>

              <div className="flex-1 min-w-0">
                {/* Type + status badges */}
                <ul role="list" aria-label="Thread labels" className="flex flex-wrap items-center gap-2 mb-3 list-none p-0 m-0">
                  <li>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${THREAD_TYPE_COLORS[thread.threadType]}`}>
                      {THREAD_TYPE_LABELS[thread.threadType]}
                    </span>
                  </li>
                  {thread.isPinned && (
                    <li>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636M15.75 6A3.75 3.75 0 1 1 8.25 6a3.75 3.75 0 0 1 7.5 0Z" />
                        </svg>
                        Pinned
                      </span>
                    </li>
                  )}
                  {thread.isResolved && (
                    <li>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Resolved
                      </span>
                    </li>
                  )}
                </ul>

                {/* Title */}
                <h1 id="thread-title" data-speakable="thread-title" className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
                  {thread.title}
                </h1>

                {/* Author info */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {author && (
                    <UserChip user={author} showTrustLevel size="md" />
                  )}
                  <time dateTime={thread.createdAt} className="text-sm text-gray-600">
                    {new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(thread.createdAt))}
                  </time>
                  <span className="text-sm text-gray-600">
                    {formatNumber(thread.viewCount)} views
                  </span>
                </div>

                {/* Body */}
                <div data-speakable="thread-body" className="prose prose-sm max-w-none text-gray-700 leading-relaxed mb-6">
                  {thread.body.split("\n").map((line, i) => {
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return (
                        <h2 key={i} className="text-base font-semibold text-gray-900 mt-4 mb-1">
                          {line.replace(/\*\*/g, "")}
                        </h2>
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
                <ul role="list" aria-label="Tags" className="flex flex-wrap gap-1.5 mb-6">
                  {thread.tags.map((tag) => (
                    <li
                      key={tag}
                      className="text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>

                {/* Product link */}
                {thread.productSlug && thread.categorySlug && (
                  <Link
                    href={`/category/${thread.categorySlug}/${thread.productSlug}`}
                    className="group flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4 mb-6 hover:border-brand-200 hover:shadow-sm motion-safe:transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
                  >
                    <div aria-hidden="true" className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                      <svg aria-hidden="true" className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-0.5">Related Product</p>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors capitalize truncate">
                        {thread.productSlug.replace(/-/g, " ")}
                      </p>
                    </div>
                    <svg aria-hidden="true" className="w-4 h-4 text-gray-400 group-hover:text-brand-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                )}

                {/* Actions bar */}
                <div className="flex items-center gap-4 py-4 border-t border-b border-gray-100 mb-8">
                  <button type="button" aria-label="Share this thread" className="inline-flex items-center gap-1.5 min-h-[44px] px-3 text-sm text-gray-600 hover:text-gray-700 transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 rounded">
                    <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                    </svg>
                    Share
                  </button>
                  <button type="button" aria-label="Save this thread" className="inline-flex items-center gap-1.5 min-h-[44px] px-3 text-sm text-gray-600 hover:text-gray-700 transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 rounded">
                    <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                    Save
                  </button>
                  <button type="button" aria-label="Report this thread" className="inline-flex items-center gap-1.5 min-h-[44px] px-3 text-sm text-gray-600 hover:text-gray-700 transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 rounded">
                    <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2.25a2.25 2.25 0 0 1 2.25 2.25v.094a2.25 2.25 0 0 0 2.25 2.25h9.372c1.399 0 2.361-1.37 1.866-2.682L19.5 3M3 3v18m0-18 1.5 13.5M21 3l-1.5 7.5M3 21h18" />
                    </svg>
                    Report
                  </button>
                  <button type="button" aria-label="Follow this thread" className="inline-flex items-center gap-1.5 min-h-[44px] px-3 text-sm text-gray-600 hover:text-gray-700 transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 rounded">
                    <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                    </svg>
                    Follow
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Comments section */}
          <section aria-labelledby="thread-replies-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 id="thread-replies-heading" className="text-lg font-semibold text-gray-900">
                {thread.commentCount} Replies
              </h2>
              <ReplySortButtons />
            </div>

            {/* Comment composer */}
            <ReplyComposer />

            {/* Comments */}
            <CommentThread comments={threadComments} />
          </section>
        </div>

        {/* Sidebar */}
        <aside aria-labelledby="thread-sidebar-heading" className="space-y-8">
          {/* Thread stats */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
            <h2 id="thread-sidebar-heading" className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider text-gray-600">
              Thread Info
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Views", value: formatNumber(thread.viewCount), icon: (
                  <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                ), color: "text-gray-500" },
                { label: "Replies", value: String(thread.commentCount), icon: (
                  <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>
                ), color: "text-brand-400" },
                { label: "Upvotes", value: String(thread.upvotes), icon: (
                  <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                ), color: "text-emerald-600" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-2.5 bg-gray-50 rounded-xl">
                  <div aria-hidden="true" className={`flex items-center justify-center mb-1 ${stat.color}`}>{stat.icon}</div>
                  <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
            <dl className="space-y-2 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <dt className="text-gray-600">Created</dt>
                <dd>
                  <time dateTime={thread.createdAt} className="font-medium text-gray-700 text-xs">
                    {new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(thread.createdAt))}
                  </time>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Last activity</dt>
                <dd>
                  <time dateTime={thread.lastActivityAt} className="font-medium text-gray-700 text-xs">
                    {new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(thread.lastActivityAt))}
                  </time>
                </dd>
              </div>
            </dl>

            {/* Author card */}
            {author && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-3 font-medium">
                  Posted by
                </p>
                <UserChip user={author} showTrustLevel showReputation size="md" />
                <p className="text-xs text-gray-600 mt-2 ml-10 leading-relaxed">
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
              <div className="flex items-center gap-2 mb-3">
                <div aria-hidden="true" className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                  <svg aria-hidden="true" className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  </svg>
                </div>
                <h2 className="font-semibold text-gray-900">Related Discussions</h2>
              </div>
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
