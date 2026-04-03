import { prisma } from "@/lib/prisma";
import { sendNewReviewAlert } from "./service";

export async function notifyWatchersOfNewReview(params: {
  productId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  headline: string;
}) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      select: { name: true, slug: true, category: { select: { slug: true } } },
    });
    if (!product) return;

    // Find users watching this product (exclude the reviewer)
    const watchers = await prisma.watchlistItem.findMany({
      where: {
        productId: params.productId,
        userId: { not: params.reviewerId },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            notificationPref: { select: { reviewAlerts: true } },
          },
        },
      },
    });

    for (const watcher of watchers) {
      if (watcher.user.notificationPref && !watcher.user.notificationPref.reviewAlerts) continue;
      if (!watcher.user.email) continue;

      const success = await sendNewReviewAlert({
        userId: watcher.user.id,
        email: watcher.user.email,
        productName: product.name,
        productSlug: product.slug,
        categorySlug: product.category.slug,
        reviewerName: params.reviewerName,
        rating: params.rating,
        headline: params.headline,
      });

      if (success) {
        await prisma.emailLog.create({
          data: {
            userId: watcher.user.id,
            emailType: "review_alert",
            productId: params.productId,
          },
        });
      }
    }
  } catch (err) {
    console.error("Failed to notify watchers of new review:", err);
  }
}
