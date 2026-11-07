// Dev helper: render a set of preview stills.  node scripts/stills.mjs <outDir> Comp:frame ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const [outDir, ...specs] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
for (const spec of specs) {
  const [id, frame] = spec.split(":");
  const composition = await selectComposition({ serveUrl, id, browserExecutable });
  const output = path.join(outDir, `${id}-${frame}.png`);
  await renderStill({ serveUrl, composition, frame: Number(frame), output, browserExecutable, scale: 0.5 });
  console.log(output);
}
