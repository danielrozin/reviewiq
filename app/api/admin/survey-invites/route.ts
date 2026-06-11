import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";
import { getAudienceCounts } from "@/lib/survey/email-audience";
import { sendSurveyInvites } from "@/lib/survey/email-invite";
import { isIntentValue } from "@/lib/survey/email-channel";

export const dynamic = "force-dynamic";

/**
 * Operator console for the consent-gated survey-invite send (DAN-984).
 *
 *   GET  -> audience diagnostics (counts only, sends nothing). Run this first to
 *           see the real eligible size against LIVE consent state.
 *   POST -> staged send. DRY-RUN BY DEFAULT: it resolves the batch and renders
 *           emails but sends nothing unless the body contains `confirm: true`.
 *           This protects the one-time ask — a real send is a deliberate,
 *           admin-authenticated, explicitly-confirmed action.
 *
 * Both require the admin cookie (verifyAdmin).
 */
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse();
  try {
    const counts = await getAudienceCounts();
    return NextResponse.json({ counts });
  } catch (error) {
    console.error("survey-invites audience count failed:", error);
    return NextResponse.json({ error: "Failed to count audience" }, { status: 500 });
  }
}

const sendSchema = z.object({
  confirm: z.boolean().optional(),
  limit: z.number().int().min(1).max(2000).optional(),
  batch: z.string().max(64).optional(),
  reviewersOnly: z.boolean().optional(),
  prefillIntentForAll: z.string().optional(),
});

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) return unauthorizedResponse();
  try {
    const body = sendSchema.parse(await request.json().catch(() => ({})));
    const intent =
      body.prefillIntentForAll && isIntentValue(body.prefillIntentForAll)
        ? body.prefillIntentForAll
        : undefined;

    // Batch-1 default cap of 150 keeps the first wave inside the issue's
    // 150-200 guardrail unless the operator overrides `limit`.
    const result = await sendSurveyInvites({
      dryRun: body.confirm !== true,
      limit: body.limit ?? 150,
      batch: body.batch,
      reviewersOnly: body.reviewersOnly,
      prefillIntentForAll: intent,
    });

    return NextResponse.json({
      dryRun: body.confirm !== true,
      ...result,
      // Don't leak full recipient emails in the response body; summarize.
      recipients: undefined,
      recipientCount: result.recipients.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("survey-invites send failed:", error);
    return NextResponse.json({ error: "Failed to send invites" }, { status: 500 });
  }
}
