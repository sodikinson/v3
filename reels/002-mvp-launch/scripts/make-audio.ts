/**
 * Synthesises the music bed and UI sound effects offline (no samples, no licensing).
 *
 *   npm run audio
 *
 * Output: public/audio/*.wav  (re-encoded to .mp3 if ffmpeg is available)
 * Swap any of these for licensed tracks later — file names are referenced in src/audio.ts.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

const SR = 44100;
const OUT = path.resolve(import.meta.dirname, "..", "public", "audio");
mkdirSync(OUT, { recursive: true });

// Deterministic PRNG so the output is reproducible.
let seed = 1234567;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rand() * 2 - 1;
const TAU = Math.PI * 2;
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

const writeWav = (name: string, left: Float32Array, right: Float32Array = left) => {
  const n = left.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  const g = peak > 0.98 ? 0.98 / peak : 1;
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[i] * g)) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[i] * g)) * 32767), 46 + i * 4);
  }
  const wav = path.join(OUT, `${name}.wav`);
  writeFileSync(wav, buf);
  try {
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", wav, "-codec:a", "libmp3lame", "-b:a", "160k", path.join(OUT, `${name}.mp3`)]);
    unlinkSync(wav);
    console.log(`✓ audio/${name}.mp3`);
  } catch {
    console.log(`✓ audio/${name}.wav (ffmpeg not found, kept WAV — update src/audio.ts extension)`);
  }
};

const make = (seconds: number) => new Float32Array(Math.ceil(seconds * SR));

// ───────────────────────────── SFX ─────────────────────────────

/** Short, dry UI tick — checkmarks, nodes snapping in. */
{
  const L = make(0.08);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    L[i] = (noise() * Math.exp(-t * 900) * 0.5 + Math.sin(TAU * 2900 * t) * Math.exp(-t * 160) * 0.35) * 0.8;
  }
  writeWav("tick", L);
}

/** Soft pop — elements appearing. */
{
  const L = make(0.18);
  let ph = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const f = 520 + 420 * Math.min(1, t / 0.05);
    ph += (TAU * f) / SR;
    L[i] = Math.sin(ph) * Math.exp(-t * 28) * 0.6;
  }
  writeWav("pop", L);
}

/** Two-note confirm chime. */
{
  const L = make(0.6);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const a = Math.sin(TAU * 1318.5 * t) * Math.exp(-t * 9);
    const t2 = t - 0.07;
    const b = t2 > 0 ? Math.sin(TAU * 1975.5 * t2) * Math.exp(-t2 * 8) : 0;
    L[i] = (a * 0.35 + b * 0.3) * Math.min(1, t * 400);
  }
  writeWav("check", L);
}

/** Muted two-tone warning (coral moments). */
{
  const L = make(0.55);
  let lp = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const f = t < 0.18 ? 349.2 : 293.7;
    const local = t < 0.18 ? t : t - 0.2;
    const env = local > 0 ? Math.exp(-local * 9) * Math.min(1, local * 300) : 0;
    const tri = (2 / Math.PI) * Math.asin(Math.sin(TAU * f * t));
    lp += (tri * env - lp) * 0.25;
    L[i] = lp * 0.55;
  }
  writeWav("warn", L);
}

/** Air whoosh for wipes and camera moves. */
const whoosh = (name: string, dur: number) => {
  const L = make(dur);
  const R = make(dur);
  let lpL = 0;
  let lpR = 0;
  for (let i = 0; i < L.length; i++) {
    const p = i / L.length;
    const env = Math.pow(Math.sin(Math.PI * p), 2.2);
    const cutoff = 0.02 + 0.22 * Math.sin(Math.PI * Math.min(1, p * 1.1));
    lpL += (noise() - lpL) * cutoff;
    lpR += (noise() - lpR) * cutoff;
    const pan = p; // sweeps left → right
    L[i] = lpL * env * (1 - pan * 0.6) * 0.9;
    R[i] = lpR * env * (0.4 + pan * 0.6) * 0.9;
  }
  writeWav(name, L, R);
};
whoosh("whoosh", 0.7);
whoosh("swish", 0.35);

/** Low thud — the final statement lands. */
{
  const L = make(0.9);
  let ph = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const f = 42 + 60 * Math.exp(-t * 14);
    ph += (TAU * f) / SR;
    L[i] = Math.sin(ph) * Math.exp(-t * 4.5) * 0.9 + noise() * Math.exp(-t * 120) * 0.15;
  }
  writeWav("thud", L);
}

