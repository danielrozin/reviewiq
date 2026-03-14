import type { UserBadge } from "@/types";
import { BADGE_LABELS } from "@/types";

interface TrustBadgeProps {
  badge: UserBadge;
  size?: "sm" | "md";
}

const BADGE_STYLE: Record<UserBadge, string> = {
  verified_owner: "text-emerald-700 bg-emerald-50 border-emerald-200",
  top_contributor: "text-amber-700 bg-amber-50 border-amber-200",
  category_expert: "text-purple-700 bg-purple-50 border-purple-200",
  long_term_owner: "text-blue-700 bg-blue-50 border-blue-200",
  helpful_reviewer: "text-teal-700 bg-teal-50 border-teal-200",
  early_adopter: "text-orange-700 bg-orange-50 border-orange-200",
  detail_oriented: "text-indigo-700 bg-indigo-50 border-indigo-200",
};

const BADGE_ICON: Record<UserBadge, string> = {
  verified_owner: "✓",
  top_contributor: "★",
  category_expert: "◆",
  long_term_owner: "◷",
  helpful_reviewer: "♡",
  early_adopter: "⚡",
  detail_oriented: "◎",
};

export function TrustBadge({ badge, size = "sm" }: TrustBadgeProps) {
  const sizeClasses = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${BADGE_STYLE[badge]} ${sizeClasses}`}
    >
      <span>{BADGE_ICON[badge]}</span>
      {BADGE_LABELS[badge]}
    </span>
  );
}
