import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Background } from "../components/Texture";
import { ChapterTag } from "../components/Chrome";
import { Arrow, Badge, DrawPath, Paper } from "../components/Diagram";
import { Label, Reveal, RevealWords } from "../components/Type";
import { BacklogTower3D } from "../three/BacklogTower3D";
import { sceneClock } from "../timeline";
import { C, EASE_IN_OUT, MONO, SANS, mix, prog } from "../theme";

const T = sceneClock("s05-assumptions");

/** Small cohort of real customers. Positions in phase A (right column) and phase B (loop centre). */
const COHORT = [
  { a: [740, 610], b: [500, 890] },
  { a: [820, 610], b: [580, 890] },
  { a: [900, 610], b: [460, 960] },
  { a: [740, 690], b: [540, 960] },
  { a: [820, 690], b: [620, 960] },
  { a: [900, 690], b: [540, 1030] },
] as const;

const STEPS = [
  { x: 690, label: "Upload" },
  { x: 820, label: "Record" },
  { x: 950, label: "Report" },
];

const TARGET: [number, number] = [540, 1235];

const LOOP_C: [number, number] = [540, 960];
const LOOP_R = 280;
const LOOP_NODES = [
  { label: "Launch", angle: -90 },
  { label: "Observe", angle: 0 },
  { label: "Learn", angle: 90 },
  { label: "Improve", angle: 180 },
];
const polar = (deg: number, r = LOOP_R): [number, number] => [
  LOOP_C[0] + Math.cos((deg * Math.PI) / 180) * r,
  LOOP_C[1] + Math.sin((deg * Math.PI) / 180) * r,
];

