import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";
import { z } from "zod";
import { invalidateProductCaches } from "@/lib/cache/redis";

export const dynamic = "force-dynamic";

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  brand: z.string().min(1),
  categoryId: z.string().min(1),
  description: z.string().min(1),
  image: z.string().url(),
  priceMin: z.number().int().min(0),
  priceMax: z.number().int().min(0),
  priceCurrency: z.string().default("USD"),
  smartScore: z.number().int().min(0).max(100).default(0),
});

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { brand: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page, limit });
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse();

  try {
    const json = await request.json();
    const data = productSchema.parse(json);

    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Product with this slug already exists" },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data,
      include: { category: { select: { name: true } } },
    });

    await invalidateProductCaches();
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse();

  try {
    const json = await request.json();
    const { id, ...rest } = json;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 }
      );
    }

    const data = productSchema.partial().parse(rest);

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: { select: { name: true } } },
    });

    await invalidateProductCaches(data.slug);
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Product ID required" },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({ where: { id }, select: { slug: true } });
  await prisma.product.delete({ where: { id } });
  await invalidateProductCaches(product?.slug);
  return NextResponse.json({ success: true });
}
