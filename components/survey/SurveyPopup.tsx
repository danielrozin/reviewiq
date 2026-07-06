"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type React from "react";
import { trackEvent } from "@/lib/tracking/analytics";

const STORAGE_KEY = "sr_survey_completed";
const SHOW_DELAY_MS = 30_000; // 30 seconds

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

type Step = "intro" | "q1" | "q2" | "q3" | "q4" | "q5" | "thanks";

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
  const [step, setStep] = useState<Step>("intro");
  const [answers, setAnswers] = useState<Answers>({
    q1Intent: "",
    q2Found: null,
    q2Missing: "",
    q3Rating: 0,
    q4Improvement: "",
    q5Discovery: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const prevFocusRef = useRef<Element | null>(null);
  const q1GroupRef = useRef<HTMLDivElement>(null);
  const q2GroupRef = useRef<HTMLDivElement>(null);
  const q3GroupRef = useRef<HTMLDivElement>(null);
  const q5GroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => {
      setVisible(true);
      trackEvent("survey_popup_shown", { trigger: "timer" });
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    trackEvent("survey_popup_dismissed", { step });
  }, [step]);

  useEffect(() => {
    if (visible) {
      prevFocusRef.current = document.activeElement;
      closeRef.current?.focus();
    } else {
      (prevFocusRef.current as HTMLElement | null)?.focus();
      prevFocusRef.current = null;
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible, dismiss]);

  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (visible && step !== "intro") {
      stepHeadingRef.current?.focus();
    }
  }, [step, visible]);

  const submit = useCallback(async () => {
    setSubmitting(true);
    try {
      const payload = {
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

  function handleQ1KeyDown(e: React.KeyboardEvent) {
    const idx = INTENT_OPTIONS.findIndex((o) => o.value === answers.q1Intent);
    const effective = idx === -1 ? 0 : idx;
    const focus = (i: number) => {
      const opt = INTENT_OPTIONS[i];
      setAnswers((a) => ({ ...a, q1Intent: opt.value }));
      (q1GroupRef.current?.querySelector(`[data-q1key="${opt.value}"]`) as HTMLButtonElement)?.focus();
    };
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); focus((effective + 1) % INTENT_OPTIONS.length); }
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); focus((effective - 1 + INTENT_OPTIONS.length) % INTENT_OPTIONS.length); }
    else if (e.key === "Home") { e.preventDefault(); focus(0); }
    else if (e.key === "End") { e.preventDefault(); focus(INTENT_OPTIONS.length - 1); }
  }

  function handleQ2KeyDown(e: React.KeyboardEvent) {
    const curr = answers.q2Found === false ? 1 : 0;
    const focus = (i: number) => {
      setAnswers((a) => ({ ...a, q2Found: i === 0 ? true : false }));
      const key = i === 0 ? "yes" : "no";
      (q2GroupRef.current?.querySelector(`[data-q2key="${key}"]`) as HTMLButtonElement)?.focus();
    };
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); focus((curr + 1) % 2); }
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); focus((curr - 1 + 2) % 2); }
  }

  function handleQ3KeyDown(e: React.KeyboardEvent) {
    const idx = answers.q3Rating ? answers.q3Rating - 1 : 0;
    const focus = (i: number) => {
      setAnswers((a) => ({ ...a, q3Rating: i + 1 }));
      (q3GroupRef.current?.querySelector(`[data-q3rating="${i + 1}"]`) as HTMLButtonElement)?.focus();
    };
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); focus((idx + 1) % 5); }
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); focus((idx - 1 + 5) % 5); }
    else if (e.key === "Home") { e.preventDefault(); focus(0); }
    else if (e.key === "End") { e.preventDefault(); focus(4); }
  }

  function handleQ5KeyDown(e: React.KeyboardEvent) {
    const idx = DISCOVERY_OPTIONS.findIndex((o) => o.value === answers.q5Discovery);
    const effective = idx === -1 ? 0 : idx;
    const focus = (i: number) => {
      const opt = DISCOVERY_OPTIONS[i];
      setAnswers((a) => ({ ...a, q5Discovery: opt.value }));
      (q5GroupRef.current?.querySelector(`[data-q5key="${opt.value}"]`) as HTMLButtonElement)?.focus();
    };
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); focus((effective + 1) % DISCOVERY_OPTIONS.length); }
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); focus((effective - 1 + DISCOVERY_OPTIONS.length) % DISCOVERY_OPTIONS.length); }
    else if (e.key === "Home") { e.preventDefault(); focus(0); }
    else if (e.key === "End") { e.preventDefault(); focus(DISCOVERY_OPTIONS.length - 1); }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={dismiss} />

      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="survey-dialog-heading"
        onKeyDown={(e) => {
          if (e.key !== "Tab") return;
          const focusable = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(
            'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
          ));
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (!first) return;
          if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
            e.preventDefault();
            (e.shiftKey ? last : first).focus();
          }
        }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 motion-safe:animate-in slide-in-from-bottom-4 duration-300"
      >
        {/* Close */}
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
          aria-label="Close survey"
        >
          <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === "intro" && (
          <div className="text-center">
            <div aria-hidden="true" className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 id="survey-dialog-heading" className="text-lg font-bold text-gray-900 mb-2">Quick feedback?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Help us make ReviewIQ better. Takes less than 30 seconds.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={dismiss}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
              >
                No thanks
              </button>
              <button
                type="button"
                onClick={() => setStep("q1")}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
              >
                Sure, I'll help
              </button>
            </div>
          </div>
        )}

        {step === "q1" && (
          <div>
            <p className="text-xs text-brand-600 font-medium mb-2">1 of 5</p>
            <h3 ref={stepHeadingRef} id="survey-dialog-heading" tabIndex={-1} className="text-base font-bold text-gray-900 mb-4">What brought you here today?</h3>
            <div ref={q1GroupRef} role="radiogroup" aria-label="What brought you here today?" className="space-y-2" onKeyDown={handleQ1KeyDown}>
              {INTENT_OPTIONS.map((opt, idx) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  data-q1key={opt.value}
                  aria-checked={answers.q1Intent === opt.value}
                  tabIndex={answers.q1Intent === opt.value || (answers.q1Intent === "" && idx === 0) ? 0 : -1}
                  onClick={() => {
                    setAnswers((a) => ({ ...a, q1Intent: opt.value }));
                    setStep("q2");
                  }}
                  className={`w-full text-left px-4 py-3 text-sm rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${
                    answers.q1Intent === opt.value
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-gray-200 hover:border-gray-500 hover:bg-gray-50 text-gray-700"
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
            <h3 ref={stepHeadingRef} id="survey-dialog-heading" tabIndex={-1} className="text-base font-bold text-gray-900 mb-4">Did you find what you were looking for?</h3>
            <div ref={q2GroupRef} role="radiogroup" aria-label="Did you find what you were looking for?" className="flex gap-3 mb-4" onKeyDown={handleQ2KeyDown}>
              <button
                type="button"
                role="radio"
                data-q2key="yes"
                aria-checked={answers.q2Found === true}
                tabIndex={answers.q2Found !== false ? 0 : -1}
                onClick={() => {
                  setAnswers((a) => ({ ...a, q2Found: true }));
                  setStep("q3");
                }}
                className="flex-1 px-4 py-3 text-sm font-medium rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
              >
                Yes
              </button>
              <button
                type="button"
                role="radio"
                data-q2key="no"
                aria-checked={answers.q2Found === false}
                tabIndex={answers.q2Found === false ? 0 : -1}
                onClick={() => setAnswers((a) => ({ ...a, q2Found: false }))}
                className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${
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
                  aria-label="What were you looking for?"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 resize-none"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={() => setStep("q3")}
                  className="mt-3 w-full px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
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
            <h3 ref={stepHeadingRef} id="survey-dialog-heading" tabIndex={-1} className="text-base font-bold text-gray-900 mb-4">How would you rate your experience?</h3>
            <div ref={q3GroupRef} role="radiogroup" aria-label="How would you rate your experience?" className="flex justify-center gap-2 mb-4" onKeyDown={handleQ3KeyDown}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  data-q3rating={n}
                  aria-label={`Rate ${n} out of 5`}
                  aria-checked={answers.q3Rating === n}
                  tabIndex={answers.q3Rating === n || (answers.q3Rating === 0 && n === 1) ? 0 : -1}
                  onClick={() => {
                    setAnswers((a) => ({ ...a, q3Rating: n }));
                    setStep("q4");
                  }}
                  className={`w-12 h-12 rounded-xl text-lg font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${
                    answers.q3Rating === n
                      ? "bg-brand-600 text-white scale-110"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span aria-hidden="true">{n}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 px-1">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        )}

        {step === "q4" && (
          <div>
            <p className="text-xs text-brand-600 font-medium mb-2">4 of 5</p>
            <h3 ref={stepHeadingRef} id="survey-dialog-heading" tabIndex={-1} className="text-base font-bold text-gray-900 mb-4">What could we improve?</h3>
            <textarea
              value={answers.q4Improvement}
              onChange={(e) => setAnswers((a) => ({ ...a, q4Improvement: e.target.value }))}
              placeholder="Anything at all — we read every response."
              aria-label="What could we improve?"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 resize-none"
              rows={3}
            />
            <div className="flex gap-3 mt-3">
              <button
                type="button"
                onClick={() => setStep("q5")}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => setStep("q5")}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === "q5" && (
          <div>
            <p className="text-xs text-brand-600 font-medium mb-2">5 of 5</p>
            <h3 ref={stepHeadingRef} id="survey-dialog-heading" tabIndex={-1} className="text-base font-bold text-gray-900 mb-4">How did you discover ReviewIQ?</h3>
            <div ref={q5GroupRef} role="radiogroup" aria-label="How did you discover ReviewIQ?" className="space-y-2 mb-4" onKeyDown={handleQ5KeyDown}>
              {DISCOVERY_OPTIONS.map((opt, idx) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  data-q5key={opt.value}
                  aria-checked={answers.q5Discovery === opt.value}
                  tabIndex={answers.q5Discovery === opt.value || (answers.q5Discovery === "" && idx === 0) ? 0 : -1}
                  onClick={() => setAnswers((a) => ({ ...a, q5Discovery: opt.value }))}
                  className={`w-full text-left px-4 py-3 text-sm rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${
                    answers.q5Discovery === opt.value
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-gray-200 hover:border-gray-500 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              aria-busy={submitting}
              aria-label={submitting ? "Submitting feedback, please wait" : "Submit feedback"}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
            >
              {submitting ? "Submitting..." : "Submit feedback"}
            </button>
          </div>
        )}

        {step === "thanks" && (
          <div className="text-center py-4">
            <div aria-hidden="true" className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🙏</span>
            </div>
            <h3 ref={stepHeadingRef} id="survey-dialog-heading" tabIndex={-1} className="text-lg font-bold text-gray-900 mb-2">Thank you!</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your feedback helps us build a better review platform for everyone.
            </p>
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="px-6 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
