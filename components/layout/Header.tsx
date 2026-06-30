"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { SearchBar } from "./SearchBar";
import { useSubscription } from "@/lib/context/SubscriptionContext";
import { ProBadge } from "@/components/premium/ProBadge";
import { useCompare } from "@/lib/context/CompareContext";

const navLinks = [
  {
    href: "/products", label: "Products",
    icon: <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>,
  },
  {
    href: "/categories", label: "Categories",
    icon: <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>,
  },
  {
    href: "/blog", label: "Blog",
    icon: <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" /></svg>,
  },
  {
    href: "/pricing", label: "Pricing", accent: true,
    icon: <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" /></svg>,
  },
  {
    href: "/community", label: "Community", accent: true,
    icon: <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>,
  },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
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
            <Link href="/" aria-label="ReviewIQ home" className="flex items-center gap-2.5 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded-lg">
              <div aria-hidden="true" className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center group-hover:bg-brand-700 transition-colors">
                <span className="text-white font-bold text-xs">RIQ</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:inline">
                Review<span className="text-brand-600">IQ</span>
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-1 flex-1" aria-label="Main navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${
                      isActive
                        ? "bg-brand-50 text-brand-700 font-semibold"
                        : link.accent
                        ? "text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
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
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-700 bg-brand-50 rounded-xl hover:bg-brand-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
                >
                  <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
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
                className="hidden md:inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
              >
                Dashboard
              </Link>
              <Link
                href="/write-review"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
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
                      aria-label="Account menu"
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
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
                          <p className="text-xs text-gray-600 truncate">
                            {session.user?.email}
                          </p>
                        </div>
                        {!isPro && (
                          <Link
                            href="/pricing"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset"
                          >
                            <span className="inline-flex items-center gap-1.5">
                            <svg aria-hidden="true" className="w-3.5 h-3.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.161c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.37-2.447a1 1 0 00-1.175 0l-3.37 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.064 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.285-3.958z" />
                            </svg>
                            Upgrade to Pro
                          </span>
                          </Link>
                        )}
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-inset"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-inset"
                        >
                          Settings
                        </Link>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            type="button"
                            onClick={() => { setUserMenuOpen(false); signOut(); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-inset"
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
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
                  >
                    Sign In
                  </Link>
                )
              )}

              {/* Mobile hamburger */}
              <button
                type="button"
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                {menuOpen ? (
                  <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
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
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${
                      isActive
                        ? "bg-brand-50 text-brand-700 font-semibold"
                        : link.accent
                        ? "text-brand-600 hover:bg-brand-50"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}

              {items.length > 0 && (
                <Link
                  href="/compare"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-medium text-brand-700 hover:bg-brand-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
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
                  className="block px-4 py-2.5 rounded-xl text-base font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
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
                      className="block px-4 py-2.5 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); signOut(); }}
                      className="block w-full text-left px-4 py-2.5 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/signin"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-base font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
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
