(() => {
  const player = document.querySelector('.promo-player');
  const video = document.querySelector('#promo-video');
  const poster = document.querySelector('#promo-play');
  const status = document.querySelector('#promo-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let hideTimer;
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
