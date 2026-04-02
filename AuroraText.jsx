import { useState, useRef, useCallback, useEffect } from "react";

/**
 * AuroraText — Fluid gradient text that reveals living color where your cursor moves.
 *
 * Usage:
 *   <AuroraText>Paint me with light</AuroraText>
 *   <AuroraText fontSize={80} radius={250} palette="ember">Custom text</AuroraText>
 *
 * Props:
 *   children    — The text to display
 *   fontSize    — Font size in px (default: 64)
 *   fontWeight  — Font weight (default: 600)
 *   radius      — Base radius of each color blob in px (default: 200)
 *   maxBlobs    — Max paint spots kept alive (default: 8)
 *   palette     — "aurora" | "ember" | "cosmic" | or a custom array of {r,g,b} objects
 *   className   — Additional class name on the wrapper
 *   style       — Additional inline styles on the wrapper
 */

const PALETTES = {
  aurora: [
    { r: 180, g: 90, b: 220 },
    { r: 120, g: 100, b: 240 },
    { r: 230, g: 100, b: 160 },
    { r: 60, g: 180, b: 220 },
    { r: 80, g: 220, b: 200 },
    { r: 200, g: 80, b: 200 },
    { r: 100, g: 140, b: 250 },
    { r: 240, g: 120, b: 140 },
  ],
  ember: [
    { r: 216, g: 90, b: 48 },
    { r: 239, g: 159, b: 39 },
    { r: 212, g: 83, b: 126 },
    { r: 232, g: 74, b: 122 },
    { r: 240, g: 192, b: 80 },
    { r: 196, g: 64, b: 32 },
    { r: 245, g: 130, b: 106 },
    { r: 230, g: 176, b: 64 },
  ],
  cosmic: [
    { r: 127, g: 119, b: 221 },
    { r: 55, g: 138, b: 221 },
    { r: 29, g: 158, b: 117 },
    { r: 239, g: 159, b: 39 },
    { r: 212, g: 83, b: 126 },
    { r: 93, g: 202, b: 165 },
    { r: 175, g: 169, b: 236 },
    { r: 133, g: 183, b: 235 },
  ],
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(a, b, t) {
  return { r: lerp(a.r, b.r, t), g: lerp(a.g, b.g, t), b: lerp(a.b, b.b, t) };
}

function sampleColor(colors, t) {
  t = ((t % 1) + 1) % 1;
  const idx = t * colors.length;
  const i = Math.floor(idx);
  const f = idx - i;
  return lerpColor(colors[i % colors.length], colors[(i + 1) % colors.length], f);
}

function toRgb(c) {
  return `rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})`;
}

function toRgba(c, a) {
  return `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${a.toFixed(2)})`;
}

export default function AuroraText({
  children = "Aurora Text",
  fontSize = 64,
  fontWeight = 600,
  radius = 200,
  maxBlobs = 8,
  palette = "aurora",
  className = "",
  style = {},
}) {
  const wrapRef = useRef(null);
  const gradRef = useRef(null);
  const blobsRef = useRef([]);
  const stateRef = useRef({ hovering: false, raf: null, t: 0 });

  const colors = Array.isArray(palette) ? palette : PALETTES[palette] || PALETTES.aurora;

  const tick = useCallback(() => {
    const s = stateRef.current;
    const blobs = blobsRef.current;
    const grad = gradRef.current;
    s.t += 0.008;

    if (!s.hovering) {
      blobs.forEach((b) => (b.fade -= 0.015));
      while (blobs.length && blobs[0].fade <= 0) blobs.shift();
    }

    if (!s.hovering && !blobs.length) {
      s.raf = null;
      if (grad) grad.style.backgroundImage = "none";
      return;
    }

    const layers = blobs.map((b) => {
      const age = s.t - b.born;
      const breathe = Math.sin(age * 1.8 + b.phase) * 35;
      const wobX = Math.sin(s.t * 0.9 + b.phase) * 20;
      const wobY = Math.cos(s.t * 1.1 + b.phase + 1) * 20;
      const cx = Math.round(b.x + wobX);
      const cy = Math.round(b.y + wobY);
      const rad = Math.round(b.r + breathe);
      const radY = Math.round(rad * 0.85);
      const shift = s.t * b.speed + b.ci;

      const c1 = sampleColor(colors, shift);
      const c2 = sampleColor(colors, shift + 0.15);
      const c3 = sampleColor(colors, shift + 0.35);
      const c4 = sampleColor(colors, shift + 0.55);
      const a = Math.min(b.fade, 1);

      const fmt = a < 1 ? (c) => toRgba(c, a) : (c) => toRgb(c);

      return `radial-gradient(ellipse ${rad}px ${radY}px at ${cx}px ${cy}px, ${fmt(c1)} 0%, ${fmt(c2)} 30%, ${fmt(c3)} 60%, ${fmt(c4)} 80%, transparent 100%)`;
    });

    if (grad) {
      grad.style.backgroundImage = layers.length ? layers.join(",") : "none";
    }

    s.raf = requestAnimationFrame(tick);
  }, [colors]);

  const handleEnter = useCallback(() => {
    const s = stateRef.current;
    s.hovering = true;
    blobsRef.current.length = 0;
    if (!s.raf) tick();
  }, [tick]);

  const handleMove = useCallback(
    (e) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const blobs = blobsRef.current;
      const last = blobs[blobs.length - 1];
      const dx = last ? mx - last.x : 99;
      const dy = last ? my - last.y : 99;

      if (!last || Math.sqrt(dx * dx + dy * dy) > 12) {
        blobs.push({
          x: mx,
          y: my,
          born: stateRef.current.t,
          r: radius + Math.random() * (radius * 0.3),
          ci: Math.random() * colors.length,
          speed: 0.3 + Math.random() * 0.4,
          phase: Math.random() * Math.PI * 2,
          fade: 1,
        });
        if (blobs.length > maxBlobs) blobs.shift();
      } else {
        last.x = mx;
        last.y = my;
      }
    },
    [radius, maxBlobs, colors]
  );

  const handleLeave = useCallback(() => {
    stateRef.current.hovering = false;
  }, []);

  useEffect(() => {
    return () => {
      if (stateRef.current.raf) {
        cancelAnimationFrame(stateRef.current.raf);
      }
    };
  }, []);

  const sharedTextStyle = {
    fontFamily: "inherit",
    fontWeight,
    fontSize: `${fontSize}px`,
    lineHeight: 1.2,
    padding: "12px 4px",
    whiteSpace: "pre-wrap",
  };

  return (
    <div
      ref={wrapRef}
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{
        position: "relative",
        display: "inline-block",
        cursor: "default",
        ...style,
      }}
    >
      {/* Base black text — always visible */}
      <div style={{ ...sharedTextStyle, color: "currentColor" }}>{children}</div>

      {/* Gradient overlay — colors appear only near cursor */}
      <div
        ref={gradRef}
        style={{
          ...sharedTextStyle,
          position: "absolute",
          inset: 0,
          color: "transparent",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          pointerEvents: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
