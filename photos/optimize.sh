#!/usr/bin/env bash
# Regenerate the optimised WebP copies used by the gallery and hero polaroids.
#
#   ./photos/optimize.sh
#
# Reads every JPG/JPEG/PNG in photos/ and writes a resized, compressed WebP into
# photos/optimized/, so the deployed site never serves the multi-megabyte originals.
# Existing WebP files are overwritten; originals are never modified.
set -euo pipefail

cd "$(dirname "$0")"

MAX_EDGE=1600   # longest side, in pixels
QUALITY=82      # cwebp quality (0-100)

if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp not found. Install it with: brew install webp" >&2
  exit 1
fi

mkdir -p optimized
count=0

for source in *.[jJ][pP][gG] *.[jJ][pP][eE][gG] *.[pP][nN][gG]; do
  [ -e "$source" ] || continue

  # Sanitise the stem: no spaces or brackets in filenames (they travel badly in URLs).
  stem=$(basename "$source")
  stem="${stem%.*}"
  stem=$(printf '%s' "$stem" | sed -e 's/[^A-Za-z0-9._-]/_/g' -e 's/__*/_/g' -e 's/_*$//')

  target="optimized/${stem}.webp"
  cwebp -quiet -q "$QUALITY" -resize "$MAX_EDGE" 0 "$source" -o "$target"
  printf '%-60s %8s -> %8s\n' "$target" "$(du -h "$source" | cut -f1)" "$(du -h "$target" | cut -f1)"
  count=$((count + 1))
done

echo "$count photo(s) optimised into photos/optimized/"
