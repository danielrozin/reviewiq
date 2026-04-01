"use client";

import type { DashboardStats } from "@/types";
import { TRUST_LEVEL_LABELS, TRUST_LEVEL_COLORS } from "@/types";
import { formatNumber } from "@/lib/utils";

interface StatsOverviewProps {
  stats: DashboardStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statItems = [
    { value: stats.reviewCount, label: "Reviews Written", icon: "✎" },
    { value: stats.savedCount, label: "Saved Products", icon: "◆" },
    { value: stats.watchlistCount, label: "Watching", icon: "◉" },
    { value: stats.helpfulVotesReceived, label: "Helpful Votes", icon: "▲" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-brand-200 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">{stat.icon}</span>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TRUST_LEVEL_COLORS[stats.trustLevel]}`}
            >
              {TRUST_LEVEL_LABELS[stats.trustLevel]}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatNumber(stat.value)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
