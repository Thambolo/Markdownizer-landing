(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Map();
  const details = [...document.querySelectorAll('.faq-section details')];
  function finish(element, state) {
    if (running.get(element) !== state) return;
    running.delete(element);
    state.height.cancel();
    state.text?.cancel();
    element.open = state.expanded;
    element.style.removeProperty('height');
    element.style.removeProperty('overflow');
  }
  details.forEach(element => {
    const summary = element.querySelector('summary');
    const answer = element.querySelector('p');
    summary.insertAdjacentHTML('beforeend', '<svg class="faq-chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>');
    element.dataset.expanded = String(element.open);
    summary.setAttribute('aria-expanded', String(element.open));
    summary.addEventListener('click', event => {
      event.preventDefault();
      const previous = running.get(element);
      const expanded = !(previous ? previous.expanded : element.open);
      const start = element.getBoundingClientRect().height;
      previous?.height.cancel();
      previous?.text?.cancel();
      element.dataset.expanded = String(expanded);
      summary.setAttribute('aria-expanded', String(expanded));
      if (reduced.matches) {
        running.delete(element);
        element.open = expanded;
        element.style.removeProperty('height');
        element.style.removeProperty('overflow');
        return;
      }
      element.open = true;
      element.style.height = 'auto';
      const style = getComputedStyle(element);
      const closed = summary.getBoundingClientRect().height + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      const end = expanded ? element.getBoundingClientRect().height : closed;
      element.style.height = `${start}px`;
      element.style.overflow = 'hidden';
      const height = element.animate([{height:`${start}px`}, {height:`${end}px`}], {duration:280, easing:'cubic-bezier(.22,1,.36,1)', fill:'forwards'});
      const text = answer?.animate(expanded ? [{opacity:0, transform:'translateY(5px)'}, {opacity:1, transform:'translateY(0)'}] : [{opacity:1}, {opacity:0}], {duration:expanded ? 240 : 160, fill:'forwards'});
      const state = {height, text, expanded};
      running.set(element, state);
      height.finished.then(() => finish(element, state)).catch(() => {});
    });
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) [...running].forEach(([element, state]) => finish(element, state));
  });
})();
