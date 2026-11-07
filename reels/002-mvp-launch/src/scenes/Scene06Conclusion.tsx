import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Background } from "../components/Texture";
import { ChapterTag } from "../components/Chrome";
import { Paper } from "../components/Diagram";
import { Label, Reveal, RevealWords } from "../components/Type";
import { sceneClock } from "../timeline";
import { C, EASE_IN, MONO, SANS, SERIF, mix, prog } from "../theme";

const T = sceneClock("s06-conclusion");

/** Miniature recaps of each diagram in the film — the "evidence board". */
const Mini: React.FC<{ kind: number }> = ({ kind }) => {
  const s = { stroke: C.ink, strokeWidth: 4, fill: "none", strokeLinecap: "round" as const };
  return (
    <svg width="100%" height="100%" viewBox="0 0 240 150">
      {kind === 0 ? (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={20 + i * 22} y={22 + i * 22} width={70} height={12} rx={6} fill={i < 3 ? C.yellow : "none"} stroke={C.ink} strokeWidth={2.5} />
          ))}
          <path d="M 170 14 L 170 136" {...s} stroke={C.coral} />
          <rect x={160} y={4} width={20} height={20} transform="rotate(45 170 14)" fill={C.yellow} stroke={C.ink} strokeWidth={2} />
        </g>
      ) : null}
      {kind === 1 ? (
        <g>
          {[20, 95, 170].map((x) => (
            <rect key={x} x={x} y={40} width={50} height={66} fill={C.white} stroke={C.ink} strokeWidth={3} />
          ))}
          <path d="M 74 73 L 90 73 M 149 73 L 165 73" {...s} />
        </g>
      ) : null}
      {kind === 2 ? (
        <g>
          <circle cx={70} cy={60} r={24} fill={C.yellow} stroke={C.ink} strokeWidth={3} />
          <circle cx={170} cy={60} r={24} fill={C.coral} stroke={C.ink} strokeWidth={3} />
          <path d="M 40 118 L 200 118 M 120 118 L 120 100" {...s} />
        </g>
      ) : null}
      {kind === 3 ? (
        <g>
          <rect x={105} y={14} width={30} height={30} transform="rotate(45 120 29)" fill={C.white} stroke={C.ink} strokeWidth={3} />
          <path d="M 120 50 L 120 70 L 60 70 L 60 92 M 120 70 L 180 70 L 180 92" {...s} />
          <rect x={30} y={96} width={60} height={34} fill={C.coral} stroke={C.ink} strokeWidth={3} />
          <rect x={150} y={96} width={60} height={34} fill={C.yellow} stroke={C.ink} strokeWidth={3} />
        </g>
      ) : null}
      {kind === 4 ? (
        <g>
          <circle cx={120} cy={75} r={52} {...s} />
          {[0, 90, 180, 270].map((a) => (
            <circle key={a} cx={120 + Math.cos((a * Math.PI) / 180) * 52} cy={75 + Math.sin((a * Math.PI) / 180) * 52} r={11} fill={C.yellow} stroke={C.ink} strokeWidth={3} />
          ))}
        </g>
      ) : null}
    </svg>
  );
};

const BOARD = [
  { x: 90, y: 380, r: -6, label: "01 MVP ≠ finished" },
  { x: 700, y: 400, r: 5, label: "02 Core value works" },
  { x: 110, y: 760, r: 4, label: "03 Both are right" },
  { x: 690, y: 780, r: -4, label: "04 Which bugs matter" },
  { x: 400, y: 1060, r: 2, label: "05 Learn from users" },
];

