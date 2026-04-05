/**
 * Framer Code Component — Floating pill nav (matches iteration-13).
 *
 * In Framer: Assets → Code → Create Code File → paste or import this file,
 * then drag the component onto the canvas. Edit everything from the Properties panel.
 */

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type NavLinkItem = {
    label?: string
    href?: string
}

export type FloatingPillNavBarProps = {
    /** Sticky bar at top of frame */
    sticky: boolean
    zIndex: number
    /** Max width of the nav column (px); matches iteration-13 desktop 800 */
    maxWidth: number
    /** Top padding of outer wrap (px) — desktop */
    wrapPaddingTop: number
    /** Top padding of outer wrap (px) — at/below mobile breakpoint */
    wrapPaddingTopMobile: number
    /** Horizontal padding of outer wrap (px) — mobile only */
    wrapPaddingXMobile: number
    /** Viewport width (px) at which hamburger + stacked links appear */
    mobileBreakpoint: number

    /** Pill fill — use alpha in color picker for glass effect */
    pillBackground: string
    backdropBlur: number
    borderRadius: number
    boxShadow: string
    /** Inner padding CSS string, e.g. "16px 32px" (desktop) */
    pillPaddingDesktop: string
    pillPaddingMobile: string

    logoText: string
    logoHref: string
    logoFontFamily: string
    logoFontSize: number
    logoFontWeight: number
    logoLetterSpacing: number

    linksFontFamily: string
    linksFontWeight: number
    linksFontSize: number
    linksLineHeight: number
    linksLetterSpacing: number
    linkGapDesktop: number
    linkGapMobile: number
    links: NavLinkItem[]

    textPrimary: string
    textSecondary: string
    toggleHoverBackground: string

    /** Accessible label for menu button when closed */
    menuOpenAriaLabel: string
    menuCloseAriaLabel: string
}

function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = React.useState(false)

    React.useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return
        const mq = window.matchMedia(query)
        const update = () => setMatches(mq.matches)
        update()
        mq.addEventListener("change", update)
        return () => mq.removeEventListener("change", update)
    }, [query])

    return matches
}

const menuIcon = (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
            d="M3 5.5h14M3 10h14M3 14.5h14"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
        />
    </svg>
)

const closeIcon = (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
            d="M5 5l10 10M15 5L5 15"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
        />
    </svg>
)

