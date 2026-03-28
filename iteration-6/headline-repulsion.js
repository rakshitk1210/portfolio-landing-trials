/**
 * Cursor repulsion for per-character headline text.
 * Ported from text-repulsion.jsx (DistortedText) for static HTML.
 */
(function initHeadlineRepulsion() {
  const root = document.querySelector("[data-headline-repulsion]");
  if (!root) return;

  const text = root.dataset.headlineRepulsion || root.textContent.trim();
  const headline = root.closest(".hero-headline");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.textContent = text;
    root.removeAttribute("aria-hidden");
    headline?.querySelector(".visually-hidden")?.remove();
    return;
  }

  root.textContent = "";

  const radius = Number(root.dataset.repulsionRadius) || 150;
  const strength = Number(root.dataset.repulsionStrength) || 28;
  /** Lower = letters ease more slowly (less jarring) */
  const charSmoothing = Number(root.dataset.repulsionCharSmooth) || 0.085;
  /** How fast the virtual cursor follows the real one (0–1 per frame) */
  const pointerSmoothing = Number(root.dataset.repulsionPointerSmooth) || 0.22;

  const chars = [];
  const positions = [];
  const offsets = [];

  const lerp = (a, b, t) => a + (b - a) * t;

  /** Smoothstep: gentler than raw linear or quadratic falloff */
  function smoothstep01(t) {
    const x = Math.max(0, Math.min(1, t));
    return x * x * (3 - 2 * x);
  }

  const mouseTarget = { x: -9999, y: -9999 };
  const mouseSmooth = { x: -9999, y: -9999 };

  let rafId = null;

  function measurePositions() {
    const containerRect = root.getBoundingClientRect();
    const n = chars.length;
    positions.length = n;
    for (let i = 0; i < n; i++) {
      const el = chars[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      positions[i] = {
        cx: rect.left + rect.width / 2 - containerRect.left,
        cy: rect.top + rect.height / 2 - containerRect.top,
      };
    }
    if (!offsets.length && n > 0) {
      for (let i = 0; i < n; i++) {
        offsets[i] = { x: 0, y: 0, rot: 0, scale: 1, opacity: 1 };
      }
    }
  }

  function buildDom() {
    const words = text.split(" ");
    let charIndex = 0;

    words.forEach((word) => {
      const wordWrap = document.createElement("span");
      wordWrap.className = "headline-repulsion-word";
      for (let ci = 0; ci < word.length; ci++) {
        const idx = charIndex++;
        const span = document.createElement("span");
        span.className = "headline-repulsion-char";
        span.textContent = word[ci];
        span.dataset.i = String(idx);
        chars[idx] = span;
        wordWrap.appendChild(span);
      }
      root.appendChild(wordWrap);
    });
  }

  buildDom();

  function tick() {
    mouseSmooth.x = lerp(mouseSmooth.x, mouseTarget.x, pointerSmoothing);
    mouseSmooth.y = lerp(mouseSmooth.y, mouseTarget.y, pointerSmoothing);

    const mx = mouseSmooth.x;
    const my = mouseSmooth.y;

    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const cur = offsets[i];
      if (!pos || !cur) continue;

      const dx = pos.cx - mx;
      const dy = pos.cy - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let targetX = 0;
      let targetY = 0;
      let targetRot = 0;
      let targetScale = 1;
      let targetOpacity = 1;

      if (dist < radius && dist > 0) {
        const u = 1 - dist / radius;
        const factor = smoothstep01(u) * smoothstep01(u);
        const pushX = (dx / dist) * strength * factor;
        const pushY = (dy / dist) * strength * factor;
        targetX = pushX;
        targetY = pushY;
        targetRot = pushX * 0.1;
        targetScale = 1 + factor * 0.08;
        targetOpacity = 0.94 + (1 - factor) * 0.06;
      }

      const newX = lerp(cur.x, targetX, charSmoothing);
      const newY = lerp(cur.y, targetY, charSmoothing);
      const newRot = lerp(cur.rot, targetRot, charSmoothing * 0.85);
      const newScale = lerp(cur.scale, targetScale, charSmoothing);
      const newOpacity = lerp(cur.opacity, targetOpacity, charSmoothing * 1.1);

      offsets[i] = {
        x: newX,
        y: newY,
        rot: newRot,
        scale: newScale,
        opacity: newOpacity,
      };

      const el = chars[i];
      if (el) {
        const rx = Math.round(newX * 100) / 100;
        const ry = Math.round(newY * 100) / 100;
        const rr = Math.round(newRot * 100) / 100;
        const rs = Math.round(newScale * 1000) / 1000;
        el.style.transform = `translate(${rx}px, ${ry}px) rotate(${rr}deg) scale(${rs})`;
        el.style.opacity = String(Math.round(newOpacity * 1000) / 1000);
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  function onMove(e) {
    const rect = root.getBoundingClientRect();
    mouseTarget.x = e.clientX - rect.left;
    mouseTarget.y = e.clientY - rect.top;
  }

  function onLeave() {
    mouseTarget.x = -9999;
    mouseTarget.y = -9999;
  }

  function scheduleMeasure() {
    measurePositions();
  }

  window.addEventListener("resize", scheduleMeasure);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      setTimeout(scheduleMeasure, 50);
    });
  } else {
    setTimeout(scheduleMeasure, 100);
  }

  root.addEventListener("mousemove", onMove);
  root.addEventListener("mouseleave", onLeave);

  scheduleMeasure();
  rafId = requestAnimationFrame(tick);

  window.addEventListener(
    "beforeunload",
    () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", scheduleMeasure);
    },
    { once: true }
  );
})();
