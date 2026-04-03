import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { reviewLimiter } from "@/lib/rate-limit";
import { sanitizeReviewContent } from "@/lib/sanitize";
import { cacheGet, cacheSet, CacheKey, CacheTTL, invalidateReviewCaches } from "@/lib/cache/redis";
import { notifyWatchersOfNewReview } from "@/lib/email/notify-review";

const createReviewSchema = z.object({
  productId: z.string().min(1),
  userId: z.string().min(1),
  headline: z.string().min(3).max(200),
  rating: z.number().int().min(1).max(5),
  verifiedPurchase: z.boolean().optional(),
  verificationTier: z.string().optional(),
  timeOwned: z.string().optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "expert"]).optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  reliabilityRating: z.number().int().min(1).max(5).optional(),
  easeOfUseRating: z.number().int().min(1).max(5).optional(),
  valueRating: z.number().int().min(1).max(5).optional(),
  body: z.string().min(10),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateCheck = reviewLimiter.check(ip);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: "Too many reviews. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rateCheck.reset - Date.now()) / 1000)) } }
    );
  }

  try {
    const json = await request.json();
    const data = createReviewSchema.parse(json);
    const sanitizedHeadline = sanitizeReviewContent(data.headline);
    const sanitizedBody = sanitizeReviewContent(data.body);

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        headline: sanitizedHeadline,
        rating: data.rating,
        verifiedPurchase: data.verifiedPurchase ?? false,
        verificationTier: data.verificationTier ?? "unverified",
        timeOwned: data.timeOwned,
        experienceLevel: data.experienceLevel ?? "intermediate",
        pros: data.pros ?? [],
        cons: data.cons ?? [],
        reliabilityRating: data.reliabilityRating,
        easeOfUseRating: data.easeOfUseRating,
        valueRating: data.valueRating,
        body: sanitizedBody,
      },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    // Update product review count
    await prisma.product.update({
      where: { id: data.productId },
      data: { reviewCount: { increment: 1 } },
    });

    // Invalidate caches for this product
    await invalidateReviewCaches(product.slug);

    // Notify watchers (fire and forget)
    notifyWatchersOfNewReview({
      productId: data.productId,
      reviewerId: data.userId,
      reviewerName: review.user?.name || "Anonymous",
      rating: data.rating,
      headline: sanitizedHeadline,
    }).catch(() => {});

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
  const sortBy = searchParams.get("sort") ?? "createdAt";

  const cacheKey = CacheKey.reviews(`${productId || "all"}:${sortBy}:${page}:${limit}`);
  const cached = await cacheGet<{ reviews: unknown[]; total: number; page: number; limit: number }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const where = {
    status: "published",
    ...(productId ? { productId } : {}),
  };

  const orderBy =
    sortBy === "helpful"
      ? { helpfulCount: "desc" as const }
      : sortBy === "rating"
        ? { rating: "desc" as const }
        : { createdAt: "desc" as const };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { id: true, name: true, image: true, trustLevel: true } } },
    }),
    prisma.review.count({ where }),
  ]);

  const result = { reviews, total, page, limit };
  await cacheSet(cacheKey, result, CacheTTL.REVIEWS);

  return NextResponse.json(result);
}
