import Link from "next/link";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { SmartScore } from "@/components/ui/SmartScore";
import { formatNumber } from "@/lib/utils";

export default function HomePage() {
  const topProducts = [...products]
    .sort((a, b) => b.smartScore - a.smartScore)
    .slice(0, 6);

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-brand-500 rounded-full" />
              AI-Powered Review Intelligence
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Reviews you can{" "}
              <span className="text-brand-600">actually trust</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 leading-relaxed mb-8 max-w-2xl mx-auto">
              Stop guessing. SmartReview analyzes thousands of verified buyer
              experiences to show you what products are really like — the good,
              the bad, and everything in between.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/categories"
                className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors text-center"
              >
                Browse Categories
              </Link>
              <Link
                href="/how-it-works"
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-center"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "20K+", label: "Verified Reviews" },
              { value: "78%", label: "Verified Purchase Rate" },
              { value: "500+", label: "Products Analyzed" },
              { value: "0", label: "Affiliate Links" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Browse by Category
            </h2>
            <p className="text-gray-500 mt-1">
              Deep product intelligence across popular categories
            </p>
          </div>
          <Link
            href="/categories"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 hidden sm:block"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:border-gray-200 transition-all"
            >
              <span className="text-3xl mb-3 block">{cat.icon}</span>
              <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {cat.productCount} products
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Rated Products */}
      <section className="bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Highest Rated Products
            </h2>
            <p className="text-gray-500 mt-1">
              Top SmartScores across all categories
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topProducts.map((product) => (
              <Link
                key={product.id}
                href={`/category/${product.categorySlug}/${product.slug}`}
                className="group flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-gray-200 transition-all"
              >
                <SmartScore
                  score={product.smartScore}
                  size="sm"
                  showLabel={false}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-brand-600 font-medium uppercase tracking-wider">
                    {product.brand}
                  </p>
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {formatNumber(product.reviewCount)} reviews
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900">
            How SmartReview Works
          </h2>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            We built a review platform you can actually trust.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Verified Reviews Only",
              description:
                "Every review shows a verification tier — from receipt uploads to retailer verification. You always know how trustworthy a review is.",
            },
            {
              step: "02",
              title: "AI-Powered Analysis",
              description:
                "Our AI reads thousands of reviews to surface recurring praise, complaints, and patterns that individual reviews miss.",
            },
            {
              step: "03",
              title: "Structured Intelligence",
              description:
                'No walls of text. Every product shows clear "Best For / Not For" signals, recurring issues, and comparison insights.',
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center font-bold text-lg mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Share your honest experience
          </h2>
          <p className="text-brand-200 max-w-xl mx-auto mb-6">
            Help others make smarter buying decisions. Write a structured,
            verified review and contribute to a more transparent marketplace.
          </p>
          <Link
            href="/write-review"
            className="inline-flex px-8 py-3.5 bg-white text-brand-600 font-semibold rounded-xl hover:bg-brand-50 transition-colors"
          >
            Write a Review
          </Link>
        </div>
      </section>
    </>
  );
}
