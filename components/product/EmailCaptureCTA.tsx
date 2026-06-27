"use client";

import { useState } from "react";

interface EmailCaptureCTAProps {
  productId: string;
  productSlug: string;
  productName: string;
}

export function EmailCaptureCTA({
  productId,
  productSlug,
  productName,
}: EmailCaptureCTAProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, productId, productSlug, productName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center">
        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-emerald-800 mb-1">
          You&apos;re subscribed!
        </h3>
        <p className="text-sm text-emerald-600">
          We&apos;ll notify you when the SmartScore changes for {productName}.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-brand-50 border border-brand-100 rounded-2xl p-6 sm:p-8">
      <div className="text-center mb-4">
        <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Get notified when SmartScore changes for {productName}
        </h3>
        <p className="text-sm text-gray-500">
          We&apos;ll email you when the score updates based on new reviews.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
      >
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-6 py-3 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {status === "loading" ? "Subscribing..." : "Notify Me"}
        </button>
      </form>

      {status === "error" && (
        <p className="text-sm text-red-600 text-center mt-3">{errorMsg}</p>
      )}

      <p className="text-xs text-gray-400 text-center mt-3">
        No spam. Unsubscribe anytime.
      </p>
    </section>
  );
}
