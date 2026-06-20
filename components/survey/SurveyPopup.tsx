"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { trackEvent } from "@/lib/tracking/analytics";

const STORAGE_KEY = "sr_survey_completed";
// Friction reduction (DAN-983): trigger sooner than the old 30s so fast sessions
// still see the prompt before they bounce. Paired with exit-intent / scroll-depth
// triggers below for sessions that leave before even 12s elapses.
const SHOW_DELAY_MS = 12_000; // 12 seconds
const SCROLL_TRIGGER_RATIO = 0.5; // show once the user has scrolled 50% of the page

function deviceTypeOf(): "mobile" | "desktop" {
  return /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";
}

/**
 * Persist one funnel event to the survey table. Funnel events (DAN-983):
 * `impression` | `partial` | `dismissed` | `form_abandon` | `form_submit`.
 * Uses sendBeacon when `beacon` is set (page-leave paths: dismiss / abandon) so
 * the write survives unload, with a keepalive fetch fallback. Best-effort and
 * never throws — funnel instrumentation must not break the survey UX.
 */
function postSurveyEvent(payload: Record<string, unknown>, opts?: { beacon?: boolean }) {
  const body = JSON.stringify(payload);
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
    // Never let funnel tracking throw.
  }
}

const INTENT_OPTIONS = [
  { value: "researching", label: "Researching a product to buy" },
  { value: "comparing", label: "Comparing specific products" },
  { value: "reading_reviews", label: "Reading reviews" },
  { value: "writing_review", label: "Writing a review" },
  { value: "browsing", label: "Just browsing" },
];

const DISCOVERY_OPTIONS = [
  { value: "google", label: "Google search" },
  { value: "social", label: "Social media" },
  { value: "friend", label: "Friend / colleague" },
  { value: "direct", label: "Typed the URL directly" },
  { value: "other", label: "Other" },
];

// DAN-1170: the dedicated intro/welcome gate is removed — the popup now opens
// directly on Q1 (an answerable, single-tap prompt). Live funnel data (DAN-176 /
// DAN-1162) showed ~90% of impressions abandoned at the old `intro` screen before
// answering anything, so the gate is collapsed to convert the impressions we
// already get. "intro" is intentionally no longer a reachable step.
type Step = "q1" | "q2" | "q3" | "q4" | "q5" | "thanks";

interface Answers {
  q1Intent: string;
  q2Found: boolean | null;
  q2Missing: string;
  q3Rating: number;
  q4Improvement: string;
  q5Discovery: string;
}

