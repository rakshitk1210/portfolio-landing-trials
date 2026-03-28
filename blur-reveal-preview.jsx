import { useRef, useEffect, useState } from "react"

function BlurReveal({ text, fontSize, fontWeight, color, bg, stagger = 0.04, duration = 0.6, delay = 0.2, maxBlur = 20, direction = "left", slideUp = true }) {
    const [visible, setVisible] = useState(false)
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), delay * 1000)
        return () => clearTimeout(t)
    }, [delay])

    const tokens = []
    text.split(" ").forEach((word, wi, arr) => {
        for (const ch of word) tokens.push({ ch, type: "char" })
        if (wi < arr.length - 1) tokens.push({ ch: "\u00A0", type: "space" })
    })

    const nonSpace = tokens.filter(t => t.type !== "space").length
    const getIdx = (i) => {
        if (direction === "right") return nonSpace - 1 - i
        if (direction === "center") return Math.abs(i - (nonSpace - 1) / 2)
        return i
    }

    let ni = 0
    return (
        <div style={{ fontSize, fontWeight, fontFamily: "'Inter', 'Helvetica Neue', sans-serif", color, letterSpacing: "-0.02em", lineHeight: 1.2, display: "flex", flexWrap: "wrap", alignItems: "baseline" }}>
            {tokens.map((t, i) => {
                if (t.type === "space") return <span key={i} style={{ width: "0.3em", display: "inline-block" }}>&nbsp;</span>
                const idx = ni++
                const d = getIdx(idx) * stagger
                return (
                    <span key={i} style={{
                        display: "inline-block",
                        filter: visible ? "blur(0px)" : `blur(${maxBlur}px)`,
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : `translateY(${slideUp ? 12 : 0}px)`,
                        transition: `filter ${duration}s cubic-bezier(0.25,0.1,0.25,1) ${d}s, opacity ${duration}s cubic-bezier(0.25,0.1,0.25,1) ${d}s, transform ${duration}s cubic-bezier(0.25,0.1,0.25,1) ${d}s`,
                        willChange: "filter, opacity, transform",
                    }}>{t.ch}</span>
                )
            })}
        </div>
    )
}

export default function BlurRevealDemo() {
    const [key, setKey] = useState(0)
    const replay = () => setKey(k => k + 1)

    return (
        <div style={{ minHeight: "100vh", background: "#f0eeeb", fontFamily: "'Inter', 'Helvetica Neue', sans-serif", display: "flex", flexDirection: "column" }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

            {/* Header */}
            <div style={{ padding: "24px 40px", borderBottom: "1px solid #ddd8d0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#999" }}>Blur Reveal Text</h1>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#bbb" }}>Characters animate from blurred to sharp on load</p>
                </div>
                <button onClick={replay} style={{
                    padding: "8px 20px", border: "1px solid #c8c3bb", borderRadius: 99, background: "#1a1a1a", color: "#f0eeeb",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.04em"
                }}>
                    ↻ Replay
                </button>
            </div>

            {/* Demos */}
            <div key={key} style={{ flex: 1, padding: "48px 40px", display: "flex", flexDirection: "column", gap: 56 }}>
                {/* Hero */}
                <div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#b0aaa0", marginBottom: 12, fontWeight: 600 }}>Left → Right</div>
                    <BlurReveal text="Every effect comes with a purpose." fontSize={56} fontWeight={800} color="#1a1a1a" delay={0.3} />
                </div>

                {/* Right to left */}
                <div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#b0aaa0", marginBottom: 12, fontWeight: 600 }}>Right → Left</div>
                    <BlurReveal text="Design is how it works." fontSize={48} fontWeight={700} color="#2a2a2a" delay={1.2} direction="right" />
                </div>

                {/* Center out */}
                <div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#b0aaa0", marginBottom: 12, fontWeight: 600 }}>Center Out</div>
                    <BlurReveal text="The details are not the details." fontSize={44} fontWeight={600} color="#3a3a3a" delay={2.0} direction="center" maxBlur={28} />
                </div>

                {/* Subtle body text */}
                <div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#b0aaa0", marginBottom: 12, fontWeight: 600 }}>Body Text (subtle)</div>
                    <div style={{ maxWidth: 520 }}>
                        <BlurReveal text="Originally from Pittsburgh, PA. I love building tools and teams to help people and companies make better things." fontSize={22} fontWeight={400} color="#555" delay={2.8} maxBlur={12} stagger={0.025} duration={0.4} />
                    </div>
                </div>
            </div>

            {/* Footer hint */}
            <div style={{ padding: "16px 40px 20px", borderTop: "1px solid #ddd8d0", fontSize: 11, color: "#bbb", fontFamily: "'SF Mono', 'Courier New', monospace" }}>
                CSS <span style={{ color: "#999" }}>filter: blur()</span> + <span style={{ color: "#999" }}>opacity</span> + staggered <span style={{ color: "#999" }}>transition-delay</span> per character
            </div>
        </div>
    )
}
