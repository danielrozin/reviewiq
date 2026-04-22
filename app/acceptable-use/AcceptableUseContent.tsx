"use client";

import Link from "next/link";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

const SECTIONS = [
  { id: "purpose", title: "Purpose" },
  { id: "prohibited-activities", title: "Prohibited Activities" },
  { id: "review-guidelines", title: "Review Guidelines" },
  { id: "enforcement", title: "Enforcement" },
  { id: "reporting", title: "Reporting Violations" },
  { id: "changes", title: "Changes to This Policy" },
  { id: "contact", title: "Contact Us" },
];

export function AcceptableUseContent() {
  return (
    <LegalPageLayout
      title="Acceptable Use Policy"
      lastUpdated="March 2026"
      lastUpdatedISO="2026-03"
      sections={SECTIONS}
    >
      <section>
        <p>
          This Acceptable Use Policy sets out the rules for using ReviewIQ. By accessing our
          platform, you agree to comply with this policy alongside our{" "}
          <Link href="/terms" className="text-brand-600 hover:underline">Terms of Service</Link>.
        </p>
      </section>

      <section id="purpose">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Purpose</h2>
        <p>
          ReviewIQ exists to provide honest, AI-powered product reviews built on real buyer
          experiences. This policy ensures the platform remains trustworthy, safe, and useful for everyone.
        </p>
      </section>

      <section id="prohibited-activities">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Prohibited Activities</h2>
        <p className="mb-4">You must not:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Post fake, misleading, or incentivized reviews</li>
          <li>Engage in review manipulation or astroturfing</li>
          <li>Harass, threaten, or abuse other users</li>
          <li>Post spam, advertising, or promotional content</li>
          <li>Impersonate other users or brands</li>
          <li>Use automated tools to submit content or scrape data</li>
          <li>Attempt to circumvent security measures</li>
          <li>Upload malicious code or harmful files</li>
          <li>Violate applicable laws or regulations</li>
        </ul>
      </section>

      <section id="review-guidelines">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Review Guidelines</h2>
        <p className="mb-4">Reviews on ReviewIQ must:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Be based on genuine personal experience with the product</li>
          <li>Be honest and fair, even if critical</li>
          <li>Not contain personal information about other individuals</li>
          <li>Not include hate speech, profanity, or discriminatory language</li>
          <li>Not be compensated or incentivized without disclosure</li>
        </ul>
      </section>

      <section id="enforcement">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Enforcement</h2>
        <p className="mb-4">Violations may result in:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Content removal</li>
          <li>Account warnings or suspension</li>
          <li>Permanent account termination</li>
          <li>Legal action where appropriate</li>
        </ul>
      </section>

      <section id="reporting">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Reporting Violations</h2>
        <p>
          If you encounter content that violates this policy, please report it using the report
          feature on the platform or contact us directly. We investigate all reports promptly.
        </p>
      </section>

      <section id="changes">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Changes to This Policy</h2>
        <p>We may update this policy at any time. Material changes will be reflected in the &ldquo;Last updated&rdquo; date.</p>
      </section>

      <section id="contact">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
        <p className="mb-4">Questions about this policy? Contact us:</p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm">
          <p className="font-semibold text-gray-900 mb-1">ReviewIQ</p>
          <p>Email: <a href="mailto:contact@revieweriq.com" className="text-brand-600 hover:underline">contact@revieweriq.com</a></p>
        </div>
      </section>
    </LegalPageLayout>
  );
}
