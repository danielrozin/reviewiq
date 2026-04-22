export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION_IN_FRAMES = 30 * FPS; // 30 seconds @ 30fps = 900 frames

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
  hook: 3 * FPS,          // Scene 1: 0-3s
  tabs: 3 * FPS,          // Scene 2: 3-6s
  sponsored: 4 * FPS,     // Scene 3: 6-10s
  enough: 3 * FPS,        // Scene 4: 10-13s
  logo: 4 * FPS,          // Scene 5: 13-17s
  smartScore: 5 * FPS,    // Scene 6: 17-22s
  icps: 4 * FPS,          // Scene 7: 22-26s
  noAffiliate: 2 * FPS,   // Scene 8: 26-28s
  cta: 2 * FPS,           // Scene 9: 28-30s
} as const;
