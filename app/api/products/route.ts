import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { cacheGet, cacheSet, CacheKey, CacheTTL } from "@/lib/cache/redis";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const cacheKey = CacheKey.productList(`${categoryId || "all"}:${page}:${limit}`);
    const cached = await cacheGet<{ products: unknown[]; total: number; page: number; limit: number }>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = categoryId;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { smartScore: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithStats = await Promise.all(
      products.map(async (product: (typeof products)[number]) => {
        const avgRating = await prisma.review.aggregate({
          where: { productId: product.id },
          _avg: { rating: true },
        });
        return {
          ...product,
          reviewCount: product._count.reviews,
          averageRating: avgRating._avg.rating || 0,
        };
      })
    );

    const result = { products: productsWithStats, total, page, limit };
    await cacheSet(cacheKey, result, CacheTTL.PRODUCT_LIST);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
