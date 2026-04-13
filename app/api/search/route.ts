import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchLimiter } from "@/lib/rate-limit";
import { sanitizeSearchQuery } from "@/lib/sanitize";
import { cacheGet, cacheSet, CacheKey, CacheTTL } from "@/lib/cache/redis";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateCheck = searchLimiter.check(ip);
  if (!rateCheck.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = sanitizeSearchQuery(searchParams.get("q") || "");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], total: 0 });
  }

  try {
    const cacheKey = CacheKey.search(q.toLowerCase(), limit);
    const cached = await cacheGet<{ products: unknown[]; total: number }>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { brand: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { smartScore: "desc" },
      include: {
        category: { select: { name: true, slug: true } },
      },
    });

    const result = { products, total: products.length };
    await cacheSet(cacheKey, result, CacheTTL.SEARCH);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to search products:", error);
    return NextResponse.json({ error: "Failed to search products" }, { status: 500 });
  }
}
