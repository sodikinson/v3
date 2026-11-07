import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { interpolate, random, useCurrentFrame } from "remotion";
import { useFontsReady } from "../components/useFontsReady";
import { C, EASE_IN_OUT, EASE_OUT, mix, prog } from "../theme";
import { featureCard } from "./textures";

export const FEATURES = [
  "Inventory",
  "Payroll",
  "AI forecasting",
  "Dark mode",
  "Multi-currency",
  "Tax filing",
  "Integrations",
  "Mobile app",
  "Budgeting",
  "Approvals",
  "Custom themes",
  "Audit trail",
];

const CARD_W = 2.8;
const CARD_H = 0.7;
const CARD_D = 0.9;

/**
 * A growing tower of speculative features. Depth matters here: the pile gets
 * taller, heavier and less stable the longer we build on assumptions.
 */
export const BacklogTower3D: React.FC<{
  width: number;
  height: number;
  tGrowStart: number;
  tGrowEnd: number;
  tWobble: number;
  tCollapse: number;
}> = ({ width, height, tGrowStart, tGrowEnd, tWobble, tCollapse }) => {
  const frame = useCurrentFrame();
  const ready = useFontsReady();
  const textures = useMemo(() => (ready ? FEATURES.map((f, i) => featureCard(f, i)) : null), [ready]);
  if (!textures) return null;

  const n = FEATURES.length;
  const stepDur = (tGrowEnd - tGrowStart) / n;
  const height3d = n * CARD_H;

  // Camera pulls back and rises as the pile grows.
  const grow = interpolate(frame, [tGrowStart, tGrowEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_IN_OUT,
  });
  const camZ = mix(9, 15.5, grow);
  const camY = mix(1.2, height3d * 0.5, grow);

  // Wobble when it's named for what it is: assumptions.
  const wob = frame > tWobble ? Math.sin((frame - tWobble) / 3.2) * Math.exp(-(frame - tWobble) / 22) * 0.07 : 0;
  const collapse = prog(frame, tCollapse, 30, (t) => t * t);
  const yaw = mix(-0.5, -0.32, grow) + Math.sin(frame / 70) * 0.03;

  return (
    <ThreeCanvas width={width} height={height} camera={{ position: [0, camY, camZ], fov: 35 }} gl={{ antialias: true }}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[4, 8, 6]} intensity={1.7} />
      <directionalLight position={[-6, 2, -2]} intensity={0.4} color={C.yellow} />
      <group position={[0, -0.6, 0]} rotation={[0.12, yaw, wob]}>
        {/* floor shadow */}
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.6, 48]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.3} />
        </mesh>
        {textures.map((tex, i) => {
          const start = tGrowStart + i * stepDur;
          const p = prog(frame, start, 14, EASE_OUT);
          if (p <= 0) return null;
          const jitterX = (random(`tx-${i}`) - 0.5) * 0.5 * (1 + i / n);
          const jitterR = (random(`tr-${i}`) - 0.5) * 0.18 * (1 + i / n);
          const restY = CARD_H / 2 + i * CARD_H;
          // collapse: each card is flung out and falls, upper cards first
          const c = Math.max(0, Math.min(1, collapse * 1.6 - (n - 1 - i) * 0.04));
          const dir = random(`dir-${i}`) > 0.5 ? 1 : -1;
          return (
            <mesh
              key={i}
              position={[
                jitterX + dir * c * (1.5 + random(`cx-${i}`) * 2),
                mix(restY + 2.4, restY, p) - c * c * (restY + 3),
                c * (random(`cz-${i}`) - 0.3) * 2,
              ]}
              rotation={[c * dir * 1.2, jitterR + c * dir * 0.8, c * dir * 1.6]}
            >
              <boxGeometry args={[CARD_W, CARD_H * 0.94, CARD_D]} />
              <meshStandardMaterial attach="material-0" color={C.paperShade} />
              <meshStandardMaterial attach="material-1" color={C.paperShade} />
              <meshStandardMaterial attach="material-2" color={C.paper} />
              <meshStandardMaterial attach="material-3" color={C.paperShade} />
              <meshStandardMaterial attach="material-4" map={tex} roughness={0.9} transparent opacity={(1 - c) * p} />
              <meshStandardMaterial attach="material-5" color={C.paperShade} transparent opacity={1 - c} />
            </mesh>
          );
        })}
      </group>
    </ThreeCanvas>
  );
};
