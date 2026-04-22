"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

// --- Types ---

interface NorthStar {
  metric: string;
  current: number;
  previous: number;
  changePercent: number;
  trend: "up" | "down" | "flat";
}

interface Acquisition {
  totalUsers: number;
  newUsers: { "7d": number; "14d": number; "30d": number };
  weeklySignupTrend: Array<{ week: string; count: number }>;
  signupMethods: Array<{ method: string; count: number }>;
  dailyAvg30d: number;
}

interface Activation {
  totalNewUsers30d: number;
  activatedUsers: number;
  activationRate: number;
  productAdoptionRate: number;
  pqlCount: number;
  pqlRate: number;
  avgTimeToFirstReviewHours: number | null;
  activationFunnel: Array<{ step: string; count: number }>;
}

interface Retention {
  activeUsers: { "7d": number; "30d": number };
  totalUsers: number;
  churnRate: number;
  churnedUsers: number;
  previouslyActiveUsers: number;
  stickiness: number;
  returningUsers: number;
  retentionRate: number;
}

interface Revenue {
  trustLevelDistribution: Array<{ level: string; count: number; percent: number }>;
  powerUsersActive30d: number;
  highEngagementUsers: number;
  trialToPaidProxy: number;
  totalUsers: number;
  revenueReadinessScore: number;
}

interface Referral {
  communityEngagement: {
    totalThreads: number;
    recentThreads: number;
    totalComments: number;
    recentComments: number;
    helpfulVotes: number;
  };
  contentPerActiveUser: number;
  communityAdvocates: number;
  totalReviews: number;
  ugcGrowthRate: number;
}

interface CustomerHealth {
  averageHealthScore: number;
  distribution: { healthy: number; atRisk: number; churning: number };
  totalUsers: number;
  healthyPercent: number;
}

interface CohortRow {
  cohort: string;
  total: number;
  retained: Record<string, number>;
}

interface AARRRData {
  northStar: NorthStar;
  acquisition: Acquisition;
  activation: Activation;
  retention: Retention;
  revenue: Revenue;
  referral: Referral;
  customerHealth: CustomerHealth;
  cohorts: CohortRow[];
  generatedAt: string;
}

// --- Components ---

const PIRATE_COLORS = {
  acquisition: "#3b82f6",
  activation: "#8b5cf6",
  retention: "#10b981",
  revenue: "#f59e0b",
  referral: "#ef4444",
};

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

const HEALTH_COLORS = {
  healthy: "#10b981",
  atRisk: "#f59e0b",
  churning: "#ef4444",
};

