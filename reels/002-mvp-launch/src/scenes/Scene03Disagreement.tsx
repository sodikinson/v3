import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Background } from "../components/Texture";
import { ChapterTag } from "../components/Chrome";
import { Badge, Paper } from "../components/Diagram";
import { Label, Reveal } from "../components/Type";
import { sceneClock, TIMELINE } from "../timeline";
import { C, EASE_IN_OUT, MONO, SANS, SERIF, prog } from "../theme";

const T = sceneClock("s03-disagreement");

const COL_W = 440;
const LEFT_X = 80;
const RIGHT_X = 1080 - 80 - COL_W;
const TOP = 330;

/** Quote typeset word-by-word in sync with the narration. */
const SyncedQuote: React.FC<{ cueId: string; color?: string; warn?: string[] }> = ({ cueId, color = C.white, warn = [] }) => {
  const frame = useCurrentFrame();
  const tc = TIMELINE.cues[cueId];
  const offset = T.cue(cueId) - tc.from;
  return (
    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 50, lineHeight: 1.12, color }}>
      {tc.words.map((w, i) => {
        const p = prog(frame, w.from + offset - 2, 8);
        const clean = w.text.replace(/[^\p{L}]/gu, "").toLowerCase();
        const isWarn = warn.includes(clean);
        return (
          <span key={i} style={{ opacity: 0.18 + p * 0.82, color: isWarn && p > 0.5 ? C.coral : undefined }}>
            {w.text}{" "}
          </span>
        );
      })}
    </div>
  );
};

/** Editorial "portrait": halftone disc with a role silhouette. No faces, just roles. */
const RoleMark: React.FC<{ start: number; role: string; goal: string; accent: string; id: string }> = ({ start, role, goal, accent, id }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 18);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, opacity: p, translate: `0 ${(1 - p) * 30}px` }}>
      <svg width={110} height={110} viewBox="0 0 110 110">
        <defs>
          <pattern id={`ht-${id}`} width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="3.5" cy="3.5" r="2" fill={accent} />
          </pattern>
          <clipPath id={`cl-${id}`}>
            <circle cx="55" cy="55" r="53" />
          </clipPath>
        </defs>
        <circle cx="55" cy="55" r="53" fill={C.navyDeep} />
        <g clipPath={`url(#cl-${id})`}>
          <circle cx="55" cy="44" r="19" fill={`url(#ht-${id})`} />
          <ellipse cx="55" cy="104" rx="38" ry="34" fill={`url(#ht-${id})`} />
        </g>
        <circle cx="55" cy="55" r="53" fill="none" stroke={accent} strokeWidth="3" />
      </svg>
      <div>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 50, color: C.white, lineHeight: 1 }}>{role}</div>
        <Label size={20} color={accent} style={{ marginTop: 8 }}>
          {goal}
        </Label>
      </div>
    </div>
  );
};

const BUGS = ["Custom reports · layout breaks", "CSV export · wrong date format", "Mobile · table overflow"];

