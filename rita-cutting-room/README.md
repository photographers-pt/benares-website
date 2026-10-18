# Rita Cutting Room

A one-page video editor for the Rita footage. People drag clips onto a timeline, trim and reorder them, preview the cut, and export it as an MP4. Everything runs in the browser: no server code, no build step.

## What's in here

```
public/              the website (this is what Cloudflare serves)
  index.html         the whole app: markup, styles and script in one file
  clips/             42 web clips, 1280×720, 25 fps, H.264 + AAC (109 MB)
  thumbs/            one 320×180 poster per clip
  _headers           Cloudflare caching rules for clips and thumbs
tools/
  compress.sh        turns camera originals into clips/ and thumbs/
CLAUDE.md            notes for Claude Code sessions working on this repo
```

The camera originals (3.3 GB) are not in this repo. Keep them outside it.

## Deploy on Cloudflare Pages

1. Push this folder to a GitHub repo (private is fine).
2. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, then pick the repo.
3. Build settings: Framework preset **None**, build command **empty**, build output directory **`public`**.
4. Save and deploy. Every push to the main branch redeploys.

The repo can be private, but the website is public: anyone with the URL can open it and download the clips. To limit who can see it, put the site behind **Cloudflare Access** (Zero Trust, free for up to 50 users).

Cloudflare Pages' free plan limits files to 25 MiB each; the largest clip is about 8 MB.

## Run it locally

Any static file server pointed at `public/` works, for example:

```bash
npx serve public
```

Opening `index.html` straight from disk (`file://`) won't load the clips.

## Add or replace clips

Requires ffmpeg.

```bash
tools/compress.sh "/path/to/CLIP"
```

It writes new clips into `public/clips/` and posters into `public/thumbs/`, skips files that already exist, and prints a `const CLIPS = [...]` line. Paste that line over the `CLIPS` list near the top of the script in `public/index.html`.

## How export works

Export doesn't re-encode. It copies the compressed video and audio packets of each timeline piece into one new MP4, using [mediabunny](https://mediabunny.dev) 1.61.1 loaded from jsDelivr. That makes it fast and lossless, with two consequences:

- **Cuts snap to whole seconds**, because a cut can only start on a keyframe and every clip has one each second.
- **Every clip must be encoded with exactly the same settings** (the ones in `tools/compress.sh`). A clip encoded differently will break exported files.

Playback in the monitor tries each clip's URL directly. If the browser refuses that, the page fetches the file and plays it from memory instead.

## Saved state

Each visitor's timeline is kept in their own browser (`localStorage`). Nothing is shared between visitors and nothing is stored on a server.
