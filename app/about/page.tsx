import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "About SmartReview",
  description:
    "SmartReview is an AI-powered product review platform built to fix the broken review ecosystem. Honest intelligence, verified buyers, zero affiliate links.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ name: "About", url: "/about" }]} />

      <div className="mt-8 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          About SmartReview
        </h1>

        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p className="text-lg">
            The review ecosystem is broken. Most reviews online are manipulated,
            shallow, affiliate-driven, or outright SEO spam. Consumers deserve
            better.
          </p>

          <p>
            SmartReview was built to solve this problem. We combine structured
            buyer reviews with AI-powered analysis to give you honest, useful
            product intelligence — not star-rating noise.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">
            Why We Built This
          </h2>
          <p>
            We were tired of reading hundreds of reviews and still not knowing
            whether a product was right for us. A 4.2-star rating tells you
            almost nothing. What we really wanted to know was:
          </p>
          <ul className="space-y-2 pl-1">
            {[
              "What are the actual recurring problems after 6 months of use?",
              "Who is this product really best for — and who should avoid it?",
              "What do verified buyers consistently love and hate?",
              "How does it compare to the alternative everyone's considering?",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-brand-500 mt-0.5 shrink-0">
                  &#8594;
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p>
            No existing platform answered these questions well. So we built one
            that does.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">
            How We&apos;re Different
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {[
              {
                title: "Structured Reviews",
                text: "Every review captures pros, cons, reliability, ease of use, value, time owned, and experience level — not just a star rating and a paragraph.",
              },
              {
                title: "Verification Tiers",
                text: "We show exactly how each reviewer verified their purchase: receipt upload, email verification, retailer confirmation, or self-declared.",
              },
              {
                title: "AI Analysis",
                text: "Our AI reads all verified reviews to surface recurring patterns — what people consistently love, hate, and complain about.",
              },
              {
                title: "Zero Affiliate Revenue",
                text: "We don't earn commissions on purchases. We have no financial incentive to recommend one product over another.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-gray-50 rounded-xl p-5"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 pt-4">
            What We&apos;re Building
          </h2>
          <p>
            SmartReview is currently in early access, covering five product
            categories: robot vacuums, coffee machines, air fryers, wireless
            earbuds, and mattresses. We&apos;re expanding categories, building
            community features, and developing deeper AI analysis capabilities.
          </p>
          <p>
            We believe the future of product reviews is structured, verified,
            and intelligent — not walls of unverified text ranked by
            helpfulness votes.
          </p>

          <div className="bg-brand-50 rounded-2xl p-6 mt-8">
            <h3 className="font-semibold text-brand-900 mb-2">
              Want to get involved?
            </h3>
            <p className="text-sm text-brand-700">
              SmartReview is in early development. We&apos;re looking for
              feedback, early reviewers, and people who share our mission of
              fixing product reviews. Reach out at{" "}
              <span className="font-medium">hello@smartreview.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
