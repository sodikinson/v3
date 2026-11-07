/**
 * Turns the narration script (+ the ElevenLabs manifest, when present) into frame-accurate timing.
 * Every scene animation asks this module "when is this word spoken?" — so re-recording the
 * voiceover automatically re-times the whole video.
 */
import manifestJson from "./voiceover/manifest.json";
import {
  CUES,
  Cue,
  DEFAULT_PAUSE,
  FALLBACK_WORDS_PER_SECOND,
  SCENE_END_PAUSE,
  SCENE_ORDER,
  SceneId,
} from "./script";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Frames before the first word. */
const LEAD_IN = Math.round(0.5 * FPS);
/** A scene's visuals start this long before its first cue, so motion leads the voice. */
const SCENE_PREROLL: Partial<Record<SceneId, number>> & { default: number } = {
  default: 0.35,
  // the recap "evidence board" needs a beat on screen before the narration resumes
  "s06-conclusion": 1.4,
};
const prerollFrames = (id: SceneId) => Math.round((SCENE_PREROLL[id] ?? SCENE_PREROLL.default) * FPS);
/** Outgoing scene stays mounted under the incoming one for the mask transition. */
export const TRANSITION_FRAMES = 18;

type Word = { w: string; s: number; e: number };
type CueAudio = { file: string; duration: number; words: Word[] };
type Manifest = { generated: boolean; cues: Record<string, CueAudio> };
const manifest = manifestJson as unknown as Manifest;

export const HAS_VOICEOVER = manifest.generated && CUES.every((c) => manifest.cues[c.id]);

export type TimedWord = { text: string; from: number; to: number; kind: "normal" | "key" | "warn" };
export type TimedCue = {
  cue: Cue;
  from: number;
  duration: number;
  audio: string | null;
  words: TimedWord[];
};
export type TimedScene = { id: SceneId; from: number; duration: number };
export type Phrase = { from: number; to: number; words: TimedWord[] };

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "");

const classify = (cue: Cue, token: string): TimedWord["kind"] => {
  const n = norm(token);
  if (cue.warnings?.some((w) => norm(w) === n)) return "warn";
  if (cue.keywords?.some((w) => norm(w) === n)) return "key";
  return "normal";
};

const timeWords = (cue: Cue, from: number, durationSec: number): TimedWord[] => {
  const tokens = cue.text.split(/\s+/).filter(Boolean);
  const aligned = HAS_VOICEOVER ? manifest.cues[cue.id].words : null;

  if (aligned && aligned.length === tokens.length) {
    return tokens.map((t, i) => ({
      text: t,
      from: from + Math.round(aligned[i].s * FPS),
      to: from + Math.round(aligned[i].e * FPS),
      kind: classify(cue, t),
    }));
  }

  // Estimate: distribute speaking time by character weight (+ extra for punctuation pauses).
  const weights = tokens.map((t) => t.length + 2 + (/[.,?!:…]["”]?$/.test(t) ? 4 : 0));
  const total = weights.reduce((a, b) => a + b, 0);
  const speak = durationSec * 0.94;
  let acc = 0.05;
  return tokens.map((t, i) => {
    const s = acc;
    acc += (weights[i] / total) * speak;
    return {
      text: t,
      from: from + Math.round(s * FPS),
      to: from + Math.round(acc * FPS),
      kind: classify(cue, t),
    };
  });
};

const estimateDuration = (cue: Cue) => {
  const words = cue.text.split(/\s+/).length;
  const punct = (cue.text.match(/[.,?!:…]/g) ?? []).length;
  return words / FALLBACK_WORDS_PER_SECOND + punct * 0.12 + 0.15;
};

const build = () => {
  const cues: Record<string, TimedCue> = {};
  let cursor = LEAD_IN;

  CUES.forEach((cue, i) => {
    const audio = HAS_VOICEOVER ? manifest.cues[cue.id] : null;
    const durSec = audio ? audio.duration : estimateDuration(cue);
    const duration = Math.ceil(durSec * FPS);
    const isSceneEnd = CUES[i + 1]?.scene !== cue.scene;
    const pause = cue.pauseAfter ?? (isSceneEnd ? SCENE_END_PAUSE : DEFAULT_PAUSE);

    cues[cue.id] = {
      cue,
      from: cursor,
      duration,
      audio: audio ? audio.file : null,
      words: timeWords(cue, cursor, durSec),
    };
    cursor += duration + Math.round(pause * FPS);
  });

  const totalFrames = cursor;

  const scenes: TimedScene[] = SCENE_ORDER.map((id, i) => {
    const first = CUES.find((c) => c.scene === id)!;
    const from = i === 0 ? 0 : cues[first.id].from - prerollFrames(id);
    return { id, from, duration: 0 };
  });
  scenes.forEach((s, i) => {
    s.duration = (scenes[i + 1]?.from ?? totalFrames) - s.from;
  });

  return { cues, scenes, totalFrames };
};

export const TIMELINE = build();

export const sceneById = (id: SceneId) => TIMELINE.scenes.find((s) => s.id === id)!;

/**
 * Scene-local timing helpers. Inside a scene, `useCurrentFrame()` is relative to the
 * scene start, so all values returned here are too.
 */
export const sceneClock = (id: SceneId) => {
  const scene = sceneById(id);
  const get = (cueId: string) => {
    const c = TIMELINE.cues[cueId];
    if (!c) throw new Error(`Unknown cue ${cueId}`);
    if (c.cue.scene !== id) console.warn(`Cue ${cueId} is not in scene ${id}`);
    return c;
  };
  return {
    duration: scene.duration,
    /** Frame the cue starts. */
    cue: (cueId: string) => get(cueId).from - scene.from,
    /** Frame the cue ends (last word finishes). */
    cueEnd: (cueId: string) => get(cueId).from + get(cueId).duration - scene.from,
    /** Frame a given word starts being spoken (case/punctuation-insensitive). */
    word: (cueId: string, word: string, occurrence = 0) => {
      const c = get(cueId);
      const matches = c.words.filter((w) => norm(w.text) === norm(word));
      const hit = matches[occurrence] ?? matches[0];
      if (!hit) throw new Error(`Word "${word}" not in cue ${cueId}`);
      return hit.from - scene.from;
    },
  };
};

/** Phrase-level captions: break on punctuation, keep chunks to ~5 words. */
export const PHRASES: Phrase[] = (() => {
  const out: Phrase[] = [];
  Object.values(TIMELINE.cues).forEach((tc, idx, all) => {
    if (tc.cue.hideCaption) return;
    let chunk: TimedWord[] = [];
    const flush = () => {
      if (chunk.length) out.push({ from: chunk[0].from, to: 0, words: chunk });
      chunk = [];
    };
    tc.words.forEach((w) => {
      chunk.push(w);
      const endsSentence = /[.?!:…]["”]?$/.test(w.text);
      const endsClause = /[,;]["”]?$/.test(w.text);
      if (endsSentence || (endsClause && chunk.length >= 3) || chunk.length >= 5) flush();
    });
    flush();
    // Each phrase holds until the next one starts (or the cue ends + a short hold).
    const next = all[idx + 1];
    const cueEnd = tc.from + tc.duration;
    const holdUntil = Math.min(cueEnd + 12, next ? next.from : cueEnd + 12);
    for (let i = out.length - 1; i >= 0 && out[i].to === 0; i--) {
      out[i].to = out[i + 1] && out[i + 1].to !== 0 ? out[i + 1].from : holdUntil;
    }
  });
  return out;
})();