export function SurveyPopup() {
  const [visible, setVisible] = useState(false);
  // Open on Q1 directly — no intro gate (DAN-1170).
  const [step, setStep] = useState<Step>("q1");
  const [answers, setAnswers] = useState<Answers>({
    q1Intent: "",
    q2Found: null,
    q2Missing: "",
    q3Rating: 0,
    q4Improvement: "",
    q5Discovery: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // --- Abandon tracking (DAN-699) ---
  // Refs mirror live state so the page-leave listeners (pagehide /
  // visibilitychange) can read the current step/answers without re-binding.
  const stepRef = useRef<Step>(step);
  const answersRef = useRef<Answers>(answers);
  // True once the survey is open and the user is mid-flow (q1..q5) and has
  // not submitted, dismissed, or reached "thanks". Only then is a page-leave an
  // abandon. submittedRef suppresses false abandons while a submit is in flight.
  const activeRef = useRef(false);
  const submittedRef = useRef(false);
  const abandonFiredRef = useRef(false);
  // Single-fire guards for the funnel (DAN-983): the popup is shown exactly once
  // per session regardless of which trigger wins, the impression is recorded
  // once, and an explicit dismissal is recorded once.
  const shownRef = useRef(false);
  const dismissFiredRef = useRef(false);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  /**
   * Fire a single `form_abandon` event: user opened/started the survey but left
   * without submitting. Records the reached step plus partial answers and
   * context (device / userAgent / referrer) for the drop-off funnel. Uses
   * sendBeacon so the write survives page unload, falling back to keepalive
   * fetch. Single-fire and suppressed once a submit is in flight or completed.
   */
  const fireAbandon = useCallback(() => {
    if (abandonFiredRef.current) return;
    if (!activeRef.current) return;
    if (submittedRef.current) return;
    abandonFiredRef.current = true;

    const reachedStep = stepRef.current;
    const a = answersRef.current;
    trackEvent("survey_form_abandon", { step: reachedStep });

    const payload = {
      event: "form_abandon",
      reachedStep,
      surveyCompleted: false,
      // Partial answers captured before leaving (where the user got to).
      q1Intent: a.q1Intent || undefined,
      q2Found: a.q2Found ?? undefined,
      q2Missing: a.q2Missing || undefined,
      q3Rating: a.q3Rating || undefined,
      q4Improvement: a.q4Improvement || undefined,
      q5Discovery: a.q5Discovery || undefined,
      deviceType: deviceTypeOf(),
      userAgent: navigator.userAgent,
      referralSource: document.referrer || undefined,
    };

    postSurveyEvent(payload, { beacon: true });
  }, []);

  /**
   * Show the popup once per session, regardless of which trigger (timer /
   * exit-intent / scroll-depth) fires first, and record an `impression` row so
   * the funnel can distinguish "popup not shown" from "shown but abandoned"
   * (DAN-983). trackEvent keeps the analytics signal; the DB write is what makes
   * the funnel queryable via GET /api/surveys.
   *
   * DAN-1170: the popup now opens on Q1, so the impression's reachedStep is "q1"
   * (no intro gate). The intro→q1 progression that the funnel tracks is therefore
   * measured as (partial@q1 + form_submit) / impression — i.e. how many shown
   * users actually answered the first question.
   */
  const showPopup = useCallback((trigger: string) => {
    if (shownRef.current) return;
    shownRef.current = true;
    setVisible(true);
    activeRef.current = true;
    trackEvent("survey_popup_shown", { trigger });
    postSurveyEvent({
      event: "impression",
      reachedStep: "q1",
      deviceType: deviceTypeOf(),
      userAgent: navigator.userAgent,
      referralSource: document.referrer || undefined,
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Primary trigger: dwell timer.
    const timer = setTimeout(() => showPopup("timer"), SHOW_DELAY_MS);

    // Secondary trigger A: exit-intent (desktop only). Mouse leaving the
    // viewport toward the top (clientY <= 0) signals the user is heading for the
    // tab bar / URL — prompt before they bounce.
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) showPopup("exit_intent");
    };
    // Secondary trigger B: scroll depth. Fast readers who scroll past 50% are
    // engaged enough to ask, even if they leave before the 12s timer.
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      if (scrollable <= 0) return;
      if (doc.scrollTop / scrollable >= SCROLL_TRIGGER_RATIO) showPopup("scroll_depth");
    };

    const isMobile = deviceTypeOf() === "mobile";
    if (!isMobile) document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
    };
  }, [showPopup]);

  // Page-leave listeners: abandon on whichever of pagehide / visibilitychange
  // (hidden) fires first. visibilitychange→hidden is the reliable last callback
  // on mobile; pagehide covers desktop navigation/unload.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPageHide = () => fireAbandon();
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") fireAbandon();
    };
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fireAbandon]);

  const dismiss = useCallback(() => {
    // Explicit close is not a page-leave abandon — stop the listeners from
    // firing one after the user deliberately dismissed the survey.
    activeRef.current = false;
    setVisible(false);
    trackEvent("survey_popup_dismissed", { step });
    // Record the dismissal in the funnel (DAN-983), with the step reached and
    // any intent captured so far. Single-fire; suppress once a submit is mid-air.
    if (dismissFiredRef.current || submittedRef.current) return;
    dismissFiredRef.current = true;
    const a = answersRef.current;
    postSurveyEvent(
      {
        event: "dismissed",
        reachedStep: step,
        surveyCompleted: false,
        q1Intent: a.q1Intent || undefined,
        deviceType: deviceTypeOf(),
        userAgent: navigator.userAgent,
        referralSource: document.referrer || undefined,
      },
      { beacon: true }
    );
  }, [step]);

  const submit = useCallback(async () => {
    // Mark submit in flight so a pagehide / backgrounding during a slow submit
    // (common on mobile) is not mis-counted as an abandon.
    submittedRef.current = true;
    activeRef.current = false;
    setSubmitting(true);
    try {
      const payload = {
        event: "form_submit",
        surveyCompleted: true,
        q1Intent: answers.q1Intent || undefined,
        q2Found: answers.q2Found ?? undefined,
        q2Missing: answers.q2Missing || undefined,
        q3Rating: answers.q3Rating || undefined,
        q4Improvement: answers.q4Improvement || undefined,
        q5Discovery: answers.q5Discovery || undefined,
        deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
        referralSource: document.referrer || undefined,
      };
      await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      trackEvent("survey_completed");
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
      setStep("thanks");
    } catch {
      // Silently fail — don't block user
      setVisible(false);
    } finally {
      setSubmitting(false);
    }
  }, [answers]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop. DAN-1179 (P2): backdrop-tap dismiss is desktop-only. On a
          phone the card is a bottom sheet and a tap just above it (in the
          backdrop) is almost always an accidental close — which both loses
          borderline users and inflates `dismissed@q1`, polluting the DAN-1175
          lift signal. On mobile the explicit ✕ is the only dismiss affordance. */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => {
          if (deviceTypeOf() === "desktop") dismiss();
        }}
      />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom-4 duration-300">
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close survey"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === "q1" && (
          <div>
            {/* DAN-1179 (P1): no "1 of 5" counter on Q1. Removing the intro
                screen (DAN-1170) but keeping the "this is a 5-question survey"
                signal on the very first frame still primes the user for
                homework at the exact moment we're trying to win the first tap.
                The counter returns from Q2 onward, once the user is engaged, so
                Q1 reads as a single question — not the opening of a survey. */}
            <h3 className="text-base font-bold text-gray-900 mb-4">What brought you here today?</h3>
            <div className="space-y-2">
              {INTENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setAnswers((a) => ({ ...a, q1Intent: opt.value }));
                    // Partial save (DAN-983): persist intent the instant it's
                    // chosen so abandoners still yield the highest-value field
                    // (DAN-162/DAN-163) even if they never submit or the
                    // page-leave beacon is dropped.
                    postSurveyEvent({
                      event: "partial",
                      reachedStep: "q1",
                      q1Intent: opt.value,
                      deviceType: deviceTypeOf(),
                      referralSource: document.referrer || undefined,
                    });
                    setStep("q2");
                  }}
                  className={`w-full text-left px-4 py-3 text-sm rounded-xl border transition-colors ${
                    answers.q1Intent === opt.value
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
            <p className="text-xs text-brand-600 font-medium mb-2">2 of 5</p>
            <h3 className="text-base font-bold text-gray-900 mb-4">Did you find what you were looking for?</h3>
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => {
                  setAnswers((a) => ({ ...a, q2Found: true }));
                  setStep("q3");
                }}
                className="flex-1 px-4 py-3 text-sm font-medium rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 text-gray-700 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setAnswers((a) => ({ ...a, q2Found: false }))}
                className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl border transition-colors ${
                  answers.q2Found === false
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-gray-200 hover:border-amber-400 hover:bg-amber-50 text-gray-700"
                }`}
              >
                Not quite
              </button>
            </div>
            {answers.q2Found === false && (
              <>
                <textarea
                  value={answers.q2Missing}
                  onChange={(e) => setAnswers((a) => ({ ...a, q2Missing: e.target.value }))}
                  placeholder="What were you looking for?"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                  rows={2}
                />
                <button
                  onClick={() => setStep("q3")}
                  className="mt-3 w-full px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors"
                >
                  Next
                </button>
              </>
            )}
          </div>
        )}

        {step === "q3" && (
          <div>
            <p className="text-xs text-brand-600 font-medium mb-2">3 of 5</p>
            <h3 className="text-base font-bold text-gray-900 mb-4">How would you rate your experience?</h3>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setAnswers((a) => ({ ...a, q3Rating: n }));
                    setStep("q4");
                  }}
                  className={`w-12 h-12 rounded-xl text-lg font-bold transition-all ${
                    answers.q3Rating === n
                      ? "bg-brand-600 text-white scale-110"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 px-1">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        )}

        {step === "q4" && (
          <div>
            <p className="text-xs text-brand-600 font-medium mb-2">4 of 5</p>
            <h3 className="text-base font-bold text-gray-900 mb-4">What could we improve?</h3>
            <textarea
              value={answers.q4Improvement}
              onChange={(e) => setAnswers((a) => ({ ...a, q4Improvement: e.target.value }))}
              placeholder="Anything at all — we read every response."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
              rows={3}
            />
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => setStep("q5")}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() => setStep("q5")}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === "q5" && (
          <div>
            <p className="text-xs text-brand-600 font-medium mb-2">5 of 5</p>
            <h3 className="text-base font-bold text-gray-900 mb-4">How did you discover ReviewIQ?</h3>
            <div className="space-y-2 mb-4">
              {DISCOVERY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAnswers((a) => ({ ...a, q5Discovery: opt.value }))}
                  className={`w-full text-left px-4 py-3 text-sm rounded-xl border transition-colors ${
                    answers.q5Discovery === opt.value
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={submit}
              disabled={submitting}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit feedback"}
            </button>
          </div>
        )}

        {step === "thanks" && (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🙏</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Thank you!</h3>
            <p className="text-sm text-gray-500 mb-4">
              Your feedback helps us build a better review platform for everyone.
            </p>
            <button
              onClick={() => setVisible(false)}
              className="px-6 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
