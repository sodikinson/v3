import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Background } from "../components/Texture";
import { ChapterTag } from "../components/Chrome";
import { Badge, Paper } from "../components/Diagram";
import { Label, RevealWords } from "../components/Type";
import { sceneClock, TIMELINE } from "../timeline";
import { C, EASE_IN_OUT, MONO, SANS, prog } from "../theme";

const T = sceneClock("s01-mvp");

/** Gantt geometry */
const BAR_X0 = 420;
const BAR_X1 = 1000;
const MONTH = (BAR_X1 - BAR_X0) / 6;
const MVP_X = BAR_X0 + MONTH * 5.3;
const ROW_H = 44;
const GANTT_TOP = 900;

type Row = { label: string; a: number; b: number; done?: number; core: boolean } | { header: string; core: boolean };

const ROWS: Row[] = [
  { header: "Core workflow", core: true },
  { label: "Bank statement upload", a: 0, b: 2.6, core: true },
  { label: "Transaction journal", a: 1, b: 3.6, core: true },
  { label: "Financial statements", a: 2.2, b: 4.6, core: true },
  { label: "Signup + free trial", a: 3.2, b: 4.8, core: true },
  { label: "Payments & billing", a: 4, b: 5.2, core: true },
  { header: "Secondary features", core: false },
  { label: "Custom reports", a: 3.4, b: 6, done: 0.55, core: false },
  { label: "CSV export", a: 4, b: 6, done: 0.5, core: false },
  { label: "Mobile layout", a: 4.4, b: 6, done: 0.35, core: false },
  { label: "Email reminders", a: 4.8, b: 6, done: 0.3, core: false },
];

const wordsAt = (cueId: string) => TIMELINE.cues[cueId].words.map((w) => w.from - TIMELINE.cues[cueId].from + T.cue(cueId));

