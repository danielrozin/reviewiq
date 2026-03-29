import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reportSchema = z.object({
  contentType: z.enum(["thread", "comment", "review"]),
  contentId: z.string().min(1),
  reporterId: z.string().min(1),
  reason: z.enum([
    "spam", "fake_review", "harassment", "misinformation",
    "off_topic", "duplicate", "self_promotion",
  ]),
  details: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = reportSchema.parse(json);

    // Check for duplicate report
    const existing = await prisma.moderationReport.findFirst({
      where: {
        contentType: data.contentType,
        contentId: data.contentId,
        reporterId: data.reporterId,
        status: "pending",
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already reported this content" },
        { status: 409 }
      );
    }

    const report = await prisma.moderationReport.create({ data });

    // Auto-flag content if it reaches 3+ pending reports
    const reportCount = await prisma.moderationReport.count({
      where: {
        contentType: data.contentType,
        contentId: data.contentId,
        status: "pending",
      },
    });

    if (reportCount >= 3) {
      if (data.contentType === "review") {
        await prisma.review.update({
          where: { id: data.contentId },
          data: { status: "flagged" },
        });
      } else if (data.contentType === "thread") {
        await prisma.discussionThread.update({
          where: { id: data.contentId },
          data: { status: "locked" },
        });
      } else if (data.contentType === "comment") {
        await prisma.comment.update({
          where: { id: data.contentId },
          data: { status: "flagged" },
        });
      }
    }

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
