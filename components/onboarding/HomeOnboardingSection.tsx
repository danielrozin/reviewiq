"use client";

import { QuickStartSuggestions } from "./QuickStartSuggestions";
import { WelcomeBackBanner } from "./WelcomeBackBanner";

export function HomeOnboardingSection() {
  return (
    <>
      <WelcomeBackBanner />
      <QuickStartSuggestions />
    </>
  );
}