export const Scene01Mvp: React.FC = () => {
  const frame = useCurrentFrame();
  const c02 = T.cue("c02");
  const mvpWord = T.word("c02", "MVP.");
  const statement = mvpWord + 10;

  // Camera: the paper sits centred, then pans up to make room for the timeline.
  const pan = prog(frame, c02 - 4, 26, EASE_IN_OUT);
  const camY = interpolate(pan, [0, 1], [230, 0]);

  // Playhead sweeps the months while "after months of development" is spoken.
  const sweep = interpolate(frame, [c02 + 10, mvpWord], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_IN_OUT,
  });
  const playX = BAR_X0 + (MVP_X - BAR_X0) * sweep;
  const ganttIn = prog(frame, c02, 18);

  return (
    <AbsoluteFill>
      <Background />
      <ChapterTag index={1} title="THE MILESTONE" />

      <AbsoluteFill style={{ translate: `0 ${camY}px` }}>
        {/* Title card — a documentary cutout */}
        <Paper id="s1" torn={{ top: true, bottom: true }} rotate={-1.5} style={{ left: 90, top: 370, width: 900, height: 400 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(transparent 0 63px, rgba(20,32,47,0.12) 63px 65px)` }} />
          <div style={{ position: "absolute", left: 120, top: 0, bottom: 0, width: 3, background: "rgba(232,102,79,0.45)" }} />
          <Label color={C.inkSoft} size={24} style={{ position: "absolute", left: 150, top: 40 }}>
            Product log · Kolaris Labs
          </Label>
          <div style={{ position: "absolute", left: 150, right: 50, top: 100 }}>
            <RevealWords
              text="We built an accounting SaaS."
              at={wordsAt("c01")}
              exit={statement - 10}
              style={{ fontSize: 92, color: C.ink }}
              words={{ accounting: { marker: C.yellow } }}
            />
          </div>
          <div style={{ position: "absolute", left: 150, right: 40, top: 92 }}>
            <RevealWords
              text={"MVP reached \n ≠ product finished"}
              start={statement}
              stagger={3}
              style={{ fontSize: 84, color: C.ink, textTransform: "uppercase", lineHeight: 1.04 }}
              words={{ "≠": { color: C.coral } }}
            />
          </div>
        </Paper>

        {/* Project timeline */}
        <div style={{ opacity: ganttIn, translate: `0 ${(1 - ganttIn) * 40}px` }}>
          <div style={{ position: "absolute", left: 80, top: GANTT_TOP - 70 }}>
            <Label size={24}>Project timeline</Label>
          </div>
          {Array.from({ length: 6 }).map((_, m) => (
            <div key={m}>
              <div
                style={{
                  position: "absolute",
                  left: BAR_X0 + m * MONTH,
                  top: GANTT_TOP - 70,
                  width: MONTH,
                  textAlign: "center",
                  fontFamily: MONO,
                  fontSize: 22,
                  color: playX >= BAR_X0 + m * MONTH ? C.paper : C.muted,
                }}
              >
                M{m + 1}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: BAR_X0 + m * MONTH,
                  top: GANTT_TOP - 30,
                  width: 1.5,
                  height: ROWS.length * ROW_H + 20,
                  background: C.navyLine,
                }}
              />
            </div>
          ))}

          {ROWS.map((r, i) => {
            const y = GANTT_TOP + i * ROW_H;
            if ("header" in r) {
              return (
                <Label key={i} size={20} color={r.core ? C.yellow : C.coral} style={{ position: "absolute", left: 80, top: y + 10 }}>
                  {r.header}
                </Label>
              );
            }
            const x0 = BAR_X0 + r.a * MONTH;
            const x1 = BAR_X0 + r.b * MONTH;
            const doneX = r.core ? x1 : x0 + (x1 - x0) * (r.done ?? 0);
            const fillTo = Math.min(doneX, Math.max(x0, playX));
            const finished = r.core && playX >= x1 - 1;
            const finishFrame = interpolate(x1, [BAR_X0, MVP_X], [c02 + 10, mvpWord], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div key={i}>
                <div
                  style={{
                    position: "absolute",
                    left: 80,
                    top: y + 6,
                    width: BAR_X0 - 100,
                    fontFamily: SANS,
                    fontWeight: 600,
                    fontSize: 26,
                    color: r.core ? C.paper : C.muted,
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.label}
                </div>
                {/* planned outline */}
                <div
                  style={{
                    position: "absolute",
                    left: x0,
                    top: y + 8,
                    width: x1 - x0,
                    height: 26,
                    borderRadius: 6,
                    border: `2px dashed ${r.core ? C.navySoft : "rgba(232,102,79,0.55)"}`,
                  }}
                />
                {/* progress */}
                <div
                  style={{
                    position: "absolute",
                    left: x0,
                    top: y + 8,
                    width: Math.max(0, fillTo - x0),
                    height: 26,
                    borderRadius: 6,
                    background: r.core ? C.yellow : C.muted,
                  }}
                />
                {finished ? (
                  <div style={{ position: "absolute", left: x1 - 4, top: y + 3 }}>
                    <Badge start={Math.round(finishFrame)} size={36} fill={C.paper} color={C.navy} />
                  </div>
                ) : null}
              </div>
            );
          })}

          {/* Playhead */}
          <div
            style={{
              position: "absolute",
              left: playX - 1.5,
              top: GANTT_TOP - 30,
              width: 3,
              height: ROWS.length * ROW_H + 20,
              background: C.paper,
              opacity: frame < mvpWord ? 0.8 : 0,
            }}
          />

          {/* MVP milestone */}
          <MvpFlag start={mvpWord} />
        </div>
      </AbsoluteFill>

      <Sequence from={T.cue("c01")} layout="none">
        <Audio src={staticFile("audio/paper.mp3")} volume={0.5} />
      </Sequence>
      <Sequence from={mvpWord} layout="none">
        <Audio src={staticFile("audio/check.mp3")} volume={0.45} />
      </Sequence>
      <Sequence from={statement} layout="none">
        <Audio src={staticFile("audio/thud.mp3")} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};

const MvpFlag: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 14);
  const line = prog(frame, start, 20, EASE_IN_OUT);
  const h = ROWS.length * ROW_H + 20;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: MVP_X - 2,
          top: GANTT_TOP - 30,
          width: 4,
          height: h * line,
          background: C.yellow,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: MVP_X - 22,
          top: GANTT_TOP - 52,
          width: 44,
          height: 44,
          rotate: "45deg",
          background: C.yellow,
          scale: String(p),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: MVP_X - 140,
          top: GANTT_TOP - 112,
          width: 120,
          textAlign: "right",
          fontFamily: SANS,
          fontWeight: 900,
          fontSize: 40,
          color: C.yellow,
          opacity: p,
        }}
      >
        MVP
      </div>
      {/* the area past the milestone: still unfinished */}
      <div
        style={{
          position: "absolute",
          left: MVP_X + 4,
          top: GANTT_TOP + 6 * ROW_H,
          width: (BAR_X1 - MVP_X) * line,
          height: 5 * ROW_H,
          background: "repeating-linear-gradient(45deg, rgba(232,102,79,0.22) 0 8px, transparent 8px 16px)",
        }}
      />
    </>
  );
};
