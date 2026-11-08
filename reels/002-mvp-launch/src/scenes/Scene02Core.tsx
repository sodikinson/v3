import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Background } from "../components/Texture";
import { ChapterTag } from "../components/Chrome";
import { Arrow, Badge, Node } from "../components/Diagram";
import { Label, Reveal } from "../components/Type";
import { COL_X, DOC_H, DocumentPipeline3D, PX_PER_UNIT } from "../three/DocumentPipeline3D";
import { sceneClock } from "../timeline";
import { C, SANS } from "../theme";

const T = sceneClock("s02-core");

const CANVAS_TOP = 320;
const CANVAS_H = 780;
const px = (x: number) => 540 + x * PX_PER_UNIT;
const DOC_CY = CANVAS_TOP + CANVAS_H / 2 - 0.15 * PX_PER_UNIT;
const DOC_HALF_PX = (DOC_H / 2) * PX_PER_UNIT;
const LABEL_Y = DOC_CY + DOC_HALF_PX + 40;

const PATH_Y = 1185;

export const Scene02Core: React.FC = () => {
  const tBank = T.word("c03", "bank");
  const tRecord = T.word("c03", "record");
  const tFinancial = T.word("c03", "financial");
  const tCore = T.cue("c04");
  const tWork = T.word("c04", "work.");
  const tSignup = T.word("c05", "Signup");
  const tTrial = T.word("c05", "trial");
  const tPayment = T.word("c05", "payment");
  const tBilling = T.word("c05", "billing");


  return (
    <AbsoluteFill>
      <Background />
      <ChapterTag index={2} title="THE CORE VALUE" />

      <div style={{ position: "absolute", top: CANVAS_TOP }}>
        <DocumentPipeline3D width={1080} height={CANVAS_H} tBank={tBank} tRecord={tRecord} tFinancial={tFinancial} tSettle={tCore} />
      </div>

      {/* Flow arrows between the 3D columns */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Arrow x1={px(COL_X.bank) + 125} y1={DOC_CY} x2={px(COL_X.journal) - 122} y2={DOC_CY} start={tRecord + 22} color={C.yellow} width={5} />
        <Arrow
          x1={px(COL_X.journal) + 125}
          y1={DOC_CY}
          x2={px(COL_X.statements) - 140}
          y2={DOC_CY}
          start={tFinancial + 14}
          color={C.yellow}
          width={5}
        />
      </svg>

      {/* Column labels — appear as each stage is named */}
      {[
        { x: COL_X.bank, t: tRecord + 8, label: "Bank\nstatement", step: "01 UPLOAD" },
        { x: COL_X.journal, t: tRecord + 30, label: "Transactions\n& journal", step: "02 RECORD" },
        { x: COL_X.statements, t: tFinancial + 18, label: "Financial\nstatements", step: "03 GENERATE" },
      ].map((c, i) => (
        <div key={i} style={{ position: "absolute", left: px(c.x) - 160, width: 320, top: LABEL_Y, textAlign: "center" }}>
          <Reveal start={c.t} distance={24}>
            <Label size={20} color={C.yellow}>
              {c.step}
            </Label>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: C.white, lineHeight: 1.05, marginTop: 8, whiteSpace: "pre-line" }}>
              {c.label}
            </div>
          </Reveal>
          <div style={{ position: "absolute", left: 160 - 26, top: -DOC_HALF_PX * 2 - 118 }}>
            <Badge start={tWork + i * 4} size={52} />
          </div>
        </div>
      ))}

      <div style={{ position: "absolute", left: 0, right: 0, top: LABEL_Y + 170, display: "flex", justifyContent: "center" }}>
        <Reveal start={tCore + 8} distance={20}>
          <div style={{ background: C.yellow, color: C.ink, fontFamily: SANS, fontWeight: 900, fontSize: 40, padding: "6px 22px", letterSpacing: "0.02em" }}>
            CORE ACCOUNTING VALUE · WORKS
          </div>
        </Reveal>
      </div>

      {/* Secondary path: Signup → Trial → Billing */}
      <div style={{ position: "absolute", left: 80, top: PATH_Y - 10 }}>
        <Reveal start={tSignup - 10} distance={16}>
          <Label size={22}>Acquisition path</Label>
        </Reveal>
      </div>
      <Node label="Signup" start={tSignup - 4} status={{ at: tSignup + 8, kind: "check" }} width={270} style={{ left: 80, top: PATH_Y + 40 }} />
      <Node label="Free trial" start={tTrial - 6} status={{ at: tTrial + 8, kind: "check" }} width={270} style={{ left: 405, top: PATH_Y + 40 }} />
      <Node
        label="Billing"
        sub="Payment gateway"
        start={tPayment - 4}
        status={{ at: tBilling + 6, kind: "check" }}
        width={270}
        style={{ left: 730, top: PATH_Y + 40 }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Arrow x1={358} y1={PATH_Y + 82} x2={398} y2={PATH_Y + 82} start={tTrial - 8} dur={10} width={4} color={C.muted} />
        <Arrow x1={683} y1={PATH_Y + 82} x2={723} y2={PATH_Y + 82} start={tPayment - 6} dur={10} width={4} color={C.muted} />
      </svg>

      <Sequence from={tBank - 6} layout="none">
        <Audio src={staticFile("audio/paper.mp3")} volume={0.6} />
      </Sequence>
      <Sequence from={tRecord + 10} layout="none">
        <Audio src={staticFile("audio/swish.mp3")} volume={0.35} />
      </Sequence>
      <Sequence from={tFinancial} layout="none">
        <Audio src={staticFile("audio/paper.mp3")} volume={0.6} />
      </Sequence>
      <Sequence from={tWork} layout="none">
        <Audio src={staticFile("audio/check.mp3")} volume={0.45} />
      </Sequence>
      {[tSignup, tTrial, tBilling].map((t, i) => (
        <Sequence key={i} from={t + 8} layout="none">
          <Audio src={staticFile("audio/tick.mp3")} volume={0.5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