export default function FloatingPillNavBar(props: FloatingPillNavBarProps) {
    const {
        sticky,
        zIndex,
        maxWidth,
        wrapPaddingTop,
        wrapPaddingTopMobile,
        wrapPaddingXMobile,
        mobileBreakpoint,
        pillBackground,
        backdropBlur,
        borderRadius,
        boxShadow,
        pillPaddingDesktop,
        pillPaddingMobile,
        logoText,
        logoHref,
        logoFontFamily,
        logoFontSize,
        logoFontWeight,
        logoLetterSpacing,
        linksFontFamily,
        linksFontWeight,
        linksFontSize,
        linksLineHeight,
        linksLetterSpacing,
        linkGapDesktop,
        linkGapMobile,
        links,
        textPrimary,
        textSecondary,
        toggleHoverBackground,
        menuOpenAriaLabel,
        menuCloseAriaLabel,
    } = props

    const mq = `(max-width: ${mobileBreakpoint}px)`
    const isMobile = useMediaQuery(mq)
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        if (!isMobile) setOpen(false)
    }, [isMobile])

    React.useEffect(() => {
        if (typeof document === "undefined") return
        if (!isMobile || !open) return
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = prev
        }
    }, [isMobile, open])

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isMobile && open) {
                setOpen(false)
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [isMobile, open])

    const safeLinks = Array.isArray(links) ? links : []
    const pillPadding = isMobile ? pillPaddingMobile : pillPaddingDesktop
    const linkGap = isMobile ? linkGapMobile : linkGapDesktop
    const topPad = isMobile ? wrapPaddingTopMobile : wrapPaddingTop
    const horizontalPad = isMobile ? wrapPaddingXMobile : 0

    const wrapStyle: React.CSSProperties = {
        width: "100%",
        maxWidth,
        marginLeft: "auto",
        marginRight: "auto",
        paddingTop: topPad,
        paddingLeft: horizontalPad,
        paddingRight: horizontalPad,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        position: sticky ? ("sticky" as const) : ("relative" as const),
        top: sticky ? 0 : undefined,
        zIndex: sticky ? zIndex : undefined,
        boxSizing: "border-box",
    }

    const pillStyle: React.CSSProperties = {
        background: pillBackground,
        WebkitBackdropFilter: `blur(${backdropBlur}px)`,
        backdropFilter: `blur(${backdropBlur}px)`,
        borderRadius,
        boxShadow,
        padding: pillPadding,
        display: "flex",
        flexWrap: isMobile ? "wrap" : "nowrap",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        whiteSpace: isMobile ? "normal" : "nowrap",
        boxSizing: "border-box",
    }

    const logoStyle: React.CSSProperties = {
        fontFamily: logoFontFamily,
        fontWeight: logoFontWeight,
        fontSize: logoFontSize,
        lineHeight: 1,
        letterSpacing: logoLetterSpacing,
        textTransform: "uppercase",
        color: textPrimary,
        flexShrink: 0,
        textDecoration: "none",
    }

    const listStyle: React.CSSProperties = {
        display: isMobile ? (open ? "flex" : "none") : "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        gap: linkGap,
        margin: 0,
        padding: 0,
        paddingTop: isMobile && open ? 24 : 0,
        listStyle: "none",
        fontFamily: linksFontFamily,
        fontWeight: linksFontWeight,
        fontSize: linksFontSize,
        lineHeight: `${linksLineHeight}px`,
        letterSpacing: linksLetterSpacing,
        textTransform: "uppercase",
        color: textPrimary,
        width: isMobile ? "100%" : undefined,
        flexBasis: isMobile ? "100%" : undefined,
        boxSizing: "border-box",
    }

    const toggleStyle: React.CSSProperties = {
        display: isMobile ? "inline-flex" : "none",
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        padding: 0,
        margin: 0,
        border: "none",
        borderRadius: 999,
        background: "transparent",
        color: textPrimary,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
    }

    const linkStyle: React.CSSProperties = {
        display: isMobile ? "block" : "inline-block",
        color: "inherit",
        textDecoration: "none",
        width: isMobile ? "100%" : undefined,
        padding: isMobile ? "2px 0" : undefined,
        transition: "color 0.15s ease, opacity 0.15s ease",
    }

    return (
        <div style={wrapStyle}>
            <nav
                style={pillStyle}
                aria-label="Primary"
            >
                <a href={logoHref} style={logoStyle}>
                    {logoText}
                </a>
                <button
                    type="button"
                    style={toggleStyle}
                    aria-expanded={open}
                    aria-label={open ? menuCloseAriaLabel : menuOpenAriaLabel}
                    onClick={() => setOpen((v) => !v)}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = toggleHoverBackground
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent"
                    }}
                >
                    <span
                        style={{
                            display: open ? "none" : "block",
                            pointerEvents: "none",
                        }}
                    >
                        {menuIcon}
                    </span>
                    <span
                        style={{
                            display: open ? "block" : "none",
                            pointerEvents: "none",
                        }}
                    >
                        {closeIcon}
                    </span>
                </button>
                <ul style={listStyle}>
                    {safeLinks.map((item, i) => (
                        <li
                            key={`${item?.label ?? "link"}-${i}`}
                            style={{
                                width: isMobile ? "100%" : undefined,
                            }}
                        >
                            <a
                                href={item?.href ?? "#"}
                                style={linkStyle}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = textSecondary
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "inherit"
                                }}
                                onClick={() => {
                                    if (isMobile) setOpen(false)
                                }}
                            >
                                {item?.label ?? "Link"}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <style>{`
                @media (prefers-reduced-motion: reduce) {
                    nav a, nav button { transition: none !important; }
                }
            `}</style>
        </div>
    )
}

