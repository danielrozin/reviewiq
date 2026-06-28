/**
 * Tests for SurveyPopup form_abandon instrumentation (DAN-699), updated for the
 * non-blocking single-question bottom bar (DAN-1508). Verifies the single-fire
 * abandon beacon on page-leave, and the guards that suppress false abandons
 * (Q1 answered / dismissed / not shown).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act, screen } from "@testing-library/react";

const trackEvent = vi.hoisted(() => vi.fn());
vi.mock("@/lib/tracking/analytics", () => ({ trackEvent }));

import { SurveyPopup } from "@/components/survey/SurveyPopup";

const STORAGE_KEY = "sr_survey_completed";

describe("SurveyPopup form_abandon", () => {
  let sendBeacon: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    trackEvent.mockClear();
    sendBeacon = vi.fn(() => true);
    Object.defineProperty(navigator, "sendBeacon", {
      value: sendBeacon,
      configurable: true,
      writable: true,
    });
    // Stub fetch so the submit path doesn't hit the network.
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(null, { status: 201 }))));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  /** Render and advance past the show delay so the popup is open at "q1" (DAN-1170: no intro gate). */
  function showSurvey() {
    render(<SurveyPopup />);
    act(() => {
      vi.advanceTimersByTime(12_000);
    });
  }

  it("fires a single form_abandon beacon on pagehide after the survey opens", () => {
    showSurvey();

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(sendBeacon.mock.calls[0][0]).toBe("/api/surveys");
    expect(trackEvent).toHaveBeenCalledWith("survey_form_abandon", { step: "q1" });
  });

  it("fires form_abandon when the tab is hidden (visibilitychange)", () => {
    showSurvey();

    act(() => {
      Object.defineProperty(document, "visibilityState", {
        value: "hidden",
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
  });

  it("only fires once even when both page-leave events occur", () => {
    showSurvey();

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
      Object.defineProperty(document, "visibilityState", {
        value: "hidden",
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
  });

  it("records the Q1 answer and does NOT fire form_abandon on a later page-leave", () => {
    showSurvey();

    // DAN-1508: the bar asks only Q1. Answering it is the conversion — it records
    // partial@q1, gates re-show, and collapses to a thanks state. A subsequent
    // page-leave must therefore NOT be counted as an abandon.
    fireEvent.click(screen.getByText("Researching a product"));

    expect(trackEvent).toHaveBeenCalledWith("survey_q1_answered", { intent: "researching" });
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });

    expect(trackEvent).not.toHaveBeenCalledWith("survey_form_abandon", expect.anything());
  });

  it("records a dismissal and does NOT also fire form_abandon on a later page-leave", () => {
    showSurvey();

    fireEvent.click(document.querySelector('[aria-label="Close survey"]')!);
    // Dismiss writes exactly one `dismissed` funnel beacon (DAN-983)...
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith("survey_popup_dismissed", { step: "q1" });

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });

    // ...and the subsequent page-leave does NOT add a form_abandon beacon.
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(trackEvent).not.toHaveBeenCalledWith("survey_form_abandon", expect.anything());
  });

  it("does NOT fire when the survey never opened (already completed)", () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    showSurvey();

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });

    expect(sendBeacon).not.toHaveBeenCalled();
  });
});
