import { useState, useEffect, useRef, useCallback } from "react";

function DistortedText({
  text,
  fontSize = 32,
  lineHeight = 1.6,
  color = "#3a3a3a",
  fontFamily = "'Georgia', serif",
  fontWeight = 400,
  radius = 120,
  strength = 60,
}) {
  const containerRef = useRef(null);
  const charsRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(null);
  const positionsRef = useRef([]);
  const currentOffsetsRef = useRef([]);

  // Measure character positions once on mount / resize
  const measurePositions = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    positionsRef.current = charsRef.current.map((el) => {
      if (!el) return { cx: 0, cy: 0 };
      const rect = el.getBoundingClientRect();
      return {
        cx: rect.left + rect.width / 2 - containerRect.left,
        cy: rect.top + rect.height / 2 - containerRect.top,
      };
    });
    if (!currentOffsetsRef.current.length) {
      currentOffsetsRef.current = positionsRef.current.map(() => ({
        x: 0,
        y: 0,
        rot: 0,
        scale: 1,
        opacity: 1,
      }));
    }
  }, []);

  useEffect(() => {
    measurePositions();
    window.addEventListener("resize", measurePositions);
    return () => window.removeEventListener("resize", measurePositions);
  }, [measurePositions, text]);

  // Re-measure after fonts load
  useEffect(() => {
    document.fonts?.ready?.then(() => {
      setTimeout(measurePositions, 50);
    });
  }, [measurePositions]);

  // Animation loop — lerp offsets toward target
  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;
    const smoothing = 0.15;

    const tick = () => {
      const mouse = mouseRef.current;
      const positions = positionsRef.current;
      const offsets = currentOffsetsRef.current;
      if (!positions.length || !offsets.length) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      let needsUpdate = false;

      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        const cur = offsets[i];
        if (!pos || !cur) continue;

        const dx = pos.cx - mouse.x;
        const dy = pos.cy - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetX = 0,
          targetY = 0,
          targetRot = 0,
          targetScale = 1,
          targetOpacity = 1;

        if (dist < radius && dist > 0) {
          const factor = Math.pow(1 - dist / radius, 2);
          const pushX = (dx / dist) * strength * factor;
          const pushY = (dy / dist) * strength * factor;
          targetX = pushX;
          targetY = pushY;
          targetRot = (pushX * 0.3);
          targetScale = 1 + factor * 0.25;
          targetOpacity = 0.4 + (1 - factor) * 0.6;
        }

        const newX = lerp(cur.x, targetX, smoothing);
        const newY = lerp(cur.y, targetY, smoothing);
        const newRot = lerp(cur.rot, targetRot, smoothing);
        const newScale = lerp(cur.scale, targetScale, smoothing);
        const newOpacity = lerp(cur.opacity, targetOpacity, smoothing);

        if (
          Math.abs(newX - cur.x) > 0.01 ||
          Math.abs(newY - cur.y) > 0.01 ||
          Math.abs(newRot - cur.rot) > 0.01
        ) {
          needsUpdate = true;
        }

        offsets[i] = { x: newX, y: newY, rot: newRot, scale: newScale, opacity: newOpacity };

        const el = charsRef.current[i];
        if (el) {
          el.style.transform = `translate(${newX}px, ${newY}px) rotate(${newRot}deg) scale(${newScale})`;
          el.style.opacity = newOpacity;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [radius, strength]);

  const handleMouseMove = useCallback(
    (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 };
  }, []);

  // Build character elements, preserving words for natural wrapping
  const words = text.split(" ");
  let charIndex = 0;
  const elements = [];

  words.forEach((word, wi) => {
    const wordChars = [];
    for (let ci = 0; ci < word.length; ci++) {
      const idx = charIndex++;
      wordChars.push(
        <span
          key={`c-${idx}`}
          ref={(el) => (charsRef.current[idx] = el)}
          style={{
            display: "inline-block",
            willChange: "transform, opacity",
            fontSize,
            fontFamily,
            fontWeight,
            color,
          }}
        >
          {word[ci]}
        </span>
      );
    }
    elements.push(
      <span key={`w-${wi}`} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
        {wordChars}
      </span>
    );
    // Add space between words
    if (wi < words.length - 1) {
      const spaceIdx = charIndex++;
      elements.push(
        <span
          key={`s-${spaceIdx}`}
          ref={(el) => (charsRef.current[spaceIdx] = el)}
          style={{ display: "inline-block", width: fontSize * 0.3 }}
        >
          {"\u00A0"}
        </span>
      );
    }
  });

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        lineHeight,
        cursor: "default",
        position: "relative",
        padding: "20px 0",
      }}
    >
      {elements}
    </div>
  );
}

