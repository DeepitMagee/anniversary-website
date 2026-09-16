# Adding your photos

Keep original photographs outside this repository. The published site contains only the optimised WebP
derivatives, so the full-resolution files are not fetchable from the public Pages asset tree.

1. Put originals in a private source folder outside the repository. The current local setup uses
   `../Anniv Website Originals/`.
2. From the repository root, regenerate the derivatives:

   ```sh
   ./photos/optimize.sh "../Anniv Website Originals"
   ./photos/build-mosaic.sh "../Anniv Website Originals"
   ```

   The first command writes resized, compressed WebP files into `photos/optimized/` and small gallery
   thumbnails into `photos/optimized/thumbs/`. The second rebuilds `photos/optimized/background-mosaic.webp`
   from the same source set.
3. Open `photos.js` and add one entry per photo, pointing `src` at the file in `photos/optimized/`.

The page never loads the originals — it only requests the optimised WebP copies, currently roughly 7 MB for
30 photos. The gallery preloads the current, next and previous full-size photo while the thumbnail strip
uses the small derivative previews lazily.

The mosaic builder crops every photo into a 256 px square cell, stacks them into one background image and
reports the grid it made. `styles.css` repeats that file behind the gallery section, under a dark wine scrim —
change the `linear-gradient` alphas in `.gallery-section` to make the background lighter or darker.

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
