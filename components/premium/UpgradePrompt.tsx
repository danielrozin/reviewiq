"use client";

import Link from "next/link";
import { Crown, Zap, Download, Filter, Bookmark, EyeOff } from "lucide-react";

type GateType = "saved_comparisons" | "advanced_filters" | "export" | "general";

const GATE_COPY: Record<GateType, { title: string; description: string; icon: typeof Crown }> = {
  saved_comparisons: {
    title: "Save Unlimited Comparisons",
    description: "Free accounts can save up to 3 products. Upgrade to Pro for unlimited saved comparisons.",
    icon: Bookmark,
  },
  advanced_filters: {
    title: "Unlock Advanced Filters",
    description: "Custom price ranges and multi-attribute sorting are available with ReviewIQ Pro.",
    icon: Filter,
  },
  export: {
    title: "Export Comparisons",
    description: "Download your comparisons as CSV or PDF with ReviewIQ Pro.",
    icon: Download,
  },
  general: {
    title: "Upgrade to ReviewIQ Pro",
    description: "Get unlimited saves, advanced filters, exports, and an ad-free experience.",
    icon: Crown,
  },
};

interface UpgradePromptProps {
  gate: GateType;
  compact?: boolean;
}

export function UpgradePrompt({ gate, compact = false }: UpgradePromptProps) {
  const { title, description, icon: Icon } = GATE_COPY[gate];

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
        <Icon className="w-5 h-5 text-amber-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900">{title}</p>
        </div>
        <Link
          href="/pricing"
          className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Zap className="w-3 h-3" />
          Upgrade
        </Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 p-6 text-center">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
      <div className="relative">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Icon className="w-6 h-6 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-5 max-w-sm mx-auto">{description}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
          >
            <Zap className="w-4 h-4" />
            Upgrade to Pro
          </Link>
          <span className="text-xs text-gray-400">Starting at $9/month</span>
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Bookmark className="w-3 h-3" /> Unlimited saves</span>
          <span className="flex items-center gap-1"><Filter className="w-3 h-3" /> Advanced filters</span>
          <span className="flex items-center gap-1"><EyeOff className="w-3 h-3" /> Ad-free</span>
        </div>
      </div>
    </div>
  );
}
