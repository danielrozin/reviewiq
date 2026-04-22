import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * AARRR Metrics Dashboard API for ReviewIQ (ReviewIQ)
 *
 * GET /api/analytics/aarrr — full AARRR metrics
 * GET /api/analytics/aarrr?section=acquisition|activation|retention|revenue|referral|health|cohorts
 *
 * North Star Metric: Weekly active review analyses completed
 */

interface CohortRow {
  cohort: string;
  total: number;
  retained: Record<string, number>;
}

interface UserActivity {
  userId: string;
  reviewCount: number;
  voteCount: number;
  threadCount: number;
  commentCount: number;
  lastActivity: Date;
  firstActivity: Date;
  trustLevel: string;
  reputationScore: number;
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split("T")[0];
}

function getWeeksBetween(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
}

async function getNorthStarMetric() {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const [currentWeek, previousWeek] = await Promise.all([
    prisma.review.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.review.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
  ]);

  const change = previousWeek > 0
    ? Math.round(((currentWeek - previousWeek) / previousWeek) * 100)
    : currentWeek > 0 ? 100 : 0;

  return {
    metric: "Weekly Active Review Analyses",
    current: currentWeek,
    previous: previousWeek,
    changePercent: change,
    trend: currentWeek > previousWeek ? "up" : currentWeek < previousWeek ? "down" : "flat",
  };
}

async function getAcquisitionMetrics() {
  const now = new Date();
  const periods = [7, 14, 30].map((days) => {
    const start = new Date(now);
    start.setDate(start.getDate() - days);
    return { days, start };
  });

  const [newUsers7d, newUsers14d, newUsers30d, totalUsers] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: periods[0].start } } }),
    prisma.user.count({ where: { createdAt: { gte: periods[1].start } } }),
    prisma.user.count({ where: { createdAt: { gte: periods[2].start } } }),
    prisma.user.count(),
  ]);

  // Weekly new user trend (last 8 weeks)
  const eightWeeksAgo = new Date(now);
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
  const usersInRange = await prisma.user.findMany({
    where: { createdAt: { gte: eightWeeksAgo } },
    select: { createdAt: true },
  });

  const weeklySignups: Record<string, number> = {};
  for (const u of usersInRange) {
    const week = getWeekStart(u.createdAt);
    weeklySignups[week] = (weeklySignups[week] || 0) + 1;
  }

  const signupTrend = Object.entries(weeklySignups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week, count }));

  // Signup method distribution
  const accounts = await prisma.account.groupBy({
    by: ["provider"],
    _count: { id: true },
  });

  const signupMethods = accounts.map((a: { provider: string; _count: { id: number } }) => ({
    method: a.provider,
    count: a._count.id,
  }));

  return {
    totalUsers,
    newUsers: { "7d": newUsers7d, "14d": newUsers14d, "30d": newUsers30d },
    weeklySignupTrend: signupTrend,
    signupMethods,
    dailyAvg30d: Math.round((newUsers30d / 30) * 10) / 10,
  };
}

async function getActivationMetrics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Users who signed up in last 30 days
  const recentUsers = await prisma.user.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: {
      id: true,
      createdAt: true,
      _count: {
        select: {
          reviews: true,
          votes: true,
          threads: true,
          comments: true,
        },
      },
    },
  });

  const totalNew = recentUsers.length;

  // Activation = user performed at least one meaningful action
  const activated = recentUsers.filter(
    (u) => u._count.reviews > 0 || u._count.votes > 0 || u._count.threads > 0 || u._count.comments > 0
  );

  // Product Adoption Rate = users who submitted a review (core value action)
  const reviewers = recentUsers.filter((u) => u._count.reviews > 0);

  // PQL: Product Qualified Lead = user with 2+ actions (review + vote/comment/thread)
  const pqls = recentUsers.filter((u) => {
    const actions = (u._count.reviews > 0 ? 1 : 0) + (u._count.votes > 0 ? 1 : 0) +
      (u._count.threads > 0 ? 1 : 0) + (u._count.comments > 0 ? 1 : 0);
    return actions >= 2;
  });

  // Time to first action (approximation based on first review)
  const usersWithReviews = await prisma.user.findMany({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      reviews: { some: {} },
    },
    select: {
      createdAt: true,
      reviews: { orderBy: { createdAt: "asc" }, take: 1, select: { createdAt: true } },
    },
  });

  const timesToFirstReview = usersWithReviews
    .filter((u) => u.reviews.length > 0)
    .map((u) => (u.reviews[0].createdAt.getTime() - u.createdAt.getTime()) / (1000 * 60 * 60));

  const avgTimeToFirstReviewHours = timesToFirstReview.length > 0
    ? Math.round((timesToFirstReview.reduce((a, b) => a + b, 0) / timesToFirstReview.length) * 10) / 10
    : null;

  // Activation funnel breakdown
  const funnelSteps = [
    { step: "Signed Up", count: totalNew },
    { step: "First Vote", count: recentUsers.filter((u) => u._count.votes > 0).length },
    { step: "First Comment", count: recentUsers.filter((u) => u._count.comments > 0).length },
    { step: "First Discussion", count: recentUsers.filter((u) => u._count.threads > 0).length },
    { step: "First Review", count: reviewers.length },
    { step: "PQL (2+ actions)", count: pqls.length },
  ];

  return {
    totalNewUsers30d: totalNew,
    activatedUsers: activated.length,
    activationRate: totalNew > 0 ? Math.round((activated.length / totalNew) * 100) : 0,
    productAdoptionRate: totalNew > 0 ? Math.round((reviewers.length / totalNew) * 100) : 0,
    pqlCount: pqls.length,
    pqlRate: totalNew > 0 ? Math.round((pqls.length / totalNew) * 100) : 0,
    avgTimeToFirstReviewHours,
    activationFunnel: funnelSteps,
  };
}

