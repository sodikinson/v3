import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, EASE_IN_OUT, EASE_OUT, MONO, SANS, prog } from "../theme";

type WordStyle = { color?: string; marker?: string; strike?: string };

/**
 * Kinetic headline: each word rises out of its own mask.
 * Pass `at` (one frame per word, e.g. from the narration) for voice-synced reveals,
 * or `start` + `stagger` for a fixed rhythm.
 */
export const RevealWords: React.FC<{
  text: string;
  start?: number;
  stagger?: number;
  at?: number[];
  style?: React.CSSProperties;
  words?: Record<string, WordStyle>;
  exit?: number;
  align?: "left" | "center";
  lineGap?: number;
}> = ({ text, start = 0, stagger = 3, at, style, words = {}, exit, align = "left" }) => {
  const frame = useCurrentFrame();
  const tokens = text.split(" ");
  const out = exit !== undefined ? prog(frame, exit, 18, EASE_IN_OUT) : 0;
  return (
    <div
      style={{
        fontFamily: SANS,
        fontWeight: 900,
        color: C.white,
        lineHeight: 1.02,
        letterSpacing: "-0.02em",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: "0.24em",
        ...style,
      }}
    >
      {tokens.map((t, i) => {
        if (t === "\n") return <div key={i} style={{ flexBasis: "100%", height: 0 }} />;
        const wi = tokens.slice(0, i).filter((x) => x !== "\n").length;
        const s = at ? at[Math.min(wi, at.length - 1)] : start + wi * stagger;
        const p = prog(frame, s, 22);
        const key = t.replace(/[^\p{L}\p{N}≠=-]/gu, "").toLowerCase();
        const ws = words[key] ?? words[t] ?? {};
        const markerP = prog(frame, s + 6, 14);
        const strikeP = prog(frame, s + 10, 12);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.08em", marginBottom: "-0.08em" }}>
            <span
              style={{
                display: "inline-block",
                position: "relative",
                translate: `0 ${interpolate(p, [0, 1], [105, 0]) + out * -105}%`,
                color: ws.color,
              }}
            >
              {ws.marker ? (
                <span
                  style={{
                    position: "absolute",
                    left: "-0.08em",
                    right: "-0.08em",
                    top: "0.18em",
                    bottom: "0.04em",
                    background: ws.marker,
                    transformOrigin: "left center",
                    scale: `${markerP} 1`,
                  }}
                />
              ) : null}
              <span style={{ position: "relative" }}>{t}</span>
              {ws.strike ? (
                <span
                  style={{
                    position: "absolute",
                    left: "-0.05em",
                    right: "-0.05em",
                    top: "52%",
                    height: "0.1em",
                    background: ws.strike,
                    transformOrigin: "left center",
                    scale: `${strikeP} 1`,
                  }}
                />
              ) : null}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Mono, uppercase, tracked — used for labels, chapter markers, annotations. */
export const Label: React.FC<{
  children: React.ReactNode;
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, color = C.muted, size = 28, style }) => (
  <div
    style={{
      fontFamily: MONO,
      fontWeight: 500,
      fontSize: size,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Simple masked slide-in for any block. */
export const Reveal: React.FC<{
  start: number;
  dur?: number;
  from?: "up" | "down" | "left" | "right" | "fade";
  distance?: number;
  exit?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ start, dur = 26, from = "up", distance = 32, exit, style, children }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, dur, EASE_OUT);
  const e = exit !== undefined ? prog(frame, exit, 18, EASE_IN_OUT) : 0;
  const d = (1 - p) * distance;
  const t =
    from === "up" ? `0 ${d}px` : from === "down" ? `0 ${-d}px` : from === "left" ? `${-d}px 0` : from === "right" ? `${d}px 0` : "0 0";
  return <div style={{ opacity: p * (1 - e), translate: t, ...style }}>{children}</div>;
};

/** A yellow (or coral) marker swipe behind inline text. */
export const Marker: React.FC<{ start: number; color?: string; children: React.ReactNode }> = ({
  start,
  color = C.yellow,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 14);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        style={{
          position: "absolute",
          inset: "0.12em -0.1em 0.02em -0.1em",
          background: color,
          transformOrigin: "left center",
          scale: `${p} 1`,
          zIndex: 0,
        }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};
