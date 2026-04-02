// Blur Reveal Text — Framer Code Component (Full Controls)
// 1. In Framer → Assets panel → Code → New File
// 2. Paste this entire file
// 3. Drag the component onto your canvas
// 4. Edit everything from the property panel on the right

import { useRef, useEffect, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

function BlurRevealText({
    // --- Content ---
    text = "Every effect comes with a purpose.",

    // --- Typography ---
    fontSize = 64,
    fontSizeMobile = 36,
    responsiveBreakpoint = 768,
    font = "Inter",
    customFont = "",
    fontWeight = 700,
    fontStyle = "normal",
    lineHeight = 1.2,
    letterSpacing = -0.02,
    wordSpacing = 0,
    color = "#1a1a1a",
    textTransform = "none",
    textDecoration = "none",

    // --- Layout ---
    textAlign = "left",
    maxWidth = 100,
    paddingTop = 0,
    paddingBottom = 0,
    paddingLeft = 0,
    paddingRight = 0,

    // --- Animation ---
    maxBlur = 20,
    animateBy = "character",
    staggerDelay = 0.04,
    duration = 0.6,
    startDelay = 0.2,
    easing = "cubic-bezier(0.25, 0.1, 0.25, 1)",
    customEasing = "",
    direction = "left",
    triggerOn = "load",
    scrollThreshold = 0.2,
    replayOnScroll = false,

    // --- Slide ---
    enableSlide = true,
    slideDirection = "up",
    slideDistance = 12,

    // --- Scale ---
    enableScale = false,
    scaleFrom = 0.9,

    // --- Opacity ---
    startOpacity = 0,

    // --- Advanced ---
    enableGPU = true,
    animateOnCanvas = false,
}) {
    const containerRef = useRef(null)
    const [isVisible, setIsVisible] = useState(false)
    const [currentFontSize, setCurrentFontSize] = useState(fontSize)

    const fontFamily = font === "Custom" && customFont ? customFont : font
    const resolvedEasing = easing === "custom" && customEasing ? customEasing : easing

    // Responsive font size
    useEffect(() => {
        const check = () => {
            const w = window.innerWidth
            setCurrentFontSize(w <= responsiveBreakpoint ? fontSizeMobile : fontSize)
        }
        check()
        window.addEventListener("resize", check)
        return () => window.removeEventListener("resize", check)
    }, [fontSize, fontSizeMobile, responsiveBreakpoint])

    // Canvas preview — show resolved state immediately
    useEffect(() => {
        if (!animateOnCanvas) {
            const isCanvas =
                window.location.href.includes("framer.com") &&
                !window.location.href.includes("preview")
            if (isCanvas) {
                setIsVisible(true)
                return
            }
        }
    }, [animateOnCanvas])

    // Load trigger
    useEffect(() => {
        if (triggerOn === "load") {
            const timer = setTimeout(() => setIsVisible(true), startDelay * 1000)
            return () => clearTimeout(timer)
        }
    }, [triggerOn, startDelay])

    // Scroll trigger
    useEffect(() => {
        if (triggerOn !== "scroll") return
        const el = containerRef.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    if (!replayOnScroll) observer.disconnect()
                } else if (replayOnScroll) {
                    setIsVisible(false)
                }
            },
            { threshold: scrollThreshold }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [triggerOn, scrollThreshold, replayOnScroll])

    // Stagger index based on direction
    const getStaggerIndex = (i, total) => {
        switch (direction) {
            case "right":
                return total - 1 - i
            case "center": {
                const mid = (total - 1) / 2
                return Math.abs(i - mid)
            }
            case "edges": {
                const mid = (total - 1) / 2
                return mid - Math.abs(i - mid)
            }
            case "random":
                return (i * 7 + 3) % total
            default:
                return i
        }
    }

    // Slide transform
    const getSlideTransform = (active) => {
        if (!enableSlide || active) return "translate(0px, 0px)"
        switch (slideDirection) {
            case "up":
                return `translate(0px, ${slideDistance}px)`
            case "down":
                return `translate(0px, ${-slideDistance}px)`
            case "left":
                return `translate(${slideDistance}px, 0px)`
            case "right":
                return `translate(${-slideDistance}px, 0px)`
            default:
                return "translate(0px, 0px)"
        }
    }

    // Build animated span helper
    const renderAnimatedSpan = (content, idx, totalCount, key) => {
        const staggerIdx = getStaggerIndex(idx, totalCount)
        const delay = staggerIdx * staggerDelay
        const scaleVal = enableScale ? (isVisible ? 1 : scaleFrom) : 1
        const slideTransform = getSlideTransform(isVisible)
        const fullTransform = `${slideTransform} scale(${scaleVal})`

        return (
            <span
                key={key}
                style={{
                    display: "inline-block",
                    filter: isVisible ? "blur(0px)" : `blur(${maxBlur}px)`,
                    opacity: isVisible ? 1 : startOpacity,
                    transform: fullTransform,
                    transition: [
                        `filter ${duration}s ${resolvedEasing} ${delay}s`,
                        `opacity ${duration}s ${resolvedEasing} ${delay}s`,
                        `transform ${duration}s ${resolvedEasing} ${delay}s`,
                    ].join(", "),
                    willChange: enableGPU ? "filter, opacity, transform" : "auto",
                }}
            >
                {content}
            </span>
        )
    }

    // Build elements based on animateBy mode
    const buildElements = () => {
        if (animateBy === "character") {
            // Group characters by word, wrap each word in a nowrap container
            const words = text.split(" ")
            let globalCharIdx = 0
            const totalChars = text.replace(/ /g, "").length
            const elements = []

            words.forEach((word, wi) => {
                const wordChars = []
                for (let ci = 0; ci < word.length; ci++) {
                    wordChars.push(
                        renderAnimatedSpan(word[ci], globalCharIdx, totalChars, `c-${globalCharIdx}`)
                    )
                    globalCharIdx++
                }
                // Wrap word characters in a nowrap container so they never split
                elements.push(
                    <span
                        key={`w-${wi}`}
                        style={{ display: "inline-flex", whiteSpace: "nowrap" }}
                    >
                        {wordChars}
                    </span>
                )
                // Add space between words
                if (wi < words.length - 1) {
                    elements.push(
                        <span
                            key={`s-${wi}`}
                            style={{ display: "inline-block", width: "0.3em" }}
                        >
                            {"\u00A0"}
                        </span>
                    )
                }
            })
            return elements

        } else if (animateBy === "word") {
            const words = text.split(" ")
            const elements = []
            words.forEach((word, wi) => {
                elements.push(
                    renderAnimatedSpan(word, wi, words.length, `w-${wi}`)
                )
                if (wi < words.length - 1) {
                    elements.push(
                        <span
                            key={`s-${wi}`}
                            style={{ display: "inline-block", width: "0.3em" }}
                        >
                            {"\u00A0"}
                        </span>
                    )
                }
            })
            return elements

        } else {
            // Line mode — split by \n
            const lines = text.split("\n")
            const elements = []
            lines.forEach((line, li) => {
                elements.push(
                    renderAnimatedSpan(line, li, lines.length, `l-${li}`)
                )
                if (li < lines.length - 1) {
                    elements.push(
                        <div key={`br-${li}`} style={{ flexBasis: "100%", height: 0 }} />
                    )
                }
            })
            return elements
        }
    }

    const justifyMap = {
        left: "flex-start",
        center: "center",
        right: "flex-end",
    }

    return (
        <div
            ref={containerRef}
            style={{
                fontSize: currentFontSize,
                fontFamily,
                fontWeight,
                fontStyle,
                lineHeight,
                letterSpacing: `${letterSpacing}em`,
                wordSpacing: `${wordSpacing}em`,
                textTransform,
                textDecoration,
                color,
                textAlign,
                width: "100%",
                maxWidth: maxWidth < 100 ? `${maxWidth}%` : "none",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: justifyMap[textAlign] || "flex-start",
                alignItems: "baseline",
                padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
                boxSizing: "border-box",
            }}
        >
            {buildElements()}
        </div>
    )
}

