import Link from "next/link";
import { categories } from "@/data/categories";

export default function NotFound() {
  const popularCategories = categories.slice(0, 6);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        {/* Branded illustration */}
        <div aria-hidden="true" className="relative inline-flex items-center justify-center mb-8">
          <div className="absolute w-40 h-40 bg-brand-50 rounded-full blur-2xl opacity-80" />
          <div className="relative w-28 h-28 bg-white border-2 border-gray-100 rounded-3xl shadow-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-brand-600 leading-none">4</p>
              <p className="text-4xl font-extrabold text-gray-200 leading-none">0</p>
              <p className="text-4xl font-extrabold text-brand-600 leading-none">4</p>
            </div>
          </div>
          {/* Floating badge */}
          <div className="absolute -top-3 -right-3 w-9 h-9 bg-amber-400 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-lg font-bold">?</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          This page went missing
        </h1>
        <p className="text-gray-600 max-w-md mx-auto leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
          >
            Back to Home
          </Link>
          <Link
            href="/categories"
            className="w-full sm:w-auto px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 border border-gray-200 active:scale-[0.98] transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
          >
            Browse Categories
          </Link>
        </div>
      </div>

      {/* Popular categories */}
      <div>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider text-center mb-5">
          Popular categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {popularCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:border-brand-200 hover:shadow-sm hover:-translate-y-0.5 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-brand-600 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
