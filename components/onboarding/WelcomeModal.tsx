"use client";

import { useState } from "react";
import { useOnboarding } from "./OnboardingProvider";
import { Search, Star, BarChart3, Users, ArrowRight, X } from "lucide-react";
import { trackEvent } from "@/lib/tracking/analytics";

const VALUE_PROPS = [
  {
    icon: Search,
    title: "Smart Comparisons",
    description: "Compare any products side-by-side with AI-powered insights",
    color: "bg-brand-50 text-brand-600",
  },
  {
    icon: Star,
    title: "Real Reviews",
    description: "Honest reviews from verified buyers — no fake ratings",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: BarChart3,
    title: "SmartScore",
    description: "Our proprietary score combines reviews, specs, and value",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Users,
    title: "Active Community",
    description: "Join discussions, ask questions, and share your experience",
    color: "bg-purple-50 text-purple-600",
  },
];

export function WelcomeModal() {
  const { isNewVisitor, dismissWelcome } = useOnboarding();
  const [step, setStep] = useState<"welcome" | "props">("welcome");

  if (!isNewVisitor) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={dismissWelcome} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={dismissWelcome}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "welcome" && (
          <div className="p-6 sm:p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/20">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to ReviewIQ
              </h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8">
                Make smarter buying decisions with AI-powered reviews,
                real comparisons, and a community that actually helps.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    trackEvent("onboarding_welcome_explore");
                    setStep("props");
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
                >
                  See what we offer
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={dismissWelcome}
                  className="px-6 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  I&apos;ll explore on my own
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "props" && (
          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Here&apos;s what you can do
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Everything you need to find the perfect product.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {VALUE_PROPS.map((prop) => (
                <div
                  key={prop.title}
                  className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${prop.color}`}>
                    <prop.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{prop.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{prop.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                trackEvent("onboarding_welcome_get_started");
                dismissWelcome();
              }}
              className="w-full px-6 py-3 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
            >
              Get started
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
