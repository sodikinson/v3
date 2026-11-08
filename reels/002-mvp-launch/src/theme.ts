import { loadFont } from "@remotion/fonts";
import { Easing, interpolate, staticFile } from "remotion";

/**
 * Fonts are self-hosted from public/fonts (SIL Open Font License) so renders work offline.
 * Archivo ships as one variable file covering every weight.
 */
export const SANS = "Archivo";
export const SERIF = "Instrument Serif";
export const MONO = "IBM Plex Mono";

const FONTS: Parameters<typeof loadFont>[0][] = [
  { family: SANS, url: staticFile("fonts/Archivo-Variable.woff2"), weight: "100 900" },
  { family: SERIF, url: staticFile("fonts/InstrumentSerif-Regular.woff2"), weight: "400", style: "normal" },
  { family: SERIF, url: staticFile("fonts/InstrumentSerif-Italic.woff2"), weight: "400", style: "italic" },
  { family: MONO, url: staticFile("fonts/IBMPlexMono-Regular.woff2"), weight: "400" },
  { family: MONO, url: staticFile("fonts/IBMPlexMono-Medium.woff2"), weight: "500" },
  { family: MONO, url: staticFile("fonts/IBMPlexMono-SemiBold.woff2"), weight: "600" },
];
FONTS.forEach((f) => loadFont(f));

export const C = {
  navy: "#0F1C2E",
  navyDeep: "#091424",
  navyLine: "#1E3048",
  navySoft: "#22385A",
  paper: "#F3ECDD",
  paperShade: "#E4DAC6",
  ink: "#14202F",
  inkSoft: "#5B6675",
  yellow: "#E7BE4F",
  yellowSoft: "rgba(231, 190, 79, 0.35)",
  coral: "#E8664F",
  coralSoft: "rgba(232, 102, 79, 0.18)",
  muted: "#8A97AA",
  white: "#FBF7EE",
};

/** Expo-out: confident, editorial. Used for almost every reveal. */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);

/** 0 → 1 between `start` and `start + dur` (clamped, eased). */
export const prog = (frame: number, start: number, dur = 24, easing = EASE_OUT) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Lerp helper. */
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Safe area for 9:16 Reels (keeps clear of IG UI chrome). */
export const SAFE = { top: 250, bottom: 430, side: 80 };
