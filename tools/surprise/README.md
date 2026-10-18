# Surprise page: Rita Cutting Room

`https://thebenaresclub.com/surprise` is a password-protected page with a one-page video editor for the Rita footage. People drag clips onto a timeline, trim and reorder them, preview the cut, and export it as an MP4. Everything runs in the browser: no build step.

The password is **`lala`**, in any capitalization (`LALA`, `Lala`, ` lala `...).

## Where things are

```
public/surprise/               served at /surprise  (part of the main site, deployed by the same Worker)
  index.html                   lock screen + the whole editor in one file
  clips/                       the 42 web clips, 1280×720, 25 fps, H.264 + AAC (about 40 MB)  ← PUT THE VIDEOS HERE
  thumbs/                      one 320×180 poster per clip
src/worker.js                  the password check and the gate in front of clips/ and thumbs/
wrangler.jsonc                 "run_worker_first" sends those paths through the Worker
tools/surprise/                not served by the website
  compress.sh                  turns camera originals into clips/ and thumbs/
  README.md, CLAUDE.md         these notes
```

The camera originals (3.3 GB) are not in this repo. Keep them outside it.

## How the editor is laid out

Three panels side by side (stacked on a phone), then the timeline underneath:

- **Clips**: the bin. Click a clip to preview it, press **+** (or drag it) to put it on the timeline.
- **Clip preview**: its own player, with the browser's normal controls. Clicking a clip, or **Play all**, plays here. It never touches the timeline.
- **Timeline playback** (the big monitor): only plays the cut that is on the timeline. Playing one stops the other.

The timeline starts **blank**. A cut the visitor builds is kept in their browser and restored next time.

## How the password works

- `/surprise` itself is public, but it only shows a lock screen. The editor does not start, and no clip or thumbnail is requested, until the password is accepted.
- The password is checked **by the Worker** (`POST /surprise/unlock`), not in the browser, so it is not in the page source. A correct password sets a cookie (`surprise_pass`, 30 days, only sent to `/surprise`).
- The Worker only serves `/surprise/clips/*` and `/surprise/thumbs/*` to browsers that have that cookie. Without it those URLs answer `403`, so the videos can't be fetched by guessing their address.
- This is a light lock for a surprise, not strong security: the password is short and there is no limit on attempts. For something sensitive use [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/) instead.

**Change the password:** edit `SURPRISE_DEFAULT_PASSWORD` in `src/worker.js`, or in Cloudflare (Workers & Pages → `benares-worker` → Settings → Variables and Secrets) add a **Secret** called `SURPRISE_PASSWORD` (use type Secret, not Text: plain-text variables that aren't in `wrangler.jsonc` can be wiped by the next deploy). Optionally add a secret `SURPRISE_SECRET` (a long random string) so the cookie can't be worked out from the code. Anyone already unlocked stays unlocked until their cookie expires, unless you change `SURPRISE_SECRET`.

## Download link

After unlocking, a **Download clips** button next to *Export MP4* opens a SwissTransfer link with the clips in a new tab.

The link is not written in `index.html`. The Worker sends it to the page only once the password was accepted (`downloadUrl` in the `/surprise/unlock` response), so it can't be read from the public page source. (If this repo is public, the link is of course visible in `src/worker.js` on GitHub.)

SwissTransfer links expire (the free plan keeps them for a limited time), so when the button stops working, upload again and replace `SURPRISE_DEFAULT_DOWNLOAD_URL` in `src/worker.js` (or set a Secret `SURPRISE_DOWNLOAD_URL`).

## Add or replace clips

1. Put the 42 `.mp4` files in `public/surprise/clips/` (on GitHub: open that folder → **Add file → Upload files**). Names must match the list in `index.html` (`C0001.mp4` … `C0042.mp4`).
2. To add new footage instead, use the script (needs ffmpeg):

   ```bash
   tools/surprise/compress.sh "/path/to/CLIP"
   ```

   It writes new clips into `public/surprise/clips/` and posters into `public/surprise/thumbs/`, skips files that already exist, and prints a `const CLIPS = [...]` line. Paste that line over the `CLIPS` list near the top of the editor script in `public/surprise/index.html`.

Cloudflare's per-file limit for the site is 25 MiB; the largest clip is about 3 MB. All clips together are about 41 MB.

## Run it locally

The password check needs the Worker, so a plain static server won't do. From the repo root:

```bash
npx wrangler dev
```

then open <http://localhost:8787/surprise>. (With a static server the lock screen shows but can't unlock.)

## How export works

Export doesn't re-encode. It copies the compressed video and audio packets of each timeline piece into one new MP4, using [mediabunny](https://mediabunny.dev) 1.61.1 loaded from jsDelivr. That makes it fast and lossless, with two consequences:

- **Cuts snap to whole seconds**, because a cut can only start on a keyframe and every clip has one each second.
- **Every clip must be encoded with exactly the same settings** (the ones in `tools/surprise/compress.sh`). A clip encoded differently will break exported files.

Playback in the monitor tries each clip's URL directly. If the browser refuses that, the page fetches the file and plays it from memory instead.

## Saved state

Each visitor's timeline is kept in their own browser (`localStorage`). Nothing is shared between visitors and nothing is stored on a server.
