import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { interpolate, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { useFontsReady } from "../components/useFontsReady";
import { C, EASE_IN_OUT, EASE_OUT, mix, prog } from "../theme";
import { bankStatement, journal, statement, txnStrip } from "./textures";

export const DOC_W = 1.6;
export const DOC_H = (DOC_W * 800) / 600;
export const COL_X = { bank: -2.55, journal: 0, statements: 2.45 };
export const PX_PER_UNIT = 136;
const STRIPS = 6;

type V3 = [number, number, number];

const Sheet: React.FC<{
  map: THREE.Texture;
  w?: number;
  h?: number;
  position: V3;
  rotation?: V3;
  scale?: number;
  opacity?: number;
  shadow?: boolean;
}> = ({ map, w = DOC_W, h = DOC_H, position, rotation = [0, 0, 0], scale = 1, opacity = 1, shadow = true }) => (
  <group position={position} rotation={rotation} scale={scale}>
    {shadow ? (
      <mesh position={[0.07, -0.1, -0.03]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35 * opacity} />
      </mesh>
    ) : null}
    <mesh>
      <boxGeometry args={[w, h, 0.012]} />
      <meshStandardMaterial attach="material-0" color={C.paperShade} />
      <meshStandardMaterial attach="material-1" color={C.paperShade} />
      <meshStandardMaterial attach="material-2" color={C.paperShade} />
      <meshStandardMaterial attach="material-3" color={C.paperShade} />
      <meshStandardMaterial attach="material-4" map={map} roughness={0.92} transparent opacity={opacity} />
      <meshStandardMaterial attach="material-5" color={C.paperShade} />
    </mesh>
  </group>
);

/**
 * Bank statement → transaction strips → journal → financial statements.
 * All motion is a pure function of the current frame (no useFrame).
 */
export const DocumentPipeline3D: React.FC<{
  width: number;
  height: number;
  tBank: number;
  tRecord: number;
  tFinancial: number;
  tSettle: number;
}> = ({ width, height, tBank, tRecord, tFinancial, tSettle }) => {
  const frame = useCurrentFrame();
  const ready = useFontsReady();

  const tex = useMemo(() => {
    if (!ready) return null;
    return {
      bank: bankStatement(),
      journal: journal(),
      strips: Array.from({ length: STRIPS }, (_, i) => txnStrip(i)),
      bs: statement("BALANCE SHEET", C.yellow),
      pl: statement("PROFIT & LOSS", C.yellow),
      cf: statement("CASH FLOW", C.yellow),
    };
  }, [ready]);

  if (!tex) return null;

  // ── Bank statement: flies in to centre, then steps aside to the left.
  const bankIn = prog(frame, tBank - 6, 22);
  const bankAside = prog(frame, tRecord, 20, EASE_IN_OUT);
  const bankPos: V3 = [mix(0, COL_X.bank, bankAside), mix(-4.5, 0.15, bankIn), mix(1.2, 0, bankAside)];
  const bankRot: V3 = [mix(-0.9, -0.08, bankIn), mix(0.5, 0.12, bankIn), mix(0.35, -0.04, bankIn)];

  // ── Journal appears in the centre as the statement steps aside.
  const jIn = prog(frame, tRecord + 6, 18);
  const jPos: V3 = [COL_X.journal, mix(-0.6, 0.15, jIn), mix(-1.5, 0, jIn)];

  // ── Statements rise from behind the journal and fan out on the right.
  const fan = [
    { t: tex.cf, dx: 0.22, dy: -0.12, rz: -0.1, z: -0.12 },
    { t: tex.pl, dx: 0.06, dy: -0.02, rz: -0.03, z: -0.06 },
    { t: tex.bs, dx: -0.12, dy: 0.08, rz: 0.05, z: 0 },
  ];

  // Whole scene parallax: a slow yaw that reveals the depth between sheets.
  const yaw = interpolate(frame, [tBank, tSettle + 90], [0.22, -0.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_IN_OUT,
  });
  const float = (k: number) => Math.sin((frame + k * 20) / 38) * 0.03;

  return (
    <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, 10], fov: 32 }} gl={{ antialias: true }}>
      <ambientLight intensity={1.6} />
      <directionalLight position={[3, 5, 7]} intensity={1.6} />
      <group rotation={[0.04, yaw, 0]}>
        {/* Journal */}
        <Sheet map={tex.journal} position={[jPos[0], jPos[1] + float(1), jPos[2]]} opacity={jIn} rotation={[0, 0, 0.02]} />

        {/* Transaction strips: lifted off the statement, landed as journal rows */}
        {tex.strips.map((t, i) => {
          const start = tRecord + 10 + i * 4;
          const p = prog(frame, start, 22, EASE_IN_OUT);
          if (p <= 0) return null;
          const rowY = DOC_H / 2 - 0.5 - i * 0.2;
          const from: V3 = [COL_X.bank + 0.05, 0.15 + DOC_H / 2 - 0.62 - i * 0.27, 0.05];
          const to: V3 = [COL_X.journal, 0.15 + rowY, 0.03];
          const arc = Math.sin(p * Math.PI) * 0.9;
          return (
            <Sheet
              key={i}
              map={t}
              w={DOC_W * 0.9}
              h={DOC_W * 0.9 * (80 / 600)}
              position={[mix(from[0], to[0], p), mix(from[1], to[1], p) + arc * 0.35, mix(from[2], to[2], p) + arc]}
              rotation={[0, 0, Math.sin(p * Math.PI) * 0.25]}
              shadow={p < 1}
            />
          );
        })}

        {/* Bank statement */}
        {bankIn > 0 ? <Sheet map={tex.bank} position={[bankPos[0], bankPos[1] + float(0), bankPos[2]]} rotation={bankRot} /> : null}

        {/* Financial statements */}
        {fan.map((f, i) => {
          const p = prog(frame, tFinancial + i * 5, 24, EASE_OUT);
          if (p <= 0) return null;
          return (
            <Sheet
              key={i}
              map={f.t}
              position={[mix(COL_X.journal, COL_X.statements + f.dx, p), mix(-0.2, 0.15 + f.dy, p) + float(2 + i), mix(-0.6, f.z, p)]}
              rotation={[0, mix(-0.6, 0, p), mix(0, f.rz, p)]}
            />
          );
        })}
      </group>
    </ThreeCanvas>
  );
};
