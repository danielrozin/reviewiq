import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWeeklyDigest } from "@/lib/email/service";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const topReviews = await prisma.review.findMany({
      where: { status: "published", createdAt: { gte: oneWeekAgo } },
      orderBy: { helpfulCount: "desc" },
      take: 10,
      include: {
        product: {
          select: { name: true, slug: true, category: { select: { slug: true } } },
        },
      },
    });

    const trendingProducts = await prisma.product.findMany({
      orderBy: { smartScore: "desc" },
      take: 10,
      select: {
        name: true,
        slug: true,
        smartScore: true,
        category: { select: { slug: true } },
      },
    });

    const users = await prisma.user.findMany({
      where: {
        email: { not: null },
        OR: [
          { notificationPref: null },
          { notificationPref: { weeklyDigest: true } },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        watchlistItems: {
          include: {
            product: {
              select: { name: true, slug: true, priceMin: true, category: { select: { slug: true } } },
            },
          },
        },
      },
    });

    const reviewData = topReviews.map((r) => ({
      productName: r.product.name,
      productSlug: r.product.slug,
      categorySlug: r.product.category.slug,
      rating: r.rating,
      headline: r.headline,
    }));

    const trendingData = trendingProducts.map((p) => ({
      name: p.name,
      slug: p.slug,
      categorySlug: p.category.slug,
      smartScore: p.smartScore,
    }));

    let sent = 0;

    for (const user of users) {
      if (!user.email) continue;

      const priceDrops = user.watchlistItems
        .filter((w) => w.lastKnownPrice > 0 && w.product.priceMin < w.lastKnownPrice)
        .map((w) => ({
          productName: w.product.name,
          productSlug: w.product.slug,
          categorySlug: w.product.category.slug,
          oldPrice: w.lastKnownPrice,
          newPrice: w.product.priceMin,
        }));

      const success = await sendWeeklyDigest({
        userId: user.id,
        email: user.email,
        userName: user.name || "",
        topReviews: reviewData,
        trendingProducts: trendingData,
        priceDrops,
      });

      if (success) {
        sent++;
        await prisma.emailLog.create({
          data: { userId: user.id, emailType: "weekly_digest" },
        });
      }
    }

    return NextResponse.json({ sent, totalUsers: users.length });
  } catch (error) {
    console.error("Failed to send weekly digest:", error);
    return NextResponse.json({ error: "Failed to send weekly digest" }, { status: 500 });
  }
}
