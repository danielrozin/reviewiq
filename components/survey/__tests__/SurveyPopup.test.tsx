/**
 * Tests for SurveyPopup form_abandon instrumentation (DAN-699).
 * Verifies the single-fire abandon beacon on page-leave events, the reached-step
 * capture, and the guards that suppress false abandons (dismiss / submit / not
 * shown).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";

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

  /**
   * Render and advance past the show delay so the popup is open at "q1"
   * (DAN-1170: no intro gate). Advance generously past SHOW_DELAY_MS (20s as of
   * DAN-1405) so timing tweaks to the dwell trigger don't silently re-break these
   * tests — the only timer in flight is the show-popup setTimeout.
   */
  function showSurvey() {
    render(<SurveyPopup />);
    act(() => {
      vi.advanceTimersByTime(30_000);
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

  it("records the reached step after the user advances", () => {
    showSurvey();

    // Popup opens on Q1 (no intro gate, DAN-1170). Answering Q1 advances to Q2.
    fireEvent.click(document.querySelector(".space-y-2 button")!);

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });

    expect(trackEvent).toHaveBeenCalledWith("survey_form_abandon", { step: "q2" });
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
