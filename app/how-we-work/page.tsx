import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { howWeWorkPageSchema } from "@/lib/schema/jsonld";

export const metadata = buildMetadata({
  title: "How We Work — Affiliate & AI Disclosure",
  description:
    "How ReviewIQ earns money, why affiliate commissions never influence our SmartScores, which merchants are partners, and how we generate AI summaries.",
  path: "/how-we-work",
});

// Plain-English answers to the four disclosure questions (DAN-600 Component 2c,
// H1 Option C per DAN-413). This page is the canonical destination for the
// disclosure footnote's "see how we work →" link (#affiliate-relationships)
// and the AI-summary disclosure link (#ai-summaries).
const affiliateQA = [
  {
    question: "How do we earn money?",
    answer:
      "ReviewIQ earns affiliate commissions when you buy a product through one of our partner links. If you click through to a retailer and make a purchase, that retailer pays us a small commission. You never pay more — the price is identical whether you use our link or go to the retailer directly.",
  },
  {
    question: "Does this influence our reviews?",
    answer:
      "No. SmartScores and rankings are computed entirely from verified buyer data. The editorial team that writes and tunes our analysis has no view of affiliate revenue per product — they cannot see which products earn us more, so they cannot favor them. A higher commission never moves a product up a ranking.",
  },
  {
    question: "Which merchants are partners?",
    answer:
      "Amazon (through the Amazon Associates program), Best Buy (through the Impact partner network), and a range of manufacturers running their own programs through CJ (Commission Junction). When a product links out to one of these merchants, that link may be an affiliate link.",
  },
  {
    question: "How do we choose which merchant to show?",
    answer:
      "Lowest live price first. We surface the merchant offering the best available price at the moment you view the page. When two offers are tied, we break the tie in favor of the first-party manufacturer, because buying direct usually means better warranty and support. Affiliate commission is never a factor in this ordering.",
  },
];

export default function HowWeWorkPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howWeWorkPageSchema()),
        }}
      />
      <Breadcrumbs items={[{ name: "How We Work", url: "/how-we-work" }]} />

      <div className="mt-8 mb-16 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          How We Work
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          Two things deserve a plain-English explanation: how ReviewIQ makes
          money, and how we use AI. We keep both on this page so you can always
          check our incentives and our methods in one place.
        </p>
        <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-brand-600">
          <a href="#affiliate-relationships" className="hover:underline">
            Affiliate relationships
          </a>
          <a href="#ai-summaries" className="hover:underline">
            AI summaries
          </a>
        </nav>
      </div>

      {/* ---- Affiliate relationships ---- */}
      <section
        id="affiliate-relationships"
        className="scroll-mt-24 max-w-3xl mb-20"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Affiliate relationships
        </h2>
        <p className="text-gray-600 leading-relaxed mb-8">
          ReviewIQ is free to use because some of the outbound links on our
          product pages are affiliate links. Here is exactly what that means and,
          just as importantly, what it does <em>not</em> mean for the reviews you
          read.
        </p>

        <dl className="space-y-8">
          {affiliateQA.map((item) => (
            <div key={item.question}>
              <dt className="text-lg font-semibold text-gray-900 mb-2">
                {item.question}
              </dt>
              <dd className="text-gray-600 leading-relaxed">{item.answer}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 bg-gray-50 rounded-2xl p-6">
          <p className="text-sm text-gray-500 leading-relaxed">
            <strong className="text-gray-700">The short version:</strong> we make
            money when you buy through a partner link, but the people who build
            our SmartScores cannot see that money. Rankings follow verified buyer
            data and the lowest live price — never our commission.
          </p>
        </div>
      </section>

      {/* ---- AI summaries ---- */}
      <section id="ai-summaries" className="scroll-mt-24 max-w-3xl mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">AI summaries</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Many ReviewIQ pages include an AI-generated summary — the &ldquo;what
          people love,&rdquo; &ldquo;what people hate,&rdquo; and &ldquo;best for
          / not for&rdquo; sections. Here is how those are produced and where
          they come from.
        </p>
        <ul className="space-y-3">
          {[
            "AI summaries are generated only from verified buyer reviews on the product — never from marketing copy, press releases, or merchant descriptions.",
            "The model identifies recurring praise and recurring complaints across many reviews; it does not invent opinions or quote reviews that don't exist.",
            "Summaries are a reading aid, not the score. SmartScores are computed separately from the underlying structured review data, not from the AI text.",
            "Affiliate revenue is never an input to a summary. The model has no access to commission data and cannot be prompted to favor a partner merchant.",
          ].map((point, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-gray-600 leading-relaxed"
            >
              <span className="text-brand-500 mt-1 shrink-0">&#10003;</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-gray-500 leading-relaxed">
          Want the deeper methodology behind scoring and editorial judgement? See{" "}
          <a
            href="/how-it-works"
            className="text-brand-600 font-medium hover:underline"
          >
            How It Works
          </a>
          .
        </p>
      </section>
    </div>
  );
}
