/**
 * REELS 002 — The MVP Works. So Why Aren't We Launching?
 *
 * Single source of truth for the narration. It drives:
 *   1. ElevenLabs voiceover generation (scripts/generate-voiceover.ts)
 *   2. Phrase-level captions (with emphasised keywords)
 *   3. Scene timing — every animation is keyed to the cue that explains it.
 *
 * This file must stay dependency-free: it is imported by Node directly.
 */

export type SceneId =
  | "s01-mvp"
  | "s02-core"
  | "s03-disagreement"
  | "s04-bugs"
  | "s05-assumptions"
  | "s06-conclusion";

export type Cue = {
  id: string;
  scene: SceneId;
  /** Text sent to ElevenLabs. */
  text: string;
  /** Words (case-insensitive, punctuation ignored) highlighted yellow in captions. */
  keywords?: string[];
  /** Words highlighted coral — warnings, risk, bugs. */
  warnings?: string[];
  /** Silence after this cue, in seconds. Defaults to 0.25s (0.6s at scene ends). */
  pauseAfter?: number;
  /** Optional ElevenLabs voice override (e.g. for a character line). */
  voiceId?: string;
  /** Hide this cue from captions (e.g. when the line is already typeset on screen). */
  hideCaption?: boolean;
};

export const SCENE_ORDER: SceneId[] = [
  "s01-mvp",
  "s02-core",
  "s03-disagreement",
  "s04-bugs",
  "s05-assumptions",
  "s06-conclusion",
];

