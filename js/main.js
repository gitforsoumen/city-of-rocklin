(function () {
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  // Alert banner
  var alertEl = document.getElementById('alert');
  if (alertEl) {
    if (store.get('rk-alert') === 'closed') alertEl.hidden = true;
    var close = alertEl.querySelector('.alert__close');
    close && close.addEventListener('click', function () { alertEl.hidden = true; store.set('rk-alert', 'closed'); });
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

  // Menu + search panels
  function toggle(btnId, panelId, other) {
    var btn = document.getElementById(btnId), panel = document.getElementById(panelId);
    if (!btn || !panel) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = panel.hidden;
      document.querySelectorAll('.menu-panel,.search-panel').forEach(function (p) { p.hidden = true; });
      document.querySelectorAll('#menuBtn,#searchBtn').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      if (open && panelId === 'searchPanel') document.getElementById('q').focus();
    });
    panel.addEventListener('click', function (e) { e.stopPropagation(); });
  }
  toggle('menuBtn', 'menuPanel');
  toggle('searchBtn', 'searchPanel');
  function closeAll() {
    document.querySelectorAll('.menu-panel,.search-panel').forEach(function (p) { p.hidden = true; });
    document.querySelectorAll('#menuBtn,#searchBtn').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
  }
  document.addEventListener('click', closeAll);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  // Hero slider
  var hero = document.getElementById('hero');
  if (hero) {
    var slides = hero.querySelectorAll('.slide');
    var dots = hero.querySelectorAll('.dots button');
    var current = 0, timer = null, paused = false;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
