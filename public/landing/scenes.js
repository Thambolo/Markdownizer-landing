(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');
  const chapters = [...document.querySelectorAll('.scene, .conversion-story, .usage-steps, .context-example')];
  const items = chapters.map(chapter => {
    let content;
    if (chapter.classList.contains('conversion-story')) {
      content = chapter.querySelector('.story-sticky');
      content.classList.add('scene-content');
    } else if (chapter.classList.contains('hero')) {
      content = chapter.querySelector('.hero-content');
      content.classList.add('scene-content');
    } else {
      content = document.createElement('div');
      content.className = 'scene-content';
      while (chapter.firstChild) content.append(chapter.firstChild);
      chapter.append(content);
    }
    return {chapter, content};
  });
  const useCase = items.find(item => item.chapter.classList.contains('use-section'));
  useCase?.content.classList.add('use-sticky');
  const useCards = useCase ? [...useCase.content.querySelectorAll('.use-items article')] : [];
  const near = new Set(items);
  const clamp = value => Math.max(0, Math.min(1, value));
  function update() {
    const height = innerHeight;
    near.forEach(({chapter, content}) => {
      const rect = chapter.getBoundingClientRect();
      const focused = content.contains(document.activeElement);
      const expanded = !!chapter.querySelector('details[open]');
      let opacity = 1;
      let offset = 0;
      if (!reduced.matches && !focused && !expanded) {
        // Short sections need a full-opacity reading zone too, even near page end.
        const shortSection = rect.height < height;
        const fadeDistance = shortSection ? Math.max(1, rect.height * .35) : height * .5;
        const enter = clamp(((shortSection ? height : height * .65) - rect.top) / fadeDistance);
        const exit = clamp((rect.bottom - (shortSection ? 0 : height * .35)) / fadeDistance);
        opacity = Math.min(enter, exit);
        if (mobile.matches) opacity = .75 + opacity * .25;
        else {
          const pinned = (chapter.classList.contains('conversion-story') || chapter.classList.contains('use-section')) && rect.top <= 0 && rect.bottom >= height;
          offset = pinned ? 0 : Math.max(-24, Math.min(24, rect.top / height * 24));
        }
      }
      content.style.setProperty('--scene-opacity', opacity);
      content.style.setProperty('--scene-y', `${offset}px`);
      content.style.setProperty('--scene-scale', reduced.matches || mobile.matches ? 1 : .96 + opacity * .04);
      content.style.setProperty('--scene-brightness', reduced.matches || mobile.matches ? 1 : .7 + opacity * .3);
      if (chapter === useCase?.chapter) {
        const progress = clamp(-rect.top / Math.max(1, chapter.offsetHeight - content.offsetHeight));
        useCards.forEach((card, i) => {
          const reveal = reduced.matches ? 1 : mobile.matches
            ? clamp((height * .9 - card.getBoundingClientRect().top) / (height * .3))
            : clamp((progress - i * .26) / .2);
          card.style.opacity = String(reveal);
          card.style.transform = `translate3d(${(1 - reveal) * (mobile.matches ? 25 : 90)}px,0,0)`;
        });
      }
    });
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const item = items.find(item => item.chapter === entry.target);
      if (entry.isIntersecting) near.add(item);
      else near.delete(item);
    });
    schedule();
  }, {rootMargin:'100% 0px'});
  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  }
  items.forEach(item => observer.observe(item.chapter));
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  addEventListener('focusin', schedule);
  document.querySelectorAll('details').forEach(details => details.addEventListener('toggle', schedule));
  reduced.addEventListener('change', schedule);
  mobile.addEventListener('change', schedule);
  update();
})();
