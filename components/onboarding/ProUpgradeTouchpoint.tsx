"use client";

import type React from "react";
import Link from "next/link";
import { useOnboarding } from "./OnboardingProvider";
import { useSubscription } from "@/lib/context/SubscriptionContext";
import { trackEvent } from "@/lib/tracking/analytics";

const PRO_BENEFITS: { icon: React.ReactElement; text: string }[] = [
  {
    icon: (
      <svg aria-hidden="true" className="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    text: "Advanced comparison filters",
  },
  {
    icon: (
      <svg aria-hidden="true" className="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
    text: "Export comparisons as PDF/CSV",
  },
  {
    icon: (
      <svg aria-hidden="true" className="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ),
    text: "Ad-free browsing experience",
  },
];

export function ProUpgradeTouchpoint() {
  const { shouldShowProUpgrade, dismissPro } = useOnboarding();
  const { isPro } = useSubscription();

  if (!shouldShowProUpgrade || isPro) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[80] w-full max-w-sm animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 shadow-xl">
        <button
          type="button"
          onClick={dismissPro}
          className="absolute top-3 right-3 p-1 text-amber-400 hover:text-amber-600 rounded-lg hover:bg-amber-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
          aria-label="Dismiss"
        >
          <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div aria-hidden="true" className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <svg aria-hidden="true" className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Upgrade to Pro</h3>
            <p className="text-xs text-gray-600">You&apos;ve been a loyal user!</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {PRO_BENEFITS.map((b) => (
            <div key={b.text} className="flex items-center gap-2 text-xs text-gray-700">
              {b.icon}
              {b.text}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/pricing"
            onClick={() => trackEvent("onboarding_pro_upgrade_clicked")}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-xl hover:bg-amber-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-amber-600"
          >
            <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
            See Pro plans
          </Link>
          <button
            type="button"
            onClick={dismissPro}
            className="px-3 py-2.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded-lg"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
