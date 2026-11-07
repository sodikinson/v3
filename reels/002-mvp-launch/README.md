# REELS 002 — The MVP Works. So Why Aren't We Launching?

**My First Journey · Product Thinking · Kolaris Labs**

A Vox-style documentary explainer Reel (1080 × 1920, 30 fps). It uses kinetic editorial typography, animated diagrams and a little Three.js depth. Every motion is keyed to the word of narration that explains it.

## Quick start

```bash
npm i
cp .env.example .env          # add ELEVENLABS_API_KEY (+ optional ELEVENLABS_VOICE_ID)
npm run voiceover             # ElevenLabs → public/voiceover/*.mp3 + src/voiceover/manifest.json
npm run dev                   # Remotion Studio
npm run render                # → out/reel-002.mp4
```

You can preview and render before you generate the voiceover. In that case the timeline estimates each line at about 2.85 words per second. After `npm run voiceover`, every scene, caption and SFX re-times to the real recording on its own. The final duration follows the voiceover (the estimate is about 115 s).

## How it is built

| Layer | Where | Notes |
| --- | --- | --- |
| Narration script | `src/script.ts` | Single source of truth: 31 cues with scene, keywords (yellow), warnings (coral) and pauses |
| Voiceover | `scripts/generate-voiceover.ts` | ElevenLabs `with-timestamps`, one MP3 per cue, stitched with `previous_text`/`next_text` for natural prosody. Cached by text hash, `-- --force` to redo |
| Timing engine | `src/timeline.ts` | Cue → frame mapping, word-level timestamps, scene ranges, phrase-level captions |
| Scenes | `src/scenes/Scene0*.tsx` | One file per storyboard scene, each also registered as its own composition under **Scenes** in Studio |
| 3D | `src/three/` | `DocumentPipeline3D` (bank statement → journal → financial statements) and `BacklogTower3D` (the growing pile of assumed features). Frame-driven only, no `useFrame` |
| Design system | `src/theme.ts`, `src/components/` | Palette, easing, kinetic type, drawn arrows/badges/nodes, torn-paper cutouts, grain, captions, mask transitions |
| Music + SFX | `scripts/make-audio.ts` → `public/audio/` | Synthesised in code (no licensing): A-minor documentary pad with clock pulse, plus tick, pop, check, warn, whoosh, swish, paper and thud. Music ducks under the voice |

### Storyboard → implementation

1. **The milestone.** A ledger cutout reads "We built an accounting SaaS". The camera pans to a project timeline whose playhead sweeps the months. Core rows complete and get ticked off. The MVP diamond lands on "MVP" while the secondary rows stay unfinished, then the card flips to **MVP REACHED ≠ PRODUCT FINISHED**.
2. **The core value.** In 3D, a bank statement flies in on "bank", transaction strips peel off it into the journal on "record", and three statements fan out on "financial". Then come the flow arrows, a check on "work", and the acquisition path Signup → Free trial → Billing, each ticked as it is spoken. The scene opens with an iris out of the MVP diamond, a spatial match cut.
3. **The disagreement.** A split screen gives both sides identical layout and weight. Each quote typesets word by word with the narration. The CEO side gets a launch button with a hovering cursor that never clicks. The marketing side gets an open-bugs note. On "fair concern" a balance beam wobbles and settles level.
4. **Which bugs matter.** The question card is word-synced. A core value test checks reliable, accurate and secure. The tree splits: critical → **FIX FIRST**, noncritical (the same four bugs drop in) → **DISCLOSE · MONITOR · CONTINUE CONTROLLED BETA**.
5. **Assumptions vs. reality.** A 3D tower of "assumed" features grows over "+6 months" and wobbles on "assumptions". Its dashed arrow falls short of product–market fit, while the small cohort's behaviour traces reach it. The same cohort dots then glide into the loop (a match cut), where Launch → Observe → Learn → Improve is driven word by word. A critical bug turns the loop coral and keeps the expand gate locked until "fix", then it opens on "expanding".
6. **The verdict.** An evidence board of every diagram collapses into the thesis. Then the final frame: *MY FIRST JOURNEY — EPISODE 002 / LAUNCH BEFORE YOU'RE COMPLETE. / NOT BEFORE YOU'RE RELIABLE. / ARI · BUILDING KOLARIS LABS* plus the "Launch now / Wait" question.

## Editing tips

- **Change a line:** edit `src/script.ts` and re-run `npm run voiceover`. Only the changed cues are regenerated.
- **Character voices:** set `voiceId` on cue `c07` (CEO) or `c09` (marketing) if you want them performed by someone other than the narrator.
- **Retime a beat:** scenes use `T.word(cueId, "word")`. Change which word an animation hangs on instead of hard-coding frames.
- **Captions** stay out of the bottom 430 px (Instagram UI). Lines that are already typeset on screen (the quotes and the finale) set `hideCaption`.
- **Swap the music:** drop a licensed track at `public/audio/music-bed.mp3`. Ducking is applied in `src/Reel.tsx`.
- Fonts (Archivo, Instrument Serif, IBM Plex Mono, all OFL) are self-hosted in `public/fonts`, so renders work offline.
- If Remotion can't download its headless browser, pass `--browser-executable=/path/to/chrome`.
