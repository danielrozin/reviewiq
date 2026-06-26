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
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            30-day money-back guarantee — no risk
          </div>
        </div>
      </div>

      {/* Social proof bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-sm text-gray-600">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["A","B","C","D"].map((l) => (
                <span key={l} className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs border-2 border-white shadow-sm">{l}</span>
              ))}
            </div>
            <span><strong className="text-gray-900">3,200+</strong> Pro members</span>
          </div>
          <div className="hidden sm:block w-px h-5 bg-gray-200" />
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-lg">★★★★★</span>
            <span><strong className="text-gray-900">4.9/5</strong> average rating</span>
          </div>
          <div className="hidden sm:block w-px h-5 bg-gray-200" />
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Cancel anytime, no questions</span>
          </div>
        </div>

        {/* Testimonials row */}
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          {[
            { quote: "Saved me from buying a $600 vacuum that reviewers called a fire hazard.", name: "Sarah K.", role: "Pro member" },
            { quote: "The AI summaries are scary good. I can read a product in 30 seconds.", name: "Marcus T.", role: "Pro member since 2024" },
            { quote: "Compared 4 coffee machines in 5 minutes. No other site comes close.", name: "Priya L.", role: "Verified buyer" },
          ].map((t) => (
            <div key={t.name} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <p className="text-sm text-gray-600 leading-relaxed italic mb-3">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
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
