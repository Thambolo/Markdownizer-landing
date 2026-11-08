(() => {
  const player = document.querySelector('.promo-player');
  const video = document.querySelector('#promo-video');
  const poster = document.querySelector('#promo-play');
  const status = document.querySelector('#promo-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');
  const backdrop = document.querySelector('#mobile-backdrop-video');
  const backdropLayer = document.querySelector('.promo-backdrop');
  let hideTimer;
  let backdropLoaded = false;
  let backdropNear = false;
  let backdropShouldPlay = false;
  const saveData = () => navigator.connection?.saveData === true;
  function updateBackdrop() {
    const shouldPlay = backdropNear && mobile.matches && !reduced.matches && !document.hidden && !saveData();
    if (shouldPlay === backdropShouldPlay) return;
    backdropShouldPlay = shouldPlay;
    if (!shouldPlay) {
      backdrop.pause();
      backdropLayer.classList.remove('is-playing');
      return;
    }
    if (!backdropLoaded) {
      backdrop.src = backdrop.dataset.src;
      backdrop.load();
      backdropLoaded = true;
    }
    backdrop.muted = true;
    backdrop.play().catch(() => { backdropShouldPlay = false; });
  }
  backdrop.addEventListener('playing', () => backdropLayer.classList.add('is-playing'));
  backdrop.addEventListener('pause', () => backdropLayer.classList.remove('is-playing'));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      backdropNear = entry.isIntersecting && entry.intersectionRatio >= 0.12;
      updateBackdrop();
    }, {threshold:0.12}).observe(document.querySelector('.demo-scene'));
  }
  document.addEventListener('visibilitychange', updateBackdrop);
  mobile.addEventListener('change', updateBackdrop);
  reduced.addEventListener('change', updateBackdrop);
  navigator.connection?.addEventListener?.('change', updateBackdrop);

  poster.hidden = false;
  function reveal() {
    player.classList.add('is-playing');
    poster.disabled = true;
    // Keep the poster until an actual video frame is playing, then crossfade.
    hideTimer = setTimeout(() => { poster.hidden = true; }, reduced.matches ? 0 : 300);
  }
  video.addEventListener('playing', reveal);
  poster.addEventListener('click', async () => {
    status.textContent = '';
    poster.setAttribute('aria-busy', 'true');
    try {
      await video.play();
      video.focus({preventScroll:true});
    } catch {
      player.classList.remove('is-playing');
      poster.disabled = false;
      poster.hidden = false;
      status.textContent = 'Playback could not start. Try again, or use the video controls.';
    } finally { poster.removeAttribute('aria-busy'); }
  });
  video.addEventListener('error', () => {
    clearTimeout(hideTimer);
    player.classList.remove('is-playing');
    poster.hidden = false;
    poster.disabled = false;
    status.textContent = 'The video could not load. Please try again.';
  });
})();
