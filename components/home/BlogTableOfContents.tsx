"use client";

import { useEffect, useRef, useState } from "react";

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface BlogTableOfContentsProps {
  headings: TocHeading[];
  className?: string;
}

export function BlogTableOfContents({ headings, className = "" }: BlogTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 }
    );

    els.forEach((el) => observerRef.current!.observe(el));
    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className={`${className}`}
    >
      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
        On this page
      </p>
      <ol role="list" className="space-y-0.5">
        {headings.map((heading) => {
          const active = activeId === heading.id;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                aria-current={active ? "location" : undefined}
                className={`flex min-h-[44px] touch-manipulation items-center px-2.5 py-1.5 text-sm rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 ${
                  heading.level === 3 ? "pl-5 text-[13px]" : ""
                } ${
                  active
                    ? "text-brand-700 bg-brand-50 font-medium"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(heading.id);
                  if (el) {
                    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                    el.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
                    // Headings are not natively focusable; temporarily add tabindex="-1" so
                    // programmatic focus moves AT reading position to the target section
                    // rather than leaving focus on the now-scrolled-away TOC link (WCAG 2.4.3).
                    el.setAttribute("tabindex", "-1");
                    el.focus({ preventScroll: true });
                    el.addEventListener("blur", () => el.removeAttribute("tabindex"), { once: true });
                  }
                }}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
