import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqSchema } from "@/lib/schema/jsonld";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://revieweriq.com";

export const metadata = buildMetadata({
  title: "Who Is ReviewIQ For?",
  description:
    "Find out if ReviewIQ is right for you. AI-powered product reviews for robot vacuum and coffee machine buyers who want honest, data-driven recommendations — not affiliate-driven picks.",
  path: "/who-is-this-for",
});

const personas = [
  {
    title: "You're buying a robot vacuum and overwhelmed by choices",
    scenario:
      "You have a 3-bedroom home with pets and hardwood floors. You need a robot vacuum under $500 that handles pet hair and won't scratch your floors.",
    queries: [
      "best robot vacuum for pet hair 2026",
      "robot vacuum hardwood floors under 500",
      "robot vacuum for large home with dogs",
    ],
    outcome:
      "AI-analyzed reviews from verified buyers, structured pros and cons, and scenario-matched recommendations filtered by your home type, budget, and needs.",
  },
  {
    title: "You're upgrading your coffee setup and want honest data",
    scenario:
      "You're a home barista wanting to upgrade from a Nespresso to a semi-automatic espresso machine under $800. You need to know which machines actually pull good shots — not which ones pay the highest affiliate commissions.",
    queries: [
      "best espresso machine for home 2026",
      "Breville vs De'Longhi espresso machine",
      "semi-automatic espresso machine under 800",
    ],
    outcome:
      "Verified buyer reviews, feature-by-feature comparison, and a buying guide with price-performance analysis across brands and price points.",
  },
  {
    title: "You don't trust typical review sites",
    scenario:
      "You've read 5 different \"best robot vacuum\" articles and they all recommend different products. You suspect affiliate commissions are driving their picks. You want structured, data-driven analysis from people who actually own the product.",
    queries: [
      "honest robot vacuum review",
      "unbiased product reviews no affiliate",
      "which robot vacuum is actually best",
    ],
    outcome:
      "AI-powered analysis of real buyer data, transparent methodology, no hidden affiliate bias. Every review shows its verification tier so you know how trustworthy it is.",
  },
  {
    title: "You need guidance in a category you know nothing about",
    scenario:
      "You're a first-time buyer. You don't know what suction power matters, what HEPA filtration means, or whether you need LiDAR mapping. You need education before you spend $200–$1,500 on something you've never owned.",
    queries: [
      "robot vacuum buying guide 2026",
      "what to look for in a coffee machine",
      "robot vacuum features explained for beginners",
    ],
    outcome:
      "Step-by-step buying guides, jargon-free explanations, and category-specific checklists that walk you from zero knowledge to a confident purchase.",
  },
];

const notForYou = [
  {
    title: "You want reviews for every product category",
    detail:
      "We currently specialize in Robot Vacuums and Coffee Machines. More categories are coming, but we go deep rather than wide.",
  },
  {
    title: "You want to buy directly on our site",
    detail:
      "We review and recommend — we don't sell products. We never earn commissions from your purchase.",
  },
  {
    title: "You need enterprise or B2B product reviews",
    detail:
      "We focus on consumer products for home use. For B2B software reviews, try G2 or Capterra.",
  },
  {
    title: "You want unstructured personal opinion blogs",
    detail:
      "Our reviews are data-driven and AI-verified from verified buyer experiences, not subjective essays.",
  },
];

const useCases = [
  {
    title: "\"My old vacuum died, I need a replacement by Friday\"",
    description:
      "A busy parent with 2 kids and a dog searches for the best robot vacuum under $400. ReviewIQ's AI-matched recommendation narrows 50+ options to 3 perfect matches based on their floor type (hardwood + carpet), home size (1,800 sq ft), and budget ($300–$400).",
    cta: { label: "Browse Robot Vacuums", href: "/category/robot-vacuums" },
  },
  {
    title: "\"I want to gift a coffee machine to my partner\"",
    description:
      "Someone who knows nothing about coffee machines uses our buying guide to understand the difference between drip, espresso, and pod machines, then picks the right one for a coffee enthusiast with a $200–$500 budget.",
    cta: { label: "Read Coffee Machine Guide", href: "/category/coffee-machines" },
  },
  {
    title: "\"I saw a TikTok about the Roborock S8 but is it actually good?\"",
    description:
      "A skeptical buyer who saw social media hype wants verified buyer data and honest analysis before spending $800. They find the Roborock S8 page with AI-analyzed reviews, recurring issues, and a SmartScore — not a sponsored endorsement.",
    cta: { label: "See How Reviews Work", href: "/how-it-works" },
  },
];

const steps = [
  {
    number: "01",
    title: "Pick your category",
    description:
      "Browse Robot Vacuums, Coffee Machines, or upcoming categories. Each category has curated products with full review data.",
  },
  {
    number: "02",
    title: "Read AI-analyzed reviews",
    description:
      "Every product has structured analysis from verified buyer data — what people love, what they hate, and who should or shouldn't buy it.",
  },
  {
    number: "03",
    title: "Compare options side by side",
    description:
      "Use our comparison tool to see two products head-to-head on the specs that actually matter for your use case and budget ($100–$2,000).",
  },
  {
    number: "04",
    title: "Follow the buying guide",
    description:
      "Step-by-step guidance tailored to your needs — whether you're a first-time buyer, upgrading, or buying a gift.",
  },
];

const stats = [
  { value: "AI-Powered", label: "Analysis of thousands of verified buyer reviews per product" },
  { value: "Structured", label: "Specs, pros/cons, and use-case matching on every product" },
  { value: "2026", label: "Category-specific buying guides updated for current models" },
  { value: "Zero", label: "Affiliate links — we never profit from your purchase" },
];

