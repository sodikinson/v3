import React from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { C, EASE_IN_OUT, MONO, SANS, prog } from "../theme";
import { PaperGrain } from "./Texture";

/** An SVG path that draws itself on. */
export const DrawPath: React.FC<{
  d: string;
  start: number;
  dur?: number;
  color?: string;
  width?: number;
  dashed?: boolean;
  opacity?: number;
}> = ({ d, start, dur = 20, color = C.paper, width = 5, dashed, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, dur + 6, EASE_IN_OUT);
  if (dashed) {
    // Dashed lines reveal through a mask so the dash pattern is preserved.
    const id = `m-${start}-${d.length}-${d.charCodeAt(3)}`;
    return (
      <g opacity={opacity}>
        <mask id={id}>
          <path d={d} pathLength={1} stroke="white" strokeWidth={width + 6} fill="none" strokeDasharray="1 1" strokeDashoffset={1 - p} />
        </mask>
        <path d={d} stroke={color} strokeWidth={width} fill="none" strokeDasharray="14 12" strokeLinecap="round" mask={`url(#${id})`} />
      </g>
    );
  }
  return (
    <path
      d={d}
      pathLength={1}
      stroke={color}
      strokeWidth={width}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="1 1"
      strokeDashoffset={1 - p}
      opacity={opacity * (p > 0 ? 1 : 0)}
    />
  );
};

/** Arrow between two points with an optional curve. The head pops at the end. */
export const Arrow: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  start: number;
  dur?: number;
  bend?: number;
  color?: string;
  width?: number;
  dashed?: boolean;
  head?: boolean;
}> = ({ x1, y1, x2, y2, start, dur = 18, bend = 0, color = C.paper, width = 5, dashed, head = true }) => {
  const frame = useCurrentFrame();
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * bend;
  const cy = my + (dx / len) * bend;
  const d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  const angle = (Math.atan2(y2 - cy, x2 - cx) * 180) / Math.PI;
  const hp = prog(frame, start + dur - 4, 10);
  return (
    <g>
      <DrawPath d={d} start={start} dur={dur} color={color} width={width} dashed={dashed} />
      {head ? (
        <g transform={`translate(${x2} ${y2}) rotate(${angle}) scale(${hp})`} opacity={hp > 0 ? 1 : 0}>
          <path d="M -22 -13 L 2 0 L -22 13" stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : null}
    </g>
  );
};

/** Circular check / cross badge that draws itself on. */
export const Badge: React.FC<{
  start: number;
  kind?: "check" | "cross" | "warn" | "lock";
  size?: number;
  color?: string;
  fill?: string;
  style?: React.CSSProperties;
}> = ({ start, kind = "check", size = 56, color = C.navy, fill = C.yellow, style }) => {
  const frame = useCurrentFrame();
  const pop = prog(frame, start, 12);
  const sc = interpolate(pop, [0, 0.6, 1], [0, 1.15, 1]);
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" style={{ overflow: "visible", scale: String(sc), ...style }}>
      {kind === "warn" ? (
        <path d="M 28 3 L 54 50 L 2 50 Z" fill={fill} stroke={fill} strokeWidth={4} strokeLinejoin="round" />
      ) : (
        <circle cx={28} cy={28} r={27} fill={fill} />
      )}
      {kind === "check" ? <DrawPath d="M 15 29 L 24 38 L 41 19" start={start + 5} dur={10} color={color} width={6} /> : null}
      {kind === "cross" ? (
        <>
          <DrawPath d="M 18 18 L 38 38" start={start + 5} dur={7} color={color} width={6} />
          <DrawPath d="M 38 18 L 18 38" start={start + 9} dur={7} color={color} width={6} />
        </>
      ) : null}
      {kind === "warn" ? (
        <>
          <DrawPath d="M 28 20 L 28 34" start={start + 5} dur={6} color={color} width={6} />
          <circle cx={28} cy={42} r={3.5} fill={color} opacity={prog(frame, start + 10, 4)} />
        </>
      ) : null}
      {kind === "lock" ? (
        <>
          <rect x={17} y={26} width={22} height={17} rx={3} fill={color} />
          <path d="M 21 26 V 20 a 7 7 0 0 1 14 0 V 26" stroke={color} strokeWidth={4.5} fill="none" />
        </>
      ) : null}
    </svg>
  );
};

