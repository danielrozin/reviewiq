"use client";

import { useState } from "react";
import Link from "next/link";
import { useOnboarding } from "./OnboardingProvider";
import { useSession } from "next-auth/react";

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
        type="button"
        onClick={() => {
          const main = document.querySelector<HTMLElement>("main");
          if (main) {
            main.setAttribute("tabindex", "-1");
            main.focus({ preventScroll: true });
            main.addEventListener("blur", () => main.removeAttribute("tabindex"), { once: true });
          }
          setDismissed(true);
        }}
        className="absolute top-3 right-3 p-1 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
        aria-label="Dismiss"
      >
        <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative flex items-start gap-3">
        <div aria-hidden="true" className="shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
          <svg aria-hidden="true" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
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
            <ul role="list" aria-label="Recently viewed products" className="flex flex-wrap gap-2 mb-3 list-none p-0 m-0">
              {state.recentlyViewed.slice(0, 3).map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/products/${slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-brand-600"
                  >
                    {slug.replace(/-/g, " ")}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <ul role="list" className="flex flex-wrap gap-2 list-none p-0 m-0">
            <li>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-brand-700 text-sm font-medium rounded-xl hover:bg-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
              >
                Browse products
                <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </li>
            {session && (
              <li>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-xl hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-brand-600"
                >
                  My dashboard
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
