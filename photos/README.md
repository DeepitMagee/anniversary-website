# Adding your photos

1. Copy your photos into this `photos` folder.
2. Run `./photos/optimize.sh` to produce resized, compressed WebP copies in `photos/optimized/`.
3. Open `photos.js` and add one entry per photo, pointing `src` at the file in `photos/optimized/`.

The page never loads the originals in `photos/` — it only ever requests `photos/optimized/*.webp`, which is
roughly 6 MB for 30 photos instead of 110 MB. Keep the originals in `photos/` as your source of truth.

Example:

```js
window.ANNIVERSARY_PHOTOS = [
  {
    src: 'photos/optimized/our-first-trip.webp',
    caption: 'Our first trip together',
    alt: 'The two of us smiling on our first trip'
  },
  {
    src: 'photos/optimized/a-favourite-day.webp',
    caption: 'One of my favourite days',
    alt: 'The two of us by the sea'
  }
];
```

Landscape and portrait photos both work, but portrait images fit the gallery frame best.

`optimize.sh` resizes to a 1600 px long side at quality 82 and strips awkward filename characters
(spaces, brackets), so `IMG_4020 (1).jpg` becomes `optimized/IMG_4020_1.webp`. Keep the name reported by
the script when you add the entry to `photos.js`. The hero polaroids in `index.html` point at the same
optimised files, so a photo used in both places is only used once.
