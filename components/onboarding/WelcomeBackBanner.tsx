"use client";

import { useState } from "react";
import Link from "next/link";
import { useOnboarding } from "./OnboardingProvider";
import { useSession } from "next-auth/react";
import { X, Sparkles, ArrowRight } from "lucide-react";

export function WelcomeBackBanner() {
  const { state, isReturningVisitor } = useOnboarding();
  const { data: session } = useSession();
  const [dismissed, setDismissed] = useState(false);

  if (!isReturningVisitor || dismissed) return null;
  // Only show once per session (first page view)
  if (state.pageViews > 1) return null;

  const firstName = session?.user?.name?.split(" ")[0];
  const hasRecent = state.recentlyViewed.length > 0;

  return (
    <div className="relative bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-2xl p-5 sm:p-6 overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold mb-1">
            Welcome back{firstName ? `, ${firstName}` : ""}!
          </h3>
          <p className="text-sm text-white/80 mb-3">
            {hasRecent
              ? "Pick up where you left off, or discover something new."
              : "Ready to find the perfect product? Start comparing now."}
          </p>

          {hasRecent && (
            <div className="flex flex-wrap gap-2 mb-3">
              {state.recentlyViewed.slice(0, 3).map((slug) => (
                <Link
                  key={slug}
                  href={`/products/${slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-medium rounded-lg transition-colors"
                >
                  {slug.replace(/-/g, " ")}
                </Link>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-brand-700 text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
            >
              Browse products
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            {session && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors"
              >
                My dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