FloatingPillNavBar.defaultProps = {
    sticky: true,
    zIndex: 100,
    maxWidth: 800,
    wrapPaddingTop: 16,
    wrapPaddingTopMobile: 12,
    wrapPaddingXMobile: 16,
    mobileBreakpoint: 640,
    pillBackground: "rgba(255, 255, 255, 0.8)",
    backdropBlur: 4,
    borderRadius: 12,
    boxShadow: "0 0 8px 0 rgba(0, 0, 0, 0.08)",
    pillPaddingDesktop: "16px 32px",
    pillPaddingMobile: "6px 12px 6px 16px",
    logoText: "RK.",
    logoHref: "#profile",
    logoFontFamily: "'Sohne', 'Inter', system-ui, sans-serif",
    logoFontSize: 20,
    logoFontWeight: 600,
    logoLetterSpacing: 0.8,
    linksFontFamily: "'Groww Sans', 'Inter', system-ui, sans-serif",
    linksFontWeight: 500,
    linksFontSize: 14,
    linksLineHeight: 20,
    linksLetterSpacing: 0.56,
    linkGapDesktop: 32,
    linkGapMobile: 12,
    links: [
        { label: "Work", href: "#work" },
        { label: "AI BUILDS", href: "#" },
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" },
        { label: "Resume", href: "#" },
    ],
    textPrimary: "#353839",
    textSecondary: "#7f8283",
    toggleHoverBackground: "rgba(53, 56, 57, 0.06)",
    menuOpenAriaLabel: "Open menu",
    menuCloseAriaLabel: "Close menu",
}

