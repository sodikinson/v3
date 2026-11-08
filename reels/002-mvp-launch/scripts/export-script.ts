/**
 * Writes VOICEOVER_SCRIPT.md: the narration split into one clip per cue, ready to
 * paste into elevenlabs.io when generating the voiceover by hand.
 *
 *   npm run voiceover:script
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { CUES, SCENE_ORDER } from "../src/script.ts";

const SCENE_TITLES: Record<string, string> = {
  "s01-mvp": "Scene 01 · We finally reached MVP",
  "s02-core": "Scene 02 · The core value",
  "s03-disagreement": "Scene 03 · The disagreement",
  "s04-bugs": "Scene 04 · Which bugs actually matter?",
  "s05-assumptions": "Scene 05 · Assumptions versus reality",
  "s06-conclusion": "Scene 06 · The conclusion",
};

const DIRECTION: Record<string, string> = {
  c07: "Quoting the CEO: a touch more energy, decisive.",
  c09: "Quoting marketing: cautious, slightly worried.",
  c10: "Warm, conceding.",
  c13: "A real question; let the pitch rise at the end.",
  c14: "Measured, listing three conditions; trail off on the ellipsis.",
  c20: "Slow down. This is the turning point.",
  c28: "The thesis. Slower, with a clear beat between the two sentences.",
  c29: "Personal, friendly, your natural voice.",
  c31: "Genuinely asking the viewer.",
};

const lines: string[] = [
  "# Reel 002 voiceover script (manual ElevenLabs generation)",
  "",
  "**The MVP Works. So Why Aren't We Launching?** · My First Journey · Kolaris Labs",
  "",
  "## Settings (use the same for every clip)",
  "",
  "- **Voice:** your cloned voice",
  "- **Model:** Eleven Multilingual v2",
  "- **Stability** 55% · **Similarity** 80% · **Style exaggeration** 20% · **Speaker boost** on · **Speed** about 1.04",
  "- **Output:** MP3 (44.1 kHz, 128 kbps or higher)",
  "",
  "## How to generate",
  "",
  `1. Generate **one clip per line below**, **in order** (c01 → c${String(CUES.length).padStart(2, "0")}). Paste exactly the text in the box.`,
  "2. Listen to each one. Regenerate if a word sounds off. Pacing between lines doesn't matter, because the video adds the pauses.",
  "3. Download each clip. Ideally rename it to its code (`c01.mp3`, `c02.mp3`, …). If you keep ElevenLabs' timestamped names, that works too, as long as you generated them in order.",
  "4. Upload all the files (or one .zip) to the Claude session.",
  "",
];

for (const scene of SCENE_ORDER) {
  lines.push(`## ${SCENE_TITLES[scene]}`, "");
  for (const cue of CUES.filter((c) => c.scene === scene)) {
    lines.push(`**${cue.id}**${DIRECTION[cue.id] ? ` · _${DIRECTION[cue.id]}_` : ""}`, "", "```", cue.text, "```", "");
  }
}

lines.push(`Total: ${CUES.length} clips.`, "");
const out = path.resolve(import.meta.dirname, "..", "VOICEOVER_SCRIPT.md");
writeFileSync(out, lines.join("\n"));
console.log(`Wrote ${out}`);
