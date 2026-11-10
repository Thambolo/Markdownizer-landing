(() => {
  const header = document.querySelector('.site-header');
  const toggle = header?.querySelector('.nav-toggle');
  const nav = header?.querySelector('nav');
  if (!toggle || !nav) return;

  const mobile = window.matchMedia('(max-width: 760px)');
  const headerSlot = document.createElement('div');
  headerSlot.className = 'mobile-header-slot';
  header.before(headerSlot);
  const placeholder = document.createComment('Main navigation');
  nav.before(placeholder);
  const drawer = document.createElement('dialog');
  drawer.className = 'nav-drawer';
  drawer.setAttribute('aria-label', 'Main navigation');
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'nav-close';
  closeButton.setAttribute('aria-label', 'Close navigation');
  closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="24" height="24" aria-hidden="true" focusable="false"><!-- Font Awesome Free 6.7.2 xmark, CC BY 4.0, https://fontawesome.com/license/free --><path fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>';
  drawer.append(closeButton);
  document.body.append(drawer);

  let previousOverflow = '';
  let previousPadding = '';
  const close = () => {
    if (drawer.open) drawer.close();
  };
  drawer.addEventListener('close', () => {
    document.documentElement.style.overflow = previousOverflow;
    document.documentElement.style.paddingRight = previousPadding;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    if (mobile.matches) toggle.focus({ preventScroll: true });
  });
  toggle.addEventListener('click', () => {
    previousOverflow = document.documentElement.style.overflow;
    previousPadding = document.documentElement.style.paddingRight;
    // Compensate the document, not the fixed drawer, when hiding the scrollbar.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const padding = parseFloat(getComputedStyle(document.documentElement).paddingRight) || 0;
    document.documentElement.style.paddingRight = `${padding + scrollbarWidth}px`;
    drawer.showModal();
    document.documentElement.style.overflow = 'hidden';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation');
  });
  closeButton.addEventListener('click', close);
  drawer.addEventListener('click', (event) => {
    if (event.target !== drawer) return;
    const bounds = drawer.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) close();
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) close();
  });
  const syncLayout = () => {
    close();
    if (mobile.matches) {
      drawer.append(nav);
      document.body.prepend(header);
    } else {
      headerSlot.after(header);
      placeholder.after(nav);
    }
  };
  mobile.addEventListener('change', syncLayout);
  toggle.hidden = false;
  header.classList.add('nav-ready');
  syncLayout();
})();
