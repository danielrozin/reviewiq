"use client";

import { useState } from "react";
import { useSubscription } from "@/lib/context/SubscriptionContext";
import { UpgradePrompt } from "./UpgradePrompt";

interface ExportButtonProps {
  onExport: (format: "csv" | "pdf") => void;
}

export function ExportButton({ onExport }: ExportButtonProps) {
  const { isPro } = useSubscription();
  const [showGate, setShowGate] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleClick = () => {
    if (!isPro) {
      setShowGate(true);
      return;
    }
    setShowMenu(!showMenu);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
      >
        {isPro ? (
          <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        ) : (
          <svg aria-hidden="true" className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        )}
        Export
      </button>

      {showMenu && isPro && (
        <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
          <button
            type="button"
            onClick={() => { onExport("csv"); setShowMenu(false); }}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-inset"
          >
            Export as CSV
          </button>
          <button
            type="button"
            onClick={() => { onExport("pdf"); setShowMenu(false); }}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-inset"
          >
            Export as PDF
          </button>
        </div>
      )}

      {showGate && !isPro && (
        <div className="absolute right-0 mt-2 w-80 z-20">
          <UpgradePrompt gate="export" compact />
          <button
            type="button"
            onClick={() => setShowGate(false)}
            className="mt-1 text-xs text-gray-500 hover:text-gray-600 w-full text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