async function getRetentionMetrics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  // Active users: users who performed any action in a period
  const [activeUsers7d, activeUsers30d] = await Promise.all([
    getActiveUserCount(7),
    getActiveUserCount(30),
  ]);

  const totalUsers = await prisma.user.count();

  // Churn: users active 30-60 days ago but NOT active in last 30 days
  const previouslyActive = await getActiveUserIds(60, 30);
  const currentlyActive = await getActiveUserIds(30, 0);
  const currentSet = new Set(currentlyActive);
  const churned = previouslyActive.filter((id) => !currentSet.has(id));
  const churnRate = previouslyActive.length > 0
    ? Math.round((churned.length / previouslyActive.length) * 100)
    : 0;

  // DAU/MAU stickiness
  const stickiness = activeUsers30d > 0
    ? Math.round((activeUsers7d / activeUsers30d) * 100)
    : 0;

  // Returning users (signed up before 30 days ago, active in last 30 days)
  const returningUsers = await prisma.user.count({
    where: {
      createdAt: { lt: thirtyDaysAgo },
      OR: [
        { reviews: { some: { createdAt: { gte: thirtyDaysAgo } } } },
        { votes: { some: { createdAt: { gte: thirtyDaysAgo } } } },
        { threads: { some: { createdAt: { gte: thirtyDaysAgo } } } },
        { comments: { some: { createdAt: { gte: thirtyDaysAgo } } } },
      ],
    },
  });

  return {
    activeUsers: { "7d": activeUsers7d, "30d": activeUsers30d },
    totalUsers,
    churnRate,
    churnedUsers: churned.length,
    previouslyActiveUsers: previouslyActive.length,
    stickiness,
    returningUsers,
    retentionRate: previouslyActive.length > 0
      ? Math.round(((previouslyActive.length - churned.length) / previouslyActive.length) * 100)
      : 0,
  };
}

async function getActiveUserCount(daysBack: number): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - daysBack);

  const [reviewers, voters, threadAuthors, commenters] = await Promise.all([
    prisma.review.findMany({ where: { createdAt: { gte: since } }, select: { userId: true }, distinct: ["userId"] }),
    prisma.vote.findMany({ where: { createdAt: { gte: since } }, select: { userId: true }, distinct: ["userId"] }),
    prisma.discussionThread.findMany({ where: { createdAt: { gte: since } }, select: { authorId: true }, distinct: ["authorId"] }),
    prisma.comment.findMany({ where: { createdAt: { gte: since } }, select: { authorId: true }, distinct: ["authorId"] }),
  ]);

  const uniqueIds = new Set([
    ...reviewers.map((r) => r.userId),
    ...voters.map((v) => v.userId),
    ...threadAuthors.map((t) => t.authorId),
    ...commenters.map((c) => c.authorId),
  ]);

  return uniqueIds.size;
}

