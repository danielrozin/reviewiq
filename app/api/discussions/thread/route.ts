import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createThreadSchema = z.object({
  title: z.string().min(5).max(300),
  body: z.string().min(10),
  threadType: z.enum([
    "question", "discussion", "issue", "recommendation",
    "comparison", "long_term_update", "warning", "positive_surprise", "tip",
  ]),
  authorId: z.string().min(1),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = createThreadSchema.parse(json);

    const thread = await prisma.discussionThread.create({
      data: {
        title: data.title,
        body: data.body,
        threadType: data.threadType,
        authorId: data.authorId,
        productId: data.productId,
        categoryId: data.categoryId,
        tags: data.tags ?? [],
      },
      include: {
        author: { select: { id: true, name: true, image: true, trustLevel: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(thread, { status: 201 });
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
  const categoryId = searchParams.get("categoryId");
  const threadType = searchParams.get("type");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

  const where = {
    status: "active",
    ...(productId ? { productId } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(threadType ? { threadType } : {}),
  };

  const [threads, total] = await Promise.all([
    prisma.discussionThread.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: { select: { id: true, name: true, image: true, trustLevel: true } },
        product: { select: { id: true, name: true, slug: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.discussionThread.count({ where }),
  ]);

  return NextResponse.json({ threads, total, page, limit });
}
