"use client";

import type React from "react";
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

const TRUST_LEVEL_ICONS: Record<TrustLevel, React.ReactElement> = {
  newcomer: (
    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
    </svg>
  ),
  contributor: (
    <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  ),
  trusted: (
    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
    </svg>
  ),
  expert: (
    <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
  ),
  moderator: (
    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  ),
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
            className={`bg-white border border-gray-100 rounded-2xl p-5 ${STAT_COLORS[i].border} hover:-translate-y-0.5 transition-all duration-200`}
          >
            <div className={`w-9 h-9 rounded-xl ${STAT_COLORS[i].icon} flex items-center justify-center mb-3`}>
              {STAT_ICONS[i]}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(stat.value)}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Reputation progress bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm hover:border-gray-200 transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
              {TRUST_LEVEL_ICONS[stats.trustLevel]}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {TRUST_LEVEL_LABELS[stats.trustLevel]}
              </p>
              <p className="text-xs text-gray-400">{formatNumber(stats.reputationScore)} reputation</p>
            </div>
          </div>
          {nextLevel && (
            <div className="text-right">
              <p className="text-xs text-gray-600">
                <span className="font-semibold text-gray-700">{pointsToNext}</span> pts to {TRUST_LEVEL_LABELS[nextLevel]}
              </p>
              <p className="inline-flex items-center gap-1 text-xs text-gray-400 mt-0.5">{TRUST_LEVEL_ICONS[nextLevel]} Next level</p>
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
