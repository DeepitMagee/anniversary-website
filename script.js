// Change this date if your anniversary is not 17 September 2022.
const ANNIVERSARY_START = new Date('2022-09-17T00:00:00');

function updateTimeTogether() {
  const elapsedMs = Math.max(0, Date.now() - ANNIVERSARY_START.getTime());
  const seconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(seconds / 3600);
  const days = Math.floor(seconds / 86400);

  document.querySelector('#days-together').textContent = days.toLocaleString();
  document.querySelector('#hours-together').textContent = hours.toLocaleString();
  document.querySelector('#seconds-together').textContent = seconds.toLocaleString();
}

function initialisePhotoGallery() {
  const fallback = [{ src: 'photos/placeholder.svg', caption: 'Our story belongs here', alt: 'A placeholder for your anniversary photographs' }];
  const photos = Array.isArray(window.ANNIVERSARY_PHOTOS) && window.ANNIVERSARY_PHOTOS.length
    ? window.ANNIVERSARY_PHOTOS
    : fallback;

  const frame = document.querySelector('[data-photo-frame]');
  const image = document.querySelector('[data-gallery-image]');
  const caption = document.querySelector('[data-photo-caption]');
  const count = document.querySelector('[data-photo-count]');
  const thumbnails = document.querySelector('[data-photo-thumbs]');
  let current = 0;
  let timer;
  let changeToken = 0;
  const preloadedSources = new Set();

  const preloadPhoto = (index) => {
    const photo = photos[(index + photos.length) % photos.length];
    if (!photo || preloadedSources.has(photo.src)) return;

    const preloader = new Image();
    preloader.decoding = 'async';
    preloader.src = photo.src;
    preloadedSources.add(photo.src);
  };

  const thumbnailSource = (photo) => photo.thumb || photo.src.replace('/optimized/', '/optimized/thumbs/');

  const thumbnailButtons = photos.map((photo, index) => {
    const button = document.createElement('button');
    button.className = 'gallery-thumb';
    button.type = 'button';
    button.setAttribute('aria-label', `Show memory ${index + 1}`);
    button.setAttribute('aria-current', index === 0 ? 'true' : 'false');

    const thumbnail = document.createElement('img');
    thumbnail.src = thumbnailSource(photo);
    thumbnail.alt = '';
    thumbnail.loading = index === 0 ? 'eager' : 'lazy';
    thumbnail.decoding = 'async';
    button.append(thumbnail);
    thumbnails.append(button);

    button.addEventListener('click', () => { show(index); restart(); });
    return button;
  });

  const updateThumbnails = () => {
    thumbnailButtons.forEach((button, index) => {
      button.setAttribute('aria-current', index === current ? 'true' : 'false');
    });

    const activeThumbnail = thumbnailButtons[current];
    if (!activeThumbnail) return;
    thumbnails.scrollTo({
      left: activeThumbnail.offsetLeft - ((thumbnails.clientWidth - activeThumbnail.clientWidth) / 2),
      behavior: 'smooth'
    });
  };

  const show = (index) => {
    current = (index + photos.length) % photos.length;
    const photo = photos[current];
    const token = ++changeToken;
    frame.classList.add('is-changing');
    updateThumbnails();
    preloadPhoto(current);
    preloadPhoto(current + 1);
    preloadPhoto(current - 1);

    window.setTimeout(() => {
      if (token !== changeToken) return;

      const finish = () => frame.classList.remove('is-changing');
      image.addEventListener('load', finish, { once: true });
      image.src = photo.src;
      image.alt = photo.alt || photo.caption || `Memory ${current + 1}`;
      caption.textContent = photo.caption || '';
      count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
      if (image.complete && image.naturalWidth > 0) finish();
    }, 220);
  };

  const restart = () => {
    window.clearInterval(timer);
    if (photos.length > 1) timer = window.setInterval(() => show(current + 1), 7000);
  };

  document.querySelector('[data-photo-prev]').addEventListener('click', () => { show(current - 1); restart(); });
  document.querySelector('[data-photo-next]').addEventListener('click', () => { show(current + 1); restart(); });

  image.addEventListener('error', () => {
    image.src = 'photos/placeholder.svg';
    caption.textContent = 'Photo not found — check photos/photos.js';
    frame.classList.remove('is-changing');
  });

  show(0);
  restart();
}

updateTimeTogether();
window.setInterval(updateTimeTogether, 1000);
initialisePhotoGallery();
