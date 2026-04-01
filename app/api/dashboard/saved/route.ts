import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const saveSchema = z.object({
  userId: z.string().min(1),
  productId: z.string().min(1),
  note: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const data = saveSchema.parse(await request.json());

    const saved = await prisma.savedComparison.upsert({
      where: {
        userId_productId: { userId: data.userId, productId: data.productId },
      },
      update: { note: data.note },
      create: {
        userId: data.userId,
        productId: data.productId,
        note: data.note,
      },
      include: { product: { select: { id: true, name: true, slug: true, image: true, smartScore: true } } },
    });

    return NextResponse.json(saved, { status: 201 });
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

  await prisma.savedComparison.deleteMany({
    where: { userId, productId },
  });

  return NextResponse.json({ success: true });
}
