import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { MONO, SANS } from "../theme";

/** Blocks rendering until the fonts used inside canvas textures are ready. */
export const useFontsReady = () => {
  const [handle] = useState(() => delayRender("Loading fonts for canvas textures"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([
      document.fonts.load(`900 40px "${SANS}"`),
      document.fonts.load(`800 40px "${SANS}"`),
      document.fonts.load(`500 20px "${MONO}"`),
    ])
      .catch(() => undefined)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);
  return ready;
};
