import React from "react";
import { AbsoluteFill, Composition, Folder } from "remotion";
import { Captions, SeriesMark } from "./components/Chrome";
import { Grain } from "./components/Texture";
import { Reel, SCENES } from "./Reel";
import { FPS, HEIGHT, TIMELINE, WIDTH } from "./timeline";

/** Standalone scene preview, with captions mapped from the global timeline. */
const scenePreview = (index: number): React.FC => {
  const s = TIMELINE.scenes[index];
  const Comp = SCENES[s.id].component;
  const Preview: React.FC = () => (
    <AbsoluteFill>
      <Comp />
      <SeriesMark />
      <Captions offset={s.from} />
      <Grain />
    </AbsoluteFill>
  );
  return Preview;
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Reel002"
        component={Reel}
        durationInFrames={TIMELINE.totalFrames}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Folder name="Scenes">
        {TIMELINE.scenes.map((s, i) => (
          <Composition
            key={s.id}
            id={`Scene${SCENES[s.id].title}`}
            component={scenePreview(i)}
            durationInFrames={s.duration}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
          />
        ))}
      </Folder>
    </>
  );
};
