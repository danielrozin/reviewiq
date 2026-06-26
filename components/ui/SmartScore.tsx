"use client";

import { cn, getScoreColor, getScoreLabel, getScoreBgColor } from "@/lib/utils";

interface SmartScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showRing?: boolean;
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return "#10b981"; // emerald
  if (score >= 60) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

export function SmartScore({ score, size = "md", showLabel = true, showRing = false }: SmartScoreProps) {
  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-14 h-14 text-lg",
    lg: "w-20 h-20 text-2xl",
  };

  const ringSize = {
    sm: 44,
    md: 60,
    lg: 88,
  };

  if (showRing) {
    const r = size === "lg" ? 38 : size === "md" ? 24 : 18;
    const cx = ringSize[size] / 2;
    const circumference = 2 * Math.PI * r;
    const filled = (score / 100) * circumference;
    const color = getScoreRingColor(score);

    return (
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center" style={{ width: ringSize[size], height: ringSize[size] }}>
          <svg
            width={ringSize[size]}
            height={ringSize[size]}
            className="-rotate-90 absolute inset-0"
            aria-hidden="true"
          >
            <circle
              cx={cx}
              cy={cx}
              r={r}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={size === "lg" ? 5 : 4}
            />
            <circle
              cx={cx}
              cy={cx}
              r={r}
              fill="none"
              stroke={color}
              strokeWidth={size === "lg" ? 5 : 4}
              strokeDasharray={`${filled} ${circumference}`}
              strokeLinecap="round"
            />
          </svg>
          <span
            className={cn("relative z-10 font-bold", {
              "text-xs": size === "sm",
              "text-base": size === "md",
              "text-xl": size === "lg",
            })}
            style={{ color }}
          >
            {score}
          </span>
        </div>
        {showLabel && (
          <div className="flex flex-col">
            <span className={cn("font-semibold text-sm", getScoreColor(score))}>
              {getScoreLabel(score)}
            </span>
            <span className="text-xs text-gray-400">SmartScore</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "rounded-xl font-bold text-white flex items-center justify-center shrink-0",
          getScoreBgColor(score),
          sizeClasses[size]
        )}
        aria-label={`SmartScore: ${score} — ${getScoreLabel(score)}`}
        role="img"
      >
        {score}
      </div>
      {showLabel && (
        <div className="flex flex-col">
          <span className={cn("font-semibold text-sm", getScoreColor(score))}>
            {getScoreLabel(score)}
          </span>
          <span className="text-xs text-gray-400">SmartScore</span>
        </div>
      )}
    </div>
  );
}
