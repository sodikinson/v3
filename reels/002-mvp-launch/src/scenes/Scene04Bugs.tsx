import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Background } from "../components/Texture";
import { ChapterTag } from "../components/Chrome";
import { Badge, DrawPath, Paper } from "../components/Diagram";
import { Label, Reveal, RevealWords } from "../components/Type";
import { sceneClock } from "../timeline";
import { C, EASE_IN_OUT, EASE_OUT, MONO, SANS, prog } from "../theme";

const T = sceneClock("s04-bugs");

const COL_L = 80;
const COL_R = 560;
const COL_W = 440;
const BRANCH_Y = 960;

const Chip: React.FC<{ text: string; start: number; tone: "coral" | "yellow" | "paper"; drop?: boolean; rotate?: number }> = ({
  text,
  start,
  tone,
  drop,
  rotate = 0,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, drop ? 20 : 14, EASE_OUT);
  const bg = tone === "coral" ? C.coralSoft : tone === "yellow" ? "rgba(231,190,79,0.16)" : C.paper;
  const border = tone === "coral" ? C.coral : tone === "yellow" ? C.yellow : C.paper;
  return (
    <div
      style={{
        display: "inline-block",
        padding: "10px 16px",
        borderRadius: 8,
        border: `2px solid ${border}`,
        background: bg,
        color: tone === "paper" ? C.ink : C.white,
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: 24,
        opacity: p,
        translate: drop ? `0 ${interpolate(p, [0, 1], [-160, 0])}px` : `${(1 - p) * -20}px 0`,
        rotate: `${drop ? (1 - p) * 12 + rotate : 0}deg`,
      }}
    >
      {text}
    </div>
  );
};

