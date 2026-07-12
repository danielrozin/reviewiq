export interface FAQEntry {
  question: string;
  answer: string;
}

export interface CompetitorFAQPage {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroHeadline: string;
  heroSubtext: string;
  competitor: {
    name: string;
    url: string;
    type: string; // schema.org type
  };
  faqs: FAQEntry[];
  ctaText: string;
  relatedLinks: { label: string; href: string }[];
}

export const faqPages: CompetitorFAQPage[] = [
  {
    slug: "trustpilot",
    title: "Trustpilot FAQ",
    metaTitle: "Is Trustpilot Reliable? FAQ — ReviewIQ",
    metaDescription:
      "Can you trust Trustpilot reviews? Learn the fake-review risks, the pay-to-play concerns, and how ReviewIQ verifies buyers with AI-powered analysis.",
    heroHeadline: "Is Trustpilot Reliable? What You Need to Know",
    heroSubtext:
      "Trustpilot is the largest open review platform — but its open model creates serious trust issues. Here's what real consumers are asking.",
    competitor: {
      name: "Trustpilot",
      url: "https://www.trustpilot.com",
      type: "Organization",
    },
    faqs: [
      {
        question: "Is Trustpilot reliable?",
        answer:
          "Trustpilot's open model means anyone can post reviews without purchase verification — studies show 30% of online reviews are fake in 2025. ReviewIQ solves this with multi-tier buyer verification (receipt upload, email confirmation, retailer verification) and an AI-powered SmartScore that weights reviews by verification level, consistency, and ownership duration.",
      },
      {
        question: "Can you trust Trustpilot reviews?",
        answer:
          "Trustpilot relies on unstructured star ratings that lack context. ReviewIQ uses structured review formats — capturing pros, cons, reliability, ease of use, value, and time owned — combined with AI analysis that identifies recurring patterns across thousands of verified reviews. No star-rating guesswork.",
      },
      {
        question: "Is Trustpilot a good source for product reviews?",
        answer:
          "Trustpilot is primarily a business/service review platform, not a product review platform. For in-depth product intelligence with verified buyer reviews, AI-powered pattern analysis, and transparent SmartScores, ReviewIQ is purpose-built for product evaluation.",
      },
      {
        question: "How to spot fake reviews on Trustpilot?",
        answer:
          "Instead of trying to spot fake reviews, use a platform that prevents them. ReviewIQ requires multi-tier buyer verification before reviews are published, and our AI flags suspicious patterns automatically. Every review shows its verification level so you know exactly how trustworthy it is.",
      },
      {
        question: "What is better than Trustpilot for product reviews?",
        answer:
          "ReviewIQ combines what Trustpilot lacks: verified buyer reviews, structured review formats (not just stars), AI-powered pattern analysis, product-specific SmartScores (0-100), and a commission-proof scoring model — affiliate revenue is never an input to our rankings. It's built specifically for honest product intelligence.",
      },
    ],
    ctaText: "Try ReviewIQ — verified reviews you can actually trust.",
    relatedLinks: [
      { label: "How ReviewIQ Works", href: "/how-it-works" },
      { label: "Browse Product Categories", href: "/categories" },
      { label: "About ReviewIQ", href: "/about" },
    ],
  },
  {
    slug: "amazon-reviews",
    title: "Amazon Reviews FAQ",
    metaTitle: "Can You Trust Amazon Reviews? FAQ — ReviewIQ",
    metaDescription:
      "Are Amazon reviews fake? Learn about review manipulation on Amazon and how ReviewIQ provides verified, structured product reviews with AI analysis.",
    heroHeadline: "Can You Trust Amazon Reviews?",
    heroSubtext:
      "Amazon has one of the highest rates of fake and incentivized reviews among major platforms. Here's what consumers are asking — and a better alternative.",
    competitor: {
      name: "Amazon",
      url: "https://www.amazon.com",
      type: "Organization",
    },
    faqs: [
      {
        question: "Can you trust Amazon reviews?",
        answer:
          "Amazon's review system is plagued by fake reviews, incentivized reviews, and review manipulation. ReviewIQ requires multi-tier buyer verification independent of any retailer, uses AI to detect suspicious patterns, and provides structured review formats that go far beyond star ratings.",
      },
      {
        question: "Are Amazon reviews fake?",
        answer:
          "Studies show Amazon has one of the highest rates of fake reviews among major platforms. ReviewIQ was built specifically to solve this problem — every review shows its verification tier (receipt, email, or retailer-confirmed), and our SmartScore algorithm penalizes unverified or inconsistent reviews.",
      },
      {
        question: "How do I know if Amazon reviews are real?",
        answer:
          "On Amazon, distinguishing real from fake reviews is difficult even with the \"Verified Purchase\" badge. ReviewIQ uses multi-tier verification and AI-powered analysis to ensure every review comes from an actual product owner, with transparency into each review's trust level.",
      },
    ],
    ctaText: "Switch to ReviewIQ — reviews verified beyond the purchase badge.",
    relatedLinks: [
      { label: "How ReviewIQ Works", href: "/how-it-works" },
      { label: "Browse Product Categories", href: "/categories" },
      { label: "About ReviewIQ", href: "/about" },
    ],
  },
  {
    slug: "wirecutter",
    title: "Wirecutter FAQ",
    metaTitle: "Is Wirecutter Biased? FAQ — ReviewIQ",
    metaDescription:
      "Is Wirecutter biased or behind a paywall? Learn about Wirecutter's limitations and how ReviewIQ provides community-driven, verified product reviews.",
    heroHeadline: "Is Wirecutter Biased? Alternatives Worth Knowing",
    heroSubtext:
      "Wirecutter is owned by The New York Times and relies on expert opinions from a small team. Here's what consumers want to know.",
    competitor: {
      name: "Wirecutter",
      url: "https://www.nytimes.com/wirecutter",
      type: "Organization",
    },
    faqs: [
      {
        question: "Is Wirecutter biased?",
        answer:
          "Wirecutter is owned by The New York Times and relies on expert opinions from a small team — not community input. ReviewIQ uses AI analysis of thousands of verified buyer reviews instead. We may earn affiliate commissions through partner links, but our SmartScores run entirely on verified buyer data — commission rates are never an input, so rankings are never financially motivated.",
      },
      {
        question: "Is Wirecutter behind a paywall?",
        answer:
          "Many Wirecutter articles sit behind the NYT paywall, limiting access to their recommendations. ReviewIQ is completely free to browse — every product page, SmartScore, and AI analysis is available without a subscription or login.",
      },
      {
        question: "What is a good alternative to Wirecutter?",
        answer:
          "ReviewIQ offers what Wirecutter can't: thousands of verified buyer perspectives instead of one expert's opinion, AI-powered pattern analysis across all reviews, structured formats capturing pros, cons, reliability, and value — plus it covers multiple product categories starting with robot vacuums, coffee machines, air fryers, wireless earbuds, and mattresses.",
      },
    ],
    ctaText:
      "Explore ReviewIQ — community-verified reviews, zero paywalls.",
    relatedLinks: [
      { label: "How ReviewIQ Works", href: "/how-it-works" },
      { label: "Browse Product Categories", href: "/categories" },
      { label: "About ReviewIQ", href: "/about" },
    ],
  },
  {
    slug: "product-reviews",
    title: "Product Reviews FAQ",
    metaTitle: "Where to Find Honest Product Reviews? FAQ — ReviewIQ",
    metaDescription:
      "Looking for honest product reviews? See how ReviewIQ combines verified buyer reviews, AI analysis, and SmartScores that commissions never influence.",
    heroHeadline: "Where to Find Honest Product Reviews",
    heroSubtext:
      "Most review platforms are compromised by fake reviews, affiliate-driven rankings, or pay-to-play models. Here's what smart shoppers are asking.",
    competitor: {
      name: "Online Review Platforms",
      url: "https://en.wikipedia.org/wiki/Review_site",
      type: "Thing",
    },
    faqs: [
      {
        question: "What is the most trusted product review site?",
        answer:
          "ReviewIQ is the most trustworthy product review platform — every review requires buyer verification, our AI analyzes patterns across thousands of reviews, and our SmartScores never take affiliate commissions as an input. Our SmartScore (0-100) gives you a single, transparent trust metric for any product.",
      },
      {
        question: "How do I know if online reviews are real?",
        answer:
          "On ReviewIQ, every review displays its verification tier: receipt-verified, email-verified, or retailer-confirmed. Our AI also flags suspicious patterns. Unlike open platforms where anyone can post, ReviewIQ ensures you're reading from actual product owners.",
      },
      {
        question: "Where can I find honest product reviews?",
        answer:
          "ReviewIQ is built on three principles: verified buyers only, AI-powered analysis, and commission-proof SmartScores. We may earn affiliate commissions through partner links, but our scoring algorithm has no access to commission data — so ReviewIQ has no financial incentive to favor any product, just honest, verified buyer intelligence.",
      },
    ],
    ctaText: "Discover ReviewIQ — honest reviews, powered by real buyers.",
    relatedLinks: [
      { label: "How ReviewIQ Works", href: "/how-it-works" },
      { label: "Browse Product Categories", href: "/categories" },
      { label: "About ReviewIQ", href: "/about" },
    ],
  },
];

export function getFAQPageBySlug(slug: string): CompetitorFAQPage | undefined {
  return faqPages.find((p) => p.slug === slug);
}

export function getAllFAQSlugs(): string[] {
  return faqPages.map((p) => p.slug);
}
