import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../theme";

/** Deep navy field with a faint editorial grid and a soft top light. */
export const Background: React.FC<{ grid?: boolean; glow?: string }> = ({ grid = true, glow }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.navy }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 70% at 50% 18%, ${glow ?? "rgba(60, 92, 138, 0.45)"} 0%, rgba(15,28,46,0) 60%)`,
        }}
      />
      {grid ? (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${C.navyLine} 1.5px, transparent 1.5px), linear-gradient(90deg, ${C.navyLine} 1.5px, transparent 1.5px)`,
            backgroundSize: "90px 90px",
            backgroundPosition: "-1px 25px",
            opacity: 0.45,
            maskImage: "radial-gradient(90% 70% at 50% 45%, black 30%, transparent 85%)",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * Film grain + vignette, laid over everything for a printed / documentary feel.
 * The grain seed steps at 12fps (not every frame) so it reads as texture, not noise.
 */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2.5) % 12;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", opacity, mixBlendMode: "overlay" }}>
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
      <AbsoluteFill
        style={{
          background: "radial-gradient(130% 90% at 50% 45%, transparent 55%, rgba(4, 10, 20, 0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Paper fibre texture for cutouts (static). */
export const PaperGrain: React.FC<{ id: string; opacity?: number }> = ({ id, opacity = 0.35 }) => (
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity, mixBlendMode: "multiply", pointerEvents: "none" }}>
    <filter id={`paper-${id}`}>
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" seed={7} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0.35 0" />
    </filter>
    <rect width="100%" height="100%" filter={`url(#paper-${id})`} />
  </svg>
);
