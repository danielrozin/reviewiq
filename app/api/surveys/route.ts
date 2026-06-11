import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { notifyNewFeedback } from "@/lib/email/notify-feedback";

const createSurveySchema = z.object({
  event: z.string().max(64).optional(),
  reachedStep: z.string().max(64).optional(),
  userType: z.string().optional(),
  actionType: z.string().optional(),
  category: z.string().optional(),
  reviewCompletionTimeSec: z.number().int().nonnegative().optional(),
  formFieldsFilled: z.number().int().nonnegative().optional(),
  surveyCompleted: z.boolean().optional(),
  q1Intent: z.string().optional(),
  q2Found: z.boolean().optional(),
  q2Missing: z.string().optional(),
  q3Rating: z.number().int().min(1).max(5).optional(),
  q4Improvement: z.string().optional(),
  q5Discovery: z.string().optional(),
  deviceType: z.string().optional(),
  userAgent: z.string().max(1024).optional(),
  referralSource: z.string().optional(),
  optInEmail: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = createSurveySchema.parse(json);

    const survey = await prisma.smartreviewSurvey.create({
      data: {
        event: data.event ?? null,
        reachedStep: data.reachedStep ?? null,
        userType: data.userType ?? null,
        actionType: data.actionType ?? null,
        category: data.category ?? null,
        reviewCompletionTimeSec: data.reviewCompletionTimeSec ?? null,
        formFieldsFilled: data.formFieldsFilled ?? null,
        surveyCompleted: data.surveyCompleted ?? false,
        q1Intent: data.q1Intent ?? null,
        q2Found: data.q2Found ?? null,
        q2Missing: data.q2Missing ?? null,
        q3Rating: data.q3Rating ?? null,
        q4Improvement: data.q4Improvement ?? null,
        q5Discovery: data.q5Discovery ?? null,
        deviceType: data.deviceType ?? null,
        userAgent: data.userAgent ?? null,
        referralSource: data.referralSource ?? null,
        optInEmail: data.optInEmail ?? null,
      },
    });

    // Fire-and-forget email notification for human-readable feedback only.
    // Notify ONLY on a completed submission. Funnel rows (impression / partial /
    // dismissed / form_abandon on-site, plus the email channel's email_sent /
    // email_open / landing_view / partial — DAN-984) are high-volume drop-off
    // signals with nothing to read, so they live in the table/funnel and never
    // trigger an email. This is essential now that a single email send writes
    // ~150 email_sent rows that would otherwise each fire a notification.
    if (data.surveyCompleted === true) {
      notifyNewFeedback(data).catch(() => {});
    }

    return NextResponse.json({ id: survey.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Failed to submit survey:", error);
    return NextResponse.json({ error: "Failed to submit survey" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const category = sp.get("category") || undefined;
    const userType = sp.get("userType") || undefined;
    const surveyCompleted = sp.get("surveyCompleted");
    const limit = Math.min(Number(sp.get("limit")) || 50, 200);
    const offset = Number(sp.get("offset")) || 0;

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (userType) where.userType = userType;
    if (surveyCompleted !== null && surveyCompleted !== undefined) {
      where.surveyCompleted = surveyCompleted === "true";
    }

    const [surveys, total] = await Promise.all([
      prisma.smartreviewSurvey.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.smartreviewSurvey.count({ where }),
    ]);

    return NextResponse.json({ surveys, total, limit, offset });
  } catch (error) {
    console.error("Failed to fetch surveys:", error);
    return NextResponse.json({ error: "Failed to fetch surveys" }, { status: 500 });
  }
}
