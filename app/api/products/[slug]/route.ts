import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet, CacheKey, CacheTTL } from "@/lib/cache/redis";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const cacheKey = CacheKey.productDetail(slug);
  const cached = await cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      specs: true,
      aiSummary: true,
      issues: true,
      faqs: true,
      videos: true,
      reviews: {
        where: { status: "published" },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          user: { select: { id: true, name: true, image: true, trustLevel: true } },
        },
      },
      threads: {
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          author: { select: { id: true, name: true, image: true } },
          _count: { select: { comments: true } },
        },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await cacheSet(cacheKey, product, CacheTTL.PRODUCT_DETAIL);
  return NextResponse.json(product);
}
