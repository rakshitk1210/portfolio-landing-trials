/**
 * Cursor repulsion — iteration 10, subtle variant.
 * Applied to hero bio + experience section only.
 * Strength and radius are roughly half of iteration 9.
 */
(function initRepulsion() {

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── Physics constants (subtler than iteration 9) ───────────────── */
  const RADIUS         = 120;   // px — repulsion field radius  (was 150)
  const STRENGTH       = 14;    // max displacement in px       (was 28)
  const CHAR_SMOOTH    = 0.07;  // per-frame lerp for chars     (was 0.085)
  const POINTER_SMOOTH = 0.18;  // per-frame lerp for cursor    (was 0.22)

  /* ── State ──────────────────────────────────────────────────────── */
  const chars   = [];
  const offsets = [];
  let   basePos = [];

  const mouseTarget = { x: -9999, y: -9999 };
  const mouseSmooth = { x: -9999, y: -9999 };

  let rafId = null;

  /* ── Helpers ────────────────────────────────────────────────────── */
  const lerp = (a, b, t) => a + (b - a) * t;

  function smoothstep(t) {
    const x = Math.max(0, Math.min(1, t));
    return x * x * (3 - 2 * x);
  }

  function makeWordSpans(container, text) {
    const words = text.split(' ').filter(w => w.length > 0);
    words.forEach((word, wi) => {
      const wordWrap = document.createElement('span');
      wordWrap.className = 'rep-word';
      for (const ch of word) {
        const span = document.createElement('span');
        span.className = 'rep-char';
        span.textContent = ch;
        wordWrap.appendChild(span);
        chars.push(span);
        offsets.push({ x: 0, y: 0, rot: 0, scale: 1, opacity: 1 });
      }
      container.appendChild(wordWrap);
      if (wi < words.length - 1) {
        container.appendChild(document.createTextNode(' '));
      }
    });
  }

  function buildPlain(el) {
    const text = el.textContent.trim();
    el.innerHTML = '';
    makeWordSpans(el, text);
  }

  /* ── Bootstrap ──────────────────────────────────────────────────── */
  document.querySelectorAll('[data-repulsion]').forEach(el => buildPlain(el));

  /* ── Position measurement ───────────────────────────────────────── */
  function measure() {
    basePos = chars.map(c => {
      const r = c.getBoundingClientRect();
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    });
  }

  /* ── Animation loop ─────────────────────────────────────────────── */
  function tick() {
    mouseSmooth.x = lerp(mouseSmooth.x, mouseTarget.x, POINTER_SMOOTH);
    mouseSmooth.y = lerp(mouseSmooth.y, mouseTarget.y, POINTER_SMOOTH);

    const mx = mouseSmooth.x;
    const my = mouseSmooth.y;

    for (let i = 0; i < chars.length; i++) {
      const p = basePos[i];
      const c = offsets[i];
      if (!p || !c) continue;

      const dx   = p.cx - mx;
      const dy   = p.cy - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let tX = 0, tY = 0, tR = 0, tS = 1, tO = 1;

      if (dist < RADIUS && dist > 0) {
        const u = 1 - dist / RADIUS;
        const f = smoothstep(u) * smoothstep(u);
        tX = (dx / dist) * STRENGTH * f;
        tY = (dy / dist) * STRENGTH * f;
        tR = tX * 0.05;          // less rotation   (was 0.1)
        tS = 1 + f * 0.04;       // less scale bump (was 0.08)
        tO = 0.97 + (1 - f) * 0.03; // barely fades  (was 0.94)
      }

      const nX = lerp(c.x,       tX, CHAR_SMOOTH);
      const nY = lerp(c.y,       tY, CHAR_SMOOTH);
      const nR = lerp(c.rot,     tR, CHAR_SMOOTH * 0.85);
      const nS = lerp(c.scale,   tS, CHAR_SMOOTH);
      const nO = lerp(c.opacity, tO, CHAR_SMOOTH * 1.1);

      offsets[i] = { x: nX, y: nY, rot: nR, scale: nS, opacity: nO };

      chars[i].style.transform =
        `translate(${+nX.toFixed(2)}px,${+nY.toFixed(2)}px)` +
        ` rotate(${+nR.toFixed(2)}deg)` +
        ` scale(${+nS.toFixed(3)})`;
      chars[i].style.opacity = (+nO.toFixed(3)).toString();
    }

    rafId = requestAnimationFrame(tick);
  }

  /* ── Event listeners ────────────────────────────────────────────── */
  document.addEventListener('mousemove', e => {
    mouseTarget.x = e.clientX;
    mouseTarget.y = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    mouseTarget.x = -9999;
    mouseTarget.y = -9999;
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 100);
  });

  window.addEventListener('scroll', measure, { passive: true });

  (document.fonts?.ready ?? Promise.resolve()).then(() => {
    setTimeout(() => {
      measure();
      rafId = requestAnimationFrame(tick);
    }, 60);
  });

  window.addEventListener('beforeunload',
    () => cancelAnimationFrame(rafId),
    { once: true }
  );

})();