export const Scene04Bugs: React.FC = () => {
  const frame = useCurrentFrame();
  const tAsk = T.cue("c13");
  // On-screen wording is tighter than the narration; each word lands on its spoken counterpart.
  const questionAt = ["Are", "bugs", "stopping", "users", "from", "getting", "the", "core", "value"].map((w) => T.word("c13", w));
  const tReliable = T.word("c14", "reliable,");
  const tAccurate = T.word("c14", "accurate,");
  const tSecure = T.word("c14", "secure…");
  const tShould = T.cue("c15");
  const tSecondary = T.word("c15", "secondary");
  const tLaunch = T.word("c15", "launch?");

  const cardIn = prog(frame, tAsk - 6, 24);
  const testIn = prog(frame, T.cue("c14") - 4, 22);
  // Once the question is asked and the test is on screen, the card leaves and the test rises.
  const makeRoom = prog(frame, tShould - 16, 28, EASE_IN_OUT);

  return (
    <AbsoluteFill>
      <Background />
      <ChapterTag index={4} title="WHICH BUGS MATTER?" />

      {/* Question card */}
      <Paper
        id="q"
        torn={{ bottom: true }}
        rotate={-0.8}
        style={{ left: 80, top: 330, width: 920, height: 310, opacity: cardIn * (1 - makeRoom), translate: `0 ${(1 - cardIn) * 40 - makeRoom * 60}px` }}
      >
        <div style={{ position: "absolute", left: 44, top: 34, display: "flex", alignItems: "center", gap: 12 }}>
          <Badge start={tAsk} kind="warn" size={34} fill={C.coral} color={C.paper} />
          <Label size={20} color={C.coral}>
            Bug found
          </Label>
        </div>
        <div style={{ position: "absolute", left: 44, right: 44, top: 92 }}>
          <RevealWords
            text="Does it stop users from getting the core value?"
            at={questionAt}
            style={{ fontSize: 66, color: C.ink }}
            words={{ core: { marker: C.yellow }, value: { marker: C.yellow } }}
          />
        </div>
      </Paper>

      <AbsoluteFill style={{ translate: `0 ${-makeRoom * 330}px` }}>
      {/* Core value test */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 690, opacity: testIn }}>
        <Label size={20} style={{ marginBottom: 16 }}>
          Core value test
        </Label>
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { t: tReliable, a: "Accounting", b: "reliable" },
            { t: tAccurate, a: "Statements", b: "accurate" },
            { t: tSecure, a: "Customer data", b: "secure" },
          ].map((c) => (
            <Reveal key={c.a} start={c.t - 6} distance={16} style={{ flex: 1 }}>
              <div style={{ position: "relative", border: `2px solid ${C.navySoft}`, borderRadius: 12, padding: "14px 18px", background: "rgba(9,20,36,0.6)" }}>
                <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase" }}>{c.a}</div>
                <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 36, color: C.yellow, marginTop: 4 }}>{c.b}</div>
                <div style={{ position: "absolute", right: -12, top: -14 }}>
                  <Badge start={c.t + 4} size={40} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Branches */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <DrawPath d={`M 540 ${BRANCH_Y - 40} L 540 ${BRANCH_Y - 10}`} start={tShould - 4} dur={8} color={C.paper} width={4} />
        <DrawPath d={`M 540 ${BRANCH_Y - 10} L ${COL_L + 30} ${BRANCH_Y - 10} L ${COL_L + 30} ${BRANCH_Y + 20}`} start={tShould + 2} dur={14} color={C.coral} width={4} />
        <DrawPath d={`M 540 ${BRANCH_Y - 10} L ${COL_R + 30} ${BRANCH_Y - 10} L ${COL_R + 30} ${BRANCH_Y + 20}`} start={tShould + 2} dur={14} color={C.yellow} width={4} />
      </svg>

      {/* YES — critical */}
      <div style={{ position: "absolute", left: COL_L, top: BRANCH_Y + 30, width: COL_W }}>
        <Reveal start={tShould + 12} distance={16}>
          <Label size={22} color={C.coral}>
            Yes · critical
          </Label>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: C.muted, margin: "6px 0 14px" }}>
            Accounting, security or data-integrity
          </div>
        </Reveal>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
          <Chip text="Wrong balances" start={tShould + 18} tone="coral" />
          <Chip text="Data exposed" start={tShould + 22} tone="coral" />
        </div>
        <Reveal start={tLaunch} distance={20}>
          <div
            style={{
              marginTop: 20,
              background: C.coral,
              color: C.ink,
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 44,
              padding: "16px 22px",
              borderRadius: 12,
            }}
          >
            FIX FIRST.
            <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 18, letterSpacing: "0.1em", marginTop: 6 }}>HOLD THE LAUNCH</div>
          </div>
        </Reveal>
      </div>

      {/* NO — noncritical */}
      <div style={{ position: "absolute", left: COL_R, top: BRANCH_Y + 30, width: COL_W }}>
        <Reveal start={tShould + 16} distance={16}>
          <Label size={22} color={C.yellow}>
            No · noncritical
          </Label>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: C.muted, margin: "6px 0 14px" }}>
            Secondary features
          </div>
        </Reveal>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {["Custom reports", "CSV export", "Mobile layout"].map((b, i) => (
            <Chip key={b} text={b} start={tSecondary + i * 4} tone="yellow" drop rotate={i % 2 ? 1.5 : -1.5} />
          ))}
        </div>
        <Reveal start={tLaunch + 6} distance={20}>
          <div
            style={{
              marginTop: 20,
              background: C.yellow,
              color: C.ink,
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 30,
              lineHeight: 1.15,
              padding: "14px 20px",
              borderRadius: 12,
            }}
          >
            DISCLOSE · MONITOR ·<br />
            CONTINUE CONTROLLED BETA
          </div>
        </Reveal>
      </div>

      </AbsoluteFill>

      <Sequence from={tAsk} layout="none">
        <Audio src={staticFile("audio/warn.mp3")} volume={0.35} />
      </Sequence>
      {[tReliable, tAccurate, tSecure].map((t, i) => (
        <Sequence key={i} from={t + 4} layout="none">
          <Audio src={staticFile("audio/tick.mp3")} volume={0.5} />
        </Sequence>
      ))}
      <Sequence from={tShould} layout="none">
        <Audio src={staticFile("audio/swish.mp3")} volume={0.35} />
      </Sequence>
      <Sequence from={tSecondary} layout="none">
        <Audio src={staticFile("audio/paper.mp3")} volume={0.5} />
      </Sequence>
      <Sequence from={tLaunch} layout="none">
        <Audio src={staticFile("audio/pop.mp3")} volume={0.45} />
      </Sequence>
    </AbsoluteFill>
  );
};
