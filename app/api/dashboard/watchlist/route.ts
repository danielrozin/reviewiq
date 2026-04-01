import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const watchlistSchema = z.object({
  userId: z.string().min(1),
  productId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const data = watchlistSchema.parse(await request.json());

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { smartScore: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const item = await prisma.watchlistItem.upsert({
      where: {
        userId_productId: { userId: data.userId, productId: data.productId },
      },
      update: { lastKnownScore: product.smartScore },
      create: {
        userId: data.userId,
        productId: data.productId,
        lastKnownScore: product.smartScore,
      },
      include: { product: { select: { id: true, name: true, slug: true, image: true, smartScore: true } } },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const productId = searchParams.get("productId");

  if (!userId || !productId) {
    return NextResponse.json({ error: "userId and productId required" }, { status: 400 });
  }

  await prisma.watchlistItem.deleteMany({
    where: { userId, productId },
  });

  return NextResponse.json({ success: true });
}
