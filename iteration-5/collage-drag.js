/**
 * Pointer-drag for .collage-draggable (Iteration 5 pegboard).
 * Respects prefers-reduced-motion.
 */
(function initCollageDrag() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll(".collage-draggable").forEach((el) => {
    let startX = 0;
    let startY = 0;
    let baseX = 0;
    let baseY = 0;
    let dragging = false;

    el.style.cursor = "grab";
    el.style.touchAction = "none";

    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      dragging = true;
      el.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      const t = el.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
      baseX = t ? parseFloat(t[1]) : 0;
      baseY = t ? parseFloat(t[2]) : 0;
      el.style.cursor = "grabbing";
    });

    el.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      el.style.transform = `translate(${baseX + dx}px, ${baseY + dy}px)`;
    });

    function end(e) {
      if (!dragging) return;
      dragging = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch (_) {}
      el.style.cursor = "grab";
    }

    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  });
})();
