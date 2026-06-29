"use client";


interface ProBadgeProps {
  size?: "sm" | "md";
}

export function ProBadge({ size = "sm" }: ProBadgeProps) {
  const sizeClasses = size === "sm"
    ? "px-1.5 py-0.5 text-xs gap-0.5"
    : "px-2 py-1 text-xs gap-1";

  const iconSize = size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3";

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200 ${sizeClasses}`}
    >
      <svg aria-hidden="true" className={iconSize} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
      PRO
    </span>
  );
}
