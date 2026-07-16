"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

interface LiveMetrics {
  period: { start: string; end: string; days: number };
  summary: {
    totalProducts: number;
    totalCategories: number;
    totalReviews: number;
    recentReviews: number;
    totalUsers: number;
    recentUsers: number;
    totalVotes: number;
    totalThreads: number;
    totalComments: number;
    recentThreads: number;
  };
  ratingDistribution: Array<{ rating: number; count: number }>;
  topProducts: Array<{ name: string; slug: string; reviewCount: number; smartScore: number; category: string }>;
  topCategories: Array<{ name: string; slug: string; productCount: number }>;
}

interface FeatureFunnel {
  name: string;
  description: string;
  steps: Array<{ step: number; name: string; event: string; description: string }>;
  kpis: Array<{ metric: string; formula: string; target: string; warning?: string }>;
}

interface AnalyticsConfig {
  product: string;
  ga4Property: string;
  clarityProject: string;
  events: Array<{ name: string; category: string; description: string; params: string[] }>;
  funnel: {
    name: string;
    steps: Array<{ step: number; name: string; event: string; description: string }>;
  };
  featureFunnels: Record<string, FeatureFunnel>;
  kpis: {
    northStar: { metric: string; description: string; target: string };
    core: Array<{ metric: string; source: string; frequency: string; target: string | null }>;
    engagement: Array<{ metric: string; formula: string; target: string }>;
  };
  live: LiveMetrics;
}

interface WeeklyReport {
  title: string;
  generatedAt: string;
  headline: Record<string, number>;
  ratingDistribution: Array<{ rating: number; count: number }>;
  topProducts: Array<{ name: string; reviewCount: number; smartScore: number; category: string }>;
  topCategories: Array<{ name: string; productCount: number }>;
  callouts: string[];
}

const COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"];
const RATING_COLORS: Record<number, string> = { 5: "#10b981", 4: "#34d399", 3: "#facc15", 2: "#f97316", 1: "#ef4444" };

