# Notes for Claude

Read README.md first. The essentials:

- The site is `public/`, deployed as-is by Cloudflare Pages (no build step). The whole app is `public/index.html`; keep it a single self-contained file.
- Export joins clips **without re-encoding** (mediabunny `EncodedPacketSink` → `EncodedVideoPacketSource`/`EncodedAudioPacketSource`). That only works because every clip in `public/clips/` has identical H.264/AAC settings and a keyframe exactly every second. Never re-encode a clip with different settings. Use `tools/compress.sh`, which holds the exact ffmpeg command.
- Trim points are therefore whole seconds (plus the clip's own end). If you add frame-accurate trimming, export has to decode and re-encode (WebCodecs), which changes speed and browser support.
- The clip list is the hardcoded `CLIPS` array in `index.html` (`[id, durationSeconds]`). `tools/compress.sh` prints a fresh one.
- Test with a static server (`npx serve public`), not `file://`. Check click-to-play, Play all, drag onto the timeline, trim, timeline playback, and export, at desktop and phone widths.
- Camera originals are not in the repo and must not be committed.
