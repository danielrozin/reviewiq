import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "..", "public", "voiceover.mp3");

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("Missing ELEVENLABS_API_KEY env var.");
  process.exit(1);
}

// Brian — deep, confident, cinematic narrator
const VOICE_ID = "nPczCjzI2devNBz1zQrb";
const MODEL_ID = process.env.ELEVENLABS_MODEL ?? "eleven_v3";

const SCRIPT = `[confident] Three hours of searching. [pause] Forty-seven tabs. [pause]

[skeptical] All recommending the same product. [slower] Because all of them [emphasize]get paid.

[whisper] Enough.

[confident, building] Meet ReviewIQ.

[warm] AI that reads thousands of real buyer reviews — [emphasize]so you don't have to.

[energetic] Robot vacuums. Coffee machines. Any home, any budget, [emphasize]zero BS.

[hard, punchy] No affiliate links. No compromises.

[confident, warm, landing] ReviewIQ. The only review that matters — [slower, softer]yours.`;

async function generate() {
  console.log(`Requesting TTS from ElevenLabs (model=${MODEL_ID}, voice=Brian)...`);
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: SCRIPT,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.75,
          style: 0.6,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    console.error(`ElevenLabs API error ${res.status}:`, body);
    process.exit(1);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, buf);
  console.log(`Wrote ${buf.length} bytes to ${OUT_PATH}`);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
