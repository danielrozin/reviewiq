"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface MetricPair {
  current: number;
  previous: number;
  change: string;
  trend: "up" | "down" | "flat";
}

interface FunnelStep {
  stage: string;
  value: number;
  rate: number;
}

interface DailyRow {
  date: string;
  day: string;
  signups: number;
  reviews: number;
  activity: number;
}

interface TopProduct {
  name: string;
  slug: string;
  reviews: number;
}

interface ReportData {
  weekNumber: number;
  year: number;
  period: { start: string; end: string };
  generatedAt: string;
  summary: Record<string, MetricPair>;
  platform: {
    totalUsers: number;
    totalReviews: number;
    totalProducts: number;
    totalVotes: number;
    totalThreads: number;
    totalComments: number;
  };
  funnel: FunnelStep[];
  dailyBreakdown: DailyRow[];
  topProducts: TopProduct[];
  trustLevels: Array<{ level: string; count: number }>;
  activationRate: number;
  markdown: string;
}

function TrendBadge({ change, trend }: { change: string; trend: "up" | "down" | "flat" }) {
  const color = trend === "up" ? "text-emerald-600 bg-emerald-50" : trend === "down" ? "text-red-600 bg-red-50" : "text-gray-500 bg-gray-100";
  const arrow = trend === "up" ? "\u2191" : trend === "down" ? "\u2193" : "\u2192";
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${color}`}>
      {arrow} {change}
    </span>
  );
}

function MetricCard({ label, current, previous, change, trend }: { label: string } & MetricPair) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-end gap-2 mt-1">
        <p className="text-2xl font-bold text-gray-900">{current.toLocaleString()}</p>
        <TrendBadge change={change} trend={trend} />
      </div>
      <p className="text-xs text-gray-500 mt-0.5">prev: {previous.toLocaleString()}</p>
    </div>
  );
}

function FunnelBar({ step, maxValue }: { step: FunnelStep; maxValue: number }) {
  const pct = maxValue > 0 ? Math.max((step.value / maxValue) * 100, 2) : 2;
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-36 text-sm text-gray-700 font-medium">{step.stage}</div>
      <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
        <div
          className="bg-emerald-500 rounded-full h-6 transition-all duration-500 flex items-center justify-end pr-2"
          style={{ width: `${pct}%`, minWidth: "40px" }}
        >
          <span className="text-[10px] font-bold text-white">{step.value}</span>
        </div>
      </div>
      <div className="w-16 text-right text-xs text-gray-500">{step.rate}%</div>
    </div>
  );
}

export default function WeeklyReportPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/analytics/weekly-report")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div role="status" aria-label="Generating weekly report" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div aria-hidden="true" className="animate-pulse text-gray-500">Generating weekly report...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">Failed to generate report</p>
      </div>
    );
  }

  const summaryLabels: Record<string, string> = {
    newUsers: "New Users",
    activeUsers: "Active Users",
    reviews: "Reviews",
    votes: "Votes",
    discussions: "Discussions",
    comments: "Comments",
  };

  const maxFunnel = Math.max(...data.funnel.map((f) => f.value), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Link href="/admin/analytics" className="text-gray-500 hover:text-gray-700 text-sm">&larr; Analytics</Link>
                <span aria-hidden="true" className="text-gray-300">|</span>
                <Link href="/admin/analytics/aarrr" className="text-gray-500 hover:text-gray-700 text-sm">AARRR</Link>
                <span aria-hidden="true" className="text-gray-300">|</span>
                <Link href="/admin/analytics/okr" className="text-gray-500 hover:text-gray-700 text-sm">OKR</Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">
                Weekly Report W{data.weekNumber}
              </h1>
              <p className="text-sm text-gray-500">
                {data.period.start} to {data.period.end}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowMarkdown(!showMarkdown)}
                aria-pressed={showMarkdown}
                className="px-3 py-1.5 text-xs font-medium border border-gray-400 rounded-lg hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
              >
                {showMarkdown ? "Dashboard" : "Markdown"}
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(data.markdown);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                aria-label={copied ? "Report copied" : "Copy report to clipboard"}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-600"
              >
                {copied ? "Copied!" : "Copy Report"}
              </button>
              <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                {copied ? "Report copied to clipboard" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showMarkdown ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
              {data.markdown}
            </pre>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <section aria-labelledby="weekly-summary-heading">
              <h2 id="weekly-summary-heading" className="text-lg font-bold text-gray-900 mb-4">Week-over-Week Summary</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {Object.entries(data.summary).map(([key, metric]) => (
                  <MetricCard key={key} label={summaryLabels[key] || key} {...metric} />
                ))}
              </div>
            </section>

            {/* Daily + Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section aria-labelledby="weekly-daily-activity-heading" className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 id="weekly-daily-activity-heading" className="text-sm font-bold text-gray-700 mb-3">Daily Activity (7d)</h3>
                <div className="space-y-2">
                  {data.dailyBreakdown.map((d) => {
                    const max = Math.max(...data.dailyBreakdown.map((r) => r.signups + r.reviews), 1);
                    return (
                      <div key={d.date} className="flex items-center gap-3 text-xs">
                        <span className="w-8 text-gray-500 font-medium">{d.day}</span>
                        <div className="flex-1 flex gap-1">
                          <div className="bg-emerald-400 h-4 rounded" style={{ width: `${Math.max((d.signups / max) * 100, 2)}%` }} title={`${d.signups} signups`} />
                          <div className="bg-indigo-400 h-4 rounded" style={{ width: `${Math.max((d.reviews / max) * 100, 2)}%` }} title={`${d.reviews} reviews`} />
                        </div>
                        <span className="w-12 text-right text-gray-500">{d.signups + d.reviews}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 mt-3 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 rounded" />Signups</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-indigo-400 rounded" />Reviews</span>
                </div>
              </section>

              <section aria-labelledby="weekly-funnel-heading" className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 id="weekly-funnel-heading" className="text-sm font-bold text-gray-700 mb-3">Activation Funnel</h3>
                {data.funnel.map((step) => (
                  <FunnelBar key={step.stage} step={step} maxValue={maxFunnel} />
                ))}
                <p className="text-xs text-gray-500 mt-2">Activation rate: {data.activationRate}%</p>
              </section>
            </div>

            {/* Top Products + Trust Levels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section aria-labelledby="weekly-top-products-heading" className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 id="weekly-top-products-heading" className="text-sm font-bold text-gray-700 mb-3">Top Products by Reviews</h3>
                <div className="space-y-1.5">
                  {data.topProducts.length === 0 ? (
                    <p className="text-xs text-gray-500">No products yet</p>
                  ) : (
                    data.topProducts.map((p, i) => (
                      <div key={p.slug} className="flex items-center gap-2 text-xs">
                        <span className="w-5 text-gray-500 font-medium">{i + 1}.</span>
                        <span className="flex-1 text-gray-700 truncate">{p.name}</span>
                        <span className="text-gray-500 font-medium">{p.reviews}</span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section aria-labelledby="weekly-trust-heading" className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 id="weekly-trust-heading" className="text-sm font-bold text-gray-700 mb-3">Trust Level Distribution</h3>
                <div className="space-y-1.5">
                  {data.trustLevels.map((t) => (
                    <div key={t.level} className="flex items-center gap-2 text-xs">
                      <span className="flex-1 text-gray-700 capitalize">{t.level}</span>
                      <span className="text-gray-500 font-medium">{t.count}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Platform Inventory */}
            <section aria-labelledby="weekly-inventory-heading" className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 id="weekly-inventory-heading" className="text-sm font-bold text-gray-700 mb-3">Platform Inventory</h3>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                {[
                  { label: "Users", value: data.platform.totalUsers },
                  { label: "Reviews", value: data.platform.totalReviews },
                  { label: "Products", value: data.platform.totalProducts },
                  { label: "Votes", value: data.platform.totalVotes },
                  { label: "Threads", value: data.platform.totalThreads },
                  { label: "Comments", value: data.platform.totalComments },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{item.value.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{item.label}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