export const CUES: Cue[] = [
  // SCENE 01 — We finally reached MVP
  { id: "c01", scene: "s01-mvp", text: "We built an accounting SaaS.", keywords: ["accounting"] },
  {
    id: "c02",
    scene: "s01-mvp",
    text: "After months of development, we finally reached our MVP.",
    keywords: ["MVP"],
    pauseAfter: 2.2, // hold for the "MVP reached ≠ product finished" card
  },

  // SCENE 02 — Demonstrate the core value
  {
    id: "c03",
    scene: "s02-core",
    text: "Users can upload bank statements, record their daily transactions, and automatically generate financial statements.",
    keywords: ["bank", "statements", "transactions", "financial"],
  },
  {
    id: "c04",
    scene: "s02-core",
    text: "The core accounting features work.",
    keywords: ["core", "work"],
    pauseAfter: 0.4,
  },
  {
    id: "c05",
    scene: "s02-core",
    text: "Signup works. Free trial works. Even the payment gateway and billing are ready.",
    keywords: ["Signup", "trial", "billing"],
    pauseAfter: 0.7,
  },

  // SCENE 03 — The disagreement
  { id: "c06", scene: "s03-disagreement", text: "So the CEO says:", keywords: ["CEO"], pauseAfter: 0.15 },
  {
    id: "c07",
    scene: "s03-disagreement",
    text: "“Alright, let’s launch the marketing campaign. We need real users.”",
    keywords: ["launch", "real", "users"],
    pauseAfter: 0.5,
    hideCaption: true, // typeset on screen as a quote
  },
  { id: "c08", scene: "s03-disagreement", text: "But marketing hesitates.", keywords: ["marketing"], pauseAfter: 0.15 },
  {
    id: "c09",
    scene: "s03-disagreement",
    text: "“Wait. Some features still have bugs. What if customers have a bad experience?”",
    warnings: ["bugs", "bad", "experience"],
    pauseAfter: 0.5,
    hideCaption: true, // typeset on screen as a quote
  },
  { id: "c10", scene: "s03-disagreement", text: "And that’s a fair concern.", keywords: ["fair"] },
  {
    id: "c11",
    scene: "s03-disagreement",
    text: "Because first impressions matter.",
    keywords: ["first", "impressions"],
    pauseAfter: 0.7,
  },

  // SCENE 04 — Which bugs actually matter?
  { id: "c12", scene: "s04-bugs", text: "But here’s a question.", pauseAfter: 0.2 },
  {
    id: "c13",
    scene: "s04-bugs",
    text: "Are those bugs actually stopping users from getting the core value of our product?",
    keywords: ["core", "value"],
    warnings: ["bugs"],
    pauseAfter: 0.4,
  },
  {
    id: "c14",
    scene: "s04-bugs",
    text: "If the accounting workflow is reliable, the financial statements are accurate, and customer data is secure…",
    keywords: ["reliable", "accurate", "secure"],
    pauseAfter: 0.35,
  },
  {
    id: "c15",
    scene: "s04-bugs",
    text: "Should bugs in secondary features stop the entire launch?",
    keywords: ["secondary"],
    warnings: ["stop"],
    pauseAfter: 1.8,
  },

  // SCENE 05 — Assumptions versus reality
  { id: "c16", scene: "s05-assumptions", text: "Here’s the thing.", pauseAfter: 0.2 },
  {
    id: "c17",
    scene: "s05-assumptions",
    text: "We can spend another six months perfecting what we think customers want.",
    keywords: ["six", "months", "think"],
  },
  {
    id: "c18",
    scene: "s05-assumptions",
    text: "But we’re still operating on assumptions.",
    warnings: ["assumptions"],
  },
  {
    id: "c19",
    scene: "s05-assumptions",
    text: "And assumptions don’t tell us whether we’ve found product-market fit.",
    keywords: ["product-market", "fit"],
  },
  {
    id: "c20",
    scene: "s05-assumptions",
    text: "Real customer behavior does.",
    keywords: ["Real", "behavior"],
    pauseAfter: 0.6,
  },
  {
    id: "c21",
    scene: "s05-assumptions",
    text: "So instead of waiting for perfection, why not start small?",
    keywords: ["start", "small"],
    pauseAfter: 0.35,
  },
  { id: "c22", scene: "s05-assumptions", text: "Launch to early adopters.", keywords: ["early", "adopters"] },
  { id: "c23", scene: "s05-assumptions", text: "Be transparent about limitations.", keywords: ["transparent"] },
  {
    id: "c24",
    scene: "s05-assumptions",
    text: "Observe how they use the product. Collect feedback. Fix problems. Iterate.",
    keywords: ["Observe", "feedback", "Fix", "Iterate"],
    pauseAfter: 0.35,
  },
  {
    id: "c25",
    scene: "s05-assumptions",
    text: "And if a critical feature breaks, fix it before expanding.",
    keywords: ["before", "expanding"],
    warnings: ["critical", "breaks"],
    pauseAfter: 1.8, // covers scene 06's longer pre-roll
  },

  // SCENE 06 — The conclusion
  {
    id: "c26",
    scene: "s06-conclusion",
    text: "Because an MVP isn’t supposed to be a finished product.",
    keywords: ["finished"],
    hideCaption: true, // kinetic typography carries this line
  },
  {
    id: "c27",
    scene: "s06-conclusion",
    text: "It’s supposed to be the beginning of learning.",
    keywords: ["beginning", "learning"],
    pauseAfter: 0.6,
    hideCaption: true,
  },
  {
    id: "c28",
    scene: "s06-conclusion",
    text: "Launch before you’re complete. Not before you’re reliable.",
    hideCaption: true,
    pauseAfter: 0.9,
  },
  { id: "c29", scene: "s06-conclusion", text: "I’m Ari, building Kolaris Labs.", hideCaption: true, pauseAfter: 0.3 },
  { id: "c30", scene: "s06-conclusion", text: "And this is My First Journey.", hideCaption: true, pauseAfter: 0.7 },
  {
    id: "c31",
    scene: "s06-conclusion",
    text: "What would you do? Launch now, or wait?",
    keywords: ["Launch", "now", "wait"],
    pauseAfter: 2.5,
    hideCaption: true,
  },
];

export const DEFAULT_PAUSE = 0.25;
export const SCENE_END_PAUSE = 0.6;
/** Narration pace used when no voiceover has been generated yet (words / second). */
export const FALLBACK_WORDS_PER_SECOND = 2.85;