const faqItems = [
  {
    question: "What is ReviewIQ / ReviewIQ?",
    answer:
      "ReviewIQ is an AI-powered product review platform for consumer products. We analyze verified buyer reviews to provide honest, structured product intelligence for categories like robot vacuums ($100–$1,500) and coffee machines ($50–$2,000).",
  },
  {
    question: "What products does ReviewIQ cover?",
    answer:
      "We currently specialize in Robot Vacuums and Coffee Machines. We go deep in each category with AI-analyzed reviews, buying guides, and side-by-side comparisons. More categories are being added.",
  },
  {
    question: "Is ReviewIQ free to use?",
    answer:
      "Yes. All product reviews, buying guides, and comparisons are free. We do not use affiliate links and never earn commissions from your purchases.",
  },
  {
    question: "How is ReviewIQ different from other review sites?",
    answer:
      "Most review sites earn affiliate commissions, which can bias their recommendations. ReviewIQ uses AI to analyze verified buyer reviews and has zero affiliate links. Every review shows a verification tier so you know whether the reviewer actually owns the product.",
  },
  {
    question: "What is the best robot vacuum for pet hair under $500?",
    answer:
      "The best robot vacuum for pet hair under $500 depends on your floor type, home size, and specific needs (like self-emptying or mopping). Use our Robot Vacuums category page to filter by these criteria and see AI-analyzed recommendations from verified buyers.",
  },
  {
    question: "What should I look for when buying a coffee machine?",
    answer:
      "Key factors include your preferred coffee type (drip, espresso, pod), budget ($50–$2,000), counter space, and daily cup count. Our Coffee Machines buying guide walks you through each factor with data-driven recommendations.",
  },
  {
    question: "Can I trust ReviewIQ's product recommendations?",
    answer:
      "Yes. Our SmartScore algorithm factors in verification rate, review consistency, recurring issue severity, and long-term ownership feedback. We never accept payment for rankings and all our methodology is transparent.",
  },
];

export default function WhoIsThisForPage() {
  const speakableJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Who Is ReviewIQ For?",
    url: `${SITE_URL}/who-is-this-for`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [
        "[data-speakable='page-intro']",
        "[data-speakable='personas']",
        "[data-speakable='how-it-works']",
      ],
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ name: "Who Is This For", url: "/who-is-this-for" }]} />

      {/* JSON-LD Schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }} />

      {/* Hero / Intro */}
      <header className="mt-8 mb-16 max-w-3xl" data-speakable="page-intro">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Who Is ReviewIQ For?
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          ReviewIQ is an AI-powered product review platform for consumers researching robot vacuums ($100–$1,500) and coffee machines ($50–$2,000). We analyze verified buyer reviews to give you honest, structured recommendations — not affiliate-driven picks.
        </p>
      </header>

      {/* This is for you if... */}
      <section className="mb-20" data-speakable="personas">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          This is for you if&hellip;
        </h2>
        <div className="space-y-10 max-w-4xl">
          {personas.map((persona) => (
            <article key={persona.title} className="border border-gray-100 rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {persona.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                <span className="font-medium text-gray-700">Scenario:</span> {persona.scenario}
              </p>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Search queries you&rsquo;d use:</p>
                <ul className="flex flex-wrap gap-2">
                  {persona.queries.map((query) => (
                    <li key={query} className="text-sm bg-brand-50 text-brand-700 px-3 py-1 rounded-full">
                      &ldquo;{query}&rdquo;
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-medium text-gray-700">What you get:</span> {persona.outcome}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* This is NOT for you if... */}
      <section className="mb-20 max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          This is NOT for you if&hellip;
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {notForYou.map((item) => (
            <div key={item.title} className="bg-gray-50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-1 flex items-start gap-2">
                <span className="text-gray-400 mt-0.5 shrink-0">&times;</span>
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed ml-5">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Use-case scenarios */}
      <section className="mb-20 max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Real-world use cases
        </h2>
        <div className="space-y-6">
          {useCases.map((uc, i) => (
            <div key={i} className="flex gap-5">
              <div className="shrink-0">
                <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">{uc.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {uc.description}
                </p>
                <Link
                  href={uc.cta.href}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                >
                  {uc.cta.label} &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mb-20 max-w-4xl" data-speakable="how-it-works">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          How it works
        </h2>
        <div className="space-y-8">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-5">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Proof with numbers */}
      <section className="mb-20 bg-gray-50 rounded-2xl p-8 lg:p-12 max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Proof with numbers
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {stats.map((stat) => (
            <div key={stat.value}>
              <p className="text-2xl font-bold text-brand-600 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-16 max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Frequently asked questions
        </h2>
        <div className="space-y-6">
          {faqItems.map((item) => (
            <details key={item.question} className="group border border-gray-100 rounded-xl">
              <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-gray-900 font-medium">
                {item.question}
                <span className="ml-4 shrink-0 text-gray-400 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl text-center py-12 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Ready to find the right product?
        </h2>
        <p className="text-gray-500 mb-6">
          Browse our categories or read a buying guide to get started.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/category/robot-vacuums"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
          >
            Robot Vacuums
          </Link>
          <Link
            href="/category/coffee-machines"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
          >
            Coffee Machines
          </Link>
          <Link
            href="/categories"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            All Categories
          </Link>
        </div>
      </section>
    </div>
  );
}
