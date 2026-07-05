"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useOnboarding } from "./OnboardingProvider";
import { trackEvent } from "@/lib/tracking/analytics";

const VALUE_PROPS: { icon: React.ReactElement; title: string; description: string; color: string }[] = [
  {
    icon: (
      <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
    title: "Smart Comparisons",
    description: "Compare any products side-by-side with AI-powered insights",
    color: "bg-brand-50 text-brand-600",
  },
  {
    icon: (
      <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
    title: "Real Reviews",
    description: "Honest reviews from verified buyers — no fake ratings",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: (
      <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    title: "SmartScore",
    description: "Our proprietary score combines reviews, specs, and value",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: (
      <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
    title: "Active Community",
    description: "Join discussions, ask questions, and share your experience",
    color: "bg-purple-50 text-purple-600",
  },
];

export function WelcomeModal() {
  const { isNewVisitor, dismissWelcome } = useOnboarding();
  const [step, setStep] = useState<"welcome" | "props">("welcome");
  const closeRef = useRef<HTMLButtonElement>(null);
  const propsHeadingRef = useRef<HTMLHeadingElement>(null);
  const prevFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (isNewVisitor) {
      prevFocusRef.current = document.activeElement;
      closeRef.current?.focus();
    } else {
      (prevFocusRef.current as HTMLElement | null)?.focus();
      prevFocusRef.current = null;
    }
  }, [isNewVisitor]);

  useEffect(() => { if (step === "props") propsHeadingRef.current?.focus(); }, [step]);

  useEffect(() => {
    if (!isNewVisitor) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismissWelcome();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isNewVisitor, dismissWelcome]);

  if (!isNewVisitor) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={dismissWelcome} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-heading"
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
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={dismissWelcome}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
          aria-label="Close welcome dialog"
        >
          <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {step === "welcome" && (
          <div className="p-6 sm:p-8">
            <div className="text-center">
              <div aria-hidden="true" className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/20">
                <svg aria-hidden="true" className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
              </div>
              <h2 id="welcome-modal-heading" className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to ReviewIQ
              </h2>
              <p className="text-sm text-gray-600 max-w-sm mx-auto mb-8">
                Make smarter buying decisions with AI-powered reviews,
                real comparisons, and a community that actually helps.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("onboarding_welcome_explore");
                    setStep("props");
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
                >
                  See what we offer
                  <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={dismissWelcome}
                  className="px-6 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
                >
                  I&apos;ll explore on my own
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "props" && (
          <div className="p-6 sm:p-8">
            <h3 ref={propsHeadingRef} tabIndex={-1} id="welcome-modal-heading" className="text-lg font-bold text-gray-900 mb-1 focus:outline-none">
              Here&apos;s what you can do
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              Everything you need to find the perfect product.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {VALUE_PROPS.map((prop) => (
                <div
                  key={prop.title}
                  className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div aria-hidden="true" className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${prop.color}`}>
                    {prop.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{prop.title}</h4>
                    <p className="text-xs text-gray-600 mt-0.5">{prop.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                trackEvent("onboarding_welcome_get_started");
                dismissWelcome();
              }}
              className="w-full px-6 py-3 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
            >
              Get started
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
