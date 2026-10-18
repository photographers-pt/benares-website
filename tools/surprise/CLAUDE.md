# Notes for Claude

Read README.md (this folder) first. The essentials:

- The page is `public/surprise/index.html`, served at `/surprise` by the main site's Worker (`src/worker.js`, `wrangler.jsonc`). There is no build step. The lock screen and the whole app are one self-contained file; keep it that way.
- The app does not start until the password is accepted: it lives inside `window.startCuttingRoom`, which the lock script at the bottom calls. Don't make it boot on load (that would request clips before unlocking).
- The password is checked in the Worker, never in the page. `/surprise/clips/*` and `/surprise/thumbs/*` are only served with the `surprise_pass` cookie (`run_worker_first` in `wrangler.jsonc`). If you add another protected path, add it in both places.
- Export joins clips **without re-encoding** (mediabunny `EncodedPacketSink` → `EncodedVideoPacketSource`/`EncodedAudioPacketSource`). That only works because every clip in `public/surprise/clips/` has identical H.264/AAC settings and a keyframe exactly every second. Never re-encode a clip with different settings. Use `tools/surprise/compress.sh`, which holds the exact ffmpeg command.
- Trim points are therefore whole seconds (plus the clip's own end). If you add frame-accurate trimming, export has to decode and re-encode (WebCodecs), which changes speed and browser support.
- The clip list is the hardcoded `CLIPS` array in `index.html` (`[id, durationSeconds]`). `tools/surprise/compress.sh` prints a fresh one.
- Test with `npx wrangler dev` (the password gate needs the Worker), not a plain static server or `file://`. Check unlock (try `LALA`), click-to-play, Play all, drag onto the timeline, trim, timeline playback, and export, at desktop and phone widths.
- Camera originals are not in the repo and must not be committed.