export const Scene03Disagreement: React.FC = () => {
  const frame = useCurrentFrame();
  const tCeo = T.cue("c06");
  const tQuote1 = T.cue("c07");
  const tLaunch = T.word("c07", "launch");
  const tMkt = T.cue("c08");
  const tQuote2 = T.cue("c09");
  const tBugs = T.word("c09", "bugs.");
  const tFair = T.cue("c10");
  const tFirst = T.cue("c11");

  // Divider draws top → bottom; the two sides are given identical weight.
  const divider = prog(frame, 0, 26, EASE_IN_OUT);
  // Spotlight: whoever is speaking is full strength, the other dims slightly — until "fair concern" levels them.
  const ceoFocus = interpolate(frame, [tMkt - 4, tMkt + 8, tFair, tFair + 12], [1, 0.45, 0.45, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mktFocus = interpolate(frame, [tMkt - 4, tMkt + 8], [0.45, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mktVisible = prog(frame, tMkt - 6, 16);

  // Launch button: cursor glides in and hovers — but never clicks.
  const btn = prog(frame, tLaunch - 4, 16);
  const cursor = prog(frame, tLaunch + 8, 22, EASE_IN_OUT);
  const hold = prog(frame, tQuote2 - 10, 10);

  // Balance beam at "fair concern": stays level — both are right.
  const beam = prog(frame, tFair, 28);
  // The button and the bug list have made their point; they step back so the beam can speak.
  const propsOut = prog(frame, tFair - 6, 20, EASE_IN_OUT);
  const beamTilt = interpolate(frame, [tFair, tFair + 16, tFair + 34, tFair + 52], [0, -5, 3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_IN_OUT,
  });

  return (
    <AbsoluteFill>
      <Background />
      <ChapterTag index={3} title="THE DISAGREEMENT" />

      {/* divider */}
      <div style={{ position: "absolute", left: 539, top: TOP, width: 2, height: 900 * divider, background: C.navySoft }} />

      {/* CEO */}
      <div style={{ position: "absolute", left: LEFT_X, top: TOP + 10, width: COL_W, opacity: ceoFocus }}>
        <RoleMark start={tCeo - 4} role="CEO" goal="Goal · Growth" accent={C.yellow} id="ceo" />
        <div style={{ marginTop: 40, minHeight: 330 }}>
          <SyncedQuote cueId="c07" />
        </div>
        {/* Campaign launch button */}
        <div style={{ position: "relative", marginTop: 10, height: 150, opacity: 1 - propsOut, translate: `0 ${propsOut * 24}px` }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 20,
              padding: "24px 34px",
              background: C.yellow,
              color: C.ink,
              borderRadius: 999,
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 34,
              opacity: btn,
              scale: String(interpolate(btn, [0, 1], [0.7, 1]) * (1 + 0.04 * cursor * (1 - hold))),
              boxShadow: `0 0 0 ${10 * cursor * (1 - hold)}px rgba(231,190,79,0.25)`,
            }}
          >
            ▶ Launch campaign
          </div>
          <svg
            width={48}
            height={58}
            viewBox="0 0 24 29"
            style={{
              position: "absolute",
              left: interpolate(cursor, [0, 1], [420, 250]),
              top: interpolate(cursor, [0, 1], [150, 70]),
              opacity: cursor,
            }}
          >
            <path d="M2 2 L2 24 L8 18 L12 27 L16 25 L12 16 L20 16 Z" fill={C.white} stroke={C.ink} strokeWidth={1.5} />
          </svg>
        </div>
      </div>

      {/* Marketing */}
      <div style={{ position: "absolute", left: RIGHT_X, top: TOP + 10, width: COL_W, opacity: mktVisible * mktFocus }}>
        <RoleMark start={tMkt - 4} role="Marketing" goal="Goal · Trust" accent={C.coral} id="mkt" />
        <div style={{ marginTop: 40, minHeight: 330 }}>
          <SyncedQuote cueId="c09" warn={["bugs", "bad", "experience"]} />
        </div>
        <div style={{ position: "relative", marginTop: 10, height: 150, opacity: 1 - propsOut, translate: `0 ${propsOut * 24}px` }}>
          <Paper id="bugs" rotate={2} style={{ left: 0, top: -10, width: COL_W, height: 196 }}>
            <div style={{ padding: "18px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Badge start={tBugs - 2} kind="warn" size={34} fill={C.coral} color={C.paper} />
                <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 20, letterSpacing: "0.1em", color: C.coral }}>OPEN BUGS</div>
              </div>
              {BUGS.map((b, i) => (
                <Reveal key={b} start={tBugs + 4 + i * 5} from="left" distance={20}>
                  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: C.ink, marginTop: 10 }}>— {b}</div>
                </Reveal>
              ))}
            </div>
          </Paper>
        </div>
      </div>

      {/* Balance — both concerns weigh the same */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, height: 200, opacity: beam }}>
        <svg width={1080} height={200} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path d="M 540 60 L 510 150 L 570 150 Z" fill={C.navySoft} />
          <g transform={`rotate(${beamTilt} 540 60)`}>
            <rect x={540 - 380 * beam} y={54} width={760 * beam} height={10} rx={5} fill={C.paper} />
            <circle cx={540} cy={59} r={12} fill={C.yellow} />
          </g>
        </svg>
        <div style={{ position: "absolute", left: 80, top: 0, width: 360, textAlign: "center", rotate: `${beamTilt}deg`, transformOrigin: "460px 60px" }}>
          <div style={{ display: "inline-block", background: C.yellow, color: C.ink, fontFamily: SANS, fontWeight: 900, fontSize: 30, padding: "6px 16px" }}>
            REAL USERS, NOW
          </div>
        </div>
        <div style={{ position: "absolute", right: 80, top: 0, width: 360, textAlign: "center", rotate: `${beamTilt}deg`, transformOrigin: "-100px 60px" }}>
          <div style={{ display: "inline-block", background: C.coral, color: C.ink, fontFamily: SANS, fontWeight: 900, fontSize: 30, padding: "6px 16px" }}>
            FIRST IMPRESSIONS
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 165, textAlign: "center" }}>
          <Reveal start={tFirst} distance={14}>
            <Label size={22} color={C.paper}>
              Both are right · that&apos;s the problem
            </Label>
          </Reveal>
        </div>
      </div>

      <Sequence from={tLaunch} layout="none">
        <Audio src={staticFile("audio/pop.mp3")} volume={0.5} />
      </Sequence>
      <Sequence from={tBugs - 2} layout="none">
        <Audio src={staticFile("audio/warn.mp3")} volume={0.45} />
      </Sequence>
      <Sequence from={tFair} layout="none">
        <Audio src={staticFile("audio/swish.mp3")} volume={0.3} />
      </Sequence>
      <Sequence from={tQuote1 - 4} layout="none">
        <Audio src={staticFile("audio/tick.mp3")} volume={0.25} />
      </Sequence>
    </AbsoluteFill>
  );
};
