"use client";

import { useState, useEffect, useRef } from "react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep button in DOM always; toggle inert so keyboard users never lose focus when
  // the button disappears (WCAG 2.4.3). Without inert, pressing Enter activates the
  // button, the scroll triggers visible=false, the element unmounts, and focus drops to <body>.
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    if (visible) {
      btn.removeAttribute("inert");
    } else {
      btn.setAttribute("inert", "");
    }
  }, [visible]);

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
      }}
      className={`fixed bottom-6 right-6 z-40 w-11 h-11 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-brand-600 hover:border-brand-500 hover:shadow-xl motion-safe:transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ${
        visible ? "opacity-100 motion-safe:animate-fade-in pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-label="Scroll to top"
    >
      <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
      </svg>
    </button>
  );
}
