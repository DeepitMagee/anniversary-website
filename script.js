// Change this date if your anniversary is not 17 September 2022.
const ANNIVERSARY_START = new Date('2022-09-17T00:00:00');
const SOUNDTRACK_TRACKS = [
  { id: 'DULDIS2qlCU', startSeconds: 15 },
  { id: '9JDSGhhiOwI', startSeconds: 13 },
  { id: 'qoq8B8ThgEM', startSeconds: 17 },
  { id: '49x8GA2axfc', startSeconds: 8 }
];

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

function initialiseSoundtrack() {
  const playerShell = document.querySelector('.soundtrack-player-shell');
  const playButton = document.querySelector('[data-music-play]');
  const nextButton = document.querySelector('[data-music-next]');
  const trackLabel = document.querySelector('[data-music-track]');
  const stateLabel = document.querySelector('[data-music-state]');
  if (!playerShell || !playButton || !nextButton || !trackLabel || !stateLabel || !SOUNDTRACK_TRACKS.length) return;

  let player;
  let current = 0;
  let isPlaying = false;
  let playerReady = false;

  const currentTrack = () => SOUNDTRACK_TRACKS[current];

  const updateTrackLabel = () => {
    const videoData = player && typeof player.getVideoData === 'function' ? player.getVideoData() : null;
    trackLabel.textContent = videoData?.title || `Song ${current + 1} of ${SOUNDTRACK_TRACKS.length}`;
  };

  const updatePlayButton = () => {
    playButton.textContent = isPlaying ? 'Pause' : 'Play';
    playButton.setAttribute('aria-label', isPlaying ? 'Pause soundtrack' : 'Play soundtrack');
  };

  const setState = (state) => {
    stateLabel.textContent = state;
    updateTrackLabel();
  };

  const setControlsEnabled = (enabled) => {
    playButton.disabled = !enabled;
    nextButton.disabled = !enabled;
  };

  const createPlayer = () => {
    if (player || !window.YT?.Player) return;

    player = new window.YT.Player('youtube-player', {
      width: '200',
      height: '200',
      videoId: currentTrack().id,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        origin: window.location.origin
      },
      events: {
        onReady: () => {
          playerReady = true;
          setControlsEnabled(true);
          player.cueVideoById({ videoId: currentTrack().id, startSeconds: currentTrack().startSeconds });
          setState('Ready to play');
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            isPlaying = true;
            setState('Playing');
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            isPlaying = false;
            setState('Paused');
          } else if (event.data === window.YT.PlayerState.ENDED) {
            isPlaying = false;
            setState('Finished — press Next song for the next one');
          }
          updatePlayButton();
        },
        onAutoplayBlocked: () => {
          isPlaying = false;
          setState('Press Play to start the soundtrack');
          updatePlayButton();
        },
        onError: () => {
          isPlaying = false;
          setState('This song cannot be embedded — try Next song');
          updatePlayButton();
        }
      }
    });
  };

  playButton.addEventListener('click', () => {
    if (!playerReady) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  });

  nextButton.addEventListener('click', () => {
    if (!playerReady) return;
    current = (current + 1) % SOUNDTRACK_TRACKS.length;
    isPlaying = true;
    player.loadVideoById({ videoId: currentTrack().id, startSeconds: currentTrack().startSeconds });
    setState('Loading next song');
    updatePlayButton();
  });

  const apiScript = document.createElement('script');
  apiScript.src = 'https://www.youtube.com/iframe_api';
  apiScript.addEventListener('error', () => {
    setState('Soundtrack unavailable');
  });

  const previousReadyCallback = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    if (typeof previousReadyCallback === 'function') previousReadyCallback();
    createPlayer();
  };

  if (window.YT?.Player) {
    createPlayer();
  } else if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
    document.head.append(apiScript);
  }
}

updateTimeTogether();
window.setInterval(updateTimeTogether, 1000);
initialisePhotoGallery();
initialiseSoundtrack();