function StatCard({ label, value, subtitle }: { label: string; value: string | number; subtitle?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

const categoryColors: Record<string, string> = {
  discovery: "bg-blue-50 text-blue-700 border-blue-200",
  consideration: "bg-indigo-50 text-indigo-700 border-indigo-200",
  conversion: "bg-emerald-50 text-emerald-700 border-emerald-200",
  engagement: "bg-orange-50 text-orange-700 border-orange-200",
  lead_capture: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export default function ReviewIQAnalytics() {
  const [config, setConfig] = useState<AnalyticsConfig | null>(null);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "funnel" | "features" | "events" | "report">("overview");
  const analyticsTablistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadReport = () => {
    if (report) return;
    setReportLoading(true);
    fetch("/api/analytics?section=report")
      .then((r) => r.json())
      .then(setReport)
      .catch(() => {})
      .finally(() => setReportLoading(false));
  };

  if (loading) {
    return (
      <div role="status" aria-label="Loading analytics" className="max-w-7xl mx-auto px-4 py-8">
        <div aria-hidden="true" className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-red-500">Failed to load analytics configuration.</p>
      </div>
    );
  }

  const live = config.live;
  const tabs = [
    { key: "overview" as const, label: "Overview" },
    { key: "funnel" as const, label: "Review Funnel" },
    { key: "features" as const, label: "New Features" },
    { key: "events" as const, label: "Custom Events" },
    { key: "report" as const, label: "Weekly Report" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">ReviewIQ Analytics</h1>
          <a
            href="/admin/analytics/aarrr"
            className="text-sm text-emerald-600 hover:text-emerald-800 font-medium underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
          >
            AARRR Pirate Metrics
          </a>
          <a
            href="/admin/analytics/okr"
            className="text-sm text-violet-600 hover:text-violet-800 font-medium underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
          >
            OKR Dashboard
          </a>
          <a
            href="/admin/analytics/weekly-report"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
          >
            Weekly Report
          </a>
        </div>
        <p className="text-gray-500 mt-1">
          GA4: {config.ga4Property} | Clarity: {config.clarityProject}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Data period: {live.period.start} to {live.period.end}
        </p>
      </div>

      {/* Tabs */}
      <div
        ref={analyticsTablistRef}
        role="tablist"
        aria-label="Analytics views"
        className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-8 w-fit"
        onKeyDown={(e) => {
          const tabKeys = tabs.map(t => t.key);
          const idx = tabKeys.indexOf(activeTab);
          if (e.key === "ArrowRight") {
            e.preventDefault();
            const next = tabKeys[(idx + 1) % tabKeys.length];
            setActiveTab(next);
            (analyticsTablistRef.current?.querySelector(`#tab-${next}`) as HTMLButtonElement)?.focus();
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            const prev = tabKeys[(idx - 1 + tabKeys.length) % tabKeys.length];
            setActiveTab(prev);
            (analyticsTablistRef.current?.querySelector(`#tab-${prev}`) as HTMLButtonElement)?.focus();
          }
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`panel-${tab.key}`}
            tabIndex={activeTab === tab.key ? 0 : -1}
            onClick={() => {
              setActiveTab(tab.key);
              if (tab.key === "report") loadReport();
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <StatCard label="Total Products" value={live.summary.totalProducts} />
            <StatCard label="Total Reviews" value={live.summary.totalReviews} subtitle={`${live.summary.recentReviews} this week`} />
            <StatCard label="Users" value={live.summary.totalUsers} subtitle={`${live.summary.recentUsers} new this week`} />
            <StatCard label="Discussions" value={live.summary.totalThreads} subtitle={`${live.summary.recentThreads} this week`} />
            <StatCard label="Votes" value={live.summary.totalVotes} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rating Distribution */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h2>
              {live.ratingDistribution.some((r) => r.count > 0) ? (
                <div role="img" aria-label="Bar chart: review count per star rating (1–5 stars)">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={live.ratingDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="rating" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v} star`} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Reviews" radius={[4, 4, 0, 0]}>
                      {live.ratingDistribution.map((entry) => (
                        <Cell key={entry.rating} fill={RATING_COLORS[entry.rating] || "#6366f1"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500">No review data yet.</div>
              )}
            </div>

            {/* Top Categories */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories by Products</h2>
              {live.topCategories.length > 0 ? (
                <div role="img" aria-label="Pie chart: product count by category">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={live.topCategories}
                      dataKey="productCount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""} (${((percent || 0) * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {live.topCategories.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500">No category data yet.</div>
              )}
            </div>
          </div>

          {/* Top Products */}
          {live.topProducts.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Reviews</h2>
              <div role="img" aria-label="Horizontal bar chart: top products ranked by review count">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={live.topProducts.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={180}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: string) => v.length > 28 ? v.slice(0, 25) + "..." : v}
                  />
                  <Tooltip />
                  <Bar dataKey="reviewCount" fill="#10b981" radius={[0, 4, 4, 0]} name="Reviews" />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href={`https://analytics.google.com/analytics/web/#/p${config.ga4Property.replace("G-", "")}/reports`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Google Analytics — ${config.ga4Property} (opens in new tab)`}
              className="flex items-center gap-3 p-4 bg-white border border-gray-400 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
            >
              <div aria-hidden="true" className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 text-lg font-bold">G</div>
              <div aria-hidden="true">
                <p className="font-medium text-gray-900">Google Analytics</p>
                <p className="text-xs text-gray-500">{config.ga4Property}</p>
              </div>
            </a>
            <a
              href={`https://clarity.microsoft.com/projects/view/${config.clarityProject}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Microsoft Clarity — ${config.clarityProject} (opens in new tab)`}
              className="flex items-center gap-3 p-4 bg-white border border-gray-400 rounded-xl hover:border-purple-400 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
            >
              <div aria-hidden="true" className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 text-lg font-bold">C</div>
              <div aria-hidden="true">
                <p className="font-medium text-gray-900">Microsoft Clarity</p>
                <p className="text-xs text-gray-500">{config.clarityProject}</p>
              </div>
            </a>
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Search Console — GSC data (opens in new tab)"
              className="flex items-center gap-3 p-4 bg-white border border-gray-400 rounded-xl hover:border-green-400 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
            >
              <div aria-hidden="true" className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 text-lg font-bold">S</div>
              <div aria-hidden="true">
                <p className="font-medium text-gray-900">Search Console</p>
                <p className="text-xs text-gray-500">GSC data</p>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Funnel */}
      {activeTab === "funnel" && (
        <div id="panel-funnel" role="tabpanel" aria-labelledby="tab-funnel" className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">North Star Metric</p>
            <h2 className="text-xl font-bold text-gray-900">{config.kpis.northStar.metric}</h2>
            <p className="text-sm text-gray-600 mt-1">{config.kpis.northStar.description}</p>
            <p className="text-sm text-gray-500 mt-2">Target: {config.kpis.northStar.target}</p>
          </div>

          <h3 className="text-lg font-semibold text-gray-900">{config.funnel.name}</h3>
          <div className="space-y-3">
            {config.funnel.steps.map((step, i) => (
              <div key={step.step} className="flex items-stretch gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                    {step.step}
                  </div>
                  {i < config.funnel.steps.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex-1 mb-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-gray-900">{step.name}</h4>
                    <code className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md border border-gray-200">{step.event}</code>
                  </div>
                  <p className="text-sm text-gray-500">{step.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 bg-gray-100 rounded-full flex-1">
                      <div className="h-2 bg-emerald-400 rounded-full transition-all" style={{ width: `${Math.round(100 * Math.pow(0.75, i))}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-12 text-right">{Math.round(100 * Math.pow(0.75, i))}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement KPI Targets</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {config.kpis.engagement.map((kpi) => (
                <StatCard key={kpi.metric} label={kpi.metric} value={kpi.target} subtitle={kpi.formula} />
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-500">Funnel percentages are placeholders. Actual GA4 data will replace them after collection begins.</p>
        </div>
      )}

      {/* New Features */}
      {activeTab === "features" && config.featureFunnels && (
        <div id="panel-features" role="tabpanel" aria-labelledby="tab-features" className="space-y-8">
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900">New Feature Tracking</h2>
            <p className="text-sm text-gray-600 mt-1">
              Conversion funnels for Email Capture, Account-Required Reviews, and Quick Answer features.
            </p>
            <p className="text-xs text-gray-500 mt-2">Baseline collection starts once features are deployed. Targets shown below are initial benchmarks.</p>
          </div>

          {Object.entries(config.featureFunnels).map(([key, funnel]) => (
            <div key={key} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{funnel.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{funnel.description}</p>
              </div>

              <div className="space-y-3">
                {funnel.steps.map((step, i) => (
                  <div key={step.step} className="flex items-stretch gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                        {step.step}
                      </div>
                      {i < funnel.steps.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex-1 mb-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 text-sm">{step.name}</h4>
                        <code className="text-[10px] bg-white text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">{step.event}</code>
                      </div>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Target KPIs</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {funnel.kpis.map((kpi) => (
                    <div key={kpi.metric} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{kpi.metric}</p>
                      <p className="text-lg font-bold text-gray-900 mt-0.5">{kpi.target}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{kpi.formula}</p>
                      {kpi.warning && <p className="text-[10px] text-amber-600 mt-1">{kpi.warning}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">GA4 Setup Instructions</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>1. Events fire automatically once feature components are deployed with tracking hooks</li>
              <li>2. Mark <code className="bg-blue-100 px-1 rounded">email_capture_submit</code> and <code className="bg-blue-100 px-1 rounded">review_auth_signup</code> as conversions in GA4 Admin &gt; Events</li>
              <li>3. Create custom dimensions for <code className="bg-blue-100 px-1 rounded">source</code>, <code className="bg-blue-100 px-1 rounded">trigger_action</code>, and <code className="bg-blue-100 px-1 rounded">method</code> parameters</li>
              <li>4. Build a Funnel Exploration report in GA4 using the event sequences above</li>
            </ul>
          </div>
        </div>
      )}

      {/* Events */}
      {activeTab === "events" && (
        <div id="panel-events" role="tabpanel" aria-labelledby="tab-events" className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Custom Events ({config.events.length})</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm" aria-label="Custom events">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-600">Event</th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Description</th>
                  <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Parameters</th>
                </tr>
              </thead>
              <tbody>
                {config.events.map((event) => (
                  <tr key={event.name} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-50 px-2 py-1 rounded border border-gray-200 font-mono">{event.name}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${categoryColors[event.category] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {event.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{event.description}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {event.params.map((p) => (
                          <code key={p} className="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100">{p}</code>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report */}
      {activeTab === "report" && (
        <div id="panel-report" role="tabpanel" aria-labelledby="tab-report" className="space-y-6">
          {reportLoading && (
            <div role="status" aria-label="Loading report">
              <div aria-hidden="true" className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/2" />
                <div className="h-48 bg-gray-200 rounded" />
              </div>
            </div>
          )}
          {report && (
            <>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-900">{report.title}</h2>
                <p className="text-sm text-gray-500 mt-1">Generated: {new Date(report.generatedAt).toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(report.headline).map(([key, value]) => (
                  <StatCard
                    key={key}
                    label={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                    value={value}
                  />
                ))}
              </div>

              {report.ratingDistribution.some((r) => r.count > 0) && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={report.ratingDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="rating" tickFormatter={(v) => `${v} star`} tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" name="Reviews" radius={[4, 4, 0, 0]}>
                        {report.ratingDistribution.map((entry) => (
                          <Cell key={entry.rating} fill={RATING_COLORS[entry.rating] || "#6366f1"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {report.callouts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-3">Callouts</h3>
                  <ul className="space-y-2">
                    {report.callouts.map((callout, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                        <span className="text-amber-500 shrink-0 mt-0.5">*</span>
                        {callout}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.topProducts.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Products</h3>
                  <table className="w-full text-sm" aria-label="Top products">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th scope="col" className="text-left py-2 text-gray-500 font-medium">#</th>
                        <th scope="col" className="text-left py-2 text-gray-500 font-medium">Product</th>
                        <th scope="col" className="text-left py-2 text-gray-500 font-medium hidden sm:table-cell">Category</th>
                        <th scope="col" className="text-right py-2 text-gray-500 font-medium">Reviews</th>
                        <th scope="col" className="text-right py-2 text-gray-500 font-medium">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.topProducts.map((p, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                          <td className="py-2 text-gray-500">{i + 1}</td>
                          <td className="py-2 text-gray-900">{p.name}</td>
                          <td className="py-2 text-gray-500 hidden sm:table-cell">{p.category}</td>
                          <td className="py-2 text-right font-medium text-emerald-600">{p.reviewCount}</td>
                          <td className="py-2 text-right font-medium text-gray-600">{p.smartScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
          {!reportLoading && !report && (
            <div className="text-center py-12 text-gray-500">Failed to load weekly report. Try refreshing.</div>
          )}
        </div>
      )}
    </div>
  );
}
