import { cn } from "@/lib/utils";
import { VERIFICATION_LABELS, VERIFICATION_CONFIDENCE, type VerificationTier } from "@/types";

interface VerificationBadgeProps {
  tier: VerificationTier;
  compact?: boolean;
}

export function VerificationBadge({ tier, compact = false }: VerificationBadgeProps) {
  const confidence = VERIFICATION_CONFIDENCE[tier];
  const label = VERIFICATION_LABELS[tier];

  const colorClass =
    confidence >= 85
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : confidence >= 40
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-gray-50 text-gray-500 border-gray-200";

  const tierIcon =
    confidence >= 85 ? (
      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ) : confidence >= 40 ? (
      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
    ) : (
      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    );

  if (compact) {
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", colorClass)}>
        {tierIcon}
        {confidence >= 85 ? "Verified" : confidence >= 40 ? "Declared" : "Unverified"}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", colorClass)}>
      {tierIcon}
      {label}
    </span>
  );
}
