"use client";

import type { DashboardStats } from "@/types";
import { TRUST_LEVEL_LABELS, TRUST_LEVEL_COLORS } from "@/types";
import type { TrustLevel } from "@/types";
import { formatNumber } from "@/lib/utils";

interface StatsOverviewProps {
  stats: DashboardStats;
}

const TRUST_LEVEL_ORDER: TrustLevel[] = ["newcomer", "contributor", "trusted", "expert", "moderator"];

const TRUST_LEVEL_THRESHOLDS: Record<TrustLevel, number> = {
  newcomer: 0,
  contributor: 50,
  trusted: 150,
  expert: 400,
  moderator: 1000,
};

const TRUST_LEVEL_ICONS: Record<TrustLevel, string> = {
  newcomer: "🌱",
  contributor: "⭐",
  trusted: "🏅",
  expert: "💎",
  moderator: "🛡️",
};

const STAT_ICONS = [
  (
    <svg key="review" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
    </svg>
  ),
  (
    <svg key="saved" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
    </svg>
  ),
  (
    <svg key="watch" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  (
    <svg key="votes" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
    </svg>
  ),
];

const STAT_COLORS = [
  { icon: "bg-brand-50 text-brand-600", border: "hover:border-brand-200" },
  { icon: "bg-amber-50 text-amber-600", border: "hover:border-amber-200" },
  { icon: "bg-purple-50 text-purple-600", border: "hover:border-purple-200" },
  { icon: "bg-emerald-50 text-emerald-600", border: "hover:border-emerald-200" },
];

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statItems = [
    { value: stats.reviewCount, label: "Reviews Written" },
    { value: stats.savedCount, label: "Saved Products" },
    { value: stats.watchlistCount, label: "Watching" },
    { value: stats.helpfulVotesReceived, label: "Helpful Votes" },
  ];

  // Reputation progress toward next level
  const currentIndex = TRUST_LEVEL_ORDER.indexOf(stats.trustLevel);
  const nextLevel = TRUST_LEVEL_ORDER[currentIndex + 1] as TrustLevel | undefined;
  const currentThreshold = TRUST_LEVEL_THRESHOLDS[stats.trustLevel];
  const nextThreshold = nextLevel ? TRUST_LEVEL_THRESHOLDS[nextLevel] : null;
  const progressPct = nextThreshold
    ? Math.min(100, Math.round(((stats.reputationScore - currentThreshold) / (nextThreshold - currentThreshold)) * 100))
    : 100;
  const pointsToNext = nextThreshold ? nextThreshold - stats.reputationScore : 0;

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((stat, i) => (
          <div
            key={stat.label}
            className={`bg-white border border-gray-100 rounded-2xl p-5 ${STAT_COLORS[i].border} transition-colors`}
          >
            <div className={`w-9 h-9 rounded-xl ${STAT_COLORS[i].icon} flex items-center justify-center mb-3`}>
              {STAT_ICONS[i]}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(stat.value)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Reputation progress bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{TRUST_LEVEL_ICONS[stats.trustLevel]}</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {TRUST_LEVEL_LABELS[stats.trustLevel]}
              </p>
              <p className="text-xs text-gray-400">{formatNumber(stats.reputationScore)} reputation</p>
            </div>
          </div>
          {nextLevel && (
            <div className="text-right">
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-gray-700">{pointsToNext}</span> pts to {TRUST_LEVEL_LABELS[nextLevel]}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{TRUST_LEVEL_ICONS[nextLevel]} Next level</p>
            </div>
          )}
          {!nextLevel && (
            <span className="text-xs font-medium px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full">
              Max level reached
            </span>
          )}
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {nextLevel && (
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-gray-400">{TRUST_LEVEL_LABELS[stats.trustLevel]}</span>
            <span className="text-[10px] text-gray-400">{progressPct}%</span>
            <span className="text-[10px] text-gray-400">{TRUST_LEVEL_LABELS[nextLevel]}</span>
          </div>
        )}
      </div>
    </div>
  );
}
