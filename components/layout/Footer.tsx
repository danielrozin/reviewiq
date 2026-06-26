"use client";

import { useState } from "react";
import Link from "next/link";

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-20">
      {/* Trust bar */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold text-base">✓</span>
              <span>No affiliate bias — honest reviews only</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-brand-500 font-bold text-base">🤖</span>
              <span>AI-synthesized from 20,000+ verified reviews</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-bold text-base">🛒</span>
              <span>78% verified purchase rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter signup */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-900">Get weekly buying guides</p>
              <p className="text-sm text-gray-500 mt-0.5">Top picks + AI insights, straight to your inbox. No spam.</p>
            </div>
            {submitted ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                You&rsquo;re in — check your inbox!
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex gap-2 w-full sm:w-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="flex-1 sm:w-60 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors shrink-0"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center group-hover:bg-brand-700 transition-colors">
                <span className="text-white font-bold text-[10px]">RIQ</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                Review<span className="text-brand-600">IQ</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Honest, AI-powered product reviews. Built on real buyer
              experiences, not affiliate deals.
            </p>
            <Link
              href="/write-review"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
              </svg>
              Write a review
            </Link>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Categories
            </h3>
            <ul className="space-y-2">
              {[
                { name: "Robot Vacuums", slug: "robot-vacuums" },
                { name: "Coffee Machines", slug: "coffee-machines" },
                { name: "Air Fryers", slug: "air-fryers" },
                { name: "Wireless Earbuds", slug: "wireless-earbuds" },
                { name: "Mattresses", slug: "mattresses" },
                { name: "Smart Watches", slug: "smart-watches" },
                { name: "Standing Desks", slug: "standing-desks" },
                { name: "Blenders", slug: "blenders" },
                { name: "Laptops", slug: "laptops" },
                { name: "Electric Toothbrushes", slug: "electric-toothbrushes" },
              ].map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-gray-500 hover:text-brand-600 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Platform
            </h3>
            <ul className="space-y-2">
              {[
                { name: "How It Works", href: "/how-it-works" },
                { name: "Who Is This For", href: "/who-is-this-for" },
                { name: "Blog", href: "/blog" },
                { name: "About", href: "/about" },
                { name: "Community", href: "/community" },
                { name: "Pricing", href: "/pricing" },
                { name: "Sitemap", href: "/site-map" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 hover:text-brand-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Contribute
            </h3>
            <ul className="space-y-2">
              {[
                { name: "Write a Review", href: "/write-review" },
                { name: "Start a Discussion", href: "/community" },
                { name: "Community Guidelines", href: "/community" },
                { name: "FAQ", href: "/faq" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 hover:text-brand-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-brand-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-brand-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-sm text-gray-500 hover:text-brand-600 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/acceptable-use" className="text-sm text-gray-500 hover:text-brand-600 transition-colors">
                  Acceptable Use
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("open-cookie-preferences"));
                    }
                  }}
                  className="text-sm text-gray-500 hover:text-brand-600 transition-colors cursor-pointer"
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} ReviewIQ. All rights reserved. No affiliate commissions.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Terms
            </Link>
            <Link href="/cookie-policy" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
