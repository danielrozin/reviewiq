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

    // Email notification for human-readable feedback only.
    // Notify ONLY on a completed submission. Funnel rows (impression / partial /
    // dismissed / form_abandon on-site, plus the email channel's email_sent /
    // email_open / landing_view / partial — DAN-984; on-site drop-off — DAN-983)
    // are high-volume signals with nothing to read, so they live in the
    // table/funnel and never trigger an email. This is essential now that a
    // single email send writes ~150 email_sent rows that would otherwise each
    // fire a notification.
    //
    // AWAITED on purpose (DAN-1276): an un-awaited send is dropped when Vercel
    // freezes the serverless instance right after the response. A send failure
    // must never 500 the submission, so it is wrapped and logged, not rethrown.
    if (data.surveyCompleted === true) {
      try {
        await notifyNewFeedback(data);
      } catch (err) {
        console.error("[EMAIL][surveys] feedback notification threw:", err);
      }
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

// Survey read access is gated behind a static bearer token (DAN-1519) so the
// raw funnel data is queryable from the public network (e.g. the UX Designer's
// workspace via curl) without exposing it to anonymous traffic. Fail closed:
// if SURVEY_ADMIN_TOKEN is unset the route always 401s rather than leaking data.
function isAuthorizedRead(request: NextRequest): boolean {
  const expected = process.env.SURVEY_ADMIN_TOKEN;
  if (!expected) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${expected}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedRead(request)) {
    return NextResponse.json(
      { error: "Unauthorized — provide 'Authorization: Bearer <SURVEY_ADMIN_TOKEN>'" },
      { status: 401 },
    );
  }

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

    // Paginated rows respect the query filters; the aggregate summary below is
    // computed over the WHOLE table so DAN-176 gets stable global totals
    // regardless of the current filter/page.
    const [surveys, total, grandTotal, completions, eventGroups, q1Groups, earliest] =
      await Promise.all([
        prisma.smartreviewSurvey.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.smartreviewSurvey.count({ where }),
        prisma.smartreviewSurvey.count(),
        prisma.smartreviewSurvey.count({ where: { surveyCompleted: true } }),
        prisma.smartreviewSurvey.groupBy({ by: ["event"], _count: { _all: true } }),
        prisma.smartreviewSurvey.groupBy({
          by: ["q1Intent"],
          _count: { _all: true },
          where: { q1Intent: { not: null } },
        }),
        prisma.smartreviewSurvey.findFirst({
          orderBy: { createdAt: "asc" },
          select: { createdAt: true },
        }),
      ]);

    const eventBreakdown: Record<string, number> = {};
    for (const g of eventGroups) {
      eventBreakdown[g.event ?? "(null)"] = g._count._all;
    }
    const q1IntentBreakdown: Record<string, number> = {};
    for (const g of q1Groups) {
      if (g.q1Intent) q1IntentBreakdown[g.q1Intent] = g._count._all;
    }

    const impressions = eventBreakdown["impression"] ?? 0;
    const dismissals = eventBreakdown["dismissed"] ?? 0;
    const funnelConversionRate =
      impressions > 0 ? Number((completions / impressions).toFixed(4)) : null;

    return NextResponse.json({
      surveys,
      total,
      limit,
      offset,
      aggregate: {
        totalRows: grandTotal,
        impressions,
        completions,
        dismissals,
        eventBreakdown,
        q1IntentBreakdown,
        funnelConversionRate,
        since: earliest?.createdAt ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to fetch surveys:", error);
    return NextResponse.json({ error: "Failed to fetch surveys" }, { status: 500 });
  }
}
