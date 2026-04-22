# ReviewIQ Promo — Visual Identity

## Style Prompt
Super Bowl-grade cinematic promo for ReviewIQ, an AI-powered product review platform.
Dark editorial canvas with high-contrast electric-blue accents. Typography does the heavy
lifting — oversized Inter Black for dramatic beats, muted grays for context. Motion is
spring-driven and restrained: fewer, bigger moves. No decorative gradients, no drop
shadows behind text blocks, no floating particles. It should feel like a trustworthy
product announcement, not a TikTok ad.

## Colors
- `#005fd4` — brand blue (primary, CTAs, accents, logo mark)
- `#0a7cff` — brand highlight (hover-state feel, glow centers, ring progress)
- `#000000` — canvas (deep black, not off-black)
- `#ffffff` — primary text
- `#94a3b8` — muted text (labels, metadata)
- `#ef4444` — alert red (for SPONSORED stamps and 0 AFFILIATE badge only)
- `#10b981` — success green (pros list)
- `#f59e0b` — warning amber (cons list)

## Typography
- **Inter** — only font. Weights 500 / 700 / 800 / 900.
- Use 900 (Black) for hero moments (Enough., 47, CTA logo).
- Use 500 for labels and muted copy.
- Tight letter-spacing on headlines (`-0.02em`), wide on small labels (`0.12em`).

## Motion Rules
- Prefer `power3.out` for entrances, `power2.in` for exits.
- Spring-like scale-in: `from(scale: 0.85, opacity: 0)`.
- No `Math.random()`, no looping infinite animations.
- Every scene opens within 200ms.

## What NOT to Do
1. No multi-color gradients (backgrounds stay flat `#000000` or `#0a0f1a`).
2. No emoji in final composition — use SVG icons only.
3. No text smaller than 20px (this renders at 1920x1080 — anything smaller is unreadable).
4. No scene that lacks a hero beat (every scene must have ONE visible focal element).
5. No drop shadows on text (flat typography only — shadow gives it a cheap vibe).
