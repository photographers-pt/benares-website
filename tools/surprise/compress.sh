#!/usr/bin/env bash
# Turn camera originals into web clips + thumbnails for the editor.
#
#   tools/surprise/compress.sh /path/to/CLIP            # writes into public/surprise/clips and public/surprise/thumbs
#   tools/surprise/compress.sh /path/to/CLIP some/dir   # writes somewhere else
#
# Clips that already exist are skipped. At the end it prints the CLIPS list to paste into
# public/surprise/index.html.
#
# Keep these encoder settings identical for every clip. The editor's export joins clips
# WITHOUT re-encoding, which only works if every file has the same codec settings and a
# keyframe exactly every second (-g 25 at 25 fps, no scene-cut keyframes).
set -euo pipefail

SRC="${1:?usage: tools/surprise/compress.sh <folder of original .MP4 files> [output dir]}"
OUT="${2:-$(cd "$(dirname "$0")/../.." && pwd)/public/surprise}"
mkdir -p "$OUT/clips" "$OUT/thumbs"

list=""
for f in "$SRC"/*.MP4 "$SRC"/*.mp4; do
  [ -e "$f" ] || continue
  id=$(basename "${f%.*}")
  clip="$OUT/clips/$id.mp4"

  if [ ! -s "$clip" ]; then
    echo "compressing $id"
    ffmpeg -hide_banner -loglevel error -y -i "$f" \
      -vf "scale=1280:720:flags=lanczos,fps=25" \
      -c:v libx264 -preset slow -crf 23 -profile:v high -pix_fmt yuv420p \
      -g 25 -keyint_min 25 -sc_threshold 0 \
      -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
      -c:a aac -b:a 128k -ar 48000 -ac 2 \
      -movflags +faststart "$clip.part.mp4"
    mv "$clip.part.mp4" "$clip"
  fi

  dur=$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "$clip")
  thumb="$OUT/thumbs/$id.jpg"
  if [ ! -s "$thumb" ]; then
    mid=$(awk -v d="$dur" 'BEGIN { printf "%.2f", d / 2 }')
    ffmpeg -hide_banner -loglevel error -y -ss "$mid" -i "$clip" -frames:v 1 -vf scale=320:180 -q:v 5 "$thumb"
  fi
  list+="[\"$id\",$(awk -v d="$dur" 'BEGIN { printf "%g", d }')],"
done

echo
echo "Paste this over the CLIPS list in public/surprise/index.html:"
echo "const CLIPS = [${list%,}]"
