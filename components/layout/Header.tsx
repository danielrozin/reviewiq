"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { SearchBar } from "./SearchBar";
import { useSubscription } from "@/lib/context/SubscriptionContext";
import { ProBadge } from "@/components/premium/ProBadge";
import { useCompare } from "@/lib/context/CompareContext";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing", accent: true },
  { href: "/community", label: "Community", accent: true },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const { isPro } = useSubscription();
  const { items } = useCompare();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center group-hover:bg-brand-700 transition-colors">
                <span className="text-white font-bold text-xs">RIQ</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:inline">
                Review<span className="text-brand-600">IQ</span>
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-1 flex-1" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    link.accent
                      ? "text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Search bar — desktop only */}
            <div className="hidden md:block flex-1 max-w-xs lg:max-w-sm">
              <SearchBar />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 ml-auto lg:ml-0">
              {/* Compare count badge */}
              {items.length > 0 && (
                <Link
                  href="/compare"
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-700 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                  </svg>
                  Compare
                  <span className="w-5 h-5 bg-brand-600 text-white rounded-full text-xs font-bold flex items-center justify-center">
                    {items.length}
                  </span>
                </Link>
              )}

              <Link
                href="/dashboard"
                className="hidden md:inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/write-review"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
              >
                <span className="hidden sm:inline">Write a Review</span>
                <span className="sm:hidden">Review</span>
              </Link>

              {status !== "loading" && (
                session ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      aria-expanded={userMenuOpen}
                      aria-haspopup="true"
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white">
                        {(session.user?.name?.[0] || session.user?.email?.[0] || "U").toUpperCase()}
                      </div>
                      <span className="hidden md:inline max-w-[100px] truncate">
                        {session.user?.name || session.user?.email?.split("@")[0]}
                      </span>
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 animate-scale-in">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {session.user?.name || "User"}
                            </p>
                            {isPro && <ProBadge size="sm" />}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {session.user?.email}
                          </p>
                        </div>
                        {!isPro && (
                          <Link
                            href="/pricing"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors font-medium"
                          >
                            ✨ Upgrade to Pro
                          </Link>
                        )}
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Settings
                        </Link>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={() => { setUserMenuOpen(false); signOut(); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
                  >
                    Sign In
                  </Link>
                )
              )}

              {/* Mobile hamburger */}
              <button
                type="button"
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                {menuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          <div className="md:hidden pb-3">
            <SearchBar />
          </div>
        </div>

        {/* Mobile navigation drawer */}
        {menuOpen && (
          <nav id="mobile-nav" className="lg:hidden border-t border-gray-100 bg-white/98 backdrop-blur-lg" aria-label="Mobile navigation">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                    link.accent
                      ? "text-brand-600 hover:bg-brand-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {items.length > 0 && (
                <Link
                  href="/compare"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-medium text-brand-700 hover:bg-brand-50 transition-colors"
                >
                  Compare
                  <span className="w-5 h-5 bg-brand-600 text-white rounded-full text-xs font-bold flex items-center justify-center">
                    {items.length}
                  </span>
                </Link>
              )}

              <div className="pt-2 mt-2 border-t border-gray-100">
                <Link
                  href="/write-review"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-base font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors"
                >
                  Write a Review
                </Link>
              </div>
              <div className="pt-1">
                {session ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { setMenuOpen(false); signOut(); }}
                      className="block w-full text-left px-4 py-2.5 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/signin"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-base font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors text-center"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Mobile menu backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
