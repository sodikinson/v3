import React, { createContext, useContext } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PHRASES } from "../timeline";
import { C, EASE_IN_OUT, EASE_OUT, MONO, SANS, prog } from "../theme";
import { TRANSITION_IN } from "../timeline";

/**
 * Phrase-level synced captions. One phrase at a time; keywords marked in yellow,
 * warnings in coral; the currently-spoken word is fully opaque.
 * `offset` maps the global timeline to local frames (for scene previews).
 */
export const Captions: React.FC<{ offset?: number }> = ({ offset = 0 }) => {
  const frame = useCurrentFrame() + offset;
  const phrase = PHRASES.find((p) => frame >= p.from && frame < p.to);
  if (!phrase) return null;
  const inP = prog(frame, phrase.from, 10);
  const outP = prog(frame, phrase.to - 7, 7);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 440, pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 900,
          padding: "14px 26px 18px",
          background: "rgba(9, 20, 36, 0.6)",
          borderRadius: 12,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 14,
          opacity: inP * (1 - outP),
          translate: `0 ${(1 - inP) * 16}px`,
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 46,
          lineHeight: 1.18,
          letterSpacing: "-0.01em",
        }}
      >
        {phrase.words.map((w, i) => {
          const spoken = frame >= w.from;
          const color = w.kind === "key" ? C.yellow : w.kind === "warn" ? C.coral : C.white;
          return (
            <span key={i} style={{ color, opacity: spoken ? 1 : 0.45 }}>
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Scene-local frame at which the scene starts leaving (Infinity for standalone previews). */
const SceneExitContext = createContext<number>(Infinity);

/** Documentary chapter marker, top-left. Wipes in on each scene and retracts before the hand-off. */
export const ChapterTag: React.FC<{ index: number; title: string }> = ({ index, title }) => {
  const frame = useCurrentFrame();
  const exitAt = useContext(SceneExitContext);
  const out = Number.isFinite(exitAt) ? prog(frame, exitAt - 10, 16, EASE_IN_OUT) : 0;
  const p = prog(frame, 6, 24) * (1 - out);
  const lineP = prog(frame, 0, 28) * (1 - out);
  return (
    <div style={{ position: "absolute", top: 250, left: 80, display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ width: 70 * lineP, height: 4, background: C.yellow }} />
      <div style={{ overflow: "hidden" }}>
        <div
          style={{
            fontFamily: MONO,
            fontWeight: 500,
            fontSize: 26,
            letterSpacing: "0.16em",
            color: C.muted,
            translate: `0 ${(1 - p) * 110}%`,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: C.yellow }}>{String(index).padStart(2, "0")}</span>&nbsp;&nbsp;{title}
        </div>
      </div>
    </div>
  );
};

/** Persistent series mark, top-right. */
export const SeriesMark: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 196,
      right: 80,
      fontFamily: MONO,
      fontSize: 22,
      letterSpacing: "0.16em",
      color: C.muted,
      opacity: 0.7,
      textAlign: "right",
    }}
  >
    MY FIRST JOURNEY · 002
  </div>
);

export type TransitionKind = "none" | "wipe-up" | "wipe-left" | "iris" | "dissolve";

const SOFT = 28; // % of the frame the soft edge spans

/**
 * Scene entrance and exit.
 * Entrance: a soft-edged gradient mask reveals the incoming scene over the outgoing one,
 * while the content settles in from a slight offset/scale.
 * Exit: during the final `exitFrames` the scene drifts and fades, so the hand-off is a
 * cross-fade, not a cut.
 */
export const SceneShell: React.FC<{
  reveal: TransitionKind;
  origin?: [number, number];
  durationInFrames: number;
  exitFrames: number;
  children: React.ReactNode;
}> = ({ reveal, origin = [540, 960], durationInFrames, exitFrames, children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, TRANSITION_IN], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_IN_OUT,
  });
  const settle = interpolate(frame, [0, TRANSITION_IN + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const out =
    exitFrames > 0
      ? interpolate(frame, [durationInFrames - exitFrames, durationInFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_IN_OUT,
        })
      : 0;

  let maskImage: string | undefined;
  let opacity = 1;
  if (reveal !== "none" && p < 1) {
    // Edge position runs from fully hidden to fully shown, including the soft band.
    const edge = -SOFT + p * (100 + SOFT);
    if (reveal === "wipe-up") maskImage = `linear-gradient(to top, black ${edge}%, transparent ${edge + SOFT}%)`;
    if (reveal === "wipe-left") maskImage = `linear-gradient(to left, black ${edge}%, transparent ${edge + SOFT}%)`;
    if (reveal === "iris") {
      const r = p * 2400;
      maskImage = `radial-gradient(circle at ${origin[0]}px ${origin[1]}px, black ${Math.max(0, r - 420)}px, transparent ${r}px)`;
    }
    if (reveal === "dissolve") opacity = p;
  }

  return (
    <SceneExitContext.Provider value={exitFrames > 0 ? durationInFrames - exitFrames : Infinity}>
      <AbsoluteFill
        style={{
          maskImage,
          WebkitMaskImage: maskImage,
          opacity: opacity * (1 - out),
          translate: `0 ${(1 - settle) * 28 - out * 60}px`,
          scale: String(0.985 + settle * 0.015 - out * 0.02),
        }}
      >
        {children}
      </AbsoluteFill>
    </SceneExitContext.Provider>
  );
};
