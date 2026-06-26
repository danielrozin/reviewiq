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

      {/* Trust Principles */}
      <section className="mt-20 bg-gradient-to-br from-gray-50 to-brand-50/30 rounded-2xl p-8 lg:p-12 max-w-4xl border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Our Trust Principles
        </h2>
        <p className="text-gray-500 mb-8">The commitments that make ReviewIQ different from every other review site.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            {
              icon: "🚫",
              title: "No Affiliate Links",
              text: "We never earn commissions from product purchases. Our only incentive is giving you honest information.",
            },
            {
              icon: "🏆",
              title: "No Sponsored Rankings",
              text: "Brands cannot pay to rank higher. SmartScores are calculated algorithmically from verified buyer data.",
            },
            {
              icon: "🔍",
              title: "Transparent Verification",
              text: "Every review shows its verification tier. You always know whether a reviewer actually bought the product.",
            },
            {
              icon: "💬",
              title: "Negative Reviews Welcome",
              text: "We believe negative reviews are often the most valuable. We never suppress critical feedback.",
            },
          ].map((principle) => (
            <div key={principle.title} className="flex gap-4">
              <span className="text-2xl shrink-0">{principle.icon}</span>
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
