"use client";
// Ported verbatim from the original static site (legacy-static/primitives.jsx).
import React from "react";

// primitives.jsx — shared icons, hooks, helpers.

// ── Icons (minimal stroke set, 1.6 stroke width pinned). ─────────────
export const Icon = ({ name, size = 20, stroke = 1.6, ...rest }) => {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: stroke,
    strokeLinecap: "round", strokeLinejoin: "round",
    ...rest,
  };
  switch (name) {
    case "cart":
      return (<svg {...common}><path d="M3 4h2l2.5 12.5a2 2 0 0 0 2 1.5h8a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="21" r="1.4"/><circle cx="18" cy="21" r="1.4"/></svg>);
    case "user":
      return (<svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>);
    case "search":
      return (<svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>);
    case "heart":
      return (<svg {...common}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>);
    case "heart-fill":
      return (<svg {...common} fill="currentColor"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>);
    case "arrow":
      return (<svg {...common}><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>);
    case "arrow-up-right":
      return (<svg {...common}><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>);
    case "x":
      return (<svg {...common}><path d="m6 6 12 12"/><path d="m18 6-12 12"/></svg>);
    case "check":
      return (<svg {...common}><path d="M4 12.5 10 18l10-12"/></svg>);
    case "download":
      return (<svg {...common}><path d="M12 4v12"/><path d="m6 11 6 6 6-6"/><path d="M4 20h16"/></svg>);
    case "star":
      return (<svg {...common} fill="currentColor" stroke="none"><path d="M12 2 14.5 8.7 22 9.3l-5.6 4.9L18 22l-6-3.6L6 22l1.6-7.8L2 9.3l7.5-.6Z"/></svg>);
    case "spark":
      return (<svg {...common}><path d="M12 3v6"/><path d="M12 15v6"/><path d="M3 12h6"/><path d="M15 12h6"/><path d="m6 6 3 3"/><path d="m15 15 3 3"/><path d="M18 6l-3 3"/><path d="m9 15-3 3"/></svg>);
    case "wave":
      return (<svg {...common}><path d="M2 12c2 0 2-4 5-4s3 8 6 8 3-8 6-8 3 4 5 4"/></svg>);
    case "menu":
      return (<svg {...common}><path d="M4 7h16"/><path d="M4 17h16"/></svg>);
    case "globe":
      return (<svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>);
    case "chev-right":
      return (<svg {...common}><path d="m9 6 6 6-6 6"/></svg>);
    case "chev-down":
      return (<svg {...common}><path d="m6 9 6 6 6-6"/></svg>);
    case "play":
      return (<svg {...common} fill="currentColor" stroke="none"><path d="M7 5v14l12-7Z"/></svg>);
    case "instagram":
      return (<svg {...common}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>);
    case "share":
      return (<svg {...common}><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="m8 7 4-4 4 4"/><path d="M12 3v13"/></svg>);
    case "mail":
      return (<svg {...common}><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg>);
    case "moon":
      return (<svg {...common}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>);
    case "sun":
      return (<svg {...common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.9 4.9l1.4 1.4"/><path d="M17.7 17.7l1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.9 19.1l1.4-1.4"/><path d="M17.7 6.3l1.4-1.4"/></svg>);
    case "arrow-up":
      return (<svg {...common}><path d="M12 20V5"/><path d="m6 11 6-6 6 6"/></svg>);
    case "trash":
      return (<svg {...common}><path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/><path d="M10 11v6M14 11v6"/></svg>);
    case "image":
      return (<svg {...common}><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="m21 16-4.5-4.5L7 20"/></svg>);
    case "upload":
      return (<svg {...common}><path d="M12 15V4"/><path d="m7 9 5-5 5 5"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>);
    default:
      return null;
  }
};

// ── Hook: detect scroll past threshold for header shrink. ────────────
export function useScrolled(threshold = 24) {
  const [s, setS] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setS(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return s;
}

// ── Hook: scroll progress 0..1 ────────────────────────────────────────
export function useScrollProgress() {
  const [p, setP] = React.useState(0);
  React.useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const h = doc.scrollHeight - window.innerHeight;
      setP(h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return p;
}

// ── Hook: in-viewport reveal. ─────────────────────────────────────────
// State: "idle" (server + first client render: fully visible), "wait"
// (below the fold after mount: hidden, off-screen so never seen), "in".
// Content is never hidden before JS runs, and anything in the viewport at
// mount stays visible: nothing above the fold depends on the observer.
export function useReveal(threshold = 0.12) {
  const ref = React.useRef(null);
  const [state, setState] = React.useState("idle");
  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return; // in view: leave visible
    setState("wait");
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setState("in"); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, state];
}

// ── Reveal wrapper: fade-up on enter for below-the-fold content. ──────
// The look lives in styles/motion.css ([data-reveal]); "idle" renders no
// attribute, so server HTML and in-view blocks are always fully visible.
export function Reveal({ children, delay = 0, as = "div", className = "", style = {}, ...rest }) {
  const [ref, state] = useReveal();
  const Tag = as;
  const delayStyle = state === "in" && delay ? { "--reveal-delay": `${delay}ms` } : null;
  return (
    <Tag
      ref={ref}
      className={className}
      data-reveal={state === "idle" ? undefined : state}
      style={delayStyle ? { ...delayStyle, ...style } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ── Price formatting (INR, the shop's only currency). ───────────────
export function fmtPriceINR(inr) {
  const n = Number(inr) || 0;
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

// ── Brand mark (wordmark glyph). Kept as-is; recolors via --joy tokens. ──
export function BrandMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="0" y="0" width="28" height="28" rx="9" fill="var(--joy-500)"/>
      <path d="M3 16 C 7 8, 9 24, 13 16 S 19 8, 21 16 S 25 24, 27 16" stroke="var(--joy-950)" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <circle cx="14" cy="7" r="2" fill="var(--joy-950)"/>
    </svg>
  );
}
