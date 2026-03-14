"use client";

import { cn, getScoreColor, getScoreLabel, getScoreBgColor } from "@/lib/utils";

interface SmartScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function SmartScore({ score, size = "md", showLabel = true }: SmartScoreProps) {
  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-14 h-14 text-lg",
    lg: "w-20 h-20 text-2xl",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "rounded-xl font-bold text-white flex items-center justify-center",
          getScoreBgColor(score),
          sizeClasses[size]
        )}
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
