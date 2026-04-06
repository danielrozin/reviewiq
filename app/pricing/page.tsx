import type { Metadata } from "next";
import { PricingTiers } from "./PricingTiers";
import { faqSchema } from "@/lib/schema/jsonld";

export const metadata: Metadata = {
  title: "Pricing — ReviewIQ Pro",
  description:
    "Unlock premium features with ReviewIQ Pro: ad-free experience, price tracking alerts, advanced comparison tools, and expert consultation.",
};

export default function PricingPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-50 via-white to-brand-50 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">
            Pricing
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Smarter reviews.{" "}
            <span className="text-brand-600">Better decisions.</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Get the most out of ReviewIQ with our Pro plan. Advanced tools,
            real-time alerts, and expert insights — all for less than a coffee.
          </p>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20">
        <PricingTiers />
      </div>

      {/* FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema(faqs.map((f) => ({ question: f.q, answer: f.a })))),
        }}
      />
      <div className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel with one click from your dashboard. You'll keep Pro access until the end of your billing period — no partial charges, no hassle.",
  },
  {
    q: "Is there a free trial?",
    a: "The Free plan is yours forever — no credit card needed. Upgrade to Pro whenever you're ready for the full experience.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, Amex) through Stripe. Your payment info is never stored on our servers.",
  },
  {
    q: "What happens if I downgrade?",
    a: "You'll keep Pro features until your current billing period ends, then revert to the Free plan. Your data and reviews are never deleted.",
  },
];
