import Link from "next/link";
import type { DiscussionThread } from "@/types";
import { THREAD_TYPE_LABELS, THREAD_TYPE_COLORS } from "@/types";
import { getUserById } from "@/data/users";
import { UserChip } from "./UserChip";
import { formatNumber } from "@/lib/utils";

interface ProductDiscussionsProps {
  threads: DiscussionThread[];
  productName: string;
}

export function ProductDiscussions({ threads, productName }: ProductDiscussionsProps) {
  if (threads.length === 0) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Community Discussion</h2>
        </div>
        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm mb-3">
            No discussions yet for {productName}
          </p>
          <Link
            href="/community"
            className="inline-flex items-center px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            Start a Discussion
          </Link>
        </div>
      </section>
    );
  }

  // Separate pinned and regular
  const pinned = threads.filter((t) => t.isPinned);
  const regular = threads.filter((t) => !t.isPinned).slice(0, 4);
  const allShown = [...pinned, ...regular];

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Community Discussion
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {threads.length} threads about {productName}
          </p>
        </div>
        <Link
          href="/community"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="space-y-3">
        {allShown.map((thread) => {
          const author = getUserById(thread.authorId);
          const netVotes = thread.upvotes - thread.downvotes;

          return (
            <Link
              key={thread.id}
              href={`/community/thread/${thread.id}`}
              className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all group"
            >
              {/* Vote count */}
              <div className="flex flex-col items-center shrink-0 min-w-[40px]">
                <span className={`text-sm font-bold ${netVotes > 0 ? "text-brand-600" : "text-gray-400"}`}>
                  {formatNumber(netVotes)}
                </span>
                <span className="text-[10px] text-gray-400">votes</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${THREAD_TYPE_COLORS[thread.threadType]}`}>
                    {THREAD_TYPE_LABELS[thread.threadType]}
                  </span>
                  {thread.isPinned && (
                    <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                      Pinned
                    </span>
                  )}
                  {thread.isResolved && (
                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      Resolved
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors mb-1.5 line-clamp-1">
                  {thread.title}
                </h3>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                  {author && (
                    <span className="font-medium text-gray-500">{author.displayName}</span>
                  )}
                  <span>{thread.commentCount} replies</span>
                  <span>{formatNumber(thread.viewCount)} views</span>
                  <span>{thread.lastActivityAt}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Start discussion CTA */}
      <div className="mt-4 pt-4 border-t border-gray-50 text-center">
        <Link
          href="/community"
          className="inline-flex items-center px-5 py-2 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
        >
          Start a Discussion about {productName}
        </Link>
      </div>
    </section>
  );
}
