"use client";

import { useEffect, useState } from "react";

export function GuaranteeBadge() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      role="img"
      aria-label="30-day money-back guarantee"
      className={`fixed bottom-6 right-6 z-40 hidden lg:flex flex-col items-center motion-safe:transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="relative w-24 h-24">
        {/* Circular badge */}
        <svg aria-hidden="true" viewBox="0 0 100 100" className="w-full h-full -rotate-12">
          <circle cx="50" cy="50" r="46" fill="#059669" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4 3" />
        </svg>
        {/* Inner text */}
        <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
          <span className="text-white font-black text-lg leading-none">30</span>
          <span className="text-emerald-200 text-[9px] font-semibold uppercase tracking-wide">day</span>
          <span className="text-white text-[9px] font-bold uppercase tracking-wide">guarantee</span>
        </div>
      </div>
      <span className="mt-1.5 text-xs text-gray-600 text-center max-w-[80px] leading-tight">
        Money back, no questions
      </span>
    </div>
  );
}
