"use client";

import Link from "next/link";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

const SECTIONS = [
  { id: "what-are-cookies", title: "What Are Cookies" },
  { id: "cookies-we-use", title: "Cookies We Use" },
  { id: "third-party-cookies", title: "Third-Party Cookies" },
  { id: "managing-cookies", title: "Managing Cookies" },
  { id: "consent", title: "Your Consent" },
  { id: "changes", title: "Changes to This Policy" },
  { id: "contact", title: "Contact Us" },
];

export function CookiePolicyContent() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      lastUpdated="March 2026"
      lastUpdatedISO="2026-03"
      sections={SECTIONS}
    >
      <section aria-label="Cookie Policy introduction">
        <p>
          This Cookie Policy explains how ReviewIQ uses cookies and similar technologies.
          Please read it alongside our{" "}
          <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>.
        </p>
      </section>

      <section id="what-are-cookies" aria-labelledby="what-are-cookies-h">
        <h2 id="what-are-cookies-h" className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies</h2>
        <p>
          Cookies are small text files placed on your device when you visit a website. They help sites
          remember your preferences, understand how you use them, and improve your experience.
        </p>
      </section>

      <section id="cookies-we-use" aria-labelledby="cookies-we-use-h">
        <h2 id="cookies-we-use-h" className="text-2xl font-bold text-gray-900 mb-4">2. Cookies We Use</h2>
        <div role="region" aria-label="Cookies we use — scrollable table" tabIndex={0} className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden" aria-label="Cookies we use">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-900">Category</th>
                <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-900">Purpose</th>
                <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-900">Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Essential</td>
                <td className="px-4 py-3">Site functionality, security, authentication</td>
                <td className="px-4 py-3">Yes</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Analytics</td>
                <td className="px-4 py-3">Aggregated usage statistics</td>
                <td className="px-4 py-3">No</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Preferences</td>
                <td className="px-4 py-3">Remember your display and language settings</td>
                <td className="px-4 py-3">No</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Marketing</td>
                <td className="px-4 py-3">Serve relevant advertisements (with consent)</td>
                <td className="px-4 py-3">No</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="third-party-cookies" aria-labelledby="third-party-cookies-h">
        <h2 id="third-party-cookies-h" className="text-2xl font-bold text-gray-900 mb-4">3. Third-Party Cookies</h2>
        <p className="mb-4">Some cookies are set by third-party services we use, including:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Analytics providers (e.g., Google Analytics)</li>
          <li>Advertising networks (where applicable)</li>
          <li>Content delivery services</li>
        </ul>
      </section>

      <section id="managing-cookies" aria-labelledby="managing-cookies-h">
        <h2 id="managing-cookies-h" className="text-2xl font-bold text-gray-900 mb-4">4. Managing Cookies</h2>
        <p className="mb-4">You can control cookies through:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Our cookie consent banner (click &ldquo;Cookie Preferences&rdquo; in the footer)</li>
          <li>Your browser settings</li>
          <li>Third-party opt-out tools</li>
        </ul>
      </section>

      <section id="consent" aria-labelledby="consent-h">
        <h2 id="consent-h" className="text-2xl font-bold text-gray-900 mb-4">5. Your Consent</h2>
        <p>
          Non-essential cookies are only set after you provide consent via our cookie banner.
          You can withdraw or modify your consent at any time by clicking &ldquo;Cookie Preferences&rdquo;
          in the footer of any page.
        </p>
      </section>

      <section id="changes" aria-labelledby="cookie-changes-h">
        <h2 id="cookie-changes-h" className="text-2xl font-bold text-gray-900 mb-4">6. Changes to This Policy</h2>
        <p>We may update this Cookie Policy at any time. Changes are reflected in the &ldquo;Last updated&rdquo; date.</p>
      </section>

      <section id="contact" aria-labelledby="cookie-contact-h">
        <h2 id="cookie-contact-h" className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
        <p className="mb-4">Questions about cookies? Contact us:</p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm">
          <p className="font-semibold text-gray-900 mb-1">ReviewIQ</p>
          <p>Email: <a href="mailto:contact@revieweriq.com" className="text-brand-600 hover:underline">contact@revieweriq.com</a></p>
        </div>
      </section>
    </LegalPageLayout>
  );
}
