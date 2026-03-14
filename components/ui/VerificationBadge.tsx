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

  const dotColor =
    confidence >= 85
      ? "bg-emerald-500"
      : confidence >= 40
        ? "bg-amber-500"
        : "bg-gray-400";

  if (compact) {
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", colorClass)}>
        <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
        {confidence >= 85 ? "Verified" : confidence >= 40 ? "Declared" : "Unverified"}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", colorClass)}>
      <span className={cn("w-2 h-2 rounded-full", dotColor)} />
      {label}
    </span>
  );
}
