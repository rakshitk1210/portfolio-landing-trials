(function () {
  const sections = document.querySelectorAll('.case-toc-section');
  const links = document.querySelectorAll('.case-side-nav__link');
  if (!sections.length || !links.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setActive(id) {
    links.forEach(function (a) {
      const href = a.getAttribute('href');
      const match = href && href === '#' + id;
      a.classList.toggle('is-active', match);
      if (match) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }

  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      const href = a.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      const el = document.getElementById(href.slice(1));
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', href);
      setActive(href.slice(1));
    });
  });

  const byId = {};
  sections.forEach(function (s) {
    if (s.id) byId[s.id] = s;
  });

  const observer = new IntersectionObserver(
    function (entries) {
      const visible = entries
        .filter(function (e) {
          return e.isIntersecting && e.target.id;
        })
        .sort(function (a, b) {
          return b.intersectionRatio - a.intersectionRatio;
        });
      if (!visible.length) return;
      setActive(visible[0].target.id);
    },
    {
      root: null,
      rootMargin: '-18% 0px -52% 0px',
      threshold: [0, 0.05, 0.1, 0.2, 0.35, 0.5, 0.75, 1],
    }
  );

  sections.forEach(function (s) {
    observer.observe(s);
  });

  function syncFromHash() {
    const id = window.location.hash.slice(1);
    if (id && byId[id]) setActive(id);
  }

  window.addEventListener('hashchange', syncFromHash);
  syncFromHash();
})();
