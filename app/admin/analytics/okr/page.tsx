"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface KeyResult {
  id: string;
  description: string;
  target: string;
  current: string;
  progress: number;
  unit?: string;
}

interface OKR {
  id: string;
  objective: string;
  owner: string;
  keyResults: KeyResult[];
  overallProgress: number;
}

interface HealthMetric {
  name: string;
  status: "green" | "yellow" | "red";
  detail: string;
  lastUpdated: string;
}

interface OKRData {
  quarter: string;
  lastUpdated: string;
  companyOKR: OKR;
  teamOKRs: OKR[];
  healthMetrics: HealthMetric[];
}

const statusColors = {
  green: { bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", text: "text-emerald-700", label: "On Track" },
  yellow: { bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500", text: "text-amber-700", label: "Needs Attention" },
  red: { bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500", text: "text-red-700", label: "At Risk" },
};

function ProgressRing({ progress, size = 80, strokeWidth = 6 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const color = progress >= 70 ? "#10b981" : progress >= 40 ? "#f59e0b" : progress >= 15 ? "#6366f1" : "#ef4444";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg aria-hidden="true" width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-900">{progress}%</span>
      </div>
    </div>
  );
}

function KeyResultRow({ kr }: { kr: KeyResult }) {
  const barColor = kr.progress >= 70 ? "bg-emerald-500" : kr.progress >= 40 ? "bg-amber-500" : kr.progress >= 15 ? "bg-indigo-500" : "bg-red-400";
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex justify-between items-start mb-1.5">
        <p className="text-sm text-gray-700 flex-1 pr-4">{kr.description}</p>
        <div className="text-right flex-shrink-0">
          <span className="text-xs font-medium text-gray-500">{kr.current}</span>
          <span className="text-xs text-gray-500"> / {kr.target}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-100 rounded-full h-2">
          <div className={`${barColor} rounded-full h-2 transition-all duration-500`} style={{ width: `${Math.min(kr.progress, 100)}%` }} />
        </div>
        <span className="text-xs font-semibold text-gray-600 w-8 text-right">{kr.progress}%</span>
      </div>
    </div>
  );
}

function OKRCard({ okr, isCompany = false }: { okr: OKR; isCompany?: boolean }) {
  return (
    <div className={`bg-white border rounded-xl ${isCompany ? "border-indigo-200 ring-1 ring-indigo-100" : "border-gray-200"}`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <ProgressRing progress={okr.overallProgress} size={isCompany ? 96 : 72} strokeWidth={isCompany ? 7 : 6} />
          <div className="flex-1 min-w-0">
            {isCompany && (
              <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-full mb-1">
                Company OKR
              </span>
            )}
            <h3 className={`font-bold text-gray-900 ${isCompany ? "text-lg" : "text-base"}`}>
              {okr.objective}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Owner: {okr.owner}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 px-5 py-2">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Key Results</p>
        {okr.keyResults.map((kr) => (
          <KeyResultRow key={kr.id} kr={kr} />
        ))}
      </div>
    </div>
  );
}

function HealthCard({ metric }: { metric: HealthMetric }) {
  const style = statusColors[metric.status];
  return (
    <div className={`${style.bg} ${style.border} border rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <div aria-hidden="true" className={`w-3 h-3 rounded-full ${style.dot}`} />
        <h4 className="font-semibold text-gray-900 text-sm">{metric.name}</h4>
        <span className={`ml-auto text-xs font-medium ${style.text}`}>{style.label}</span>
      </div>
      <p className="text-xs text-gray-600">{metric.detail}</p>
      <p className="text-[10px] text-gray-500 mt-1">Updated {metric.lastUpdated}</p>
    </div>
  );
}

export default function OKRDashboard() {
  const [data, setData] = useState<OKRData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/okr")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div role="status" aria-label="Loading OKR data" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div aria-hidden="true" className="animate-pulse text-gray-500">Loading OKR data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">Failed to load OKR data</p>
      </div>
    );
  }

  const avgCompanyProgress = data.companyOKR.overallProgress;
  const avgTeamProgress = Math.round(data.teamOKRs.reduce((s, t) => s + t.overallProgress, 0) / data.teamOKRs.length);
  const healthCounts = { green: 0, yellow: 0, red: 0 };
  data.healthMetrics.forEach((m) => healthCounts[m.status]++);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Link href="/admin/analytics" className="text-gray-500 hover:text-gray-700 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 rounded">&larr; Analytics</Link>
                <span aria-hidden="true" className="text-gray-300">|</span>
                <Link href="/admin/analytics/aarrr" className="text-gray-500 hover:text-gray-700 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 rounded">AARRR</Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">OKR Dashboard</h1>
              <p className="text-sm text-gray-500">{data.quarter} &middot; Last updated {data.lastUpdated}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{avgCompanyProgress}%</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Company</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-violet-600">{avgTeamProgress}%</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Avg Team</p>
              </div>
              <div className="flex gap-1.5 items-center">
                {healthCounts.green > 0 && <span className="flex items-center gap-1 text-xs"><span aria-hidden="true" className="w-2 h-2 rounded-full bg-emerald-500" />{healthCounts.green}</span>}
                {healthCounts.yellow > 0 && <span className="flex items-center gap-1 text-xs"><span aria-hidden="true" className="w-2 h-2 rounded-full bg-amber-500" />{healthCounts.yellow}</span>}
                {healthCounts.red > 0 && <span className="flex items-center gap-1 text-xs"><span aria-hidden="true" className="w-2 h-2 rounded-full bg-red-500" />{healthCounts.red}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Company OKR */}
        <section aria-label="Company OKR">
          <OKRCard okr={data.companyOKR} isCompany />
        </section>

        {/* Health Metrics */}
        <section aria-labelledby="okr-health-heading">
          <h2 id="okr-health-heading" className="text-lg font-bold text-gray-900 mb-4">Health Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.healthMetrics.map((m) => (
              <HealthCard key={m.name} metric={m} />
            ))}
          </div>
        </section>

        {/* Team OKRs */}
        <section aria-labelledby="okr-team-heading">
          <h2 id="okr-team-heading" className="text-lg font-bold text-gray-900 mb-4">Team OKRs</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.teamOKRs.map((okr) => (
              <OKRCard key={okr.id} okr={okr} />
            ))}
          </div>
        </section>

        {/* Legend / Guide */}
        <section aria-labelledby="okr-legend-heading" className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 id="okr-legend-heading" className="text-sm font-bold text-gray-700 mb-2">How to read this dashboard</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
            <div>
              <p><strong>OKR progress</strong> shows % toward each Key Result. OKRs should be ambitious &mdash; 70% completion is a strong result.</p>
              <p className="mt-1"><strong>Sweet spot:</strong> ~50% chance of full achievement means the objective is appropriately challenging.</p>
            </div>
            <div>
              <p><strong>Health Metrics</strong> are reviewed during Monday check-ins:</p>
              <ul role="list" className="mt-1 space-y-0.5">
                <li><span aria-hidden="true" className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />Green = on track, no action needed</li>
                <li><span aria-hidden="true" className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />Yellow = needs attention this week</li>
                <li><span aria-hidden="true" className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />Red = at risk, requires immediate action</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