// ============================================================
// FRAMER PROPERTY CONTROLS
// ============================================================

addPropertyControls(BlurRevealText, {
    // ── CONTENT ──────────────────────────
    text: {
        type: ControlType.String,
        title: "Text",
        defaultValue: "Every effect comes with a purpose.",
        displayTextArea: true,
    },

    // ── TYPOGRAPHY ───────────────────────
    fontSize: {
        type: ControlType.Number,
        title: "Font Size",
        defaultValue: 64,
        min: 8,
        max: 300,
        step: 1,
        unit: "px",
    },
    fontSizeMobile: {
        type: ControlType.Number,
        title: "Mobile Font Size",
        defaultValue: 36,
        min: 8,
        max: 200,
        step: 1,
        unit: "px",
        description: "Font size below the breakpoint",
    },
    responsiveBreakpoint: {
        type: ControlType.Number,
        title: "Breakpoint",
        defaultValue: 768,
        min: 320,
        max: 1440,
        step: 1,
        unit: "px",
        description: "Width below which mobile font size kicks in",
    },
    font: {
        type: ControlType.Enum,
        title: "Font",
        defaultValue: "Inter",
        options: [
            "Inter",
            "Georgia",
            "Times New Roman",
            "Garamond",
            "Palatino",
            "Arial",
            "Helvetica Neue",
            "Helvetica",
            "Verdana",
            "Trebuchet MS",
            "Gill Sans",
            "Futura",
            "Avenir",
            "Courier New",
            "Monaco",
            "SF Pro Display",
            "system-ui",
            "Custom",
        ],
        optionTitles: [
            "Inter",
            "Georgia",
            "Times New Roman",
            "Garamond",
            "Palatino",
            "Arial",
            "Helvetica Neue",
            "Helvetica",
            "Verdana",
            "Trebuchet MS",
            "Gill Sans",
            "Futura",
            "Avenir",
            "Courier New",
            "Monaco",
            "SF Pro Display",
            "System UI",
            "Custom →",
        ],
        description: "Choose Custom to use any font loaded in your Framer project",
    },
    customFont: {
        type: ControlType.String,
        title: "Custom Font",
        defaultValue: "",
        placeholder: "e.g. Söhne, sans-serif",
        description: "Exact font name from your Framer project",
        hidden: (props) => props.font !== "Custom",
    },
    fontWeight: {
        type: ControlType.Enum,
        title: "Weight",
        defaultValue: 700,
        options: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        optionTitles: [
            "100 · Thin",
            "200 · Extra Light",
            "300 · Light",
            "400 · Regular",
            "500 · Medium",
            "600 · Semi Bold",
            "700 · Bold",
            "800 · Extra Bold",
            "900 · Black",
        ],
    },
    fontStyle: {
        type: ControlType.Enum,
        title: "Style",
        defaultValue: "normal",
        options: ["normal", "italic"],
        optionTitles: ["Normal", "Italic"],
    },
    lineHeight: {
        type: ControlType.Number,
        title: "Line Height",
        defaultValue: 1.2,
        min: 0.5,
        max: 4,
        step: 0.05,
    },
    letterSpacing: {
        type: ControlType.Number,
        title: "Letter Spacing",
        defaultValue: -0.02,
        min: -0.15,
        max: 1,
        step: 0.005,
        unit: "em",
    },
    wordSpacing: {
        type: ControlType.Number,
        title: "Word Spacing",
        defaultValue: 0,
        min: -0.2,
        max: 1,
        step: 0.01,
        unit: "em",
    },
    color: {
        type: ControlType.Color,
        title: "Color",
        defaultValue: "#1a1a1a",
    },
    textTransform: {
        type: ControlType.Enum,
        title: "Transform",
        defaultValue: "none",
        options: ["none", "uppercase", "lowercase", "capitalize"],
        optionTitles: ["None", "UPPERCASE", "lowercase", "Capitalize"],
    },
    textDecoration: {
        type: ControlType.Enum,
        title: "Decoration",
        defaultValue: "none",
        options: ["none", "underline", "line-through"],
        optionTitles: ["None", "Underline", "Strikethrough"],
    },

    // ── LAYOUT ───────────────────────────
    textAlign: {
        type: ControlType.Enum,
        title: "Alignment",
        defaultValue: "left",
        options: ["left", "center", "right"],
        optionTitles: ["Left", "Center", "Right"],
    },
    maxWidth: {
        type: ControlType.Number,
        title: "Max Width",
        defaultValue: 100,
        min: 20,
        max: 100,
        step: 1,
        unit: "%",
        description: "Constrain text width (100% = full)",
    },
    paddingTop: {
        type: ControlType.Number,
        title: "Pad Top",
        defaultValue: 0,
        min: 0,
        max: 200,
        step: 1,
        unit: "px",
    },
    paddingBottom: {
        type: ControlType.Number,
        title: "Pad Bottom",
        defaultValue: 0,
        min: 0,
        max: 200,
        step: 1,
        unit: "px",
    },
    paddingLeft: {
        type: ControlType.Number,
        title: "Pad Left",
        defaultValue: 0,
        min: 0,
        max: 200,
        step: 1,
        unit: "px",
    },
    paddingRight: {
        type: ControlType.Number,
        title: "Pad Right",
        defaultValue: 0,
        min: 0,
        max: 200,
        step: 1,
        unit: "px",
    },

    // ── ANIMATION ────────────────────────
    triggerOn: {
        type: ControlType.Enum,
        title: "Trigger",
        defaultValue: "load",
        options: ["load", "scroll"],
        optionTitles: ["On Page Load", "On Scroll Into View"],
    },
    scrollThreshold: {
        type: ControlType.Number,
        title: "Scroll Threshold",
        defaultValue: 0.2,
        min: 0,
        max: 1,
        step: 0.05,
        description: "How much must be visible to trigger (0–1)",
        hidden: (props) => props.triggerOn !== "scroll",
    },
    replayOnScroll: {
        type: ControlType.Boolean,
        title: "Replay on Scroll",
        defaultValue: false,
        description: "Re-blur when scrolled out, re-reveal on return",
        hidden: (props) => props.triggerOn !== "scroll",
    },
    animateBy: {
        type: ControlType.Enum,
        title: "Animate By",
        defaultValue: "character",
        options: ["character", "word", "line"],
        optionTitles: ["Character", "Word", "Line"],
        description: "Line mode splits on line breaks in the text",
    },
    direction: {
        type: ControlType.Enum,
        title: "Reveal Direction",
        defaultValue: "left",
        options: ["left", "right", "center", "edges", "random"],
        optionTitles: ["Left → Right", "Right → Left", "Center → Out", "Edges → In", "Random"],
    },
    maxBlur: {
        type: ControlType.Number,
        title: "Blur Amount",
        defaultValue: 20,
        min: 1,
        max: 60,
        step: 1,
        unit: "px",
    },
    startOpacity: {
        type: ControlType.Number,
        title: "Start Opacity",
        defaultValue: 0,
        min: 0,
        max: 1,
        step: 0.05,
        description: "Opacity before reveal (0 = invisible)",
    },
    staggerDelay: {
        type: ControlType.Number,
        title: "Stagger",
        defaultValue: 0.04,
        min: 0,
        max: 0.3,
        step: 0.005,
        unit: "s",
    },
    duration: {
        type: ControlType.Number,
        title: "Duration",
        defaultValue: 0.6,
        min: 0.05,
        max: 3,
        step: 0.05,
        unit: "s",
    },
    startDelay: {
        type: ControlType.Number,
        title: "Start Delay",
        defaultValue: 0.2,
        min: 0,
        max: 5,
        step: 0.1,
        unit: "s",
    },
    easing: {
        type: ControlType.Enum,
        title: "Easing",
        defaultValue: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        options: [
            "cubic-bezier(0.25, 0.1, 0.25, 1)",
            "cubic-bezier(0.33, 1, 0.68, 1)",
            "cubic-bezier(0.22, 1, 0.36, 1)",
            "cubic-bezier(0.16, 1, 0.3, 1)",
            "cubic-bezier(0, 0, 0.2, 1)",
            "cubic-bezier(0.34, 1.56, 0.64, 1)",
            "ease-in-out",
            "linear",
            "custom",
        ],
        optionTitles: [
            "Smooth",
            "Ease Out",
            "Ease Out Quint",
            "Ease Out Expo",
            "Sharp Decel",
            "Bouncy",
            "Ease In Out",
            "Linear",
            "Custom →",
        ],
    },
    customEasing: {
        type: ControlType.String,
        title: "Custom Easing",
        defaultValue: "",
        placeholder: "cubic-bezier(0.5, 0, 0, 1)",
        hidden: (props) => props.easing !== "custom",
    },

    // ── SLIDE MOTION ─────────────────────
    enableSlide: {
        type: ControlType.Boolean,
        title: "Enable Slide",
        defaultValue: true,
    },
    slideDirection: {
        type: ControlType.Enum,
        title: "Slide From",
        defaultValue: "up",
        options: ["up", "down", "left", "right"],
        optionTitles: ["Below ↑", "Above ↓", "Right →", "Left ←"],
        hidden: (props) => !props.enableSlide,
    },
    slideDistance: {
        type: ControlType.Number,
        title: "Slide Distance",
        defaultValue: 12,
        min: 0,
        max: 100,
        step: 1,
        unit: "px",
        hidden: (props) => !props.enableSlide,
    },

    // ── SCALE MOTION ─────────────────────
    enableScale: {
        type: ControlType.Boolean,
        title: "Enable Scale",
        defaultValue: false,
    },
    scaleFrom: {
        type: ControlType.Number,
        title: "Scale From",
        defaultValue: 0.9,
        min: 0.1,
        max: 2,
        step: 0.05,
        description: "Starting scale (1 = normal, <1 = smaller, >1 = bigger)",
        hidden: (props) => !props.enableScale,
    },

    // ── ADVANCED ─────────────────────────
    enableGPU: {
        type: ControlType.Boolean,
        title: "GPU Acceleration",
        defaultValue: true,
        description: "Smoother animation, slightly more memory",
    },
    animateOnCanvas: {
        type: ControlType.Boolean,
        title: "Animate on Canvas",
        defaultValue: false,
        description: "Play animation inside the Framer editor too",
    },
})

export default BlurRevealText
