import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PHRASES } from "../timeline";
import { C, EASE_OUT, MONO, SANS, prog } from "../theme";

/**
 * Phrase-level synced captions. One phrase at a time; keywords marked in yellow,
 * warnings in coral; the currently-spoken word is fully opaque.
 * `offset` maps the global timeline to local frames (for scene previews).
 */
export const Captions: React.FC<{ offset?: number }> = ({ offset = 0 }) => {
  const frame = useCurrentFrame() + offset;
  const phrase = PHRASES.find((p) => frame >= p.from && frame < p.to);
  if (!phrase) return null;
  const inP = prog(frame, phrase.from, 7);
  const outP = prog(frame, phrase.to - 5, 5);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 440, pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 900,
          padding: "14px 26px 18px",
          background: "rgba(9, 20, 36, 0.78)",
          borderRadius: 12,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 14,
          opacity: inP * (1 - outP),
          translate: `0 ${(1 - inP) * 16}px`,
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 50,
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

/** Documentary chapter marker, top-left. Wipes in on each scene. */
export const ChapterTag: React.FC<{ index: number; title: string }> = ({ index, title }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, 4, 18);
  const lineP = prog(frame, 0, 22);
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

export type TransitionKind = "none" | "wipe-up" | "wipe-left" | "iris" | "blinds";

/**
 * Mask-reveal entrance for a scene: the incoming scene is revealed over the outgoing one.
 */
export const SceneShell: React.FC<{
  reveal: TransitionKind;
  origin?: [number, number];
  children: React.ReactNode;
}> = ({ reveal, origin = [540, 960], children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  let clipPath: string | undefined;
  if (p < 1) {
    if (reveal === "wipe-up") clipPath = `inset(${(1 - p) * 100}% 0 0 0)`;
    if (reveal === "wipe-left") clipPath = `inset(0 0 0 ${(1 - p) * 100}%)`;
    if (reveal === "iris") clipPath = `circle(${p * 2300}px at ${origin[0]}px ${origin[1]}px)`;
    if (reveal === "blinds") {
      // Six horizontal bands sweeping in — an editorial "page turn".
      const bands = 6;
      const h = 100 / bands;
      const pts: string[] = [];
      for (let i = 0; i < bands; i++) {
        const local = Math.min(1, Math.max(0, p * 1.6 - i * 0.12));
        const y0 = i * h;
        const y1 = y0 + h * local;
        pts.push(`0% ${y0}%, 100% ${y0}%, 100% ${y1}%, 0% ${y1}%, 0% ${y0}%`);
      }
      clipPath = `polygon(evenodd, ${pts.join(", ")})`;
    }
  }
  return <AbsoluteFill style={{ clipPath }}>{children}</AbsoluteFill>;
};
