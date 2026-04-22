"use client";

import Link from "next/link";
import { useOnboarding } from "./OnboardingProvider";
import { X, UserPlus, Bookmark, Bell, MessageSquare } from "lucide-react";
import { trackEvent } from "@/lib/tracking/analytics";

const BENEFITS = [
  { icon: Bookmark, text: "Save comparisons & watchlists" },
  { icon: Bell, text: "Price drop & score change alerts" },
  { icon: MessageSquare, text: "Join the community discussions" },
];

export function SignupPrompt() {
  const { shouldShowSignupPrompt, dismissSignup } = useOnboarding();

  if (!shouldShowSignupPrompt) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={dismissSignup} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={dismissSignup}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-6 h-6 text-brand-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Enjoying ReviewIQ?
          </h3>
          <p className="text-sm text-gray-500">
            Create a free account to unlock more features.
          </p>
        </div>

        <div className="space-y-2.5 mb-6">
          {BENEFITS.map((benefit) => (
            <div key={benefit.text} className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                <benefit.icon className="w-4 h-4 text-brand-600" />
              </div>
              {benefit.text}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          <Link
            href="/auth/signin"
            onClick={() => trackEvent("onboarding_signup_cta_clicked")}
            className="w-full px-5 py-3 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors text-center shadow-sm"
          >
            Create free account
          </Link>
          <button
            onClick={dismissSignup}
            className="w-full px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