addPropertyControls(FloatingPillNavBar, {
    sticky: {
        type: ControlType.Boolean,
        title: "Sticky",
        defaultValue: true,
    },
    zIndex: {
        type: ControlType.Number,
        title: "Z-index",
        min: 0,
        max: 9999,
        defaultValue: 100,
        displayStepper: true,
    },
    maxWidth: {
        type: ControlType.Number,
        title: "Max width",
        min: 280,
        max: 1400,
        defaultValue: 800,
        unit: "px",
        displayStepper: true,
    },
    wrapPaddingTop: {
        type: ControlType.Number,
        title: "Wrap pad top",
        min: 0,
        max: 64,
        defaultValue: 16,
        unit: "px",
    },
    wrapPaddingTopMobile: {
        type: ControlType.Number,
        title: "Wrap pad top (mobile)",
        min: 0,
        max: 48,
        defaultValue: 12,
        unit: "px",
    },
    wrapPaddingXMobile: {
        type: ControlType.Number,
        title: "Wrap pad X (mobile)",
        min: 0,
        max: 32,
        defaultValue: 16,
        unit: "px",
    },
    mobileBreakpoint: {
        type: ControlType.Number,
        title: "Mobile ≤ px",
        min: 400,
        max: 900,
        defaultValue: 640,
        unit: "px",
        displayStepper: true,
    },
    pillBackground: {
        type: ControlType.Color,
        title: "Pill background",
        defaultValue: "rgba(255, 255, 255, 0.8)",
    },
    backdropBlur: {
        type: ControlType.Number,
        title: "Blur",
        min: 0,
        max: 40,
        defaultValue: 4,
        unit: "px",
    },
    borderRadius: {
        type: ControlType.Number,
        title: "Radius",
        min: 0,
        max: 40,
        defaultValue: 12,
        unit: "px",
    },
    boxShadow: {
        type: ControlType.String,
        title: "Box shadow",
        defaultValue: "0 0 8px 0 rgba(0, 0, 0, 0.08)",
        placeholder: "CSS box-shadow",
    },
    pillPaddingDesktop: {
        type: ControlType.String,
        title: "Pill padding (desktop)",
        defaultValue: "16px 32px",
    },
    pillPaddingMobile: {
        type: ControlType.String,
        title: "Pill padding (mobile)",
        defaultValue: "6px 12px 6px 16px",
    },
    logoText: {
        type: ControlType.String,
        title: "Logo text",
        defaultValue: "RK.",
    },
    logoHref: {
        type: ControlType.String,
        title: "Logo link",
        defaultValue: "#profile",
    },
    logoFontFamily: {
        type: ControlType.String,
        title: "Logo font",
        defaultValue: "'Sohne', 'Inter', system-ui, sans-serif",
    },
    logoFontSize: {
        type: ControlType.Number,
        title: "Logo size",
        min: 12,
        max: 36,
        defaultValue: 20,
        unit: "px",
    },
    logoFontWeight: {
        type: ControlType.Number,
        title: "Logo weight",
        min: 400,
        max: 900,
        step: 100,
        defaultValue: 600,
        displayStepper: true,
    },
    logoLetterSpacing: {
        type: ControlType.Number,
        title: "Logo tracking",
        min: -2,
        max: 4,
        step: 0.1,
        defaultValue: 0.8,
        unit: "px",
    },
    linksFontFamily: {
        type: ControlType.String,
        title: "Links font",
        defaultValue: "'Groww Sans', 'Inter', system-ui, sans-serif",
    },
    linksFontWeight: {
        type: ControlType.Number,
        title: "Links weight",
        min: 400,
        max: 900,
        step: 100,
        defaultValue: 500,
        displayStepper: true,
    },
    linksFontSize: {
        type: ControlType.Number,
        title: "Links size",
        min: 10,
        max: 20,
        defaultValue: 14,
        unit: "px",
    },
    linksLineHeight: {
        type: ControlType.Number,
        title: "Links line height",
        min: 12,
        max: 32,
        defaultValue: 20,
        unit: "px",
    },
    linksLetterSpacing: {
        type: ControlType.Number,
        title: "Links tracking",
        min: 0,
        max: 4,
        step: 0.01,
        defaultValue: 0.56,
        unit: "px",
    },
    linkGapDesktop: {
        type: ControlType.Number,
        title: "Link gap (desktop)",
        min: 8,
        max: 64,
        defaultValue: 32,
        unit: "px",
    },
    linkGapMobile: {
        type: ControlType.Number,
        title: "Link gap (mobile)",
        min: 4,
        max: 32,
        defaultValue: 12,
        unit: "px",
    },
    links: {
        title: "Nav links",
        type: ControlType.Array,
        control: {
            type: ControlType.Object,
            controls: {
                label: {
                    type: ControlType.String,
                    title: "Label",
                    defaultValue: "Link",
                },
                href: {
                    type: ControlType.String,
                    title: "URL / #anchor",
                    defaultValue: "#",
                },
            },
        },
        defaultValue: [
            { label: "Work", href: "#work" },
            { label: "AI BUILDS", href: "#" },
            { label: "About", href: "#about" },
            { label: "Contact", href: "#contact" },
            { label: "Resume", href: "#" },
        ],
    },
    textPrimary: {
        type: ControlType.Color,
        title: "Text",
        defaultValue: "#353839",
    },
    textSecondary: {
        type: ControlType.Color,
        title: "Text hover",
        defaultValue: "#7f8283",
    },
    toggleHoverBackground: {
        type: ControlType.Color,
        title: "Toggle hover",
        defaultValue: "rgba(53, 56, 57, 0.06)",
    },
    menuOpenAriaLabel: {
        type: ControlType.String,
        title: "ARIA (closed)",
        defaultValue: "Open menu",
    },
    menuCloseAriaLabel: {
        type: ControlType.String,
        title: "ARIA (open)",
        defaultValue: "Close menu",
    },
})
