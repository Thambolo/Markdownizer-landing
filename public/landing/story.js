(() => {
  const section = document.querySelector('.conversion-story');
  const stage = section.querySelector('.story-sticky');
  const frames = [...section.querySelectorAll('[data-frame]')];
  const viewport = section.querySelector('.story-frames');
  const track = document.createElement('div');
  track.className = 'story-track';
  frames.forEach(frame => track.append(frame));
  viewport.append(track);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 760px)');
  const titles = ['Keep instructions together.', 'Keep values in their columns.', 'Keep code distinct from prose.', 'Bring the context to your question.'];
  const descriptions = [
    'Headings and lists keep each requirement in its proper place.',
    'Table rows keep each value connected to the right label.',
    'Code blocks separate commands from the surrounding explanation.',
    'Give your AI the source material alongside your question.'
  ];
  frames.slice(0, 3).forEach(frame => {
    const walker = document.createTreeWalker(frame.querySelector('.structured-example'), NodeFilter.SHOW_TEXT);
    const words = [];
    while (walker.nextNode()) {
      const value = walker.currentNode.textContent.trim();
      if (value) words.push(value);
    }
    frame.querySelector('.flat-example').textContent = words.join(' ').replace(/\s+/g, ' ');
  });
  let current = 0;
  function setFrame(index) {
    current = index;
    stage.dataset.step = String(index);
    frames.forEach((frame, i) => {
      frame.hidden = compact.matches && !reduced.matches && i !== index;
      frame.inert = !reduced.matches && i !== index;
      frame.setAttribute('aria-hidden', String(!reduced.matches && i !== index));
      frame.classList.toggle('is-focused', reduced.matches || i === index);
    });
    if (compact.matches) track.style.transform = '';
    document.querySelector('#story-title').textContent = reduced.matches ? 'Keep the details that matter.' : titles[index];
    document.querySelector('#story-description').textContent = reduced.matches ? 'See how headings, tables, and code preserve the structure of your source.' : descriptions[index];
    document.querySelector('#story-back').disabled = index === 0;
    document.querySelector('#story-next').disabled = index === frames.length - 1;
    if (compact.matches || reduced.matches) {
      stage.style.setProperty('--story-progress', (index + 1) / frames.length);
    }
  }
  function update() {
    if (compact.matches || reduced.matches) return;
    const distance = Math.max(1, section.offsetHeight - stage.offsetHeight);
    const progress = Math.max(0, Math.min(1, -section.getBoundingClientRect().top / distance));
    stage.style.setProperty('--story-progress', progress);
    const segment = Math.min(frames.length - 1, Math.floor(progress * frames.length));
    // Hold each complete pair for 70% of its segment, then transition without snapping.
    const local = progress * frames.length - segment;
    const blend = Math.max(0, Math.min(1, (local - .7) / .3));
    const eased = blend * blend * (3 - 2 * blend);
    const position = Math.min(frames.length - 1, segment + eased);
    const next = Math.round(position);
    if (next !== current) setFrame(next);
    track.style.transform = `translate3d(${-position * 100}%,0,0)`;
    frames.forEach((frame, i) => {
      const distance = Math.min(1, Math.abs(i - position));
      frame.style.transform = `scale(${1 - distance * .08})`;
      frame.style.opacity = String(1 - distance * .65);
      frame.style.filter = `brightness(${1 - distance * .3})`;
    });
  }
  function navigate(index) {
    if (!compact.matches && !reduced.matches) {
      const top = section.getBoundingClientRect().top + scrollY;
      scrollTo({top: top + (section.offsetHeight - stage.offsetHeight) * (index + 0.5) / frames.length, behavior: 'smooth'});
    } else {
      setFrame(index);
    }
  }
  document.querySelector('#story-back').addEventListener('click', () => navigate(Math.max(0, current - 1)));
  document.querySelector('#story-next').addEventListener('click', () => navigate(Math.min(frames.length - 1, current + 1)));
  let queued = false;
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  }, {passive: true});
  function refresh() {
    track.style.transform = '';
    frames.forEach(frame => { frame.style.transform = ''; frame.style.opacity = ''; frame.style.filter = ''; });
    setFrame(current);
    update();
  }
  compact.addEventListener('change', refresh);
  reduced.addEventListener('change', refresh);
  addEventListener('resize', update);
  refresh();
})();
