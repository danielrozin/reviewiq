import type { Config } from "tailwindcss";

/**
 * Shared design tokens aligned with Comparison (aversusb.net).
 * Canonical token source: Comparison/src/app/globals.css @theme block.
 *
 * Token mapping:
 *   brand-*  → ReviewIQ's primary brand (kept distinct)
 *   primary-* → alias of brand-* for cross-product consistency
 *   trust-*  → semantic trust indicators (shared with Comparison's win/lose)
 *   surface-* → background layers
 *
 * Typography: Inter across both products.
 * Spacing / radius: Tailwind defaults (shared).
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ReviewIQ brand (blue) */
        brand: {
          50: "#f0f7ff",
          100: "#e0efff",
          200: "#b8dbff",
          300: "#7abfff",
          400: "#3a9fff",
          500: "#0a7cff",
          600: "#005fd4",
          700: "#004bab",
          800: "#00408d",
          900: "#003775",
          950: "#00224d",
        },
        /* Cross-product primary alias (maps to Comparison's primary-*) */
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        /* Shared semantic trust colors (aligned with Comparison win/lose/tie) */
        trust: {
          green: "#10b981",
          yellow: "#f59e0b",
          red: "#ef4444",
        },
        win: "#10b981",
        lose: "#ef4444",
        tie: "#6b7280",
        /* Shared surface scale */
        surface: {
          DEFAULT: "#ffffff",
          alt: "#f8fafc",
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
        },
        border: "#e2e8f0",
        text: {
          DEFAULT: "#0f172a",
          secondary: "#475569",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
