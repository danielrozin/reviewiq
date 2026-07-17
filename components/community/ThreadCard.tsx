import Link from "next/link";
import type { DiscussionThread } from "@/types";
import { THREAD_TYPE_LABELS, THREAD_TYPE_COLORS } from "@/types";
import { getUserById } from "@/data/users";
import { UserChip } from "./UserChip";
import { formatNumber } from "@/lib/utils";

interface ThreadCardProps {
  thread: DiscussionThread;
  showProduct?: boolean;
  compact?: boolean;
}

export function ThreadCard({ thread, showProduct = true, compact = false }: ThreadCardProps) {
  const author = getUserById(thread.authorId);
  const netVotes = thread.upvotes - thread.downvotes;

  if (compact) {
    return (
      <Link
        href={`/community/thread/${thread.id}`}
        aria-label={`${thread.title}${thread.isResolved ? " (Resolved)" : ""} — ${formatNumber(netVotes)} ${netVotes === 1 ? "vote" : "votes"}, ${thread.commentCount} ${thread.commentCount === 1 ? "reply" : "replies"}`}
        className="flex items-center gap-3 py-3 px-4 bg-white border border-gray-100 rounded-xl hover:border-brand-200 hover:shadow-sm motion-safe:transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
      >
        <div className="flex flex-col items-center min-w-[40px]" aria-hidden="true">
          <span className={`text-sm font-semibold ${netVotes > 0 ? "text-brand-600" : "text-gray-600"}`}>
            {formatNumber(netVotes)}
          </span>
          <span className="text-xs text-gray-600">votes</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${THREAD_TYPE_COLORS[thread.threadType]}`}>
              {THREAD_TYPE_LABELS[thread.threadType]}
            </span>
            {thread.isResolved && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                Resolved
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors truncate block">
            {thread.title}
          </span>
        </div>
        <div className="text-xs text-gray-600 shrink-0">
          {thread.commentCount} replies
        </div>
      </Link>
    );
  }

  return (
    <article aria-labelledby={`thread-${thread.id}-title`} className="border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm motion-safe:hover:-translate-y-0.5 motion-safe:transition-all duration-200 overflow-hidden group">
      <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="flex gap-4 p-5">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
          <svg aria-hidden="true" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
          <span
            aria-label={`${formatNumber(netVotes)} net votes`}
            className={`text-sm font-bold tabular-nums leading-none ${netVotes > 0 ? "text-brand-600" : "text-gray-600"}`}
          >
            {formatNumber(netVotes)}
          </span>
          <svg aria-hidden="true" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Thread type + status tags */}
          <ul role="list" aria-label="Thread labels" className="flex flex-wrap items-center gap-2 mb-2 list-none p-0 m-0">
            <li>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${THREAD_TYPE_COLORS[thread.threadType]}`}>
                {THREAD_TYPE_LABELS[thread.threadType]}
              </span>
            </li>
            {thread.isPinned && (
              <li>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Pinned
                </span>
              </li>
            )}
            {thread.isResolved && (
              <li>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Resolved
                </span>
              </li>
            )}
          </ul>

          {/* Title */}
          <Link
            href={`/community/thread/${thread.id}`}
            aria-label={`Read thread: ${thread.title}`}
            className="block mb-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 rounded-lg"
          >
            <h3 id={`thread-${thread.id}-title`} className="text-base font-semibold text-gray-900 group-hover:text-brand-600 transition-colors leading-snug">
              {thread.title}
            </h3>
          </Link>

          {/* Preview */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
            {thread.body.replace(/\*\*/g, "").replace(/\n/g, " ").slice(0, 200)}
            {thread.body.length > 200 && "..."}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {author && <UserChip user={author} showTrustLevel size="sm" />}
            <time dateTime={thread.createdAt} className="text-xs text-gray-600">
              {new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(thread.createdAt))}
            </time>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
                {thread.commentCount} replies
              </span>
              <span className="flex items-center gap-1">
                <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                {formatNumber(thread.viewCount)} views
              </span>
            </div>
            {showProduct && thread.productSlug && (
              <Link
                href={`/category/${thread.categorySlug}/${thread.productSlug}`}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 rounded"
              >
                {thread.productSlug?.replace(/-/g, " ")}
              </Link>
            )}
          </div>

          {/* Tags */}
          {thread.tags.length > 0 && (
            <ul role="list" aria-label="Tags" className="flex flex-wrap gap-1.5 mt-3">
              {thread.tags.slice(0, 4).map((tag) => (
                <li
                  key={tag}
                  className="text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