export const Scene05Assumptions: React.FC = () => {
  const frame = useCurrentFrame();

  // Phase A — assumptions vs. reality
  const tThing = T.cue("c16");
  const tSix = T.cue("c17");
  const tAssume = T.word("c18", "assumptions.");
  const tPmf = T.word("c19", "product-market");
  const tReal = T.cue("c20");
  const tBehavior = T.word("c20", "behavior");

  // Phase B — start small, loop
  const tSmall = T.cue("c21");
  const tAdopters = T.cue("c22");
  const tTransparent = T.cue("c23");
  const tObserve = T.word("c24", "Observe");
  const tFeedback = T.word("c24", "feedback.");
  const tFix = T.word("c24", "Fix");
  const tIterate = T.word("c24", "Iterate.");
  const tCritical = T.word("c25", "critical");
  const tFixIt = T.word("c25", "fix");
  const tExpanding = T.word("c25", "expanding.");

  const phaseAOut = prog(frame, tSmall - 4, 16, EASE_IN_OUT);
  const toCentre = prog(frame, tSmall + 4, 26, EASE_IN_OUT);

  // Month counter while "six months" plays out.
  const months = Math.round(
    interpolate(frame, [tSix, T.cueEnd("c17") + 6], [0, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );

  // Loop traveller: reaches each node on its word, then a full extra spin on "Iterate".
  const loopAngle = interpolate(
    frame,
    [tAdopters, tObserve, tFeedback, tFix, tIterate, tIterate + 24],
    [-90, 0, 90, 180, 270, 630],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT },
  );
  const loopDraw = prog(frame, tAdopters + 4, 30, EASE_IN_OUT);
  const broken = frame >= tCritical && frame < tFixIt + 4;
  const nodeHit = (i: number) => [tAdopters, tObserve, tFeedback, tFix][i];
  const expand = prog(frame, tExpanding - 4, 24);

  return (
    <AbsoluteFill>
      <Background />
      <ChapterTag index={5} title="ASSUMPTIONS VS. REALITY" />

      {/* ───────────── PHASE A ───────────── */}
      <AbsoluteFill style={{ opacity: 1 - phaseAOut, translate: `0 ${-60 * phaseAOut}px` }}>
        <div style={{ position: "absolute", left: 80, top: 330 }}>
          <Reveal start={tThing} distance={16}>
            <Label size={24} color={C.coral}>
              What we think
            </Label>
          </Reveal>
        </div>
        <div style={{ position: "absolute", left: 640, top: 330 }}>
          <Reveal start={tThing + 6} distance={16}>
            <Label size={24} color={C.yellow}>
              What we know
            </Label>
          </Reveal>
        </div>
        <div style={{ position: "absolute", left: 560, top: 330, width: 2, height: 800, background: C.navyLine }} />

        {/* Tower */}
        <div style={{ position: "absolute", left: 20, top: 480 }}>
          <BacklogTower3D width={540} height={760} tGrowStart={tSix + 4} tGrowEnd={T.cueEnd("c18")} tWobble={tAssume} tCollapse={tSmall - 2} />
        </div>
        <div style={{ position: "absolute", left: 80, top: 390, opacity: prog(frame, tSix, 12) }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 64, color: C.white, lineHeight: 1 }}>
            +{months} <span style={{ fontSize: 30, fontWeight: 700, color: C.muted }}>MONTHS</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 60, top: 900, rotate: "-8deg" }}>
          <Reveal start={tAssume} from="fade" dur={8}>
            <div
              style={{
                border: `5px solid ${C.coral}`,
                color: C.coral,
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: 54,
                padding: "6px 18px",
                letterSpacing: "0.04em",
                background: "rgba(15,28,46,0.75)",
                scale: String(interpolate(prog(frame, tAssume, 8), [0, 1], [1.6, 1])),
              }}
            >
              ASSUMPTIONS
            </div>
          </Reveal>
        </div>

        {/* Cohort + behaviour traces */}
        <div style={{ position: "absolute", left: 640, top: 400, width: 360 }}>
          <Reveal start={tSix + 10} distance={12}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, color: C.muted }}>A small cohort of real customers</div>
          </Reveal>
        </div>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {STEPS.map((s, i) => (
            <g key={s.label} opacity={prog(frame, tReal + i * 4, 12)}>
              <rect x={s.x - 58} y={800} width={116} height={46} rx={8} fill="none" stroke={C.yellow} strokeWidth={3} />
              <text x={s.x} y={831} textAnchor="middle" fontFamily={MONO} fontSize={19} fill={C.yellow} letterSpacing="0.08em">
                {s.label.toUpperCase()}
              </text>
            </g>
          ))}
          {COHORT.map((d, i) => {
            const step = STEPS[i % 3];
            const step2 = STEPS[(i + 1) % 3];
            return (
              <g key={i}>
                <DrawPath
                  d={`M ${d.a[0]} ${d.a[1]} C ${d.a[0]} ${d.a[1] + 60}, ${step.x} ${760}, ${step.x} ${800}`}
                  start={tBehavior - 10 + i * 3}
                  dur={16}
                  color={C.yellow}
                  width={2.5}
                  opacity={0.7}
                />
                <DrawPath
                  d={`M ${step.x + 58} 823 L ${step2.x - 58} 823`}
                  start={tBehavior + 8 + i * 3}
                  dur={10}
                  color={C.yellow}
                  width={2.5}
                  opacity={0.5}
                />
              </g>
            );
          })}
          {/* Product-market fit target */}
          <g opacity={prog(frame, tPmf - 6, 14)}>
            {[100, 70, 40].map((r, i) => (
              <circle
                key={r}
                cx={TARGET[0]}
                cy={TARGET[1]}
                r={r}
                fill={i === 2 && frame > tBehavior + 20 ? C.yellow : "none"}
                stroke={i === 2 && frame > tBehavior + 20 ? C.yellow : C.muted}
                strokeWidth={3}
                strokeDasharray={i === 0 ? "8 8" : undefined}
              />
            ))}
          </g>
          <Arrow x1={300} y1={1150} x2={430} y2={1215} start={tPmf} dur={16} color={C.coral} dashed bend={-30} width={4} head={false} />
          <Arrow x1={820} y1={870} x2={TARGET[0] + 46} y2={TARGET[1] - 34} start={tBehavior + 4} dur={18} color={C.yellow} bend={40} width={5} />
        </svg>
        <div
          style={{
            position: "absolute",
            left: 400,
            top: 1180,
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 64,
            color: C.coral,
            opacity: prog(frame, tPmf + 14, 8),
          }}
        >
          ?
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1345, textAlign: "center" }}>
          <Reveal start={tPmf} distance={10}>
            <Label size={22} color={C.paper}>
              Product–market fit
            </Label>
          </Reveal>
        </div>
      </AbsoluteFill>

      {/* Cohort dots — persist from phase A into phase B (spatial match) */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {COHORT.map((d, i) => {
          const x = mix(d.a[0], d.b[0], toCentre);
          const y = mix(d.a[1], d.b[1], toCentre);
          const p = prog(frame, tSix + 14 + i * 2, 12);
          const lit = frame > tBehavior - 6 + i * 3 ? 1 : 0.4;
          return <circle key={i} cx={x} cy={y} r={20 * p} fill={C.yellow} opacity={lit} />;
        })}
        {/* newcomers once we're allowed to expand */}
        {Array.from({ length: 10 }).map((_, i) => {
          const ang = (i / 10) * Math.PI * 2 + 0.3;
          const r = mix(60, 170, expand);
          return (
            <circle
              key={i}
              cx={540 + Math.cos(ang) * r}
              cy={LOOP_C[1] + Math.sin(ang) * r}
              r={14 * expand}
              fill="none"
              stroke={C.yellow}
              strokeWidth={4}
              opacity={expand}
            />
          );
        })}
      </svg>

      {/* ───────────── PHASE B ───────────── */}
      <div style={{ position: "absolute", left: 80, top: 330 }}>
        <RevealWords
          text="Waiting for perfection"
          start={tSmall + 2}
          stagger={3}
          style={{ fontSize: 40, fontWeight: 800, color: C.muted }}
          words={{ perfection: { strike: C.coral } }}
        />
        <div style={{ height: 8 }} />
        <RevealWords
          text="Start small."
          at={[T.word("c21", "start"), T.word("c21", "small?")]}
          style={{ fontSize: 110 }}
          words={{ "small.": { marker: C.yellow, color: C.ink }, small: { marker: C.yellow, color: C.ink } }}
        />
      </div>

      {/* Known limitations note */}
      <Paper
        id="note"
        tape
        rotate={3}
        style={{
          left: 700,
          top: 520,
          width: 300,
          height: 200,
          opacity: prog(frame, tTransparent - 4, 14),
          translate: `0 ${(1 - prog(frame, tTransparent - 4, 18)) * -60}px`,
        }}
      >
        <div style={{ padding: "26px 22px" }}>
          <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 18, letterSpacing: "0.1em", color: C.coral }}>KNOWN LIMITATIONS</div>
          {["Custom reports: beta", "CSV dates: fixing", "Mobile: desktop first"].map((t, i) => (
            <div key={t} style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: C.ink, marginTop: 8, opacity: prog(frame, tTransparent + 6 + i * 4, 10) }}>
              {t}
            </div>
          ))}
        </div>
      </Paper>

      {/* The loop */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle
          cx={LOOP_C[0]}
          cy={LOOP_C[1]}
          r={LOOP_R}
          fill="none"
          stroke={broken ? C.coral : C.navySoft}
          strokeWidth={6}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - loopDraw}
          transform={`rotate(-90 ${LOOP_C[0]} ${LOOP_C[1]})`}
        />
        {loopDraw > 0.98 ? (
          (() => {
            const [x, y] = polar(loopAngle);
            return <circle cx={x} cy={y} r={14} fill={broken ? C.coral : C.yellow} />;
          })()
        ) : null}
      </svg>
      {LOOP_NODES.map((n, i) => {
        const [x, y] = polar(n.angle);
        const hit = nodeHit(i);
        const p = prog(frame, hit - 6, 14);
        const active = frame >= hit;
        return (
          <div
            key={n.label}
            style={{
              position: "absolute",
              left: x - 115,
              top: y - 34,
              width: 230,
              height: 68,
              borderRadius: 34,
              background: active ? (broken && i === 0 ? C.coral : C.yellow) : C.navy,
              border: `3px solid ${C.yellow}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 34,
              color: active ? C.ink : C.yellow,
              opacity: p,
              scale: String(mix(0.7, 1, p)),
            }}
          >
            {n.label.toUpperCase()}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: LOOP_C[1] + 110, textAlign: "center" }}>
        <Reveal start={tAdopters + 8} distance={12} exit={tCritical - 6}>
          <Label size={20} color={C.paper}>
            Early adopters
          </Label>
        </Reveal>
      </div>

      {/* Critical break → fix → expand */}
      <div style={{ position: "absolute", left: 0, right: 0, top: LOOP_C[1] - 160, display: "flex", justifyContent: "center" }}>
        <Reveal start={tCritical} dur={8} from="fade" exit={tExpanding - 6}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 18px",
              borderRadius: 10,
              background: frame >= tFixIt + 4 ? C.yellow : C.coral,
              color: C.ink,
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 30,
            }}
          >
            {frame >= tFixIt + 4 ? "CRITICAL BUG · FIXED" : "CRITICAL BUG"}
          </div>
        </Reveal>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: LOOP_C[1] + LOOP_R + 54, display: "flex", justifyContent: "center" }}>
        <Reveal start={tCritical + 4} distance={14}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 22px 10px 12px",
              borderRadius: 999,
              border: `3px solid ${frame >= tExpanding ? C.yellow : C.muted}`,
              color: frame >= tExpanding ? C.yellow : C.muted,
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 30,
            }}
          >
            {frame >= tExpanding ? (
              <Badge start={tExpanding} size={44} />
            ) : (
              <Badge start={tCritical + 4} kind="lock" size={44} fill={C.muted} color={C.navy} />
            )}
            EXPAND TO MORE USERS
          </div>
        </Reveal>
      </div>

      <Sequence from={tSix} layout="none">
        <Audio src={staticFile("audio/paper.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={tAssume} layout="none">
        <Audio src={staticFile("audio/thud.mp3")} volume={0.3} />
      </Sequence>
      <Sequence from={tBehavior} layout="none">
        <Audio src={staticFile("audio/check.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={tSmall - 4} layout="none">
        <Audio src={staticFile("audio/whoosh.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={tTransparent - 4} layout="none">
        <Audio src={staticFile("audio/paper.mp3")} volume={0.5} />
      </Sequence>
      {[tObserve, tFeedback, tFix, tIterate].map((t, i) => (
        <Sequence key={i} from={t} layout="none">
          <Audio src={staticFile("audio/tick.mp3")} volume={0.45} />
        </Sequence>
      ))}
      <Sequence from={tCritical} layout="none">
        <Audio src={staticFile("audio/warn.mp3")} volume={0.45} />
      </Sequence>
      <Sequence from={tFixIt + 4} layout="none">
        <Audio src={staticFile("audio/check.mp3")} volume={0.45} />
      </Sequence>
      <Sequence from={tExpanding} layout="none">
        <Audio src={staticFile("audio/pop.mp3")} volume={0.45} />
      </Sequence>
    </AbsoluteFill>
  );
};
