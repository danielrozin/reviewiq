/**
 * OKR Configuration — Company & Team OKRs (ReviewIQ view)
 *
 * Updated weekly during Monday check-ins.
 * Progress values are 0-100 (percentage).
 * Health metrics: "green" | "yellow" | "red"
 */

export interface KeyResult {
  id: string;
  description: string;
  target: string;
  current: string;
  progress: number;
  unit?: string;
}

export interface OKR {
  id: string;
  objective: string;
  owner: string;
  keyResults: KeyResult[];
  overallProgress: number;
}

export interface HealthMetric {
  name: string;
  status: "green" | "yellow" | "red";
  detail: string;
  lastUpdated: string;
}

export interface OKRConfig {
  quarter: string;
  lastUpdated: string;
  companyOKR: OKR;
  teamOKRs: OKR[];
  healthMetrics: HealthMetric[];
}

export const okrConfig: OKRConfig = {
  quarter: "Q2 2026",
  lastUpdated: "2026-04-06",

  companyOKR: {
    id: "company-q2-2026",
    objective: "Become the go-to comparison platform users trust and return to weekly",
    owner: "CEO",
    overallProgress: 12,
    keyResults: [
      {
        id: "cr-1",
        description: "Grow Monthly Active Users (MAU) to 50,000",
        target: "50,000",
        current: "~2,500",
        progress: 5,
        unit: "users",
      },
      {
        id: "cr-2",
        description: "Achieve 5% visitor-to-engaged-user conversion rate",
        target: "5%",
        current: "~1.2%",
        progress: 24,
        unit: "%",
      },
      {
        id: "cr-3",
        description: "Reach $8,000 MRR from affiliate + API + embed revenue",
        target: "$8,000",
        current: "~$200",
        progress: 3,
        unit: "USD",
      },
    ],
  },

  teamOKRs: [
    {
      id: "smartreview-q2",
      objective: "Launch ReviewIQ as a trusted review platform with active contributors",
      owner: "VP Product / ReviewIQ",
      overallProgress: 10,
      keyResults: [
        {
          id: "sr-1",
          description: "Reach 200 registered reviewers",
          target: "200",
          current: "~15",
          progress: 8,
          unit: "users",
        },
        {
          id: "sr-2",
          description: "Achieve 50 verified reviews per week",
          target: "50/week",
          current: "~3/week",
          progress: 6,
        },
        {
          id: "sr-3",
          description: "Launch trust scoring system with 80%+ user approval",
          target: "80%",
          current: "Launched, no approval data yet",
          progress: 15,
          unit: "%",
        },
      ],
    },
    {
      id: "product-q2",
      objective: "Ship data-driven product improvements that measurably increase engagement",
      owner: "VP Product",
      overallProgress: 18,
      keyResults: [
        {
          id: "pr-1",
          description: "Run 3 A/B tests with statistically significant results",
          target: "3",
          current: "0",
          progress: 0,
        },
        {
          id: "pr-2",
          description: "Reduce comparison page bounce rate from 72% to 55%",
          target: "55%",
          current: "~72%",
          progress: 0,
          unit: "%",
        },
        {
          id: "pr-3",
          description: "Launch AARRR dashboards for both products",
          target: "2",
          current: "2",
          progress: 100,
        },
      ],
    },
    {
      id: "engineering-q2",
      objective: "Build a fast, reliable platform that scales to 100K users",
      owner: "CTO",
      overallProgress: 30,
      keyResults: [
        {
          id: "er-1",
          description: "Achieve <2s P95 page load time across all pages",
          target: "<2s",
          current: "~3.5s",
          progress: 20,
          unit: "seconds",
        },
        {
          id: "er-2",
          description: "Reach 95% Lighthouse performance score",
          target: "95",
          current: "~72",
          progress: 30,
          unit: "score",
        },
        {
          id: "er-3",
          description: "Zero critical bugs in production for 30 consecutive days",
          target: "30 days",
          current: "~12 days",
          progress: 40,
          unit: "days",
        },
      ],
    },
    {
      id: "growth-q2",
      objective: "Drive organic traffic growth through content and SEO",
      owner: "Content / SEO",
      overallProgress: 15,
      keyResults: [
        {
          id: "gr-1",
          description: "Publish 500 high-quality comparisons (volume > 500 searches/mo)",
          target: "500",
          current: "~180",
          progress: 36,
        },
        {
          id: "gr-2",
          description: "Grow organic sessions to 30,000/month",
          target: "30,000",
          current: "~3,000",
          progress: 10,
          unit: "sessions",
        },
        {
          id: "gr-3",
          description: "Acquire 50 quality backlinks from DR 30+ domains",
          target: "50",
          current: "~5",
          progress: 10,
        },
      ],
    },
  ],

  healthMetrics: [
    {
      name: "Team Health",
      status: "yellow",
      detail: "High agent idle rate resolved; coordination improving but still stabilizing",
      lastUpdated: "2026-04-06",
    },
    {
      name: "Code Quality",
      status: "green",
      detail: "Builds clean, Sentry error rate low, TypeScript strict mode enabled",
      lastUpdated: "2026-04-06",
    },
    {
      name: "Customer Satisfaction",
      status: "yellow",
      detail: "Survey NPS ~35; limited sample size; need more user feedback",
      lastUpdated: "2026-04-06",
    },
    {
      name: "User Engagement",
      status: "red",
      detail: "Low returning user rate (~5%); few active reviewers; need onboarding improvements",
      lastUpdated: "2026-04-06",
    },
  ],
};