export default function TextRepulsionDemo() {
  const [radius, setRadius] = useState(120);
  const [strength, setStrength] = useState(60);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f2ed",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        color: "#2a2a2a",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Instrument+Serif:ital@0;1&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div style={{ padding: "28px 40px 20px", borderBottom: "1px solid #e0dbd4" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#999",
            }}
          >
            Cursor Text Repulsion
          </h1>
          <span style={{ fontSize: 12, color: "#bbb" }}>— move your mouse over the text</span>
        </div>
      </div>

      {/* Main demo area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* About section — mimics the screenshot */}
        <div style={{ padding: "48px 40px 20px" }}>
          <div style={{ fontSize: 13, color: "#999", fontWeight: 500, letterSpacing: "0.04em", marginBottom: 8 }}>
            About
          </div>
          <div style={{ maxWidth: 650 }}>
            <DistortedText
              text="Designer originally from Pittsburgh, PA. I love building tools and teams to help people and companies make better things."
              fontSize={30}
              lineHeight={1.55}
              color="#3a3a3a"
              fontFamily="'Source Serif 4', 'Georgia', serif"
              fontWeight={400}
              radius={radius}
              strength={strength}
            />
          </div>
        </div>

        {/* Second example */}
        <div style={{ padding: "20px 40px 48px" }}>
          <div style={{ fontSize: 13, color: "#999", fontWeight: 500, letterSpacing: "0.04em", marginBottom: 8 }}>
            Work
          </div>
          <div style={{ maxWidth: 650 }}>
            <DistortedText
              text="Currently designing products at a small studio in Brooklyn. Previously at Google and Stripe."
              fontSize={30}
              lineHeight={1.55}
              color="#3a3a3a"
              fontFamily="'Source Serif 4', 'Georgia', serif"
              fontWeight={400}
              radius={radius}
              strength={strength}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          padding: "20px 40px",
          borderTop: "1px solid #e0dbd4",
          background: "#efeae3",
          display: "flex",
          gap: 32,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ fontSize: 12, color: "#888", fontWeight: 500, minWidth: 50 }}>Radius</label>
          <input
            type="range"
            min={50}
            max={250}
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            style={{ width: 120, accentColor: "#999" }}
          />
          <span style={{ fontSize: 11, color: "#aaa", fontVariantNumeric: "tabular-nums", minWidth: 30 }}>
            {radius}px
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ fontSize: 12, color: "#888", fontWeight: 500, minWidth: 58 }}>Strength</label>
          <input
            type="range"
            min={20}
            max={150}
            value={strength}
            onChange={(e) => setStrength(parseInt(e.target.value))}
            style={{ width: 120, accentColor: "#999" }}
          />
          <span style={{ fontSize: 11, color: "#aaa", fontVariantNumeric: "tabular-nums", minWidth: 30 }}>
            {strength}px
          </span>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#bbb",
            lineHeight: 1.5,
            marginLeft: "auto",
            maxWidth: 320,
            textAlign: "right",
          }}
        >
          Each letter measures its distance to the cursor and gets pushed away proportionally. Letters far from the cursor stay in place.
        </div>
      </div>
    </div>
  );
}
