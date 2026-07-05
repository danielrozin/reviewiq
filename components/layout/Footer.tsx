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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="w-5 h-5 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                <svg aria-hidden="true" className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <span>No affiliate bias — honest reviews only</span>
            </div>
            <div aria-hidden="true" className="hidden sm:block w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="w-5 h-5 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                <svg aria-hidden="true" className="w-3 h-3 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                </svg>
              </span>
              <span>AI-synthesized from 20,000+ verified reviews</span>
            </div>
            <div aria-hidden="true" className="hidden sm:block w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="w-5 h-5 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                <svg aria-hidden="true" className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
              </span>
              <span>78% verified purchase rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter signup */}
      <div className="border-b border-gray-100 bg-gradient-to-r from-brand-600 to-brand-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-lg font-bold text-white">Get smarter about buying</p>
              <p className="text-sm text-brand-100 mt-1">Weekly buying guides + AI insights. No spam, unsubscribe anytime.</p>
              <div className="flex items-center gap-2 mt-3">
                {[
                  { label: "Top picks", icon: <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg> },
                  { label: "AI summaries", icon: <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg> },
                  { label: "Price alerts", icon: <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg> },
                ].map((tag) => (
                  <span key={tag.label} className="inline-flex items-center gap-1 text-xs text-brand-100">
                    {tag.icon}
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
            {submitted ? (
              <div role="status" className="flex items-center gap-2 text-sm text-white font-medium bg-white/20 px-5 py-3 rounded-xl">
                <svg aria-hidden="true" className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                You&rsquo;re in — check your inbox!
              </div>
            ) : (
              <form onSubmit={handleNewsletter} aria-label="Newsletter signup" className="flex gap-2 w-full sm:w-auto">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="flex-1 sm:w-64 px-4 py-3 text-sm border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/15 text-white placeholder:text-brand-200 backdrop-blur-sm"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-white text-brand-700 text-sm font-semibold rounded-xl hover:bg-brand-50 transition-colors shrink-0 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
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
            <Link href="/" aria-label="ReviewIQ home" className="flex items-center gap-2 mb-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded-lg">
              <div aria-hidden="true" className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center group-hover:bg-brand-700 transition-colors">
                <span className="text-white font-bold text-xs">RIQ</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                Review<span className="text-brand-600">IQ</span>
              </span>
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Honest, AI-powered product reviews. Built on real buyer
              experiences, not affiliate deals.
            </p>
            <Link
              href="/write-review"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
              </svg>
              Write a review
            </Link>
          </div>

          <nav aria-label="Product categories">
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
                    className="text-sm text-gray-600 hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Platform links">
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
                    className="text-sm text-gray-600 hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Contribute links">
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
                    className="text-sm text-gray-600 hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal links">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-sm text-gray-600 hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/acceptable-use" className="text-sm text-gray-600 hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded">
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
                  className="text-sm text-gray-600 hover:text-brand-600 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="border-t border-gray-200 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} ReviewIQ. All rights reserved. No affiliate commissions.
          </p>
          <nav aria-label="Footer legal links" className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded">
              Terms
            </Link>
            <Link href="/cookie-policy" className="text-sm text-gray-600 hover:text-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded">
              Cookies
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
