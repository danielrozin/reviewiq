"use client";

import Link from "next/link";
import { useOnboarding } from "./OnboardingProvider";
import { useSubscription } from "@/lib/context/SubscriptionContext";
import { X, Crown, Zap, EyeOff, Download, BarChart3 } from "lucide-react";
import { trackEvent } from "@/lib/tracking/analytics";

const PRO_BENEFITS = [
  { icon: BarChart3, text: "Advanced comparison filters" },
  { icon: Download, text: "Export comparisons as PDF/CSV" },
  { icon: EyeOff, text: "Ad-free browsing experience" },
];

export function ProUpgradeTouchpoint() {
  const { shouldShowProUpgrade, dismissPro } = useOnboarding();
  const { isPro } = useSubscription();

  // Don't show if already pro or conditions not met
  if (!shouldShowProUpgrade || isPro) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[80] w-full max-w-sm animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 shadow-xl">
        <button
          onClick={dismissPro}
          className="absolute top-3 right-3 p-1 text-amber-400 hover:text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Upgrade to Pro</h3>
            <p className="text-xs text-gray-500">You&apos;ve been a loyal user!</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {PRO_BENEFITS.map((b) => (
            <div key={b.text} className="flex items-center gap-2 text-xs text-gray-700">
              <b.icon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              {b.text}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/pricing"
            onClick={() => trackEvent("onboarding_pro_upgrade_clicked")}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-xl hover:bg-amber-700 transition-colors shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            See Pro plans
          </Link>
          <button
            onClick={dismissPro}
            className="px-3 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
