# Adding your photos

1. Copy your photos into this `photos` folder.
2. Open `photos.js`.
3. Add one entry per photo to `window.ANNIVERSARY_PHOTOS`.

Example:

```js
window.ANNIVERSARY_PHOTOS = [
  {
    src: 'photos/our-first-trip.jpg',
    caption: 'Our first trip together',
    alt: 'The two of us smiling on our first trip'
  },
  {
    src: 'photos/a-favourite-day.jpg',
    caption: 'One of my favourite days',
    alt: 'The two of us by the sea'
  }
];
```

Use web-friendly JPG, PNG, AVIF or WebP files. Landscape and portrait photos both work, but portrait images fit the gallery frame best. Avoid spaces in filenames; use names such as `our-first-trip.jpg`.
