"use client";

import { signIn } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "Couldn't start Google sign-in. Please try again.",
  OAuthCallback: "Google sign-in failed during the callback. Please try again.",
  OAuthCreateAccount: "Couldn't create your account. Please try again.",
  OAuthAccountNotLinked:
    "This email is already linked to another sign-in method.",
  Callback: "Sign-in failed. Please try again.",
  AccessDenied: "Access denied. You cancelled the Google sign-in.",
  Configuration:
    "Google sign-in isn't configured yet. The site owner needs to set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
  default: "Something went wrong with sign-in. Please try again.",
};

function SignInError() {
  const params = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = params.get("error");
    if (code) setError(ERROR_MESSAGES[code] ?? ERROR_MESSAGES.default);
  }, [params]);

  if (!error) return null;
  return (
    <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg">
      {error}
    </div>
  );
}

export default function SignInPage() {
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left — value proposition */}
        <div className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
            <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center group-hover:bg-brand-700 transition-colors">
              <span className="text-white font-bold text-xs">RIQ</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Review<span className="text-brand-600">IQ</span></span>
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
            Make smarter buying<br />decisions — for free
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            AI-powered review intelligence trusted by 20,000+ verified buyers. No affiliate bias. No fake reviews.
          </p>
          <ul className="space-y-4">
            {[
              { icon: "🤖", title: "AI-Powered Summaries", desc: "Instantly understand what buyers love and hate from thousands of reviews" },
              { icon: "📊", title: "SmartScore Rankings", desc: "Our 0–100 score synthesizes verified buyer data into one clear verdict" },
              { icon: "🔔", title: "Price & Score Alerts", desc: "Get notified when a product's SmartScore changes or the price drops" },
              { icon: "⚖️", title: "Side-by-Side Comparisons", desc: "Compare up to 4 products head-to-head on every spec that matters" },
            ].map((benefit) => (
              <li key={benefit.title} className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{benefit.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{benefit.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{benefit.desc}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
            <div className="flex -space-x-2">
              {["bg-brand-400","bg-emerald-400","bg-amber-400","bg-pink-400"].map((c,i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} ring-2 ring-white flex items-center justify-center text-white text-[10px] font-bold`}>
                  {["JL","SA","MK","TR"][i]}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500"><span className="font-semibold text-gray-800">20,000+</span> verified reviews written</p>
          </div>
        </div>

        {/* Right — sign in form */}
        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">RIQ</span>
              </div>
            </Link>
          </div>
          <div className="text-center lg:text-left mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Sign in to ReviewIQ</h1>
            <p className="mt-2 text-sm text-gray-500">
              Write reviews, save comparisons, and get personalized recommendations.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <Suspense fallback={null}>
              <SignInError />
            </Suspense>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {loading ? "Redirecting…" : "Continue with Google"}
            </button>

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="flex-1 h-px bg-gray-100" />
              <span>Free forever · No credit card</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <ul className="space-y-2">
              {["No affiliate bias", "78% verified buyer rate", "Cancel or leave anytime"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-center text-xs text-gray-400">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-gray-600">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
