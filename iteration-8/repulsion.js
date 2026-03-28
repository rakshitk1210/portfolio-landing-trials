/**
 * Cursor repulsion — iteration 8 hero headline only.
 *
 * Use [data-repulsion]; add [data-repulsion-mixed] when mixing text + inline
 * nodes (e.g. avatar chip). Subtitle blur-reveal runs in index.html — do not
 * put data-repulsion on .hero-bio.
 *
 * Viewport mouse coords, re-measure on scroll/resize. prefers-reduced-motion:
 * script no-ops; headline stays plain HTML.
 */
(function initRepulsion() {

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── Physics constants ──────────────────────────────────────────── */
  const RADIUS          = 150;   // px — repulsion field radius
  const STRENGTH        = 28;    // max displacement in px
  const CHAR_SMOOTH     = 0.085; // per-frame lerp for character offsets
  const POINTER_SMOOTH  = 0.22;  // per-frame lerp for the virtual cursor

  /* ── State ──────────────────────────────────────────────────────── */
  const chars   = [];   // all registered <span class="rep-char"> elements
  const offsets = [];   // { x, y, rot, scale, opacity } current physics state
  let   basePos = [];   // { cx, cy } cached viewport-space centre of each char

  const mouseTarget = { x: -9999, y: -9999 }; // real cursor (viewport px)
  const mouseSmooth = { x: -9999, y: -9999 }; // smoothed virtual cursor

  let rafId = null;

  /* ── Helpers ────────────────────────────────────────────────────── */
  const lerp = (a, b, t) => a + (b - a) * t;

  function smoothstep(t) {
    const x = Math.max(0, Math.min(1, t));
    return x * x * (3 - 2 * x);
  }

  /**
   * Append word-wrapped char spans to `container`.
   * Words become inline-block no-break wrappers; spaces become plain
   * text nodes so the browser wraps lines at word boundaries naturally.
   */
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

  /**
   * Build repulsion DOM for an element that contains a mix of
   * text nodes AND inline child elements (e.g. the avatar chip).
   * Text nodes → char spans.  Element nodes → kept verbatim.
   */
  function buildMixed(el) {
    const nodes = Array.from(el.childNodes);
    el.innerHTML = '';

    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const raw = node.textContent;
        if (!/\S/.test(raw)) return; // skip pure-whitespace nodes

        const hasLeading  = raw[0] === ' ';
        const hasTrailing = raw[raw.length - 1] === ' ';
        const trimmed     = raw.trim();

        if (hasLeading)  el.appendChild(document.createTextNode(' '));

        const seg = document.createElement('span');
        seg.className = 'rep-seg';
        makeWordSpans(seg, trimmed);
        el.appendChild(seg);

        if (hasTrailing) el.appendChild(document.createTextNode(' '));

      } else if (node.nodeType === Node.ELEMENT_NODE) {
        el.appendChild(node); // avatar chip, etc. — kept unchanged
      }
    });
  }

  /**
   * Build repulsion DOM for a plain-text element (no inline children).
   */
  function buildPlain(el) {
    const text = el.textContent.trim();
    el.innerHTML = '';
    makeWordSpans(el, text);
  }

  /* ── Bootstrap ──────────────────────────────────────────────────── */
  document.querySelectorAll('[data-repulsion]').forEach(el => {
    if ('repulsionMixed' in el.dataset) buildMixed(el);
    else                                buildPlain(el);
  });

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
        tR = tX * 0.1;
        tS = 1 + f * 0.08;
        tO = 0.94 + (1 - f) * 0.06;
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

  // Re-measure on scroll since viewport coords of chars change
  window.addEventListener('scroll', measure, { passive: true });

  // Wait for fonts so letter sizes are accurate before first measure
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
