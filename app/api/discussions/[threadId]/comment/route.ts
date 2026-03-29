import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCommentSchema = z.object({
  authorId: z.string().min(1),
  body: z.string().min(1),
  parentId: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const json = await request.json();
    const data = createCommentSchema.parse(json);

    const thread = await prisma.discussionThread.findUnique({
      where: { id: threadId },
    });
    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        threadId,
        authorId: data.authorId,
        body: data.body,
        parentId: data.parentId,
      },
      include: {
        author: { select: { id: true, name: true, image: true, trustLevel: true } },
      },
    });

    // Increment thread comment count
    await prisma.discussionThread.update({
      where: { id: threadId },
      data: { commentCount: { increment: 1 }, updatedAt: new Date() },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { threadId, parentId: null, status: "published" },
      orderBy: [{ isTopAnswer: "desc" }, { createdAt: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: { select: { id: true, name: true, image: true, trustLevel: true } },
        replies: {
          where: { status: "published" },
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, image: true, trustLevel: true } },
          },
        },
      },
    }),
    prisma.comment.count({ where: { threadId, parentId: null, status: "published" } }),
  ]);

  return NextResponse.json({ comments, total, page, limit });
}
