import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const voteSchema = z.object({
  userId: z.string().min(1),
  voteType: z.enum(["upvote", "downvote", "helpful", "agree", "same_issue", "owner_confirmed"]),
  reviewId: z.string().optional(),
  threadId: z.string().optional(),
  commentId: z.string().optional(),
}).refine(
  (d) => [d.reviewId, d.threadId, d.commentId].filter(Boolean).length === 1,
  { message: "Provide exactly one of reviewId, threadId, or commentId" }
);

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = voteSchema.parse(json);

    // Check for existing vote (toggle behavior)
    const existing = await prisma.vote.findFirst({
      where: {
        userId: data.userId,
        voteType: data.voteType,
        reviewId: data.reviewId ?? null,
        threadId: data.threadId ?? null,
        commentId: data.commentId ?? null,
      },
    });

    if (existing) {
      // Remove vote (toggle off)
      await prisma.vote.delete({ where: { id: existing.id } });
      await updateVoteCount(data, -1);
      return NextResponse.json({ action: "removed" });
    }

    // Create vote
    await prisma.vote.create({ data });
    await updateVoteCount(data, 1);

    return NextResponse.json({ action: "created" }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function updateVoteCount(
  data: { voteType: string; reviewId?: string; threadId?: string; commentId?: string },
  delta: number
) {
  const isUp = data.voteType === "upvote" || data.voteType === "helpful" || data.voteType === "agree";
  const field = data.voteType === "helpful" ? "helpfulCount" : isUp ? "upvotes" : "downvotes";

  if (data.reviewId) {
    const updateField = data.voteType === "helpful" ? "helpfulCount" : undefined;
    if (updateField) {
      await prisma.review.update({
        where: { id: data.reviewId },
        data: { [updateField]: { increment: delta } },
      });
    }
  } else if (data.threadId) {
    await prisma.discussionThread.update({
      where: { id: data.threadId },
      data: { [field]: { increment: delta } },
    });
  } else if (data.commentId) {
    await prisma.comment.update({
      where: { id: data.commentId },
      data: { [field]: { increment: delta } },
    });
  }
}