function StatCard({
  label, value, subtitle, color, large,
}: {
  label: string; value: string | number; subtitle?: string; color?: string; large?: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`font-bold text-gray-900 mt-1 ${large ? "text-3xl" : "text-2xl"}`} style={color ? { color } : undefined}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function SectionHeader({ title, emoji, color, description }: {
  title: string; emoji: string; color: string; description: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {emoji}
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function HealthGauge({ score }: { score: number }) {
  const color = score >= 60 ? "#10b981" : score >= 30 ? "#f59e0b" : "#ef4444";
  const label = score >= 60 ? "Healthy" : score >= 30 ? "At Risk" : "Critical";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-gray-500">/100</span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

function CohortTable({ cohorts }: { cohorts: CohortRow[] }) {
  if (cohorts.length === 0) {
    return <p className="text-gray-400 text-sm">No cohort data available yet.</p>;
  }

  const maxWeeks = Math.max(...cohorts.map((c) => Object.keys(c.retained).length));
  const weekHeaders = Array.from({ length: maxWeeks }, (_, i) => `W${i + 1}`);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-3 font-semibold text-gray-600">Cohort</th>
            <th className="text-right py-2 px-3 font-semibold text-gray-600">Users</th>
            {weekHeaders.map((w) => (
              <th key={w} className="text-right py-2 px-3 font-semibold text-gray-600">{w}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((row) => (
            <tr key={row.cohort} className="border-b border-gray-50">
              <td className="py-2 px-3 text-gray-700 font-medium">{row.cohort}</td>
              <td className="py-2 px-3 text-right font-medium text-gray-900">{row.total}</td>
              {weekHeaders.map((_, i) => {
                const retained = row.retained[`week${i + 1}`];
                const pct = row.total > 0 && retained !== undefined
                  ? Math.round((retained / row.total) * 100)
                  : null;
                const bg = pct !== null
                  ? `rgba(16, 185, 129, ${Math.max(0.05, pct / 100)})`
                  : "transparent";
                return (
                  <td
                    key={i}
                    className="py-2 px-3 text-right text-xs font-medium"
                    style={{ backgroundColor: bg }}
                  >
                    {pct !== null ? `${pct}%` : "-"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Main Page ---

type TabKey = "overview" | "acquisition" | "activation" | "retention" | "revenue" | "referral";

export default function AARRRDashboard() {
  const [data, setData] = useState<AARRRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  useEffect(() => {
    fetch("/api/analytics/aarrr")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-red-500">Failed to load AARRR metrics.</p>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; color: string }[] = [
    { key: "overview", label: "Overview", color: "#111827" },
    { key: "acquisition", label: "Acquisition", color: PIRATE_COLORS.acquisition },
    { key: "activation", label: "Activation", color: PIRATE_COLORS.activation },
    { key: "retention", label: "Retention", color: PIRATE_COLORS.retention },
    { key: "revenue", label: "Revenue", color: PIRATE_COLORS.revenue },
    { key: "referral", label: "Referral", color: PIRATE_COLORS.referral },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">AARRR Pirate Metrics</h1>
          <a
            href="/admin/analytics"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            General Analytics
          </a>
        </div>
        <p className="text-gray-500">ReviewIQ (ReviewIQ) growth dashboard</p>
        <p className="text-xs text-gray-400 mt-1">
          Generated: {new Date(data.generatedAt).toLocaleString()}
        </p>
      </div>

      {/* North Star */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
              North Star Metric
            </p>
            <h2 className="text-xl font-bold text-gray-900">{data.northStar.metric}</h2>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-emerald-700">{data.northStar.current}</p>
            <p className="text-sm text-gray-600 mt-1">
              vs {data.northStar.previous} last week{" "}
              <span
                className={`font-semibold ${
                  data.northStar.trend === "up"
                    ? "text-emerald-600"
                    : data.northStar.trend === "down"
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                ({data.northStar.changePercent > 0 ? "+" : ""}{data.northStar.changePercent}%)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* AARRR Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatCard
              label="Acquisition"
              value={data.acquisition.newUsers["30d"]}
              subtitle="New users (30d)"
              color={PIRATE_COLORS.acquisition}
            />
            <StatCard
              label="Activation"
              value={`${data.activation.activationRate}%`}
              subtitle="Activation rate (30d)"
              color={PIRATE_COLORS.activation}
            />
            <StatCard
              label="Retention"
              value={`${data.retention.retentionRate}%`}
              subtitle="Retention rate"
              color={PIRATE_COLORS.retention}
            />
            <StatCard
              label="Revenue Readiness"
              value={data.revenue.revenueReadinessScore}
              subtitle="Readiness score"
              color={PIRATE_COLORS.revenue}
            />
            <StatCard
              label="Referral"
              value={data.referral.contentPerActiveUser}
              subtitle="UGC per active user"
              color={PIRATE_COLORS.referral}
            />
          </div>

          {/* Health Score + Key Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Health Score</h3>
              <HealthGauge score={data.customerHealth.averageHealthScore} />
              <div className="grid grid-cols-3 gap-4 mt-6 w-full">
                {(["healthy", "atRisk", "churning"] as const).map((key) => (
                  <div key={key} className="text-center">
                    <p className="text-lg font-bold" style={{ color: HEALTH_COLORS[key] }}>
                      {data.customerHealth.distribution[key]}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{key === "atRisk" ? "At Risk" : key}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard label="Total Users" value={data.acquisition.totalUsers} />
                <StatCard label="PQLs (30d)" value={data.activation.pqlCount} subtitle={`${data.activation.pqlRate}% of new users`} />
                <StatCard label="Churn Rate" value={`${data.retention.churnRate}%`} subtitle={`${data.retention.churnedUsers} users churned`} />
                <StatCard label="Stickiness" value={`${data.retention.stickiness}%`} subtitle="WAU/MAU ratio" />
                <StatCard label="Power Users" value={data.revenue.powerUsersActive30d} subtitle="Active reviewers (30d)" />
                <StatCard label="Advocates" value={data.referral.communityAdvocates} subtitle="Users with badges" />
              </div>
            </div>
          </div>

          {/* Cohort Analysis */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Cohort Retention</h3>
            <CohortTable cohorts={data.cohorts} />
          </div>
        </div>
      )}

      {/* Acquisition Tab */}
      {activeTab === "acquisition" && (
        <div className="space-y-8">
          <SectionHeader
            title="Acquisition"
            emoji="A"
            color={PIRATE_COLORS.acquisition}
            description="How do users find ReviewIQ?"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={data.acquisition.totalUsers} />
            <StatCard label="New (7d)" value={data.acquisition.newUsers["7d"]} color={PIRATE_COLORS.acquisition} />
            <StatCard label="New (14d)" value={data.acquisition.newUsers["14d"]} />
            <StatCard label="New (30d)" value={data.acquisition.newUsers["30d"]} subtitle={`${data.acquisition.dailyAvg30d}/day avg`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Signup Trend</h3>
              {data.acquisition.weeklySignupTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data.acquisition.weeklySignupTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke={PIRATE_COLORS.acquisition}
                      fill={`${PIRATE_COLORS.acquisition}20`}
                      name="Signups"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">No signup data yet.</div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Signup Methods</h3>
              {data.acquisition.signupMethods.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.acquisition.signupMethods}
                      dataKey="count"
                      nameKey="method"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ method, percent }: { method?: string; percent?: number }) =>
                        `${method || ""} (${((percent || 0) * 100).toFixed(0)}%)`
                      }
                    >
                      {data.acquisition.signupMethods.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">No method data yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activation Tab */}
      {activeTab === "activation" && (
        <div className="space-y-8">
          <SectionHeader
            title="Activation"
            emoji="A"
            color={PIRATE_COLORS.activation}
            description="Do users experience the core value?"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Activation Rate"
              value={`${data.activation.activationRate}%`}
              subtitle={`${data.activation.activatedUsers} of ${data.activation.totalNewUsers30d}`}
              color={PIRATE_COLORS.activation}
              large
            />
            <StatCard
              label="Product Adoption"
              value={`${data.activation.productAdoptionRate}%`}
              subtitle="New users who reviewed"
            />
            <StatCard
              label="PQLs"
              value={data.activation.pqlCount}
              subtitle={`${data.activation.pqlRate}% PQL rate`}
              color={PIRATE_COLORS.activation}
            />
            <StatCard
              label="Time to First Review"
              value={
                data.activation.avgTimeToFirstReviewHours !== null
                  ? `${data.activation.avgTimeToFirstReviewHours}h`
                  : "N/A"
              }
              subtitle="Average hours"
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activation Funnel (30d new users)</h3>
            {data.activation.activationFunnel.length > 0 ? (
              <div className="space-y-3">
                {data.activation.activationFunnel.map((step, i) => {
                  const maxCount = data.activation.activationFunnel[0].count;
                  const pct = maxCount > 0 ? Math.round((step.count / maxCount) * 100) : 0;
                  return (
                    <div key={step.step} className="flex items-center gap-4">
                      <div className="w-36 text-sm font-medium text-gray-700 text-right shrink-0">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full rounded-lg flex items-center px-3 transition-all"
                            style={{
                              width: `${Math.max(pct, 2)}%`,
                              backgroundColor: `${PIRATE_COLORS.activation}${i === 0 ? "" : "cc"}`,
                            }}
                          >
                            <span className="text-xs font-semibold text-white whitespace-nowrap">
                              {step.count} ({pct}%)
                            </span>
                          </div>
                        </div>
                      </div>
                      {i > 0 && (
                        <div className="w-16 text-xs text-gray-400 text-right">
                          {data.activation.activationFunnel[i - 1].count > 0
                            ? `${Math.round((step.count / data.activation.activationFunnel[i - 1].count) * 100)}%`
                            : "-"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">No activation data yet.</div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">PQL Definition</h4>
            <p className="text-sm text-blue-800">
              A Product Qualified Lead (PQL) is a user who has performed 2+ distinct action types
              (review, vote, discussion, comment) within 30 days of signup, indicating strong product-market fit.
            </p>
          </div>
        </div>
      )}

      {/* Retention Tab */}
      {activeTab === "retention" && (
        <div className="space-y-8">
          <SectionHeader
            title="Retention"
            emoji="R"
            color={PIRATE_COLORS.retention}
            description="Do users come back?"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Retention Rate"
              value={`${data.retention.retentionRate}%`}
              color={PIRATE_COLORS.retention}
              large
            />
            <StatCard
              label="Churn Rate"
              value={`${data.retention.churnRate}%`}
              subtitle={`${data.retention.churnedUsers} churned`}
              color="#ef4444"
            />
            <StatCard
              label="Stickiness (WAU/MAU)"
              value={`${data.retention.stickiness}%`}
              subtitle="Weekly vs monthly active"
            />
            <StatCard
              label="Returning Users"
              value={data.retention.returningUsers}
              subtitle="Active old users (30d)"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Users</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={[
                    { period: "7 days", users: data.retention.activeUsers["7d"] },
                    { period: "30 days", users: data.retention.activeUsers["30d"] },
                    { period: "Total", users: data.retention.totalUsers },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="users" fill={PIRATE_COLORS.retention} radius={[4, 4, 0, 0]} name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Retention vs Churn</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Retained", value: data.retention.previouslyActiveUsers - data.retention.churnedUsers },
                      { name: "Churned", value: data.retention.churnedUsers },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name || ""} (${((percent || 0) * 100).toFixed(0)}%)`
                    }
                  >
                    <Cell fill={PIRATE_COLORS.retention} />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Cohort Retention</h3>
            <CohortTable cohorts={data.cohorts} />
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === "revenue" && (
        <div className="space-y-8">
          <SectionHeader
            title="Revenue"
            emoji="R"
            color={PIRATE_COLORS.revenue}
            description="Revenue readiness and monetization signals"
          />

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-amber-800">
              ReviewIQ does not yet have a paid tier. These metrics track <strong>revenue readiness</strong> signals:
              user engagement depth, trust level progression, and power user growth as proxies for
              monetization potential.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Revenue Readiness"
              value={data.revenue.revenueReadinessScore}
              subtitle="Score /100"
              color={PIRATE_COLORS.revenue}
              large
            />
            <StatCard
              label="Trial-to-Paid Proxy"
              value={`${data.revenue.trialToPaidProxy}%`}
              subtitle="Newcomer -> Contributor+"
            />
            <StatCard
              label="Power Users"
              value={data.revenue.powerUsersActive30d}
              subtitle="Active reviewers (30d)"
            />
            <StatCard
              label="High Engagement"
              value={data.revenue.highEngagementUsers}
              subtitle="Trusted/Expert users"
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust Level Distribution</h3>
            {data.revenue.trustLevelDistribution.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.revenue.trustLevelDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="level" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill={PIRATE_COLORS.revenue} radius={[4, 4, 0, 0]} name="Users" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {data.revenue.trustLevelDistribution.map((t) => (
                    <div key={t.level} className="flex items-center gap-3">
                      <span className="w-24 text-sm font-medium text-gray-700 capitalize">{t.level}</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(t.percent, 2)}%`,
                            backgroundColor: PIRATE_COLORS.revenue,
                          }}
                        />
                      </div>
                      <span className="w-20 text-sm text-gray-600 text-right">{t.count} ({t.percent}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">No trust level data yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Referral Tab */}
      {activeTab === "referral" && (
        <div className="space-y-8">
          <SectionHeader
            title="Referral"
            emoji="R"
            color={PIRATE_COLORS.referral}
            description="Do users tell others about ReviewIQ?"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="UGC per Active User"
              value={data.referral.contentPerActiveUser}
              subtitle="Threads + comments"
              color={PIRATE_COLORS.referral}
              large
            />
            <StatCard
              label="Community Advocates"
              value={data.referral.communityAdvocates}
              subtitle="Badge holders"
            />
            <StatCard
              label="Total Reviews"
              value={data.referral.totalReviews}
              subtitle="User-generated content"
            />
            <StatCard
              label="UGC Growth Rate"
              value={`${data.referral.ugcGrowthRate}%`}
              subtitle="Recent community / total reviews"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Engagement</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    { metric: "Threads", total: data.referral.communityEngagement.totalThreads, recent: data.referral.communityEngagement.recentThreads },
                    { metric: "Comments", total: data.referral.communityEngagement.totalComments, recent: data.referral.communityEngagement.recentComments },
                    { metric: "Helpful Votes", total: data.referral.communityEngagement.helpfulVotes, recent: 0 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#94a3b8" radius={[4, 4, 0, 0]} name="All Time" />
                  <Bar dataKey="recent" fill={PIRATE_COLORS.referral} radius={[4, 4, 0, 0]} name="Last 30d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Levers</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">Review Quality</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {data.referral.totalReviews} reviews generate SEO traffic that brings new users organically.
                    Higher review count and quality improve search rankings.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">Community Discussions</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {data.referral.communityEngagement.totalThreads} discussion threads create shareable, indexable content.
                    Active discussions signal product authority.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">Badge & Reputation System</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {data.referral.communityAdvocates} users have earned badges. These power users are natural
                    advocates who share expertise and attract new community members.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
