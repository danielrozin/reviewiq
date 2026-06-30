import type React from "react";
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

const BADGE_ICON: Record<UserBadge, React.ReactElement> = {
  verified_owner: (
    <svg aria-hidden="true" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  top_contributor: (
    <svg aria-hidden="true" className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  ),
  category_expert: (
    <svg aria-hidden="true" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
  ),
  long_term_owner: (
    <svg aria-hidden="true" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  helpful_reviewer: (
    <svg aria-hidden="true" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  ),
  early_adopter: (
    <svg aria-hidden="true" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  ),
  detail_oriented: (
    <svg aria-hidden="true" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  ),
};

export function TrustBadge({ badge, size = "sm" }: TrustBadgeProps) {
  const sizeClasses = size === "sm" ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-1";

  return (
    <span
      role="img"
      aria-label={`Badge: ${BADGE_LABELS[badge]}`}
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${BADGE_STYLE[badge]} ${sizeClasses}`}
    >
      {BADGE_ICON[badge]}
      <span aria-hidden="true">{BADGE_LABELS[badge]}</span>
    </span>
  );
}
