import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "How It Works",
  description:
    "Learn how ReviewIQ uses AI-powered analysis and verified buyer data to deliver honest, structured product reviews you can trust.",
  path: "/how-it-works",
});

const steps = [
  {
    number: "01",
    icon: "✓",
    color: "bg-emerald-500",
    lightBg: "bg-emerald-50",
    textColor: "text-emerald-600",
    title: "Verified Buyers Submit Structured Reviews",
    description:
      "Unlike traditional review platforms, ReviewIQ asks reviewers to share specific details: how long they've owned the product, their experience level, and separate ratings for reliability, ease of use, and value. Every review includes a verification tier so you know how trustworthy it is.",
    details: [
      "Receipt upload, email receipt, or retailer verification",
      "Structured pros and cons — not just a star rating",
      "Time-owned context so you see long-term reliability",
      "Experience level helps you find reviews from people like you",
    ],
  },
  {
    number: "02",
    icon: "🤖",
    color: "bg-brand-500",
    lightBg: "bg-brand-50",
    textColor: "text-brand-600",
    title: "AI Analyzes Thousands of Experiences",
    description:
      "Our AI reads every verified review and identifies patterns that individual reviews miss. It surfaces recurring praise, recurring complaints, and builds a complete picture of what owning the product is actually like.",
    details: [
      "What people love — consistent strengths across buyers",
      "What people hate — real problems, not one-off complaints",
      "Best for / Not for — who should and shouldn't buy",
      "Recurring issues with severity and mention counts",
    ],
  },
  {
    number: "03",
    icon: "📊",
    color: "bg-purple-500",
    lightBg: "bg-purple-50",
    textColor: "text-purple-600",
    title: "SmartScore Ranks Products Honestly",
    description:
      "Every product gets a SmartScore from 0 to 100. It's not just an average rating — it factors in verification rate, review consistency, recurring issues severity, and long-term ownership feedback. Higher verified purchase rates mean a more trustworthy score.",
    details: [
      "Weighted by verification tier — verified reviews count more",
      "Penalized for recurring high-severity issues",
      "Rewards consistency across many reviewers",
      "Long-term ownership reviews weighted higher than first-week impressions",
    ],
  },
  {
    number: "04",
    icon: "🎯",
    color: "bg-amber-500",
    lightBg: "bg-amber-50",
    textColor: "text-amber-600",
    title: "You Make Smarter Decisions",
    description:
      "Browse structured product pages with everything you need: AI summaries, specs, comparisons, recurring issues, and FAQ — all in one place. No affiliate links. No sponsored placements. Just honest intelligence.",
    details: [
      "Side-by-side comparisons based on real search demand",
      "FAQ sections answering the questions real buyers ask",
      "Technical specs alongside real-world experience data",
      "Zero affiliate links — we never profit from your purchase",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ name: "How It Works", url: "/how-it-works" }]} />

      {/* Hero */}
      <div className="mt-8 mb-16 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-medium mb-4 border border-brand-100">
          <span className="w-2 h-2 bg-brand-500 rounded-full" />
          The ReviewIQ system
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          How ReviewIQ Works
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          Most online reviews are manipulated, shallow, or driven by affiliate
          commissions. ReviewIQ is different. We built a system where trust,
          structure, and AI analysis replace star-rating noise.
        </p>
      </div>

      {/* Timeline steps */}
      <div className="relative max-w-4xl">
        {/* Vertical connector line */}
        <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-gradient-to-b from-emerald-200 via-brand-200 to-amber-200 hidden sm:block" aria-hidden="true" />

        <div className="space-y-12">
          {steps.map((step, index) => (
            <section key={step.number} className="relative flex gap-6 sm:gap-8">
              {/* Step number bubble */}
              <div className="shrink-0 relative z-10">
                <div className={`w-12 h-12 ${step.color} rounded-2xl flex items-center justify-center text-white text-xl shadow-md`}>
                  {step.icon}
                </div>
              </div>

              {/* Content card */}
              <div className={`flex-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs font-bold ${step.textColor} ${step.lightBg} px-2.5 py-1 rounded-full`}>
                    Step {step.number}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {step.description}
                </p>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {step.details.map((detail, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className={`${step.textColor} mt-0.5 shrink-0 font-bold`}>✓</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* ReviewIQ vs Traditional Reviews comparison table */}
      <section className="mt-16 max-w-4xl">
        <h2 className="text-xl font-bold text-gray-900 mb-2">ReviewIQ vs. Traditional Review Sites</h2>
        <p className="text-gray-500 text-sm mb-6">See exactly how we&apos;re different in the ways that matter.</p>
        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-2/5">Feature</th>
                <th className="text-center px-4 py-3.5 w-[30%]">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-lg">
                    ✓ ReviewIQ
                  </span>
                </th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[30%]">Traditional Sites</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Verified buyer reviews", us: true, them: false },
                { feature: "AI pattern analysis", us: true, them: false },
                { feature: "Affiliate-free rankings", us: true, them: false },
                { feature: "Recurring issue tracking", us: true, them: false },
                { feature: "SmartScore (weighted algorithm)", us: true, them: false },
                { feature: "Best For / Not For signals", us: true, them: false },
                { feature: "Side-by-side comparison", us: true, them: "partial" },
                { feature: "Anonymous star ratings", us: "partial", them: true },
              ].map((row, i) => (
                <tr key={row.feature} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                  <td className="px-5 py-3.5 font-medium text-gray-700">{row.feature}</td>
                  <td className="px-4 py-3.5 text-center">
                    {row.us === true ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold">✓</span>
                    ) : row.us === "partial" ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-50 text-amber-500 rounded-full text-xs font-bold">~</span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-300 rounded-full text-xs font-bold">✗</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {row.them === true ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold">✓</span>
                    ) : row.them === "partial" ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-50 text-amber-500 rounded-full text-xs font-bold">~</span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-300 rounded-full text-xs font-bold">✗</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Trust Principles */}
      <section className="mt-20 bg-gradient-to-br from-gray-50 to-brand-50/30 rounded-2xl p-8 lg:p-12 max-w-4xl border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Our Trust Principles
        </h2>
        <p className="text-gray-500 mb-8">The commitments that make ReviewIQ different from every other review site.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            {
              iconBg: "bg-red-50",
              iconColor: "text-red-500",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              ),
              title: "No Affiliate Links",
              text: "We never earn commissions from product purchases. Our only incentive is giving you honest information.",
            },
            {
              iconBg: "bg-amber-50",
              iconColor: "text-amber-500",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
              ),
              title: "No Sponsored Rankings",
              text: "Brands cannot pay to rank higher. SmartScores are calculated algorithmically from verified buyer data.",
            },
            {
              iconBg: "bg-brand-50",
              iconColor: "text-brand-500",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              ),
              title: "Transparent Verification",
              text: "Every review shows its verification tier. You always know whether a reviewer actually bought the product.",
            },
            {
              iconBg: "bg-emerald-50",
              iconColor: "text-emerald-500",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
              ),
              title: "Negative Reviews Welcome",
              text: "We believe negative reviews are often the most valuable. We never suppress critical feedback.",
            },
          ].map((principle) => (
            <div key={principle.title} className="flex gap-4">
              <div className={`w-10 h-10 ${principle.iconBg} ${principle.iconColor} rounded-xl flex items-center justify-center shrink-0`}>
                {principle.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {principle.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {principle.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
