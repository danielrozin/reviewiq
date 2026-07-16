"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { trackEvent } from "@/lib/tracking/analytics";
import { NEWSLETTER_PRODUCT, SUBSCRIPTION_SOURCE } from "@/lib/email/newsletter";

const STORAGE_KEY = "sr_survey_completed";
// DAN-1508: reduced from 20s — catches engaged users before they bounce
const SHOW_DELAY_MS = 8_000;
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

// DAN-1508: Q1-only bottom bar — once answered the bar closes.
// Q2-Q5 are dropped from the bottom bar; the bar is done after Q1.
type Step = "q1" | "thanks";

interface Answers {
  q1Intent: string;
}

export function SurveyPopup() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<Step>("q1");
  const [answers, setAnswers] = useState<Answers>({ q1Intent: "" });
  const [collapsed, setCollapsed] = useState(false);

  // --- Abandon tracking (DAN-699) ---
  const stepRef = useRef<Step>(step);
  const answersRef = useRef<Answers>(answers);
  const activeRef = useRef(false);
  const submittedRef = useRef(false);
  const abandonFiredRef = useRef(false);
  const shownRef = useRef(false);
  const dismissFiredRef = useRef(false);

  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  const fireAbandon = useCallback(() => {
    if (abandonFiredRef.current) return;
    if (!activeRef.current) return;
    if (submittedRef.current) return;
    abandonFiredRef.current = true;

    const reachedStep = stepRef.current;
    const a = answersRef.current;
    trackEvent("survey_form_abandon", { step: reachedStep });

    postSurveyEvent({
      event: "form_abandon",
      reachedStep,
      surveyCompleted: false,
      q1Intent: a.q1Intent || undefined,
      deviceType: deviceTypeOf(),
      userAgent: navigator.userAgent,
      referralSource: document.referrer || undefined,
    }, { beacon: true });
  }, []);

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

    const timer = setTimeout(() => showPopup("timer"), SHOW_DELAY_MS);

    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) showPopup("exit_intent");
    };
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
    activeRef.current = false;
    setVisible(false);
    trackEvent("survey_popup_dismissed", { step });
    if (dismissFiredRef.current || submittedRef.current) return;
    dismissFiredRef.current = true;
    const a = answersRef.current;
    postSurveyEvent({
      event: "dismissed",
      reachedStep: step,
      surveyCompleted: false,
      q1Intent: a.q1Intent || undefined,
      deviceType: deviceTypeOf(),
      userAgent: navigator.userAgent,
      referralSource: document.referrer || undefined,
    }, { beacon: true });
  }, [step]);

  const handleQ1Answer = useCallback((value: string) => {
    submittedRef.current = true;
    activeRef.current = false;
    setAnswers({ q1Intent: value });
    localStorage.setItem(STORAGE_KEY, Date.now().toString());

    postSurveyEvent({
      event: "partial",
      reachedStep: "q1",
      q1Intent: value,
      deviceType: deviceTypeOf(),
      userAgent: navigator.userAgent,
      referralSource: document.referrer || undefined,
    });

    trackEvent("survey_q1_answered", { value });
    setStep("thanks");
    // Collapse and auto-close after brief thanks
    setTimeout(() => {
      setCollapsed(true);
      setTimeout(() => setVisible(false), 300);
    }, 1200);
  }, []);

  if (!visible) return null;

  // DAN-1508: non-blocking sticky bottom bar — pointer-events-none on wrapper
  // so the bar never covers page content or intercepts taps above it.
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none">
      <div
        className={`pointer-events-auto transition-transform duration-300 ${
          collapsed ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="bg-white border-t border-gray-200 shadow-lg px-4 py-3 sm:px-6">
          <div className="max-w-3xl mx-auto">
            {step === "q1" && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-shrink-0 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    Quick question — what brought you here today?
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Helps us show you better results</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:ml-auto">
                  {INTENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleQ1Answer(opt.value)}
                      className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border border-gray-300 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 text-gray-700 transition-colors whitespace-nowrap"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={dismiss}
                  className="absolute top-3 right-3 sm:relative sm:top-auto sm:right-auto flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close survey"
                >
                  <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {step === "thanks" && (
              <p className="text-sm text-center text-gray-600 font-medium py-0.5">
                Thanks — that&apos;s helpful! 🙏
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
