"use client";

import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

const SECTIONS = [
  { id: "information-we-collect", title: "Information We Collect" },
  { id: "cookies", title: "Cookies and Tracking" },
  { id: "analytics", title: "Analytics" },
  { id: "how-we-use", title: "How We Use Your Information" },
  { id: "data-sharing", title: "Data Sharing" },
  { id: "your-rights", title: "Your Rights" },
  { id: "data-retention", title: "Data Retention" },
  { id: "data-security", title: "Data Security" },
  { id: "childrens-privacy", title: "Children's Privacy" },
  { id: "changes", title: "Changes to This Policy" },
  { id: "contact", title: "Contact Us" },
];

export function PrivacyContent() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="March 2026"
      lastUpdatedISO="2026-03"
      sections={SECTIONS}
    >
      <section>
        <p>
          Welcome to ReviewIQ. This Privacy Policy explains how we collect, use, disclose, and safeguard
          your information when you visit our website. Please read this policy carefully.
        </p>
      </section>

      <section id="information-we-collect">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Information You Provide</h3>
        <p className="mb-4">
          When you create an account, write a review, or contact us, we collect the information you provide
          including your name, email address, and review content.
        </p>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Automatically Collected Information</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>IP address (anonymized where required)</li>
          <li>Browser type and version</li>
          <li>Pages visited and time spent</li>
          <li>Device type and screen resolution</li>
          <li>Referring URLs</li>
        </ul>
      </section>

      <section id="cookies">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Cookies and Tracking Technologies</h2>
        <p className="mb-4">ReviewIQ uses cookies to enhance your experience:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong className="text-gray-900">Essential cookies:</strong> Required for the website to function.</li>
          <li><strong className="text-gray-900">Analytics cookies:</strong> Aggregated, anonymous usage data.</li>
          <li><strong className="text-gray-900">Preference cookies:</strong> Remember your settings.</li>
        </ul>
      </section>

      <section id="analytics">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Analytics</h2>
        <p>
          We use third-party analytics services to understand usage patterns. Analytics data is
          retained in aggregated, anonymized form and is not sold to third parties.
        </p>
      </section>

      <section id="how-we-use">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Operate and improve ReviewIQ</li>
          <li>Display and moderate reviews</li>
          <li>Respond to inquiries and support requests</li>
          <li>Analyze usage and optimize content</li>
          <li>Detect and prevent abuse</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section id="data-sharing">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Sharing</h2>
        <p className="mb-4">We do not sell your personal information. We may share data with:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong className="text-gray-900">Service providers:</strong> Trusted vendors under confidentiality obligations.</li>
          <li><strong className="text-gray-900">Legal requirements:</strong> When required by law.</li>
          <li><strong className="text-gray-900">Business transfers:</strong> In the event of a merger or acquisition.</li>
        </ul>
      </section>

      <section id="your-rights">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
        <p className="mb-4">Depending on your location, you may have the right to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access your personal data</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Restrict processing of your data</li>
          <li>Data portability</li>
          <li>Object to processing</li>
        </ul>
      </section>

      <section id="data-retention">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
        <p>We retain personal data only as long as necessary for the purposes described in this policy.</p>
      </section>

      <section id="data-security">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Security</h2>
        <p>
          We implement industry-standard measures including HTTPS encryption, access controls,
          and regular security reviews to protect your information.
        </p>
      </section>

      <section id="childrens-privacy">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
        <p>ReviewIQ is not directed to children under 13. We do not knowingly collect personal information from children.</p>
      </section>

      <section id="changes">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Material changes will be reflected in the &ldquo;Last updated&rdquo; date.</p>
      </section>

      <section id="contact">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us:</p>
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm">
          <p className="font-semibold text-gray-900 mb-1">ReviewIQ</p>
          <p>Email: <a href="mailto:contact@revieweriq.com" className="text-brand-600 hover:underline">contact@revieweriq.com</a></p>
        </div>
      </section>
    </LegalPageLayout>
  );
}
