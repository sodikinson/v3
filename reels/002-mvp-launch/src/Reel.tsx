import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Captions, SceneShell, TransitionKind } from "./components/Chrome";
import { Grain } from "./components/Texture";
import { Scene01Mvp } from "./scenes/Scene01Mvp";
import { Scene02Core } from "./scenes/Scene02Core";
import { Scene03Disagreement } from "./scenes/Scene03Disagreement";
import { Scene04Bugs } from "./scenes/Scene04Bugs";
import { Scene05Assumptions } from "./scenes/Scene05Assumptions";
import { Scene06Conclusion } from "./scenes/Scene06Conclusion";
import { SceneId } from "./script";
import { TIMELINE, TRANSITION_FRAMES } from "./timeline";

export const SCENES: Record<SceneId, { component: React.FC; reveal: TransitionKind; origin?: [number, number]; title: string }> = {
  "s01-mvp": { component: Scene01Mvp, reveal: "none", title: "01-Milestone" },
  // Spatial match cut: the next scene irises open out of the MVP milestone diamond.
  "s02-core": { component: Scene02Core, reveal: "iris", origin: [932, 850], title: "02-CoreValue" },
  "s03-disagreement": { component: Scene03Disagreement, reveal: "wipe-left", title: "03-Disagreement" },
  "s04-bugs": { component: Scene04Bugs, reveal: "dissolve", title: "04-WhichBugsMatter" },
  "s05-assumptions": { component: Scene05Assumptions, reveal: "wipe-up", title: "05-AssumptionsVsReality" },
  "s06-conclusion": { component: Scene06Conclusion, reveal: "iris", origin: [540, 960], title: "06-Verdict" },
};

/** Music ducks under the narration and swells in the pauses. */
const musicVolume = (frame: number) => {
  const speaking = Object.values(TIMELINE.cues).some((c) => frame >= c.from - 6 && frame < c.from + c.duration + 6);
  const base = speaking ? 0.07 : 0.13;
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [TIMELINE.totalFrames - 45, TIMELINE.totalFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return base * fadeIn * fadeOut;
};

/** Smooth the ducking so it never clicks: average the target volume over a short window. */
const smoothedMusicVolume = (frame: number) => {
  let sum = 0;
  const win = 8;
  for (let i = -win; i <= win; i++) sum += musicVolume(frame + i);
  return sum / (win * 2 + 1);
};

export const Reel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0F1C2E" }}>
      {TIMELINE.scenes.map((s, i) => {
        const def = SCENES[s.id];
        const Comp = def.component;
        const isLast = i === TIMELINE.scenes.length - 1;
        return (
          <Sequence key={s.id} name={def.title} from={s.from} durationInFrames={s.duration + (isLast ? 0 : TRANSITION_FRAMES)}>
            <SceneShell
              reveal={def.reveal}
              origin={def.origin}
              durationInFrames={s.duration + (isLast ? 0 : TRANSITION_FRAMES)}
              exitFrames={isLast ? 0 : TRANSITION_FRAMES}
            >
              <Comp />
            </SceneShell>
            {i > 0 ? (
              <Sequence durationInFrames={24} layout="none">
                <Audio src={staticFile("audio/whoosh.mp3")} volume={0.16} />
              </Sequence>
            ) : null}
          </Sequence>
        );
      })}

      <Captions />
      <Grain />

      {/* Narration — one clip per cue, placed by the timeline */}
      {Object.values(TIMELINE.cues).map((c) =>
        c.audio ? (
          <Sequence key={c.cue.id} name={`VO ${c.cue.id}`} from={c.from} durationInFrames={c.duration + 6} layout="none">
            <Audio src={staticFile(c.audio)} />
          </Sequence>
        ) : null,
      )}

      <Audio src={staticFile("audio/music-bed.mp3")} loop volume={(f) => smoothedMusicVolume(f)} />
    </AbsoluteFill>
  );
};
