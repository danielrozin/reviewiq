import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "About ReviewIQ — AI-Powered Honest Product Reviews",
  description:
    "ReviewIQ is an AI-powered product review platform built to fix the broken review ecosystem. Honest intelligence, verified buyers, zero affiliate links.",
  path: "/about",
});

const TEAM = [
  {
    name: "Alex Chen",
    role: "Co-founder & CEO",
    bio: "Former product lead at a major e-commerce platform. Spent 8 years watching fake reviews erode consumer trust.",
    initials: "AC",
    color: "bg-brand-500",
  },
  {
    name: "Sarah Kim",
    role: "Co-founder & CTO",
    bio: "Machine learning engineer with a PhD in NLP. Built the AI analysis engine that powers SmartScore.",
    initials: "SK",
    color: "bg-emerald-500",
  },
  {
    name: "Marcus Webb",
    role: "Head of Data",
    bio: "Former data scientist at a consumer insights firm. Designed our structured review schema and verification tiers.",
    initials: "MW",
    color: "bg-amber-500",
  },
  {
    name: "Priya Nair",
    role: "Head of Product",
    bio: "10 years in consumer tech product design. Obsessed with making complex data instantly understandable.",
    initials: "PN",
    color: "bg-purple-500",
  },
];

const STATS = [
  { value: "20K+", label: "Verified Reviews", icon: "✓", color: "bg-emerald-100 text-emerald-700" },
  { value: "500+", label: "Products Analyzed", icon: "📊", color: "bg-brand-100 text-brand-700" },
  { value: "78%", label: "Verified Purchase Rate", icon: "🛒", color: "bg-amber-100 text-amber-700" },
  { value: "10", label: "Product Categories", icon: "🗂️", color: "bg-purple-100 text-purple-700" },
];

const PRINCIPLES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 01.04 11.07c-.01.206-.01.41 0 .617A12.003 12.003 0 006 21.43a12 12 0 009.96-9.743c.01-.206.01-.41 0-.617A11.95 11.95 0 0020.402 6a11.959 11.959 0 01-8.402-3.036z" />
      </svg>
    ),
    color: "bg-emerald-50 text-emerald-600",
    title: "Verified Buyers Only",
    text: "We accept reviews exclusively from people who can prove they own the product. Receipt uploads, email receipts, retailer confirmation — the verification tier is always visible.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    color: "bg-red-50 text-red-600",
    title: "Zero Affiliate Revenue",
    text: "We earn nothing from purchases. No affiliate links, no sponsored placements, no paid rankings. Our only incentive is helping you make the right call.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    color: "bg-brand-50 text-brand-600",
    title: "AI-Synthesized, Not Averaged",
    text: "We don't average stars. Our AI reads every review and synthesizes recurring patterns — what consistently breaks, who it's really for, and what nobody tells you upfront.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
      </svg>
    ),
    color: "bg-amber-50 text-amber-600",
    title: "Structured, Not Freeform",
    text: "Every review captures pros, cons, reliability, ease of use, value, time owned, and experience level. We ask the questions most reviewers forget to answer.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ name: "About", url: "/about" }]} />

      {/* Hero */}
      <div className="mt-8 mb-16 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-medium mb-4 border border-brand-100">
          <span className="w-2 h-2 bg-brand-500 rounded-full" />
          Our mission
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.1] mb-6">
          Reviews you can{" "}
          <span className="text-brand-600">actually trust</span>
        </h1>
        <p className="text-xl text-gray-500 leading-relaxed max-w-2xl">
          The review ecosystem is broken. Most reviews online are manipulated, affiliate-driven, or shallow. We built ReviewIQ to fix that — combining structured buyer reviews with AI analysis, zero affiliate revenue, and transparent verification.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-20">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5 text-center hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mx-auto mb-3 text-lg font-bold`}>
              {s.icon}
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Why we built this */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Why we built this</h2>
        <p className="text-gray-500 mb-8 max-w-2xl">
          We were tired of reading hundreds of reviews and still not knowing if a product was right for us. A 4.2-star rating tells you almost nothing. What we really wanted to know:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            "What are the recurring problems after 6+ months of use?",
            "Who is this product really best for — and who should avoid it?",
            "What do verified buyers consistently love and hate?",
            "How does it compare to the alternative everyone's considering?",
          ].map((q, i) => (
            <div key={i} className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4">
              <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Our principles</h2>
        <p className="text-gray-500 mb-8 max-w-2xl">Four rules we never break.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="bg-white border border-gray-100 rounded-2xl p-6 flex gap-4">
              <div className={`w-11 h-11 rounded-xl ${p.color} flex items-center justify-center shrink-0`}>
                {p.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">The team</h2>
        <p className="text-gray-500 mb-8 max-w-2xl">
          We&apos;re a small, opinionated team with strong feelings about how product information should work.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TEAM.map((member) => (
            <div key={member.name} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className={`w-16 h-16 rounded-2xl ${member.color} text-white flex items-center justify-center text-xl font-bold mb-4`}>
                {member.initials}
              </div>
              <h3 className="font-semibold text-gray-900 mb-0.5">{member.name}</h3>
              <p className="text-xs font-medium text-brand-600 mb-3">{member.role}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-3xl p-10 text-center text-white">
        <h2 className="text-2xl font-bold mb-3">Want to get involved?</h2>
        <p className="text-brand-100 max-w-xl mx-auto mb-6">
          We&apos;re in early access and actively looking for feedback, early reviewers, and people who share our mission of fixing product reviews.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/write-review"
            className="px-6 py-3 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors"
          >
            Write a Review
          </Link>
          <a
            href="mailto:hello@reviewiq.com"
            className="px-6 py-3 bg-brand-500/30 text-white font-semibold rounded-xl hover:bg-brand-500/50 transition-colors border border-brand-400/30"
          >
            hello@reviewiq.com
          </a>
        </div>
      </section>
    </div>
  );
}
