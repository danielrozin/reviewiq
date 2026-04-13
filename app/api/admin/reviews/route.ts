import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";
import { invalidateReviewCaches } from "@/lib/cache/redis";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { headline: { contains: search, mode: "insensitive" } },
        { body: { contains: search, mode: "insensitive" } },
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          product: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({ reviews, total, page, limit });
  } catch (error) {
    console.error("Failed to fetch admin reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse();

  try {
    const json = await request.json();
    const { ids, status, featured } = json as {
      ids: string[];
      status?: string;
      featured?: boolean;
    };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Review IDs required" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (typeof featured === "boolean") data.helpfulCount = featured ? 999 : 0;

    const result = await prisma.review.updateMany({
      where: { id: { in: ids } },
      data,
    });

    await invalidateReviewCaches();
    return NextResponse.json({ updated: result.count });
  } catch (error) {
    console.error("Failed to update reviews:", error);
    return NextResponse.json({ error: "Failed to update reviews" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Review ID required" },
        { status: 400 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id },
      include: { product: { select: { slug: true } } },
    });
    await prisma.review.delete({ where: { id } });
    await invalidateReviewCaches(review?.product?.slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete review:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
