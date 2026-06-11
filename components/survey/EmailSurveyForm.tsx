"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  EMAIL_CHANNEL,
  EmailFunnelEvent,
  EmailFunnelStep,
  INTENT_OPTIONS,
  ACCOUNT_OPTIONS,
  FREQUENCY_OPTIONS,
  accountActionType,
  frequencyField,
  type IntentValue,
  type AccountValue,
  type FrequencyValue,
} from "@/lib/survey/email-channel";

/**
 * Best-effort funnel write to the shared survey table. Never throws — survey UX
 * must not break on instrumentation. Mirrors the on-site popup's postSurveyEvent
 * but always tags `referralSource: EMAIL_CHANNEL` so the channel is separable.
 */
function postEvent(payload: Record<string, unknown>, opts?: { beacon?: boolean }) {
  const body = JSON.stringify({ ...payload, referralSource: EMAIL_CHANNEL });
  try {
    if (opts?.beacon && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon("/api/surveys", blob)) return;
    }
    void fetch("/api/surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never throw */
  }
}

function deviceTypeOf(): "mobile" | "desktop" {
  return typeof navigator !== "undefined" && /Mobi|Android/i.test(navigator.userAgent)
    ? "mobile"
    : "desktop";
}

type Step = "q1" | "q2" | "q3" | "q4" | "thanks";

export function EmailSurveyForm({ prefillIntent }: { prefillIntent?: IntentValue }) {
  // If Q1 arrives prefilled from the email link, land the user one question deep.
  const [step, setStep] = useState<Step>(prefillIntent ? "q2" : "q1");
  const [intent, setIntent] = useState<IntentValue | "">(prefillIntent ?? "");
  const [barrier, setBarrier] = useState("");
  const [account, setAccount] = useState<AccountValue | "">("");
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState<FrequencyValue>("major");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const landingFiredRef = useRef(false);
  const partialFiredRef = useRef(false);

  // Landing view (once). If Q1 was prefilled, also record it as the first
  // partial so a prefilled-but-abandoned visit still yields the intent.
  useEffect(() => {
    if (landingFiredRef.current) return;
    landingFiredRef.current = true;
    postEvent({
      event: EmailFunnelEvent.LandingView,
      reachedStep: prefillIntent ? EmailFunnelStep.Q1 : EmailFunnelStep.Landing,
      q1Intent: prefillIntent || undefined,
      deviceType: deviceTypeOf(),
    });
    if (prefillIntent) partialFiredRef.current = true;
  }, [prefillIntent]);

  // Persist intent the instant it's chosen (highest-value partial), so an
  // abandoner still yields Q1 even if they never submit.
  const recordPartial = useCallback((value: IntentValue) => {
    if (partialFiredRef.current) return;
    partialFiredRef.current = true;
    postEvent({
      event: EmailFunnelEvent.Partial,
      reachedStep: EmailFunnelStep.Q1,
      q1Intent: value,
      deviceType: deviceTypeOf(),
    });
  }, []);

  const chooseIntent = (value: IntentValue) => {
    setIntent(value);
    recordPartial(value);
    setStep("q2");
  };

  const submit = useCallback(async () => {
    setSubmitting(true);
    setError(false);
    const trimmedEmail = email.trim();
    const payload: Record<string, unknown> = {
      event: EmailFunnelEvent.Submit,
      reachedStep: EmailFunnelStep.Submitted,
      surveyCompleted: true,
      q1Intent: intent || undefined,
      q2Missing: barrier.trim() || undefined,
      actionType: account ? accountActionType(account) : undefined,
      deviceType: deviceTypeOf(),
    };
    // Optional email capture (Q4): only attach when a valid-looking address is
    // given. Frequency is meaningful only alongside an opted-in email.
    if (trimmedEmail && /.+@.+\..+/.test(trimmedEmail)) {
      payload.optInEmail = trimmedEmail;
      payload.q4Improvement = frequencyField(frequency);
    }
    try {
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, referralSource: EMAIL_CHANNEL }),
      });
      if (!res.ok) throw new Error("bad status");
      setStep("thanks");
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }, [intent, barrier, account, email, frequency]);

  const Progress = ({ n }: { n: number }) => (
    <p className="text-xs text-brand-600 font-medium mb-2">{`Question ${n} of 3`}</p>
  );

  if (step === "thanks") {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🙏</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Thank you!</h2>
        <p className="text-sm text-gray-500">
          Your answers go straight to the team building ReviewIQ.
        </p>
      </div>
    );
  }

  return (
    <div>
      {step === "q1" && (
        <div>
          <Progress n={1} />
          <h2 className="text-base font-bold text-gray-900 mb-4">
            What brings you to ReviewIQ?
          </h2>
          <div className="space-y-2">
            {INTENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => chooseIntent(opt.value)}
                className={`w-full text-left px-4 py-3 text-sm rounded-xl border transition-colors ${
                  intent === opt.value
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "q2" && (
        <div>
          <Progress n={2} />
          <h2 className="text-base font-bold text-gray-900 mb-2">
            What stops you from writing a review or signing up?
          </h2>
          <p className="text-xs text-gray-400 mb-3">Optional — but it&apos;s the most useful answer.</p>
          <textarea
            value={barrier}
            onChange={(e) => setBarrier(e.target.value)}
            placeholder="e.g. takes too long, don't trust it, no reason to make an account…"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
            rows={3}
          />
          <button
            onClick={() => setStep("q3")}
            className="mt-3 w-full px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {step === "q3" && (
        <div>
          <Progress n={3} />
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Would you create an account for review tracking &amp; SmartScore alerts?
          </h2>
          <div className="space-y-2">
            {ACCOUNT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setAccount(opt.value);
                  setStep("q4");
                }}
                className={`w-full text-left px-4 py-3 text-sm rounded-xl border transition-colors ${
                  account === opt.value
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "q4" && (
        <div>
          <p className="text-xs text-gray-400 font-medium mb-2">Optional</p>
          <h2 className="text-base font-bold text-gray-900 mb-2">
            Want SmartScore change notifications?
          </h2>
          <p className="text-xs text-gray-400 mb-3">
            Leave your email to get notified when scores change. Skip if you&apos;d rather not.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          {email.trim() && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">How often?</p>
              <div className="flex flex-wrap gap-2">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFrequency(opt.value)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      frequency === opt.value
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {error && (
            <p className="mt-3 text-xs text-red-500">
              Something went wrong — please try submitting again.
            </p>
          )}
          <button
            onClick={submit}
            disabled={submitting}
            className="mt-4 w-full px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      )}
    </div>
  );
}