/** Flowchart node: a labelled box on the navy field. */
export const Node: React.FC<{
  label: string;
  sub?: string;
  start: number;
  status?: { at: number; kind: "check" | "cross" | "warn" } | null;
  tone?: "paper" | "outline" | "yellow" | "coral";
  width?: number;
  style?: React.CSSProperties;
  fontSize?: number;
}> = ({ label, sub, start, status, tone = "outline", width = 280, style, fontSize = 36 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 22);
  const bg = tone === "paper" ? C.paper : tone === "yellow" ? C.yellow : tone === "coral" ? C.coral : "rgba(15,28,46,0.85)";
  const fg = tone === "outline" ? C.white : C.ink;
  const border = tone === "outline" ? `3px solid ${C.navySoft}` : "none";
  return (
    <div
      style={{
        position: "absolute",
        width,
        padding: "22px 24px",
        background: bg,
        border,
        borderRadius: 14,
        color: fg,
        opacity: p,
        scale: String(interpolate(p, [0, 1], [0.85, 1])),
        boxShadow: tone === "outline" ? "none" : "0 18px 40px rgba(0,0,0,0.35)",
        ...style,
      }}
    >
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize, lineHeight: 1.05, letterSpacing: "-0.01em" }}>{label}</div>
      {sub ? (
        <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 10, opacity: 0.7 }}>
          {sub}
        </div>
      ) : null}
      {status ? (
        <div style={{ position: "absolute", right: -20, top: -20 }}>
          <Badge
            start={status.at}
            kind={status.kind}
            size={52}
            fill={status.kind === "check" ? C.yellow : C.coral}
            color={C.navy}
          />
        </div>
      ) : null}
    </div>
  );
};

/** Jagged "torn" polygon for paper cutouts. Deterministic. */
const tornClip = (seed: string, edges: { top?: boolean; bottom?: boolean }) => {
  const pts: string[] = [];
  const steps = 26;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    const y = edges.top ? random(`${seed}-t-${i}`) * 2.2 : 0;
    pts.push(`${x}% ${y}%`);
  }
  for (let i = steps; i >= 0; i--) {
    const x = (i / steps) * 100;
    const y = edges.bottom ? 100 - random(`${seed}-b-${i}`) * 2.2 : 100;
    pts.push(`${x}% ${y}%`);
  }
  return `polygon(${pts.join(", ")})`;
};

/** Off-white document cutout with grain, torn edges and optional tape. */
export const Paper: React.FC<{
  id: string;
  style?: React.CSSProperties;
  torn?: { top?: boolean; bottom?: boolean };
  tape?: boolean;
  rotate?: number;
  children?: React.ReactNode;
  color?: string;
}> = ({ id, style, torn, tape, rotate = 0, children, color = C.paper }) => (
  <div style={{ position: "absolute", rotate: `${rotate}deg`, filter: "drop-shadow(0 22px 30px rgba(0,0,0,0.45))", ...style }}>
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: color,
        clipPath: torn ? tornClip(id, torn) : undefined,
        overflow: "hidden",
      }}
    >
      <PaperGrain id={id} />
      <div style={{ position: "relative", width: "100%", height: "100%" }}>{children}</div>
    </div>
    {tape ? (
      <div
        style={{
          position: "absolute",
          top: -22,
          left: "50%",
          width: 150,
          height: 44,
          marginLeft: -75,
          rotate: "-4deg",
          background: "rgba(231, 190, 79, 0.75)",
          mixBlendMode: "multiply",
        }}
      />
    ) : null}
  </div>
);
