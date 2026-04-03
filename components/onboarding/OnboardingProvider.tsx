"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { trackEvent } from "@/lib/tracking/analytics";

const STORAGE_KEY = "sr_onboarding";

interface OnboardingState {
  /** Number of unique page navigations this session */
  pageViews: number;
  /** Total sessions (incremented on each new visit) */
  sessionCount: number;
  /** Whether the welcome modal has been dismissed */
  welcomeDismissed: boolean;
  /** Whether the signup prompt has been dismissed */
  signupDismissed: boolean;
  /** Whether the pro upgrade prompt has been dismissed */
  proDismissed: boolean;
  /** Checklist items completed */
  checklist: {
    viewedProduct: boolean;
    savedComparison: boolean;
    wroteReview: boolean;
    joinedDiscussion: boolean;
  };
  /** Recently viewed product slugs (for returning users) */
  recentlyViewed: string[];
  /** Timestamp of last visit */
  lastVisitAt: number;
}

interface OnboardingContextValue {
  state: OnboardingState;
  /** Whether this is a brand-new visitor (first session, welcome not dismissed) */
  isNewVisitor: boolean;
  /** Whether this is a returning visitor (sessionCount > 1) */
  isReturningVisitor: boolean;
  /** Whether signup prompt should show (3+ page views, not signed in, not dismissed) */
  shouldShowSignupPrompt: boolean;
  /** Whether pro upgrade touchpoint should show (5+ sessions, signed in, not pro) */
  shouldShowProUpgrade: boolean;
  dismissWelcome: () => void;
  dismissSignup: () => void;
  dismissPro: () => void;
  trackPageView: () => void;
  trackProductView: (slug: string) => void;
  completeChecklistItem: (item: keyof OnboardingState["checklist"]) => void;
}

const DEFAULT_STATE: OnboardingState = {
  pageViews: 0,
  sessionCount: 1,
  welcomeDismissed: false,
  signupDismissed: false,
  proDismissed: false,
  checklist: {
    viewedProduct: false,
    savedComparison: false,
    wroteReview: false,
    joinedDiscussion: false,
  },
  recentlyViewed: [],
  lastVisitAt: Date.now(),
};

const SESSION_GAP_MS = 30 * 60 * 1000; // 30 minutes = new session

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

function loadState(): OnboardingState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: OnboardingState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const { data: session, status } = useSession();

  // Hydrate from localStorage and bump session if needed
  useEffect(() => {
    const stored = loadState();
    const now = Date.now();
    const isNewSession = now - stored.lastVisitAt > SESSION_GAP_MS;

    const updated: OnboardingState = {
      ...stored,
      sessionCount: isNewSession ? stored.sessionCount + 1 : stored.sessionCount,
      pageViews: isNewSession ? 0 : stored.pageViews,
      lastVisitAt: now,
    };

    if (isNewSession) {
      trackEvent("onboarding_new_session", { session_count: updated.sessionCount });
    }

    setState(updated);
    saveState(updated);
    setHydrated(true);
  }, []);

  const update = useCallback((updater: (prev: OnboardingState) => OnboardingState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const dismissWelcome = useCallback(() => {
    trackEvent("onboarding_welcome_dismissed");
    update((s) => ({ ...s, welcomeDismissed: true }));
  }, [update]);

  const dismissSignup = useCallback(() => {
    trackEvent("onboarding_signup_dismissed");
    update((s) => ({ ...s, signupDismissed: true }));
  }, [update]);

  const dismissPro = useCallback(() => {
    trackEvent("onboarding_pro_dismissed");
    update((s) => ({ ...s, proDismissed: true }));
  }, [update]);

  const trackPageView = useCallback(() => {
    update((s) => ({ ...s, pageViews: s.pageViews + 1, lastVisitAt: Date.now() }));
  }, [update]);

  const trackProductView = useCallback(
    (slug: string) => {
      update((s) => {
        const recent = [slug, ...s.recentlyViewed.filter((r) => r !== slug)].slice(0, 10);
        return {
          ...s,
          recentlyViewed: recent,
          checklist: { ...s.checklist, viewedProduct: true },
        };
      });
    },
    [update],
  );

  const completeChecklistItem = useCallback(
    (item: keyof OnboardingState["checklist"]) => {
      trackEvent("onboarding_checklist_completed", { item });
      update((s) => ({
        ...s,
        checklist: { ...s.checklist, [item]: true },
      }));
    },
    [update],
  );

  const isAuthenticated = status === "authenticated";
  const isNewVisitor = hydrated && state.sessionCount === 1 && !state.welcomeDismissed;
  const isReturningVisitor = hydrated && state.sessionCount > 1;
  const shouldShowSignupPrompt =
    hydrated && state.pageViews >= 3 && !isAuthenticated && !state.signupDismissed;
  const shouldShowProUpgrade =
    hydrated && state.sessionCount >= 5 && isAuthenticated && !state.proDismissed;

  return (
    <OnboardingContext.Provider
      value={{
        state,
        isNewVisitor,
        isReturningVisitor,
        shouldShowSignupPrompt,
        shouldShowProUpgrade,
        dismissWelcome,
        dismissSignup,
        dismissPro,
        trackPageView,
        trackProductView,
        completeChecklistItem,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
