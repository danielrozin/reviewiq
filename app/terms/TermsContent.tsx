"use client";

import Link from "next/link";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

const SECTIONS = [
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "use-of-site", title: "Use of the Site" },
  { id: "user-content", title: "User Content and Reviews" },
  { id: "intellectual-property", title: "Intellectual Property" },
  { id: "disclaimers", title: "Disclaimers" },
  { id: "limitation-of-liability", title: "Limitation of Liability" },
  { id: "termination", title: "Termination" },
  { id: "governing-law", title: "Governing Law" },
  { id: "changes", title: "Changes to These Terms" },
  { id: "contact", title: "Contact" },
];

export function TermsContent() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated="March 2026"
      lastUpdatedISO="2026-03"
      sections={SECTIONS}
    >
      <section>
        <p>
          Please read these Terms of Service carefully before using ReviewIQ. By accessing the site,
          you agree to be bound by these terms.
        </p>
      </section>

      <section id="acceptance">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing ReviewIQ, you confirm that you are at least 13 years of age, have read and
          understood these Terms, and agree to be legally bound by them.
        </p>
      </section>

      <section id="use-of-site">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of the Site</h2>
        <p className="mb-4">ReviewIQ grants you a limited license for personal, non-commercial use. You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Use the Site for unlawful purposes</li>
          <li>Attempt unauthorized access to our systems</li>
          <li>Use automated tools to scrape content without consent</li>
          <li>Submit false or misleading reviews</li>
          <li>Interfere with the Site&apos;s integrity or performance</li>
        </ul>
      </section>

      <section id="user-content">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Content and Reviews</h2>
        <p className="mb-4">
          By submitting reviews or content, you grant ReviewIQ a worldwide, royalty-free license to
          use, display, and distribute that content for operating the platform.
        </p>
        <p>Reviews must be honest, based on genuine experience, and comply with our community guidelines.</p>
      </section>

      <section id="intellectual-property">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Intellectual Property</h2>
        <p>
          All ReviewIQ content, design, and code is protected by intellectual property laws.
          You may not reproduce or distribute content without written permission.
        </p>
      </section>

      <section id="disclaimers">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Disclaimers</h2>
        <p>
          THE SITE IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTIES OF ANY KIND. Reviews represent individual
          user opinions and should not be treated as professional product advice.
        </p>
      </section>

      <section id="limitation-of-liability">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, REVIEWIQ SHALL NOT BE LIABLE FOR ANY INDIRECT,
          INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SITE.
        </p>
      </section>

      <section id="termination">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Termination</h2>
        <p>We may terminate or restrict your access at any time for violation of these Terms.</p>
      </section>

      <section id="governing-law">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Governing Law</h2>
        <p>These Terms shall be governed by applicable laws. Disputes shall first be resolved through good-faith negotiation.</p>
      </section>

      <section id="changes">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to These Terms</h2>
        <p>We may update these Terms at any time. Continued use constitutes acceptance.</p>
      </section>

      <section id="contact">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact</h2>
        <p className="mb-4">Questions about these Terms? Contact us:</p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm">
          <p className="font-semibold text-gray-900 mb-1">ReviewIQ</p>
          <p>Email: <a href="mailto:contact@revieweriq.com" className="text-brand-600 hover:underline">contact@revieweriq.com</a></p>
        </div>
      </section>
    </LegalPageLayout>
  );
}
