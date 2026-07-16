"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { legalPageSchema } from "@/lib/schema/jsonld";

interface Section {
  id: string;
  title: string;
}

interface LegalPageLayoutProps {
  title: string;
  path: string;
  /**
   * Page-level schema description. Required (not optional, not derived) so tsc
   * proves every legal page supplies one — an optional prop would silently
   * regress a page back to an untyped node. Keep it in sync with the route's
   * buildMetadata() description.
   */
  description: string;
  lastUpdated: string;
  lastUpdatedISO: string;
  sections: Section[];
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  path,
  description,
  lastUpdated,
  lastUpdatedISO,
  sections,
  children,
}: LegalPageLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            legalPageSchema({
              name: title,
              path,
              description,
              dateModified: lastUpdatedISO,
            })
          ),
        }}
      />
      <div className="mb-8 print:hidden">
        <Breadcrumbs items={[{ name: title, url: path }]} />
      </div>

      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block print:hidden">
          <div className="sticky top-24">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
              On this page
            </h2>
            <nav>
              <ul className="space-y-1 border-l border-gray-200">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className={`block pl-4 py-1.5 text-sm transition-colors border-l-2 -ml-px ${
                        activeSection === section.id
                          ? "border-brand-600 text-brand-600 font-medium"
                          : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                      }`}
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
              {title}
            </h1>
            <p className="text-sm text-gray-500">
              Last updated: <time dateTime={lastUpdatedISO}>{lastUpdated}</time>
            </p>
          </div>

          {/* Mobile TOC */}
          <details className="lg:hidden mb-8 bg-gray-50 border border-gray-200 rounded-xl p-4 print:hidden">
            <summary className="text-sm font-semibold text-gray-900 cursor-pointer select-none">
              Table of Contents
            </summary>
            <nav className="mt-3">
              <ol className="space-y-1.5">
                {sections.map((section, i) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-sm text-brand-600 hover:underline"
                    >
                      {i + 1}. {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </details>

          {/* Content */}
          <div className="space-y-10 text-gray-600 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
