import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">SR</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                Smart<span className="text-brand-600">Review</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Honest, AI-powered product reviews. Built on real buyer
              experiences, not affiliate deals.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Categories
            </h3>
            <ul className="space-y-2">
              {[
                { name: "Robot Vacuums", slug: "robot-vacuums" },
                { name: "Coffee Machines", slug: "coffee-machines" },
                { name: "Air Fryers", slug: "air-fryers" },
                { name: "Wireless Earbuds", slug: "wireless-earbuds" },
                { name: "Mattresses", slug: "mattresses" },
              ].map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Platform
            </h3>
            <ul className="space-y-2">
              {["How It Works", "Trust & Verification", "About", "Contact"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              For Reviewers
            </h3>
            <ul className="space-y-2">
              {[
                "Write a Review",
                "Verification Guide",
                "Review Guidelines",
                "Community",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} SmartReview. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
