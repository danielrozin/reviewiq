export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// Tuned to the generated ElevenLabs V3 voiceover (~31.8s).
// 32s gives the final CTA room to breathe and a clean fade.
export const DURATION_IN_FRAMES = 32 * FPS; // 960 frames

export const COLORS = {
  brand: "#005fd4",
  brandLight: "#0a7cff",
  brandDark: "#00408d",
  brandGlow: "#3a9fff",
  bg: "#0a0f1a",
  bgDeep: "#000000",
  surface: "#111827",
  text: "#ffffff",
  textMuted: "#94a3b8",
  danger: "#ef4444",
  success: "#10b981",
  warning: "#f59e0b",
} as const;

export const SCENE_DURATIONS_FRAMES = {
  hook: 3 * FPS,          // Scene 1: 0-3s    "Three hours of searching."
  tabs: 3 * FPS,          // Scene 2: 3-6s    "Forty-seven tabs."
  sponsored: 5 * FPS,     // Scene 3: 6-11s   "All recommending... get paid."
  enough: 3 * FPS,        // Scene 4: 11-14s  "Enough." (whispered)
  logo: 3 * FPS,          // Scene 5: 14-17s  "Meet ReviewIQ."
  smartScore: 5 * FPS,    // Scene 6: 17-22s  "AI that reads thousands..."
  icps: 4 * FPS,          // Scene 7: 22-26s  "Robot vacuums. Coffee machines..."
  noAffiliate: 2 * FPS,   // Scene 8: 26-28s  "No affiliate links. No compromises."
  cta: 4 * FPS,           // Scene 9: 28-32s  "ReviewIQ. The only review that matters — yours."
} as const;
