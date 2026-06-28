"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { trackEvent } from "@/lib/tracking/analytics";

const STORAGE_KEY = "sr_survey_completed";
// DAN-1508: trigger sooner. The old 20s timer meant users who bounced in <20s
// never saw the prompt — many of the form_abandon@q1 events were likely from
// users who left before the timer ever fired. 8s catches engaged users earlier
// without being as aggressive as the old 12s value.
const SHOW_DELAY_MS = 8_000; // 8 seconds (DAN-1508: was 20s)
const SCROLL_TRIGGER_RATIO = 0.5; // show once the user has scrolled 50% of the page

function deviceTypeOf(): "mobile" | "desktop" {
  return /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";
}

/**
 * Persist one funnel event to the survey table. Funnel events (DAN-983):
 * `impression` | `partial` | `dismissed` | `form_abandon`.
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

// Q1 options. Labels are kept compact so they fit as a single row of pills in
// the bottom bar; the `value` strings are unchanged from the modal era so the
// funnel (q1Intent) stays comparable across the format change.
const INTENT_OPTIONS = [
  { value: "researching", label: "Researching a product" },
  { value: "comparing", label: "Comparing products" },
  { value: "reading_reviews", label: "Reading reviews" },
  { value: "writing_review", label: "Writing a review" },
  { value: "browsing", label: "Just browsing" },
];

// DAN-1508: the survey is now a single, non-blocking sticky bottom bar that asks
// only Q1. The old multi-step blocking modal (Q1–Q5 + post-completion email
// opt-in) was the conversion bottleneck: DAN-176 funnel data showed 23
// impressions / 0 completions / 4.3% Q1 answer rate, with ~96% of users
// dismissing at Q1 without answering. Capturing Q1 — the single highest-value
// field — without overlaying the page is the win. Q2–Q5 are intentionally no
// longer asked; once Q1 is answered the bar is done.
type Step = "q1" | "thanks";

export function SurveyPopup() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<Step>("q1");
  const [selected, setSelected] = useState<string>("");

  // --- Abandon tracking (DAN-699) ---
  // `activeRef` is true once the bar is shown and Q1 is unanswered. Only then is
  // a page-leave an abandon. It flips false the moment the user answers Q1 or
  // explicitly dismisses, so neither path is mis-counted as an abandon.
  const activeRef = useRef(false);
  const abandonFiredRef = useRef(false);
  // Single-fire guards (DAN-983): the bar is shown once per session regardless of
  // which trigger wins, the impression is recorded once, and an explicit
  // dismissal is recorded once.
  const shownRef = useRef(false);
  const dismissFiredRef = useRef(false);

  /**
   * Fire a single `form_abandon` event: the user saw the bar but left without
   * answering Q1 or dismissing. Uses sendBeacon so the write survives unload.
   * Single-fire and suppressed once the bar is no longer active.
   */
  const fireAbandon = useCallback(() => {
    if (abandonFiredRef.current) return;
    if (!activeRef.current) return;
    abandonFiredRef.current = true;

    trackEvent("survey_form_abandon", { step: "q1" });
    postSurveyEvent(
      {
        event: "form_abandon",
        reachedStep: "q1",
        surveyCompleted: false,
        deviceType: deviceTypeOf(),
        userAgent: navigator.userAgent,
        referralSource: document.referrer || undefined,
      },
      { beacon: true }
    );
  }, []);

  /**
   * Show the bar once per session, regardless of which trigger (timer /
   * exit-intent / scroll-depth) fires first, and record an `impression` row so
   * the funnel can distinguish "bar not shown" from "shown but not answered"
   * (DAN-983). The funnel answer rate is therefore partial@q1 / impression.
   */
  const showBar = useCallback((trigger: string) => {
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
    const timer = setTimeout(() => showBar("timer"), SHOW_DELAY_MS);

    // Secondary trigger A: exit-intent (desktop only).
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) showBar("exit_intent");
    };
    // Secondary trigger B: scroll depth (50%).
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      if (scrollable <= 0) return;
      if (doc.scrollTop / scrollable >= SCROLL_TRIGGER_RATIO) showBar("scroll_depth");
    };

    const isMobile = deviceTypeOf() === "mobile";
    if (!isMobile) document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
    };
  }, [showBar]);

  // Page-leave listeners: abandon on whichever of pagehide / visibilitychange
  // (hidden) fires first.
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
    // firing one after the user deliberately dismissed the bar.
    activeRef.current = false;
    setVisible(false);
    trackEvent("survey_popup_dismissed", { step: "q1" });
    // Record the dismissal in the funnel (DAN-983). Single-fire.
    if (dismissFiredRef.current) return;
    dismissFiredRef.current = true;
    postSurveyEvent(
      {
        event: "dismissed",
        reachedStep: "q1",
        surveyCompleted: false,
        deviceType: deviceTypeOf(),
        userAgent: navigator.userAgent,
        referralSource: document.referrer || undefined,
      },
      { beacon: true }
    );
  }, []);

  const answerQ1 = useCallback((value: string) => {
    // Q1 answered — this is the conversion. Record partial@q1 (the highest-value
    // field, DAN-162/DAN-163), stop abandon listeners, and gate re-show via the
    // `sr_survey_completed` localStorage key. Then collapse to a brief thanks and
    // slide closed so the user continues with the main content.
    activeRef.current = false;
    setSelected(value);
    trackEvent("survey_q1_answered", { intent: value });
    postSurveyEvent({
      event: "partial",
      reachedStep: "q1",
      q1Intent: value,
      surveyCompleted: true,
      deviceType: deviceTypeOf(),
      referralSource: document.referrer || undefined,
    });
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {
      // ignore storage failures — worst case the bar re-shows next session
    }
    setStep("thanks");
    // Auto-dismiss the thanks confirmation shortly after.
    window.setTimeout(() => setVisible(false), 2500);
  }, []);

  if (!visible) return null;

  // Non-blocking sticky bottom bar. The full-width wrapper is pointer-events-none
  // so taps outside the bar pass straight through to the page content; only the
  // bar itself is interactive. No backdrop, no overlay — main content is never
  // blocked (DAN-1508).
  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] px-3 pb-3 sm:px-4 sm:pb-4 pointer-events-none">
      <div className="pointer-events-auto relative mx-auto w-full max-w-3xl rounded-xl border border-gray-200 bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Close */}
        <button
          onClick={() => (step === "thanks" ? setVisible(false) : dismiss())}
          className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close survey"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === "q1" && (
          <div className="flex flex-col gap-2 p-3 pr-9 sm:flex-row sm:items-center sm:gap-4 sm:py-3 sm:px-4">
            <div className="min-w-0 sm:flex-shrink-0">
              <p className="text-sm font-semibold text-gray-900">
                Quick question — what brought you here today?
              </p>
              <p className="text-xs text-gray-500">Helps us show you better results</p>
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 sm:ml-auto sm:flex-wrap sm:justify-end sm:overflow-visible">
              {INTENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => answerQ1(opt.value)}
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    selected === opt.value
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "thanks" && (
          <div className="flex items-center gap-2 p-3 pr-9 sm:px-4">
            <span className="text-lg" aria-hidden="true">
              🙏
            </span>
            <p className="text-sm font-medium text-gray-900">Thanks — that helps!</p>
          </div>
        )}
      </div>
    </div>
  );
}