/** Paper slide — document cutouts. */
{
  const L = make(0.4);
  let lp = 0;
  let hp = 0;
  for (let i = 0; i < L.length; i++) {
    const p = i / L.length;
    const n = noise();
    lp += (n - lp) * 0.5;
    hp = n - lp;
    L[i] = hp * Math.pow(Math.sin(Math.PI * p), 1.5) * 0.35 * (0.7 + 0.3 * Math.sin(TAU * 31 * p));
  }
  writeWav("paper", L);
}

// ───────────────────────────── MUSIC BED ─────────────────────────────
// 32s seamless loop: A-minor documentary pad + clock pulse + sparse plucks.
{
  const LOOP = 32;
  const N = LOOP * SR;
  const dry = new Float32Array(N);
  const dryR = new Float32Array(N);

  const chords = [
    [45, 57, 60, 64, 71], // Am(add9)
    [41, 53, 57, 60, 64], // Fmaj7
    [48, 55, 60, 64, 74], // C(add9)
    [43, 55, 59, 62, 64], // G6
  ];
  const chordLen = LOOP / chords.length;

  for (let c = 0; c < chords.length; c++) {
    const startSec = c * chordLen;
    const len = chordLen + 3; // overlap into next chord, wraps around the loop
    for (const midi of chords[c]) {
      const f = mtof(midi);
      const amp = midi < 50 ? 0.16 : 0.07;
      const det = 0.6 + rand() * 0.5;
      for (let i = 0; i < len * SR; i++) {
        const t = i / SR;
        const env = Math.min(1, t / 2.2) * Math.min(1, (len - t) / 3);
        const s =
          Math.sin(TAU * f * t) +
          0.35 * Math.sin(TAU * (f + det) * t + 1.3) +
          0.18 * Math.sin(TAU * f * 2 * t + 0.4) +
          0.06 * Math.sin(TAU * f * 3 * t);
        const idx = (Math.floor(startSec * SR) + i) % N;
        const trem = 0.85 + 0.15 * Math.sin(TAU * 0.11 * (idx / SR) + midi);
        dry[idx] += s * amp * env * trem;
        dryR[idx] += s * amp * env * (2 - trem);
      }
    }
  }

  // Soft clock pulse every 0.5s (investigative tension, very low).
  for (let k = 0; k < LOOP * 2; k++) {
    const at = Math.floor(k * 0.5 * SR);
    const accent = k % 4 === 0 ? 1 : 0.55;
    for (let i = 0; i < 0.05 * SR; i++) {
      const t = i / SR;
      const v = (Math.sin(TAU * 1800 * t) * 0.4 + noise() * 0.3) * Math.exp(-t * 140) * 0.05 * accent;
      dry[(at + i) % N] += v;
      dryR[(at + i) % N] += v * 0.8;
    }
  }

  // Sparse plucks from the A-minor pentatonic.
  const penta = [69, 72, 74, 76, 79, 81];
  for (let k = 0; k < 16; k++) {
    if (rand() < 0.3) continue;
    const at = Math.floor((k * 2 + 1) * SR);
    const f = mtof(penta[Math.floor(rand() * penta.length)]);
    const pan = rand();
    for (let i = 0; i < 1.8 * SR; i++) {
      const t = i / SR;
      const v = (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 2 * t)) * Math.exp(-t * 3.2) * 0.07;
      dry[(at + i) % N] += v * (1 - pan);
      dryR[(at + i) % N] += v * pan;
    }
  }

  // Circular Schroeder reverb (two passes so tails wrap seamlessly).
  const reverb = (input: Float32Array, offset: number) => {
    const out = new Float32Array(N);
    const combs = [1557, 1617, 1491, 1422].map((d) => d + offset);
    for (const d of combs) {
      const buf = new Float32Array(d);
      let p = 0;
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < N; i++) {
          const y = buf[p];
          buf[p] = input[i] + y * 0.82;
          p = (p + 1) % d;
          if (pass === 1) out[i] += y * 0.25;
        }
      }
    }
    return out;
  };
  const wetL = reverb(dry, 0);
  const wetR = reverb(dryR, 23);

  const L = new Float32Array(N);
  const R = new Float32Array(N);
  let lpL = 0;
  let lpR = 0;
  for (let i = 0; i < N; i++) {
    lpL += (dry[i] * 0.7 + wetL[i] * 0.5 - lpL) * 0.12; // warm low-pass
    lpR += (dryR[i] * 0.7 + wetR[i] * 0.5 - lpR) * 0.12;
    L[i] = lpL;
    R[i] = lpR;
  }
  writeWav("music-bed", L, R);
}
