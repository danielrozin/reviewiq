"use client";

import { useEffect, useRef, useState } from "react";

interface Section {
  id: string;
  label: string;
}

const SECTIONS: Section[] = [
  { id: "section-summary", label: "Summary" },
  { id: "section-reviews", label: "Reviews" },
  { id: "section-specs", label: "Specs" },
  { id: "section-compare", label: "Compare" },
  { id: "section-faq", label: "FAQ" },
];

export function ProductJumpNav() {
  const [activeId, setActiveId] = useState<string>("");
  const [visible, setVisible] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent keyboard focus on hidden buttons (WCAG 2.4.3)
  useEffect(() => {
    if (!navRef.current) return;
    if (visible) {
      navRef.current.removeAttribute("inert");
    } else {
      navRef.current.setAttribute("inert", "");
    }
  }, [visible]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduced ? "instant" : "smooth" });
  };

  return (
    <div
      ref={navRef}
      className={`block sticky top-14 sm:top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <nav aria-label="Page sections" className="overflow-x-auto scrollbar-none">
          <ul role="list" className="flex items-center gap-0.5 sm:gap-1 h-11 sm:h-10 list-none p-0 m-0">
            {SECTIONS.map(({ id, label }) => (
              <li key={id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => scrollTo(id)}
                  aria-label={`Jump to ${label} section`}
                  aria-current={activeId === id ? "location" : undefined}
                  className={`px-2.5 sm:px-3 py-2 sm:py-1 min-h-[44px] rounded-full text-xs font-medium transition-colors whitespace-nowrap touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 ${
                    activeId === id
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-100"
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
