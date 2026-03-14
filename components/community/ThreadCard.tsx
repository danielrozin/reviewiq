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
        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors group"
      >
        <div className="flex flex-col items-center min-w-[40px]">
          <span className={`text-sm font-semibold ${netVotes > 0 ? "text-brand-600" : "text-gray-400"}`}>
            {formatNumber(netVotes)}
          </span>
          <span className="text-[10px] text-gray-400">votes</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${THREAD_TYPE_COLORS[thread.threadType]}`}>
              {THREAD_TYPE_LABELS[thread.threadType]}
            </span>
            {thread.isResolved && (
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                Resolved
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors truncate">
            {thread.title}
          </h3>
        </div>
        <div className="text-xs text-gray-400 shrink-0">
          {thread.commentCount} replies
        </div>
      </Link>
    );
  }

  return (
    <div className="border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all">
      <div className="flex gap-4 p-5">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
          <div className="flex flex-col items-center">
            <span className="text-gray-300 text-sm">▲</span>
            <span className={`text-sm font-bold ${netVotes > 0 ? "text-brand-600" : "text-gray-400"}`}>
              {formatNumber(netVotes)}
            </span>
            <span className="text-gray-300 text-sm">▼</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Thread type + tags */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${THREAD_TYPE_COLORS[thread.threadType]}`}>
              {THREAD_TYPE_LABELS[thread.threadType]}
            </span>
            {thread.isPinned && (
              <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Pinned
              </span>
            )}
            {thread.isResolved && (
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Resolved
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            href={`/community/thread/${thread.id}`}
            className="block mb-2 group"
          >
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-brand-600 transition-colors leading-snug">
              {thread.title}
            </h3>
          </Link>

          {/* Preview */}
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {thread.body.replace(/\*\*/g, "").replace(/\n/g, " ").slice(0, 200)}
            {thread.body.length > 200 && "..."}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {author && <UserChip user={author} showTrustLevel size="sm" />}
            <span className="text-xs text-gray-400">{thread.createdAt}</span>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span>💬</span> {thread.commentCount} replies
              </span>
              <span className="flex items-center gap-1">
                <span>👁</span> {formatNumber(thread.viewCount)} views
              </span>
            </div>
            {showProduct && thread.productSlug && (
              <Link
                href={`/category/${thread.categorySlug}/${thread.productSlug}`}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                {thread.productSlug?.replace(/-/g, " ")}
              </Link>
            )}
          </div>

          {/* Tags */}
          {thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {thread.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
