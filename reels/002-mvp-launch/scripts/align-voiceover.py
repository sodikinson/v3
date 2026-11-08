"""
Forced alignment of a single narration file against the script.

Finds when every word of the known script is spoken, using PocketSphinx's bundled
English model (offline, no model download):

    pip install pocketsphinx
    python3 scripts/align-voiceover.py narration.mp3 cues.json alignment.json

cues.json:      [{"id": "c01", "text": "..."}, ...]   (written by import-voiceover.ts)
alignment.json: one list per cue, one [start, end] in seconds per whitespace token.

Normally you don't call this directly: `npm run voiceover:import -- narration.mp3` does.
"""
import json
import re
import subprocess
import sys

from pocketsphinx import Decoder, get_model_path

# Words the CMU dictionary doesn't know, spelled as sound-alikes it does.
SOUND_ALIKES = {
    "saas": ["sass"],
    "mvp": ["m", "v", "p"],
    "kolaris": ["polaris"],
    "iterate": ["it", "rate"],
    "signup": ["sign", "up"],
}


def main(audio: str, cues_path: str, out_path: str) -> None:
    cues = json.load(open(cues_path, encoding="utf8"))
    model = get_model_path()
    with open(f"{model}/en-us/cmudict-en-us.dict", encoding="utf8") as f:
        vocab = {line.split()[0].split("(")[0] for line in f}

    def to_dict_words(token: str) -> list[str]:
        t = token.lower().replace("’", "'").replace("…", "")
        t = re.sub(r"[^a-z0-9'\-]", "", t)
        out = []
        for part in filter(None, re.split(r"-+", t)):
            out.extend(SOUND_ALIKES.get(part.strip("'"), [part.strip("'")]))
        return out

    sequence, owner = [], []  # dictionary words, and the (cue, token) each belongs to
    for ci, cue in enumerate(cues):
        for ti, token in enumerate(cue["text"].split()):
            for w in to_dict_words(token):
                sequence.append(w)
                owner.append((ci, ti))

    unknown = sorted({w for w in sequence if w not in vocab})
    if unknown:
        sys.exit(f"Words missing from the dictionary, add them to SOUND_ALIKES: {unknown}")

    pcm = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", audio, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
        capture_output=True,
        check=True,
    ).stdout

    decoder = Decoder(samprate=16000, bestpath=False, beam=1e-120, wbeam=1e-100, pbeam=1e-120)
    decoder.set_align_text(" ".join(sequence))
    decoder.start_utt()
    decoder.process_raw(pcm, full_utt=True)
    decoder.end_utt()

    skip = {"<s>", "</s>", "<sil>", "[NOISE]"}
    aligned = [
        (seg.start_frame / 100, (seg.end_frame + 1) / 100)
        for seg in decoder.seg()
        if seg.word.split("(")[0] not in skip
    ]
    if len(aligned) != len(sequence):
        sys.exit(f"Alignment failed: matched {len(aligned)} of {len(sequence)} words. Does the audio follow the script exactly?")

    result = [[None] * len(c["text"].split()) for c in cues]
    for (start, end), (ci, ti) in zip(aligned, owner):
        cur = result[ci][ti]
        result[ci][ti] = [start, end] if cur is None else [cur[0], end]

    json.dump(result, open(out_path, "w"))
    print(f"Aligned {len(aligned)} words across {len(cues)} cues.")


if __name__ == "__main__":
    main(*sys.argv[1:4])
