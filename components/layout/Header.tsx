import Link from "next/link";
import { SearchBar } from "./SearchBar";

export function Header() {
  return (
    <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SR</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:inline">
              Smart<span className="text-brand-600">Review</span>
            </span>
          </Link>

          <div className="flex-1 max-w-md hidden md:block">
            <SearchBar />
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/categories"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/write-review"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
            >
              Write a Review
            </Link>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
