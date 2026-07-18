"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PLANS } from "@/lib/stripe";

export function PricingTiers() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  async function handleSubscribe() {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/pricing");
      return;
    }

    setLoading(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCheckoutError(data.error || "Something went wrong. Please try again.");
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setCheckoutError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ul role="list" aria-label="Pricing plans" className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* Free Plan */}
      <li><article aria-labelledby="plan-free-name" className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-sm hover:border-gray-300 motion-safe:hover:-translate-y-0.5 motion-safe:transition-all duration-200 group">
        <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-gray-200 to-gray-300 opacity-0 group-hover:opacity-100 motion-safe:transition-opacity duration-200" />
        <div className="p-8 flex flex-col flex-1">
        <div className="mb-6">
          <h2 id="plan-free-name" className="text-lg font-semibold text-gray-900">
            {PLANS.free.name}
          </h2>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-gray-900" aria-label="Free, $0 per month">$0</span>
            <span aria-hidden="true" className="text-gray-600 text-sm">/month</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Perfect for casual browsing and reading reviews.
          </p>
        </div>

        <ul role="list" aria-label={`${PLANS.free.name} plan features`} className="space-y-3 flex-1">
          {PLANS.free.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
              <svg
                aria-hidden="true"
                className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled
          aria-disabled="true"
          aria-label="Free — Current Plan"
          className="mt-8 w-full py-3 px-6 min-h-[44px] rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
        >
          Current Plan
        </button>
        </div>
      </article></li>

      {/* Pro Plan */}
      <li><article aria-labelledby="plan-pro-name" className="bg-white rounded-2xl border-2 border-brand-500 p-8 flex flex-col relative shadow-lg shadow-brand-100/50 hover:shadow-xl motion-safe:hover:-translate-y-1 motion-safe:transition-all duration-200">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2" aria-hidden="true">
          <span className="bg-brand-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
            Most Popular
          </span>
        </div>

        <div className="mb-6">
          <h2 id="plan-pro-name" className="text-lg font-semibold text-gray-900">
            {PLANS.pro.name}
            <span className="sr-only"> — Most Popular</span>
          </h2>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-gray-900" aria-label={`$${(PLANS.pro.price / 100).toFixed(2)} per month`}>
              ${(PLANS.pro.price / 100).toFixed(2)}
            </span>
            <span aria-hidden="true" className="text-gray-600 text-sm">/month</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            For power users who want the complete ReviewIQ experience.
          </p>
        </div>

        <ul role="list" aria-label={`${PLANS.pro.name} plan features`} className="space-y-3 flex-1">
          {PLANS.pro.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
              <svg
                aria-hidden="true"
                className="w-5 h-5 text-brand-600 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        {checkoutError && (
          <p role="alert" aria-live="assertive" className="mt-4 p-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl">
            {checkoutError}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubscribe}
          disabled={loading}
          aria-busy={loading}
          aria-describedby={checkoutError ? "checkout-error" : undefined}
          className="mt-8 w-full py-3 px-6 min-h-[44px] rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-wait inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
        >
          {loading ? (
            <>
              <svg aria-hidden="true" className="w-4 h-4 motion-safe:animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4Z" />
              </svg>
              Redirecting…
            </>
          ) : (
            <>
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
              Upgrade to Pro
            </>
          )}
        </button>
      </article></li>
    </ul>
  );
}
