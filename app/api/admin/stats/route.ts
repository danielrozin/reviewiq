import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse();

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalProducts,
    totalCategories,
    totalReviews,
    recentReviews,
    pendingReviews,
    totalUsers,
    recentUsers,
    totalThreads,
    totalComments,
    totalVotes,
    totalSubscriptions,
    pendingReports,
    topProducts,
    recentReviewsList,
    reviewsByRating,
    userSignups,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.review.count(),
    prisma.review.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.review.count({ where: { status: "pending" } }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.discussionThread.count(),
    prisma.comment.count(),
    prisma.vote.count(),
    prisma.emailSubscription.count({ where: { unsubscribedAt: null } }),
    prisma.moderationReport.count({ where: { status: "pending" } }),
    prisma.product.findMany({
      orderBy: { reviewCount: "desc" },
      take: 10,
      include: { category: { select: { name: true } } },
    }),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        product: { select: { name: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.review.groupBy({
      by: ["rating"],
      _count: { id: true },
      orderBy: { rating: "desc" },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, name: true, email: true, createdAt: true, trustLevel: true },
    }),
  ]);

  const ratingDistribution = [5, 4, 3, 2, 1].map((r) => {
    const found = reviewsByRating.find(
      (rr: { rating: number; _count: { id: number } }) => rr.rating === r
    );
    return { rating: r, count: found?._count.id || 0 };
  });

  return NextResponse.json({
    summary: {
      totalProducts,
      totalCategories,
      totalReviews,
      recentReviews,
      pendingReviews,
      totalUsers,
      recentUsers,
      totalThreads,
      totalComments,
      totalVotes,
      totalSubscriptions,
      pendingReports,
    },
    ratingDistribution,
    topProducts,
    recentReviews: recentReviewsList,
    recentSignups: userSignups,
  });
}
