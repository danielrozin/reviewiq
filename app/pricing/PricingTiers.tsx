"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PLANS } from "@/lib/stripe";

export function PricingTiers() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/pricing");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* Free Plan */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {PLANS.free.name}
          </h3>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-gray-900">$0</span>
            <span className="text-gray-500 text-sm">/month</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Perfect for casual browsing and reading reviews.
          </p>
        </div>

        <ul className="space-y-3 flex-1">
          {PLANS.free.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
              <svg
                className="w-5 h-5 text-gray-400 shrink-0 mt-0.5"
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
          disabled
          className="mt-8 w-full py-3 px-6 rounded-xl text-sm font-semibold bg-gray-100 text-gray-500 cursor-default"
        >
          Current Plan
        </button>
      </div>

      {/* Pro Plan */}
      <div className="bg-white rounded-2xl border-2 border-brand-500 p-8 flex flex-col relative shadow-lg shadow-brand-100/50">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-brand-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
            Most Popular
          </span>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {PLANS.pro.name}
          </h3>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-gray-900">
              ${(PLANS.pro.price / 100).toFixed(2)}
            </span>
            <span className="text-gray-500 text-sm">/month</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            For power users who want the complete ReviewIQ experience.
          </p>
        </div>

        <ul className="space-y-3 flex-1">
          {PLANS.pro.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
              <svg
                className="w-5 h-5 text-brand-500 shrink-0 mt-0.5"
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
          onClick={handleSubscribe}
          disabled={loading}
          className="mt-8 w-full py-3 px-6 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
        >
          {loading ? "Redirecting to checkout..." : "Upgrade to Pro"}
        </button>
      </div>
    </div>
  );
}
