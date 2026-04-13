import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

function wowChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+new" : "flat";
  const pct = Math.round(((current - previous) / previous) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

function trend(current: number, previous: number): "up" | "down" | "flat" {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "flat";
}

export async function GET() {
  try {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const weekNum = Math.ceil(((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);
    const periodStart = weekAgo.toISOString().split("T")[0];
    const periodEnd = now.toISOString().split("T")[0];

    const [
      totalUsers, newUsersThisWeek, newUsersPrevWeek,
      totalReviews, reviewsThisWeek, reviewsPrevWeek,
      totalVotes, votesThisWeek, votesPrevWeek,
      totalThreads, threadsThisWeek, threadsPrevWeek,
      totalComments, commentsThisWeek, commentsPrevWeek,
      totalProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
      prisma.review.count(),
      prisma.review.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.review.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
      prisma.vote.count(),
      prisma.vote.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.vote.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
      prisma.discussionThread.count(),
      prisma.discussionThread.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.discussionThread.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
      prisma.comment.count(),
      prisma.comment.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.comment.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
      prisma.product.count(),
    ]);

    const activeUsersThisWeek = await prisma.user.count({
      where: {
        OR: [
          { reviews: { some: { createdAt: { gte: weekAgo } } } },
          { votes: { some: { createdAt: { gte: weekAgo } } } },
          { threads: { some: { createdAt: { gte: weekAgo } } } },
          { comments: { some: { createdAt: { gte: weekAgo } } } },
        ],
      },
    });

    const activeUsersPrevWeek = await prisma.user.count({
      where: {
        OR: [
          { reviews: { some: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } } },
          { votes: { some: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } } },
          { threads: { some: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } } },
          { comments: { some: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } } },
        ],
      },
    });

    const trustLevels = await prisma.user.groupBy({
      by: ["trustLevel"],
      _count: true,
    });

    const topProducts = await prisma.product.findMany({
      orderBy: { reviews: { _count: "desc" } },
      take: 10,
      select: {
        name: true,
        slug: true,
        _count: { select: { reviews: true } },
      },
    });

    const dailyData: Record<string, { signups: number; reviews: number; activity: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dailyData[d.toISOString().split("T")[0]] = { signups: 0, reviews: 0, activity: 0 };
    }

    const recentUsers = await prisma.user.findMany({
      where: { createdAt: { gte: weekAgo } },
      select: { createdAt: true },
    });
    for (const u of recentUsers) {
      const day = u.createdAt.toISOString().split("T")[0];
      if (dailyData[day]) dailyData[day].signups++;
    }

    const recentReviews = await prisma.review.findMany({
      where: { createdAt: { gte: weekAgo } },
      select: { createdAt: true },
    });
    for (const r of recentReviews) {
      const day = r.createdAt.toISOString().split("T")[0];
      if (dailyData[day]) dailyData[day].reviews++;
    }

    const dailyBreakdown = Object.entries(dailyData).map(([date, counts]) => ({
      date,
      day: new Date(date + "T00:00:00Z").toLocaleDateString("en-US", { weekday: "short" }),
      ...counts,
    }));

    const activatedUsers = await prisma.user.count({
      where: {
        createdAt: { gte: weekAgo },
        OR: [
          { reviews: { some: {} } },
          { votes: { some: {} } },
          { threads: { some: {} } },
        ],
      },
    });
    const activationRate = newUsersThisWeek > 0 ? Math.round((activatedUsers / newUsersThisWeek) * 100) : 0;

    const funnel = [
      { stage: "New Signups", value: newUsersThisWeek, rate: 100 },
      { stage: "Activated Users", value: activatedUsers, rate: activationRate },
      { stage: "Reviews Written", value: reviewsThisWeek, rate: newUsersThisWeek > 0 ? Math.round((reviewsThisWeek / newUsersThisWeek) * 100) : 0 },
      { stage: "Votes Cast", value: votesThisWeek, rate: 0 },
      { stage: "Discussions", value: threadsThisWeek + commentsThisWeek, rate: 0 },
    ];

    const markdown = `# ReviewIQ Weekly Metrics Report — W${weekNum} 2026
**Period:** ${periodStart} to ${periodEnd}
**Generated:** ${now.toISOString().split("T")[0]}

---

## Executive Summary

| Metric | This Week | Prev Week | WoW Change |
|--------|-----------|-----------|------------|
| New Users | ${newUsersThisWeek} | ${newUsersPrevWeek} | ${wowChange(newUsersThisWeek, newUsersPrevWeek)} |
| Active Users | ${activeUsersThisWeek} | ${activeUsersPrevWeek} | ${wowChange(activeUsersThisWeek, activeUsersPrevWeek)} |
| Reviews | ${reviewsThisWeek} | ${reviewsPrevWeek} | ${wowChange(reviewsThisWeek, reviewsPrevWeek)} |
| Votes | ${votesThisWeek} | ${votesPrevWeek} | ${wowChange(votesThisWeek, votesPrevWeek)} |
| Discussions | ${threadsThisWeek} | ${threadsPrevWeek} | ${wowChange(threadsThisWeek, threadsPrevWeek)} |
| Comments | ${commentsThisWeek} | ${commentsPrevWeek} | ${wowChange(commentsThisWeek, commentsPrevWeek)} |

---

## Platform Inventory

| Asset | Count |
|-------|-------|
| Total Users | ${totalUsers} |
| Total Reviews | ${totalReviews} |
| Total Products | ${totalProducts} |
| Total Votes | ${totalVotes} |
| Total Threads | ${totalThreads} |
| Total Comments | ${totalComments} |

---

## Activation Funnel (New Users This Week)

| Stage | Count | Rate |
|-------|-------|------|
| New Signups | ${newUsersThisWeek} | 100% |
| Activated (any action) | ${activatedUsers} | ${activationRate}% |
| Wrote a Review | ${reviewsThisWeek} | — |

---

## Trust Level Distribution

| Level | Users |
|-------|-------|
${trustLevels.map((t) => `| ${t.trustLevel || "unset"} | ${t._count} |`).join("\n")}

---

## Top 10 Products by Reviews

| # | Product | Reviews |
|---|---------|---------|
${topProducts.map((p, i) => `| ${i + 1} | ${p.name} | ${p._count.reviews} |`).join("\n")}

---

## Key Callouts

${newUsersThisWeek === 0 ? "- **No new signups this week** — acquisition needs attention\n" : ""}${reviewsThisWeek > reviewsPrevWeek ? `- **Review volume up:** ${wowChange(reviewsThisWeek, reviewsPrevWeek)} WoW\n` : ""}${activeUsersThisWeek < 5 ? "- **Low active users** — focus on onboarding and re-engagement\n" : ""}${activationRate < 30 && newUsersThisWeek > 0 ? `- **Low activation rate (${activationRate}%)** — review onboarding flow\n` : ""}
---

## Next Actions

1. Improve onboarding flow to increase activation rate
2. Launch email re-engagement for inactive users
3. Add product comparison features to drive repeat visits
4. Implement review quality scoring

---

*Report generated automatically from ReviewIQ database.*
`;

    return NextResponse.json({
      weekNumber: weekNum,
      year: 2026,
      period: { start: periodStart, end: periodEnd },
      generatedAt: now.toISOString(),
      summary: {
        newUsers: { current: newUsersThisWeek, previous: newUsersPrevWeek, change: wowChange(newUsersThisWeek, newUsersPrevWeek), trend: trend(newUsersThisWeek, newUsersPrevWeek) },
        activeUsers: { current: activeUsersThisWeek, previous: activeUsersPrevWeek, change: wowChange(activeUsersThisWeek, activeUsersPrevWeek), trend: trend(activeUsersThisWeek, activeUsersPrevWeek) },
        reviews: { current: reviewsThisWeek, previous: reviewsPrevWeek, change: wowChange(reviewsThisWeek, reviewsPrevWeek), trend: trend(reviewsThisWeek, reviewsPrevWeek) },
        votes: { current: votesThisWeek, previous: votesPrevWeek, change: wowChange(votesThisWeek, votesPrevWeek), trend: trend(votesThisWeek, votesPrevWeek) },
        discussions: { current: threadsThisWeek, previous: threadsPrevWeek, change: wowChange(threadsThisWeek, threadsPrevWeek), trend: trend(threadsThisWeek, threadsPrevWeek) },
        comments: { current: commentsThisWeek, previous: commentsPrevWeek, change: wowChange(commentsThisWeek, commentsPrevWeek), trend: trend(commentsThisWeek, commentsPrevWeek) },
      },
      platform: {
        totalUsers, totalReviews, totalProducts, totalVotes, totalThreads, totalComments,
      },
      funnel,
      dailyBreakdown,
      topProducts: topProducts.map((p) => ({ name: p.name, slug: p.slug, reviews: p._count.reviews })),
      trustLevels: trustLevels.map((t) => ({ level: t.trustLevel || "unset", count: t._count })),
      activationRate,
      markdown,
    });
  } catch (error) {
    console.error("Failed to generate weekly report:", error);
    return NextResponse.json({ error: "Failed to generate weekly report" }, { status: 500 });
  }
}