async function getActiveUserIds(daysBackStart: number, daysBackEnd: number): Promise<string[]> {
  const start = new Date();
  start.setDate(start.getDate() - daysBackStart);
  const end = new Date();
  end.setDate(end.getDate() - daysBackEnd);

  const [reviewers, voters, threadAuthors, commenters] = await Promise.all([
    prisma.review.findMany({
      where: { createdAt: { gte: start, lt: end } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.vote.findMany({
      where: { createdAt: { gte: start, lt: end } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.discussionThread.findMany({
      where: { createdAt: { gte: start, lt: end } },
      select: { authorId: true },
      distinct: ["authorId"],
    }),
    prisma.comment.findMany({
      where: { createdAt: { gte: start, lt: end } },
      select: { authorId: true },
      distinct: ["authorId"],
    }),
  ]);

  const uniqueIds = new Set([
    ...reviewers.map((r) => r.userId),
    ...voters.map((v) => v.userId),
    ...threadAuthors.map((t) => t.authorId),
    ...commenters.map((c) => c.authorId),
  ]);

  return Array.from(uniqueIds);
}

async function getRevenueMetrics() {
  // ReviewIQ doesn't have subscriptions yet, so we track engagement-based
  // "revenue readiness" indicators: PQLs, power users, trust level distribution
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [trustDistribution, powerUsers, totalUsers] = await Promise.all([
    prisma.user.groupBy({
      by: ["trustLevel"],
      _count: { id: true },
    }),
    // Power users: 3+ reviews and 5+ votes
    prisma.user.count({
      where: {
        reviews: { some: {} },
        AND: [
          { reviews: { some: { createdAt: { gte: thirtyDaysAgo } } } },
        ],
      },
    }),
    prisma.user.count(),
  ]);

  // Users with high engagement (potential premium tier)
  const highEngagement = await prisma.user.findMany({
    where: {
      OR: [
        { trustLevel: "expert" },
        { trustLevel: "trusted" },
        { reputationScore: { gte: 50 } },
      ],
    },
    select: { id: true, trustLevel: true, reputationScore: true },
  });

  const trustDist = trustDistribution.map((t: { trustLevel: string; _count: { id: number } }) => ({
    level: t.trustLevel,
    count: t._count.id,
    percent: totalUsers > 0 ? Math.round((t._count.id / totalUsers) * 100) : 0,
  }));

  // Trial-to-paid proxy: newcomer → contributor conversion
  const newcomers = trustDist.find((t) => t.level === "newcomer")?.count || 0;
  const converted = totalUsers - newcomers;
  const trialToPaidProxy = totalUsers > 0
    ? Math.round((converted / totalUsers) * 100)
    : 0;

  return {
    trustLevelDistribution: trustDist,
    powerUsersActive30d: powerUsers,
    highEngagementUsers: highEngagement.length,
    trialToPaidProxy,
    totalUsers,
    revenueReadinessScore: Math.min(100, Math.round(
      (trialToPaidProxy * 0.4) + (highEngagement.length * 2) + (powerUsers * 3)
    )),
  };
}

async function getReferralMetrics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Community engagement as referral proxy
  const [
    totalThreads,
    recentThreads,
    totalComments,
    recentComments,
    helpfulVotes,
    totalReviews,
  ] = await Promise.all([
    prisma.discussionThread.count(),
    prisma.discussionThread.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.comment.count(),
    prisma.comment.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.vote.count({ where: { voteType: "helpful" } }),
    prisma.review.count(),
  ]);

  // Content creation rate (UGC)
  const activeUsers30d = await getActiveUserCount(30);
  const contentPerUser = activeUsers30d > 0
    ? Math.round(((recentThreads + recentComments) / activeUsers30d) * 10) / 10
    : 0;

  // Users with badges (community advocates)
  const advocates = await prisma.user.count({
    where: { badges: { isEmpty: false } },
  });

  return {
    communityEngagement: {
      totalThreads,
      recentThreads,
      totalComments,
      recentComments,
      helpfulVotes,
    },
    contentPerActiveUser: contentPerUser,
    communityAdvocates: advocates,
    totalReviews,
    ugcGrowthRate: totalReviews > 0
      ? Math.round(((recentThreads + recentComments) / totalReviews) * 100)
      : 0,
  };
}

async function getCohortAnalysis() {
  const now = new Date();
  const weeksToAnalyze = 6;
  const cohorts: CohortRow[] = [];

  for (let w = weeksToAnalyze - 1; w >= 0; w--) {
    const cohortStart = new Date(now);
    cohortStart.setDate(cohortStart.getDate() - (w + 1) * 7);
    const cohortEnd = new Date(now);
    cohortEnd.setDate(cohortEnd.getDate() - w * 7);

    const cohortUsers = await prisma.user.findMany({
      where: { createdAt: { gte: cohortStart, lt: cohortEnd } },
      select: { id: true },
    });

    const cohortLabel = getWeekStart(cohortStart);
    const total = cohortUsers.length;
    const retained: Record<string, number> = {};

    if (total > 0) {
      const userIds = cohortUsers.map((u) => u.id);

      // Check retention for each subsequent week
      for (let rw = 1; rw <= w; rw++) {
        const retentionStart = new Date(cohortStart);
        retentionStart.setDate(retentionStart.getDate() + rw * 7);
        const retentionEnd = new Date(retentionStart);
        retentionEnd.setDate(retentionEnd.getDate() + 7);

        const [reviewers, voters, threadAuthors, commenters] = await Promise.all([
          prisma.review.findMany({
            where: { userId: { in: userIds }, createdAt: { gte: retentionStart, lt: retentionEnd } },
            select: { userId: true },
            distinct: ["userId"],
          }),
          prisma.vote.findMany({
            where: { userId: { in: userIds }, createdAt: { gte: retentionStart, lt: retentionEnd } },
            select: { userId: true },
            distinct: ["userId"],
          }),
          prisma.discussionThread.findMany({
            where: { authorId: { in: userIds }, createdAt: { gte: retentionStart, lt: retentionEnd } },
            select: { authorId: true },
            distinct: ["authorId"],
          }),
          prisma.comment.findMany({
            where: { authorId: { in: userIds }, createdAt: { gte: retentionStart, lt: retentionEnd } },
            select: { authorId: true },
            distinct: ["authorId"],
          }),
        ]);

        const activeInWeek = new Set([
          ...reviewers.map((r) => r.userId),
          ...voters.map((v) => v.userId),
          ...threadAuthors.map((t) => t.authorId),
          ...commenters.map((c) => c.authorId),
        ]);

        retained[`week${rw}`] = activeInWeek.size;
      }
    }

    cohorts.push({ cohort: cohortLabel, total, retained });
  }

  return cohorts;
}

async function getCustomerHealthScore() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get all users with their activity
  const users = await prisma.user.findMany({
    select: {
      id: true,
      trustLevel: true,
      reputationScore: true,
      createdAt: true,
      _count: {
        select: {
          reviews: true,
          votes: true,
          threads: true,
          comments: true,
        },
      },
    },
  });

  // Score each user (0-100)
  const scoredUsers = users.map((u) => {
    const totalActions = u._count.reviews + u._count.votes + u._count.threads + u._count.comments;
    const trustMultiplier = { expert: 1.5, trusted: 1.3, contributor: 1.1, newcomer: 1.0 }[u.trustLevel] || 1.0;

    const activityScore = Math.min(40, totalActions * 4);
    const reputationBonus = Math.min(30, u.reputationScore * 0.3);
    const trustBonus = (trustMultiplier - 1) * 30;

    return {
      score: Math.min(100, Math.round(activityScore + reputationBonus + trustBonus)),
      trustLevel: u.trustLevel,
    };
  });

  // Health distribution
  const distribution = {
    healthy: scoredUsers.filter((u) => u.score >= 60).length,
    atRisk: scoredUsers.filter((u) => u.score >= 30 && u.score < 60).length,
    churning: scoredUsers.filter((u) => u.score < 30).length,
  };

  const avgScore = scoredUsers.length > 0
    ? Math.round(scoredUsers.reduce((sum, u) => sum + u.score, 0) / scoredUsers.length)
    : 0;

  return {
    averageHealthScore: avgScore,
    distribution,
    totalUsers: users.length,
    healthyPercent: users.length > 0
      ? Math.round((distribution.healthy / users.length) * 100)
      : 0,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");

  try {
    if (section === "acquisition") return NextResponse.json(await getAcquisitionMetrics());
    if (section === "activation") return NextResponse.json(await getActivationMetrics());
    if (section === "retention") return NextResponse.json(await getRetentionMetrics());
    if (section === "revenue") return NextResponse.json(await getRevenueMetrics());
    if (section === "referral") return NextResponse.json(await getReferralMetrics());
    if (section === "health") return NextResponse.json(await getCustomerHealthScore());
    if (section === "cohorts") return NextResponse.json(await getCohortAnalysis());

    // Full AARRR response
    const [northStar, acquisition, activation, retention, revenue, referral, health, cohorts] =
      await Promise.all([
        getNorthStarMetric(),
        getAcquisitionMetrics(),
        getActivationMetrics(),
        getRetentionMetrics(),
        getRevenueMetrics(),
        getReferralMetrics(),
        getCustomerHealthScore(),
        getCohortAnalysis(),
      ]);

    return NextResponse.json({
      northStar,
      acquisition,
      activation,
      retention,
      revenue,
      referral,
      customerHealth: health,
      cohorts,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("AARRR metrics error:", err);
    return NextResponse.json({ error: "Failed to compute AARRR metrics" }, { status: 500 });
  }
}
