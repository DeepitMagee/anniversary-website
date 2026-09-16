#!/usr/bin/env bash
# Build the repeating photo-mosaic tile used as the gallery section background.
#
#   ./photos/build-mosaic.sh "/path/to/private/originals"
#
# Every photo in the supplied source directory is cropped to a square cell and
# stacked into photos/optimized/background-mosaic.webp, which styles.css repeats
# behind the gallery section. The cell size stays fixed, so the tile grows as
# photos are added rather than shrinking them.
set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "$0")" && pwd)
SOURCE_DIR=${1:-}
[ -n "$SOURCE_DIR" ] || { echo "usage: $0 /path/to/private/originals" >&2; exit 1; }
[ -d "$SOURCE_DIR" ] || { echo "source directory not found: $SOURCE_DIR" >&2; exit 1; }
SOURCE_DIR=$(cd -- "$SOURCE_DIR" && pwd)
OUTPUT_DIR="$SCRIPT_DIR/optimized"

CELL=256          # cell edge in pixels
QUALITY=68        # cwebp quality for the finished tile
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

for tool in ffmpeg cwebp sips; do
  command -v "$tool" >/dev/null 2>&1 || { echo "$tool not found" >&2; exit 1; }
done

sources=()
for original in "$SOURCE_DIR"/*.[jJ][pP][gG] "$SOURCE_DIR"/*.[jJ][pP][eE][gG] "$SOURCE_DIR"/*.[pP][nN][gG]; do
  [ -e "$original" ] || continue
  sources+=("$original")
done

count=${#sources[@]}
[ "$count" -gt 0 ] || { echo "no photos found in $SOURCE_DIR" >&2; exit 1; }

# Square-ish grid, filled out by repeating photos when the count does not divide.
cols=$(awk -v n="$count" 'BEGIN { print int(sqrt(n) + 0.999) }')
rows=$(awk -v n="$count" -v c="$cols" 'BEGIN { print int((n + c - 1) / c) }')
cells=$((cols * rows))
echo "$count photo(s) -> ${cols}x${rows} grid ($cells cells)"

# Stage every cell at twice the cell size so the tile survives retina displays.
index=0
while [ "$index" -lt "$cells" ]; do
  sips -s format jpeg -Z $((CELL * 2)) "${sources[$((index % count))]}" \
    --out "$WORK/$(printf '%02d' "$index").jpg" >/dev/null
  index=$((index + 1))
done

# xstack rather than tile: the tile filter only carried the first frame through,
# leaving the rest of the canvas black.
inputs=()
filter=""
layout=""
name=0
while [ "$name" -lt "$cells" ]; do
  inputs+=(-i "$WORK/$(printf '%02d' "$name").jpg")
  filter="${filter}[${name}:v]scale=${CELL}:${CELL}:force_original_aspect_ratio=increase,crop=${CELL}:${CELL},setsar=1[v${name}];"
  x=$(((name % cols) * CELL))
  y=$(((name / cols) * CELL))
  [ "$name" -gt 0 ] && layout="${layout}|"
  layout="${layout}${x}_${y}"
  name=$((name + 1))
done

streams=""
name=0
while [ "$name" -lt "$cells" ]; do
  streams="${streams}[v${name}]"
  name=$((name + 1))
done

ffmpeg -hide_banner -loglevel error -y "${inputs[@]}" \
  -filter_complex "${filter}${streams}xstack=inputs=${cells}:layout=${layout}" \
  -frames:v 1 "$WORK/mosaic.png"

cwebp -quiet -q "$QUALITY" -m 6 "$WORK/mosaic.png" -o "$OUTPUT_DIR/background-mosaic.webp"

size=$(stat -f%z "$OUTPUT_DIR/background-mosaic.webp")
echo "wrote $OUTPUT_DIR/background-mosaic.webp  $((size / 1024)) KB  (${cols}x${rows} cells of ${CELL}px)"
