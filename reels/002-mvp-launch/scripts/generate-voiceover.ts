/**
 * Generates the ElevenLabs voiceover, one MP3 per narration cue, plus a manifest
 * with real durations and word-level timestamps (used for caption sync).
 *
 *   ELEVENLABS_API_KEY=... npm run voiceover            # only regenerates changed cues
 *   ELEVENLABS_API_KEY=... npm run voiceover -- --force # regenerate everything
 *
 * Optional env:
 *   ELEVENLABS_VOICE_ID   voice to use (default: "George", a calm narrator — swap in your own clone)
 *   ELEVENLABS_MODEL_ID   default: eleven_multilingual_v2
 *
 * Requests are stitched with previous_text / next_text so prosody flows
 * naturally across cue boundaries.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CUES } from "../src/script.ts";

type Word = { w: string; s: number; e: number };
type CueAudio = { file: string; duration: number; hash: string; words: Word[] };
type Manifest = { generated: boolean; voiceId?: string; modelId?: string; cues: Record<string, CueAudio> };

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "voiceover");
const MANIFEST_PATH = path.join(ROOT, "src", "voiceover", "manifest.json");

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "JBFqnCBsd6RMkjVDRZzb";
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";
const FORCE = process.argv.includes("--force");

const VOICE_SETTINGS = {
  stability: 0.55, // documentary narration: steady, not monotone
  similarity_boost: 0.8,
  style: 0.2,
  use_speaker_boost: true,
  speed: 1.04,
};

if (!API_KEY) {
  console.error("Missing ELEVENLABS_API_KEY. Put it in .env and run: npm run voiceover");
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });

const previous: Manifest = existsSync(MANIFEST_PATH)
  ? JSON.parse(readFileSync(MANIFEST_PATH, "utf8"))
  : { generated: false, cues: {} };

const manifest: Manifest = { generated: true, voiceId: VOICE_ID, modelId: MODEL_ID, cues: {} };

/** Collapse ElevenLabs character alignment into words. */
const toWords = (chars: string[], starts: number[], ends: number[]): Word[] => {
  const words: Word[] = [];
  let cur: Word | null = null;
  chars.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (cur) words.push(cur);
      cur = null;
      return;
    }
    if (!cur) cur = { w: "", s: starts[i], e: ends[i] };
    cur.w += ch;
    cur.e = ends[i];
  });
  if (cur) words.push(cur);
  return words.map((w) => ({ w: w.w, s: +w.s.toFixed(3), e: +w.e.toFixed(3) }));
};

const probeDuration = (file: string): number | null => {
  for (const bin of [["ffprobe"], ["npx", "remotion", "ffprobe"]]) {
    try {
      const out = execFileSync(
        bin[0],
        [...bin.slice(1), "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
      );
      const d = parseFloat(out.trim());
      if (Number.isFinite(d)) return d;
    } catch {
      // try next
    }
  }
  return null;
};

for (let i = 0; i < CUES.length; i++) {
  const cue = CUES[i];
  const voiceId = cue.voiceId ?? VOICE_ID;
  const hash = createHash("sha1")
    .update(JSON.stringify([cue.text, voiceId, MODEL_ID, VOICE_SETTINGS]))
    .digest("hex")
    .slice(0, 12);
  const file = `voiceover/${cue.id}.mp3`;
  const abs = path.join(ROOT, "public", file);

  const cached = previous.cues[cue.id];
  if (!FORCE && cached?.hash === hash && existsSync(abs)) {
    manifest.cues[cue.id] = cached;
    console.log(`= ${cue.id} (cached)`);
    continue;
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: cue.text,
      model_id: MODEL_ID,
      voice_settings: VOICE_SETTINGS,
      previous_text: CUES.slice(Math.max(0, i - 2), i).map((c) => c.text).join(" ") || undefined,
      next_text: CUES[i + 1]?.text,
    }),
  });

  if (!res.ok) {
    console.error(`✗ ${cue.id}: ${res.status} ${await res.text()}`);
    process.exit(1);
  }

  const data = (await res.json()) as {
    audio_base64: string;
    alignment: {
      characters: string[];
      character_start_times_seconds: number[];
      character_end_times_seconds: number[];
    };
  };

  writeFileSync(abs, Buffer.from(data.audio_base64, "base64"));
  const a = data.alignment;
  const words = toWords(a.characters, a.character_start_times_seconds, a.character_end_times_seconds);
  const duration = probeDuration(abs) ?? (words.at(-1)?.e ?? 1) + 0.15;

  manifest.cues[cue.id] = { file, duration: +duration.toFixed(3), hash, words };
  console.log(`✓ ${cue.id} ${duration.toFixed(2)}s  ${cue.text}`);
}

writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
const total = Object.values(manifest.cues).reduce((s, c) => s + c.duration, 0);
console.log(`\nWrote ${MANIFEST_PATH}\nSpoken audio: ${total.toFixed(1)}s (pauses are added by the timeline).`);
