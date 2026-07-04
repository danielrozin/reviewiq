import Link from "next/link";
import type { UserProfile } from "@/types";
import { TRUST_LEVEL_LABELS, TRUST_LEVEL_COLORS } from "@/types";

interface UserChipProps {
  user: UserProfile;
  showTrustLevel?: boolean;
  showReputation?: boolean;
  size?: "sm" | "md";
}

export function UserChip({ user, showTrustLevel = true, showReputation = false, size = "sm" }: UserChipProps) {
  const initials = user.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const avatarSize = size === "sm" ? "w-6 h-6 text-xs" : "w-8 h-8 text-xs";

  return (
    <Link
      href={`/community/user/${user.username}`}
      aria-label={`View ${user.displayName}'s profile`}
      className="inline-flex items-center gap-1.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded-full"
    >
      <div
        className={`${avatarSize} rounded-full bg-brand-100 text-brand-600 font-semibold flex items-center justify-center shrink-0`}
      >
        {initials}
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-brand-600 transition-colors">
        {user.displayName}
      </span>
      {showTrustLevel && user.trustLevel !== "newcomer" && (
        <span
          className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${TRUST_LEVEL_COLORS[user.trustLevel]}`}
        >
          {TRUST_LEVEL_LABELS[user.trustLevel]}
        </span>
      )}
      {showReputation && (
        <span className="text-xs text-gray-600">{user.reputationScore} rep</span>
      )}
    </Link>
  );
}
