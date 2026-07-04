import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/schema/jsonld";

export const metadata = buildMetadata({
  title: "About ReviewIQ — AI-Powered Honest Product Reviews",
  description:
    "ReviewIQ is an AI-powered product review platform built to fix the broken review ecosystem. Honest intelligence, verified buyers, zero affiliate links.",
  path: "/about",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

const aboutPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/about`,
  name: "About ReviewIQ — AI-Powered Honest Product Reviews",
  url: `${SITE_URL}/about`,
  inLanguage: "en",
  description:
    "ReviewIQ is an AI-powered product review platform built to fix the broken review ecosystem. Honest intelligence, verified buyers, zero affiliate links.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [
      "[data-speakable='about-mission']",
      "[data-speakable='about-why']",
      "[data-speakable='about-principles']",
    ],
  },
};

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

const teamPersonsJsonLd = {
  "@context": "https://schema.org",
  "@graph": TEAM.map((member) => ({
    "@type": "Person",
    name: member.name,
    jobTitle: member.role,
    description: member.bio,
    worksFor: { "@id": `${SITE_URL}/#organization` },
  })),
};

const STATS = [
  {
    value: "20K+", label: "Verified Reviews", color: "bg-emerald-100 text-emerald-700",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  },
  {
    value: "500+", label: "Products Analyzed", color: "bg-brand-100 text-brand-700",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>,
  },
  {
    value: "78%", label: "Verified Purchase Rate", color: "bg-amber-100 text-amber-700",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>,
  },
  {
    value: "10", label: "Product Categories", color: "bg-purple-100 text-purple-700",
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>,
  },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(teamPersonsJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([{ name: "About", url: "/about" }])),
        }}
      />
      <Breadcrumbs items={[{ name: "About", url: "/about" }]} />

      {/* Hero */}
      <div className="mt-8 mb-16 max-w-3xl" data-speakable="about-mission">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-medium mb-4 border border-brand-100">
          <span className="w-2 h-2 bg-brand-500 rounded-full" />
          Our mission
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.1] mb-6">
          Reviews you can{" "}
          <span className="text-brand-600">actually trust</span>
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
          The review ecosystem is broken. Most reviews online are manipulated, affiliate-driven, or shallow. We built ReviewIQ to fix that — combining structured buyer reviews with AI analysis, zero affiliate revenue, and transparent verification.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-20">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
            <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="p-5 text-center">
              <div aria-hidden="true" className={`w-9 h-9 ${s.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                {s.icon}
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-600 mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Why we built this */}
      <section aria-labelledby="about-why-heading" className="mb-20" data-speakable="about-why">
        <h2 id="about-why-heading" className="text-2xl font-bold text-gray-900 mb-2">Why we built this</h2>
        <p className="text-gray-600 mb-8 max-w-2xl leading-relaxed">
          We were tired of reading hundreds of reviews and still not knowing if a product was right for us. A 4.2-star rating tells you almost nothing. What we really wanted to know:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            "What are the recurring problems after 6+ months of use?",
            "Who is this product really best for — and who should avoid it?",
            "What do verified buyers consistently love and hate?",
            "How does it compare to the alternative everyone's considering?",
          ].map((q, i) => (
            <div key={i} className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4 hover:border-brand-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section aria-labelledby="about-principles-heading" className="mb-20" data-speakable="about-principles">
        <h2 id="about-principles-heading" className="text-2xl font-bold text-gray-900 mb-2">Our principles</h2>
        <p className="text-gray-600 mb-8 max-w-2xl">Four rules we never break.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="flex gap-4 p-6">
                <div aria-hidden="true" className={`w-9 h-9 rounded-xl ${p.color} flex items-center justify-center shrink-0`}>
                  {p.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{p.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section aria-labelledby="about-team-heading" className="mb-20">
        <h2 id="about-team-heading" className="text-2xl font-bold text-gray-900 mb-2">The team</h2>
        <p className="text-gray-600 mb-8 max-w-2xl leading-relaxed">
          We&apos;re a small, opinionated team with strong feelings about how product information should work.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TEAM.map((member) => (
            <div key={member.name} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div aria-hidden="true" className="h-0.5 w-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="flex flex-col items-center text-center p-6">
                <div className={`w-16 h-16 rounded-2xl ${member.color} text-white flex items-center justify-center text-xl font-bold mb-4`}>
                  {member.initials}
                </div>
                <h3 className="font-semibold text-gray-900 mb-0.5">{member.name}</h3>
                <p className="text-xs font-medium text-brand-600 mb-3">{member.role}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section aria-labelledby="about-cta-heading" className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-3xl p-10 text-center text-white">
        <h2 id="about-cta-heading" className="text-2xl font-bold mb-3">Want to get involved?</h2>
        <p className="text-brand-100 max-w-xl mx-auto mb-6">
          We&apos;re in early access and actively looking for feedback, early reviewers, and people who share our mission of fixing product reviews.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/write-review"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
            Write a Review
          </Link>
          <a
            href="mailto:hello@reviewiq.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500/30 text-white font-semibold rounded-xl hover:bg-brand-500/50 transition-colors border border-brand-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
            hello@reviewiq.com
          </a>
        </div>
      </section>
    </div>
  );
}
