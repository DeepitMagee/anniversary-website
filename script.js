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
  let current = 0;
  let timer;

  const show = (index) => {
    current = (index + photos.length) % photos.length;
    const photo = photos[current];
    frame.classList.add('is-changing');

    window.setTimeout(() => {
      image.src = photo.src;
      image.alt = photo.alt || photo.caption || `Memory ${current + 1}`;
      caption.textContent = photo.caption || '';
      count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
      image.addEventListener('load', () => frame.classList.remove('is-changing'), { once: true });
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
