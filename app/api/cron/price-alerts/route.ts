import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPriceDropAlert } from "@/lib/email/service";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find all watchlist items where the product price has dropped
  const watchlistItems = await prisma.watchlistItem.findMany({
    where: { lastKnownPrice: { gt: 0 } },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          priceMin: true,
          category: { select: { slug: true } },
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          notificationPref: { select: { priceAlerts: true } },
        },
      },
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const item of watchlistItems) {
    const currentPrice = item.product.priceMin;
    if (currentPrice >= item.lastKnownPrice) continue;

    // Check user preference
    if (item.user.notificationPref && !item.user.notificationPref.priceAlerts) {
      skipped++;
      continue;
    }

    if (!item.user.email) continue;

    const success = await sendPriceDropAlert({
      userId: item.user.id,
      email: item.user.email,
      productName: item.product.name,
      productSlug: item.product.slug,
      categorySlug: item.product.category.slug,
      oldPrice: item.lastKnownPrice,
      newPrice: currentPrice,
    });

    if (success) {
      sent++;
      await prisma.emailLog.create({
        data: {
          userId: item.user.id,
          emailType: "price_alert",
          productId: item.product.id,
        },
      });
    }

    // Update last known price
    await prisma.watchlistItem.update({
      where: { id: item.id },
      data: { lastKnownPrice: currentPrice },
    });
  }

  // Also update lastKnownPrice for items that had 0 (newly added)
  const newItems = await prisma.watchlistItem.findMany({
    where: { lastKnownPrice: 0 },
    include: { product: { select: { priceMin: true } } },
  });
  for (const item of newItems) {
    await prisma.watchlistItem.update({
      where: { id: item.id },
      data: { lastKnownPrice: item.product.priceMin },
    });
  }

  return NextResponse.json({ sent, skipped, checked: watchlistItems.length });
}
