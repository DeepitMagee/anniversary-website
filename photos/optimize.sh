#!/usr/bin/env bash
# Regenerate the optimised WebP copies used by the gallery and hero polaroids.
#
#   ./photos/optimize.sh "/path/to/private/originals"
#
# Reads every JPG/JPEG/PNG in the supplied source directory and writes a resized,
# compressed WebP into photos/optimized/, so the deployed site never serves the
# multi-megabyte originals.
# Existing WebP files are overwritten; originals are never modified.
set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "$0")" && pwd)
SOURCE_DIR=${1:-}
[ -n "$SOURCE_DIR" ] || { echo "usage: $0 /path/to/private/originals" >&2; exit 1; }
[ -d "$SOURCE_DIR" ] || { echo "source directory not found: $SOURCE_DIR" >&2; exit 1; }
SOURCE_DIR=$(cd -- "$SOURCE_DIR" && pwd)
OUTPUT_DIR="$SCRIPT_DIR/optimized"

MAX_EDGE=1600   # longest side, in pixels
QUALITY=82      # cwebp quality (0-100)
THUMB_EDGE=180  # longest side for gallery thumbnails, in pixels
THUMB_QUALITY=70

if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp not found. Install it with: brew install webp" >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR/thumbs"
count=0

for source in "$SOURCE_DIR"/*.[jJ][pP][gG] "$SOURCE_DIR"/*.[jJ][pP][eE][gG] "$SOURCE_DIR"/*.[pP][nN][gG]; do
  [ -e "$source" ] || continue

  # Sanitise the stem: no spaces or brackets in filenames (they travel badly in URLs).
  stem=$(basename "$source")
  stem="${stem%.*}"
  stem=$(printf '%s' "$stem" | sed -e 's/[^A-Za-z0-9._-]/_/g' -e 's/__*/_/g' -e 's/_*$//')

  target="$OUTPUT_DIR/${stem}.webp"

  # Cap the LONG side: cwebp's -resize W H keeps the aspect ratio only when one
  # value is 0, so portrait sources need the height pinned instead of the width.
  read -r width height < <(sips -g pixelWidth -g pixelHeight "$source" | awk '/pixel/{print $2}' | paste -sd' ' -)
  if [ "${width:-0}" -ge "${height:-0}" ]; then
    resize=("$MAX_EDGE" 0)
    thumb_resize=("$THUMB_EDGE" 0)
  else
    resize=(0 "$MAX_EDGE")
    thumb_resize=(0 "$THUMB_EDGE")
  fi

  cwebp -quiet -q "$QUALITY" -resize "${resize[@]}" "$source" -o "$target"
  cwebp -quiet -q "$THUMB_QUALITY" -resize "${thumb_resize[@]}" "$source" -o "$OUTPUT_DIR/thumbs/${stem}.webp"
  printf '%-60s %8s -> %8s\n' "$target" "$(du -h "$source" | cut -f1)" "$(du -h "$target" | cut -f1)"
  count=$((count + 1))
done

echo "$count photo(s) optimised into photos/optimized/"
