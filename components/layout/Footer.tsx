"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">RIQ</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                Review<span className="text-brand-600">IQ</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Honest, AI-powered product reviews. Built on real buyer
              experiences, not affiliate deals.
            </p>
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
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
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
                { name: "Sitemap", href: "/site-map" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
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
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/acceptable-use" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
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
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} ReviewIQ. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/cookie-policy"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
