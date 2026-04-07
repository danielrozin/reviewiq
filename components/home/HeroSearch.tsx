"use client";

import { SearchBar } from "@/components/layout/SearchBar";

export function HeroSearch() {
  return (
    <SearchBar
      size="lg"
      placeholder="Search for a product, category, or topic..."
      className="w-full max-w-xl"
    />
  );
}
