(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Alert banner (demo: it comes back on every page load)
  var alertEl = document.getElementById('alert');
  if (alertEl) {
    var close = alertEl.querySelector('.alert__close');
    close && close.addEventListener('click', function () { alertEl.hidden = true; });
  }

  // Text size
  var fsBtns = document.querySelectorAll('.fs button');
  function setFs(size) {
    document.documentElement.classList.remove('fs-sm', 'fs-lg');
    if (size !== 'md') document.documentElement.classList.add('fs-' + size);
    fsBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.fs === size)); });
    try { localStorage.setItem('rk-fs', size); } catch (e) {}
  }
  fsBtns.forEach(function (b) { b.addEventListener('click', function () { setFs(b.dataset.fs); }); });
  try { var saved = localStorage.getItem('rk-fs'); if (saved) setFs(saved); } catch (e) {}

  // Search panel
  var searchBtn = document.getElementById('searchBtn'), searchPanel = document.getElementById('searchPanel');
  function closeSearch() { if (searchPanel) { searchPanel.hidden = true; searchBtn.setAttribute('aria-expanded', 'false'); } }
  if (searchBtn && searchPanel) {
    searchBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = searchPanel.hidden;
      searchPanel.hidden = !open;
      searchBtn.setAttribute('aria-expanded', String(open));
      if (open) document.getElementById('q').focus();
    });
    searchPanel.addEventListener('click', function (e) { e.stopPropagation(); });
    document.addEventListener('click', closeSearch);
  }

  // Drawer menu
  var drawer = document.getElementById('drawer'), overlay = document.getElementById('drawerOverlay');
  var menuBtn = document.getElementById('menuBtn'), drawerClose = document.getElementById('drawerClose');
  var lastFocus = null;
  function openDrawer() {
    closeSearch();
    lastFocus = document.activeElement;
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add('is-open'); drawer.classList.add('is-open'); });
    drawer.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('drawer-open');
    setTimeout(function () { drawerClose.focus(); }, 50);
  }
  function closeDrawer() {
    if (!drawer.classList.contains('is-open')) return;
    overlay.classList.remove('is-open'); drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('drawer-open');
    setTimeout(function () { overlay.hidden = true; }, 350);
    if (lastFocus) lastFocus.focus();
  }
  if (drawer && menuBtn) {
    menuBtn.addEventListener('click', function (e) { e.stopPropagation(); openDrawer(); });
    drawerClose.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeDrawer); });
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;  // keep keyboard focus inside the open drawer
      var f = drawer.querySelectorAll('a,button'), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeSearch(); if (drawer) closeDrawer(); } });

  // Back to top + scroll progress ring
  var toTop = document.getElementById('toTop');
  if (toTop) {
    var ticking = false;
    function onScroll() {
      var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
      toTop.classList.toggle('is-visible', y > 600);
      toTop.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(3) : 0);
      ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      var skip = document.querySelector('.skip'); // move keyboard focus back to the top too
      if (skip) skip.focus({ preventScroll: true });
    });
  }

  // Images: fade in as they load
  document.querySelectorAll('main img, .footer img').forEach(function (img) {
    if (img.complete && img.naturalWidth) return;
    img.classList.add('img-fade');
    img.addEventListener('load', function () { img.classList.add('loaded'); });
    img.addEventListener('error', function () { img.classList.add('loaded'); });
  });

  // Scroll-reveal animations
  if ('IntersectionObserver' in window && !reduceMotion) {
    var groups = [
      ['.quick a', ''], ['.sec-head > *', ''], ['.sec-head--center', ''], ['.v-card', ''], ['.residents__img', 'reveal--left'],
      ['.residents__body > .eyebrow, .residents__body > .title, .residents__body > .intro', ''], ['.res-item', ''], ['.stats li', 'reveal--zoom'],
      ['.b-card', ''], ['.duo__item', ''], ['.news-feature', 'reveal--left'], ['.news-list li', 'reveal--right'], ['.news-more', ''],
      ['.c-card', ''], ['.ev-feature__img', 'reveal--left'], ['.ev-feature__body', 'reveal--right'], ['.ev-card', ''], ['.btn-row', ''],
      ['.access__text', ''], ['.phones', 'reveal--right'], ['.nl-list', 'reveal--left'], ['.subscribe .wrap > div:last-child', ''],
      ['.footer__brand', ''], ['.fcol', ''], ['.banner__title', 'reveal--left'], ['.side-nav', 'reveal--left'], ['.ev-article', ''],
      ['.promo', 'reveal--right'], ['.contact-card', ''], ['.detail > *', ''], ['.aside', 'reveal--right']
    ];
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('is-in');
        io.unobserve(el);
        // once finished, remove the helper classes so hover effects work normally
        setTimeout(function () { el.classList.remove('reveal', 'is-in', 'reveal--left', 'reveal--right', 'reveal--zoom'); el.style.removeProperty('--d'); }, 1600);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    groups.forEach(function (g) {
      document.querySelectorAll(g[0]).forEach(function (el) {
        if (el.closest('.slide')) return;
        var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.matches(g[0]); });
        el.style.setProperty('--d', (Math.min(sibs.indexOf(el), 6) * 0.09) + 's');
        el.classList.add('reveal');
        if (g[1]) el.classList.add(g[1]);
        io.observe(el);
      });
    });
  }

  // Hero slider
  var hero = document.getElementById('hero');
  if (hero) {
    var slides = hero.querySelectorAll('.slide');
    var dots = hero.querySelectorAll('.dots button');
    var current = 0, timer = null, paused = false;
    var reduce = reduceMotion;
    function show(n) {
      current = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        var on = i === current;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', String(!on));
        s.querySelectorAll('a').forEach(function (a) { a.tabIndex = on ? 0 : -1; });
        if (on) { var img = s.querySelector('img'); if (img) img.loading = 'eager'; }
      });
      dots.forEach(function (d, i) { if (i === current) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    }
    function start() { stop(); if (!reduce && !paused) timer = setInterval(function () { show(current + 1); }, 6000); }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i); start(); }); });
    hero.addEventListener('mouseenter', function () { paused = true; stop(); });
    hero.addEventListener('mouseleave', function () { paused = false; start(); });
    hero.addEventListener('focusin', function () { paused = true; stop(); });
    hero.addEventListener('focusout', function () { paused = false; start(); });
    hero.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { show(current + 1); }
      if (e.key === 'ArrowLeft') { show(current - 1); }
    });
    var x0 = null;
    hero.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { show(current + (dx < 0 ? 1 : -1)); start(); }
    });
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    // preload the other slides after the page loads
    window.addEventListener('load', function () { slides.forEach(function (s) { var i = s.querySelector('img'); if (i) i.loading = 'eager'; }); });
    show(0); start();
  }

  // Newsletter tabs
  var tabs = document.querySelectorAll('.nl-list button');
  var sub = document.getElementById('nl-sub');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
      t.setAttribute('aria-selected', 'true');
      if (sub) sub.textContent = t.dataset.sub;
    });
  });

  // Newsletter form (demo only)
  var form = document.getElementById('nlForm'), msg = document.getElementById('nlMsg');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('nl-email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      msg.textContent = 'Please enter a valid email address.';
      email.focus();
      return;
    }
    var active = document.querySelector('.nl-list [aria-selected="true"]');
    msg.textContent = 'Thanks! You are now subscribed to the ' + (active ? active.textContent : 'newsletter') + '.';
    form.reset();
  });
})();

// Share links (event details page)
document.querySelectorAll('[data-share]').forEach(function (a) {
  var url = encodeURIComponent(location.href), text = encodeURIComponent(document.title);
  var map = {
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url,
    linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + url,
    x: 'https://twitter.com/intent/tweet?url=' + url + '&text=' + text
  };
  a.href = map[a.dataset.share];
  a.target = '_blank';
  a.rel = 'noopener';
});
