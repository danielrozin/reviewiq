# ReviewIQ Promo — ElevenLabs V3 Voiceover Script

## How to use this

1. Go to https://elevenlabs.io/app/speech-synthesis
2. Select **Eleven v3** as the model
3. Pick a voice — recommended: **Brian** (deep, confident, cinematic) or **Daniel** (warm authority)
4. Set voice settings:
   - Stability: **40** (enough variation for drama without wobble)
   - Similarity: **75**
   - Style: **60** (lets the tone tags drive)
   - Speaker boost: **on**
5. Paste the script block below into the text box
6. Generate, download the MP3, save it as `video/public/voiceover.mp3`
7. Tell me when it's ready and I'll wire it into Remotion + re-render

## Target duration
**30 seconds** — if the generated audio is 28–32s we're golden. If it's off, I'll adjust the Remotion timings or you can regenerate with different pacing cues.

## The script (paste this exact block into ElevenLabs)

```
[confident] Three hours of searching. [pause] Forty-seven tabs. [pause]

[skeptical] All recommending the same product. [slower] Because all of them [emphasize]get paid.

[whisper] Enough.

[confident, building] Meet ReviewIQ.

[warm] AI that reads thousands of real buyer reviews — [emphasize]so you don't have to.

[energetic] Robot vacuums. Coffee machines. Any home, any budget, [emphasize]zero BS.

[hard, punchy] No affiliate links. No compromises.

[confident, warm, landing] ReviewIQ. The only review that matters — [slower, softer]yours.
```

## Scene → VO mapping (for timing sanity)

| Scene | Time | VO line |
|-------|------|---------|
| 1 Hook | 0–3s | "Three hours of searching." |
| 2 Tabs | 3–6s | "Forty-seven tabs." |
| 3 Sponsored | 6–10s | "All recommending the same product. Because all of them get paid." |
| 4 Enough | 10–13s | "Enough." (1s silence before + after — V3 handles the weight) |
| 5 Logo | 13–17s | "Meet ReviewIQ." |
| 6 SmartScore | 17–22s | "AI that reads thousands of real buyer reviews — so you don't have to." |
| 7 ICPs | 22–26s | "Robot vacuums. Coffee machines. Any home, any budget, zero BS." |
| 8 No Affiliate | 26–28s | "No affiliate links. No compromises." |
| 9 CTA | 28–30s | "ReviewIQ. The only review that matters — yours." |

## Tone tag reference (V3)

- `[confident]` — default narrator voice, grounded
- `[whisper]` — quiet, intimate — used for "Enough."
- `[skeptical]` — dismissive edge
- `[warm]` — softer, inviting
- `[energetic]` — faster, brighter
- `[hard, punchy]` — percussive delivery
- `[building]` — rising intensity
- `[landing]` — resolved, final-beat energy
- `[pause]` — adds ~400ms
- `[slower]` — stretches the next phrase
- `[emphasize]` — hits the next word
