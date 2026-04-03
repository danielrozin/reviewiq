"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useOnboarding } from "./OnboardingProvider";
import { WelcomeModal } from "./WelcomeModal";
import { SignupPrompt } from "./SignupPrompt";
import { ProUpgradeTouchpoint } from "./ProUpgradeTouchpoint";

/**
 * Orchestrates all onboarding overlays and tracks page views.
 * Renders modals/toasts; inline components (QuickStartSuggestions,
 * WelcomeBackBanner, ProfileChecklist) are placed directly in pages.
 */
export function OnboardingOrchestrator() {
  const pathname = usePathname();
  const { trackPageView } = useOnboarding();

  // Track page views on navigation
  useEffect(() => {
    trackPageView();
  }, [pathname, trackPageView]);

  return (
    <>
      <WelcomeModal />
      <SignupPrompt />
      <ProUpgradeTouchpoint />
    </>
  );
}
