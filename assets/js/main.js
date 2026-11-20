/* あいまいと — shared behaviour
   1. JA / EN switch (remembered across pages)
   2. Menu overlay (small screens)
   3. Stage: swap the photo behind the window as sections pass the middle of the screen
      Sections declare data-photo="<key of a .ph in .stage>" and data-cap="caption text".
      The rail link pointing at the section's id lights up.
*/
(function () {
  var root = document.documentElement;
  root.classList.remove('no-js');

  /* 1. Language */
  var langButtons = document.querySelectorAll('[data-set-lang]');
  function setLang(lang) {
    root.dataset.lang = lang;
    root.lang = lang;
    langButtons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.setLang === lang));
    });
    try { localStorage.setItem('aimaito-lang', lang); } catch (e) {}
  }
  langButtons.forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.setLang); });
  });
  setLang(root.dataset.lang || 'ja');

  /* 2. Menu */
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('site-menu');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* 3. Stage */
  var stage = document.querySelector('.stage');
  if (!stage || !('IntersectionObserver' in window)) return;
  var phs = stage.querySelectorAll('.ph');
  var cap = stage.querySelector('.stage-cap');
  var small = window.matchMedia('(max-width: 900px)');

  function show(section) {
    if (small.matches) return; /* on phones the first photo stays as a header image */
    var key = section.dataset.photo;
    if (!stage.querySelector('.ph[data-key="' + key + '"]')) return;
    phs.forEach(function (p) { p.classList.toggle('is-on', p.dataset.key === key); });
    if (cap && section.dataset.cap) {
      var c = section.dataset.cap.split('|');
      cap.innerHTML = '<b>' + c[0] + '</b>' + (c[1] || '');
    }
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) show(e.target); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('[data-photo]').forEach(function (s) { io.observe(s); });
})();
