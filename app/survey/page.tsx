import type { Metadata } from "next";
import { EmailSurveyForm } from "@/components/survey/EmailSurveyForm";
import { isIntentValue } from "@/lib/survey/email-channel";

export const metadata: Metadata = {
  title: "Quick 30-Second Survey — Help Shape ReviewIQ",
  description:
    "Three quick questions about why you visit ReviewIQ and what would make it more useful. Takes under 30 seconds.",
  robots: { index: false, follow: false },
};

/**
 * Dedicated email-survey landing page (DAN-984).
 *
 * This is NOT the on-site popup — it's the destination for the one-click link in
 * the survey-invite email. The link can prefill Q1 intent via `?intent=<code>`
 * so the recipient lands one question deep. Responses persist to the same survey
 * DB as the on-site instrument (POST /api/surveys), tagged as the email channel,
 * so email + on-site totals roll up together for DAN-176.
 *
 * Funnel: a `landing_view` event is emitted on mount (inside the form), the
 * `email_sent`/`email_open` events are emitted by the send pipeline / open pixel.
 */
export default async function SurveyPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const { intent } = await searchParams;
  const prefillIntent = isIntentValue(intent) ? intent : undefined;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">ReviewIQ</h1>
          <p className="text-sm text-gray-500 mt-1">
            A few quick questions — under 30 seconds, no account needed.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <EmailSurveyForm prefillIntent={prefillIntent} />
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          Your answers are anonymous and help us build a better review platform.
        </p>
      </div>
    </main>
  );
}
