# Notes for Claude

Read README.md (this folder) first. The essentials:

- The page is `public/surprise/index.html`, served at `/surprise` by the main site's Worker (`src/worker.js`, `wrangler.jsonc`). There is no build step. The lock screen and the whole app are one self-contained file; keep it that way.
- The app does not start until the password is accepted: it lives inside `window.startCuttingRoom`, which the lock script at the bottom calls. Don't make it boot on load (that would request clips before unlocking).
- The password is checked in the Worker, never in the page. `/surprise/clips/*` and `/surprise/thumbs/*` are only served with the `surprise_pass` cookie (`run_worker_first` in `wrangler.jsonc`). If you add another protected path, add it in both places.
- The "Download clips" button (`#btnDownload`) is hidden until unlock. Its SwissTransfer URL lives in `src/worker.js` (`SURPRISE_DEFAULT_DOWNLOAD_URL`) and reaches the page as `downloadUrl` from `/surprise/unlock`. Don't paste that URL into `index.html`: it would expose the clips without the password.
- Two separate players: `#vPrev` (the **Clip preview** panel: bin clicks and Play all, native controls, state in `prev`) and `#vA`/`#vB` (the big **Timeline playback** monitor, double-buffered, modes `timeline | trim`). Don't route bin previews through the monitor again: they were mixed up before. Playing one pauses the other.
- The timeline must start blank (no example cut). `load()` ignores a saved `example: true` from older versions.
- Export joins clips **without re-encoding** (mediabunny `EncodedPacketSink` → `EncodedVideoPacketSource`/`EncodedAudioPacketSource`). That only works because every clip in `public/surprise/clips/` has identical H.264/AAC settings and a keyframe exactly every second. Never re-encode a clip with different settings. Use `tools/surprise/compress.sh`, which holds the exact ffmpeg command.
- Trim points are therefore whole seconds (plus the clip's own end). If you add frame-accurate trimming, export has to decode and re-encode (WebCodecs), which changes speed and browser support.
- The clip list is the hardcoded `CLIPS` array in `index.html` (`[id, durationSeconds]`). `tools/surprise/compress.sh` prints a fresh one.
- Test with `npx wrangler dev` (the password gate needs the Worker), not a plain static server or `file://`. Check unlock (try `LALA`), click-to-preview, Play all, drag onto the timeline, trim, timeline playback, and export, at desktop and phone widths. Headless Chromium (Playwright) can't decode H.264; to test playback there, serve WebM stand-ins for a few clips with `page.route`.
- Camera originals are not in the repo and must not be committed.