export const Scene06Conclusion: React.FC = () => {
  const frame = useCurrentFrame();
  const tCollapse = T.word("c26", "isn't") - 8;
  const tLearning = T.cue("c27");
  const tFinal = T.cue("c28");
  const tReliable = T.word("c28", "reliable.");
  const tAri = T.cue("c29");
  const tJourney = T.cue("c30");
  const tQuestion = T.cue("c31");

  const collapse = prog(frame, tCollapse, 16, EASE_IN);
  const thesisOut = tFinal - 8;

  return (
    <AbsoluteFill>
      <Background glow="rgba(231,190,79,0.12)" />
      <div style={{ opacity: 1 - prog(frame, thesisOut, 10) }}>
        <ChapterTag index={6} title="THE VERDICT" />
      </div>

      {/* Evidence board collapses into one statement */}
      {BOARD.map((b, i) => {
        const appear = prog(frame, i * 3, 14);
        const cx = b.x + 140;
        const cy = b.y + 110;
        return (
          <Paper
            key={i}
            id={`board-${i}`}
            tape={i % 2 === 0}
            rotate={b.r * (1 - collapse)}
            style={{
              left: b.x,
              top: b.y,
              width: 280,
              height: 220,
              opacity: appear * (1 - collapse),
              translate: `${(540 - cx) * collapse}px ${(760 - cy) * collapse + (1 - appear) * 40}px`,
              scale: String(mix(1, 0.2, collapse)),
            }}
          >
            <div style={{ position: "absolute", left: 20, right: 20, top: 16, height: 150 }}>
              <Mini kind={i} />
            </div>
            <div style={{ position: "absolute", left: 20, bottom: 14, fontFamily: MONO, fontSize: 17, fontWeight: 600, color: C.inkSoft, letterSpacing: "0.06em" }}>
              {b.label.toUpperCase()}
            </div>
          </Paper>
        );
      })}

      {/* Thesis */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 520 }}>
        <RevealWords
          text="An MVP isn't a finished product."
          at={["an", "MVP", "isn't", "a", "finished", "product."].map((w) => T.word("c26", w))}
          exit={thesisOut}
          style={{ fontSize: 100 }}
          words={{ finished: { strike: C.coral }, "product.": { strike: C.coral } }}
        />
        <div style={{ height: 36 }} />
        <RevealWords
          text="It's the beginning of learning."
          at={["It's", "the", "beginning", "of", "learning."].map((w) => T.word("c27", w))}
          exit={thesisOut}
          style={{ fontSize: 100, color: C.yellow }}
          words={{ learning: { marker: C.yellow, color: C.ink } }}
        />
      </div>

      {/* Final frame */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 470, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ height: 3, flex: 1, background: C.yellow, scale: `${prog(frame, tJourney, 20)} 1`, transformOrigin: "right" }} />
        <Reveal start={tJourney} distance={14}>
          <Label size={26} color={C.yellow}>
            My First Journey — Episode 002
          </Label>
        </Reveal>
        <div style={{ height: 3, flex: 1, background: C.yellow, scale: `${prog(frame, tJourney, 20)} 1`, transformOrigin: "left" }} />
      </div>

      <div style={{ position: "absolute", left: 80, right: 80, top: 560 }}>
        <RevealWords
          text={"Launch before \n you're complete."}
          at={[T.word("c28", "Launch"), T.word("c28", "before"), T.word("c28", "you're"), T.word("c28", "complete.")]}
          style={{ fontSize: 80, textTransform: "uppercase", lineHeight: 1, letterSpacing: "-0.03em" }}
        />
        <div style={{ height: 30 }} />
        <RevealWords
          text={"Not before \n you're reliable."}
          at={[T.word("c28", "Not"), T.word("c28", "before", 1), T.word("c28", "you're", 1), T.word("c28", "reliable.")]}
          style={{ fontSize: 80, textTransform: "uppercase", lineHeight: 1, letterSpacing: "-0.03em", color: C.yellow }}
        />
      </div>

      <div style={{ position: "absolute", left: 80, top: 960 }}>
        <Reveal start={tAri} distance={16}>
          <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 32, letterSpacing: "0.14em", color: C.paper }}>
            ARI <span style={{ color: C.yellow }}>·</span> BUILDING KOLARIS LABS
          </div>
        </Reveal>
      </div>

      {/* Question to the audience */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 1060 }}>
        <Reveal start={tQuestion} distance={16}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 58, color: C.white }}>What would you do?</div>
        </Reveal>
        <div style={{ display: "flex", gap: 20, marginTop: 18 }}>
          {[
            { label: "Launch now", word: "Launch", bg: C.yellow },
            { label: "Wait", word: "wait?", bg: C.coral },
          ].map((o) => {
            const t = T.word("c31", o.word);
            const p = prog(frame, t - 2, 12);
            return (
              <div
                key={o.label}
                style={{
                  padding: "16px 30px",
                  borderRadius: 999,
                  background: o.bg,
                  color: C.ink,
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: 36,
                  opacity: p,
                  scale: String(interpolate(p, [0, 0.6, 1], [0.6, 1.08, 1])),
                }}
              >
                {o.label.toUpperCase()}
              </div>
            );
          })}
          <div style={{ alignSelf: "center", opacity: prog(frame, T.cueEnd("c31"), 14) }}>
            <Label size={22} color={C.muted}>
              ↓ Comment
            </Label>
          </div>
        </div>
      </div>

      <Sequence from={tCollapse} layout="none">
        <Audio src={staticFile("audio/whoosh.mp3")} volume={0.35} />
      </Sequence>
      <Sequence from={tLearning} layout="none">
        <Audio src={staticFile("audio/tick.mp3")} volume={0.3} />
      </Sequence>
      <Sequence from={tReliable} layout="none">
        <Audio src={staticFile("audio/thud.mp3")} volume={0.5} />
      </Sequence>
      <Sequence from={tQuestion} layout="none">
        <Audio src={staticFile("audio/pop.mp3")} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};
