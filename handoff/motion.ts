/**
 * handoff/motion.ts
 * ──────────────────────────────────────────────────────────────────────────
 * JoyWaveDigital motion system. Framer Motion variants + named easings,
 * durations, and transitions. Drop into `lib/motion.ts` and import
 * per-component.
 *
 * Hard rules baked in:
 * - 60fps budget. No animations on layout-shifting properties (use transform
 *   + opacity only, with rare exceptions where width/height matter — header
 *   pill collapse).
 * - prefers-reduced-motion: reduce → all transitions become 1ms cross-fades.
 *   Honor the `useReducedMotion()` hook at the variant level for fine grain.
 * - View Transitions API used where supported; Framer fallback otherwise.
 * ──────────────────────────────────────────────────────────────────────────
 */

import type { Variants, Transition } from "framer-motion";

/* ── Named easings (4) ─────────────────────────────────────────────────── */

export const easing = {
  /** Default UI motion. Out-soft (cubic-bezier(.22, 1, .36, 1)). Hover, fade,
   *  reveal, most transitions. */
  outSoft: [0.22, 1, 0.36, 1] as const,

  /** Bouncy spring-feel curve. Used for tap, heart-pop, badge-pop. */
  outSpring: [0.34, 1.56, 0.64, 1] as const,

  /** Exits and dismisses. Short, decisive. */
  inSoft: [0.4, 0, 1, 1] as const,

  /** Layout, drawer, modal. Symmetrical for in-and-out transitions. */
  inOutSoft: [0.65, 0, 0.35, 1] as const,
} as const;

/* ── Named durations (4) ───────────────────────────────────────────────── */

export const duration = {
  /** Hover lift, tap, focus paint. */
  fast: 0.12,

  /** Default transition. Reveal, state changes. */
  base: 0.22,

  /** Modal open, header collapse, route transition. */
  med: 0.38,

  /** Drawer slide, sequenced layout shift. */
  slow: 0.64,

  /** Header pill-on-scroll (Material-buttery feel). */
  buttery: 0.7,
} as const;

/* ── Named transitions (compose) ───────────────────────────────────────── */

const t = (d: number, e = easing.outSoft): Transition => ({ duration: d, ease: e });

export const transitions = {
  hoverLift:    t(duration.fast, easing.outSoft),
  tap:          t(duration.fast, easing.outSoft),
  reveal:       t(duration.base, easing.outSoft),
  badgePop:     t(duration.base, easing.outSpring),
  layout:       t(duration.med,  easing.inOutSoft),
  drawerOpen:   t(duration.slow, easing.inOutSoft),
  modalOpen:    t(duration.med,  easing.outSoft),
  headerShrink: t(duration.buttery, [0.4, 0, 0.2, 1]),
} as const;

/* ── Variant atoms ─────────────────────────────────────────────────────── */

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: transitions.reveal },
  exit:    { opacity: 0, y: -8, transition: t(duration.fast, easing.inSoft) },
};

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: transitions.reveal },
  exit:    { opacity: 0, transition: t(duration.fast, easing.inSoft) },
};

/** List stagger. Use `stagger` as the parent's variants and `fadeUp` as the
 *  child's. Delay between children is 60ms by default. */
export const stagger = (delay = 0.06): Variants => ({
  visible: { transition: { staggerChildren: delay, delayChildren: 0.05 } },
});

/** Page-level enter/exit, paired with the View Transitions API where
 *  available. Framer fallback used otherwise. */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 16 },
  enter:   { opacity: 1, y: 0, transition: transitions.layout },
  exit:    { opacity: 0, y: -8, transition: t(duration.fast, easing.inSoft) },
};

/* ── Drawer (cart, mobile filter) ───────────────────────────────────────── */

export const drawerRight: Variants = {
  closed: { x: "100%", transition: transitions.drawerOpen },
  open:   { x: 0,      transition: transitions.drawerOpen },
};

export const drawerBottom: Variants = {
  closed: { y: "100%", transition: transitions.drawerOpen },
  open:   { y: 0,      transition: transitions.drawerOpen },
};

export const scrim: Variants = {
  closed: { opacity: 0, transition: t(duration.med, easing.outSoft) },
  open:   { opacity: 1, transition: t(duration.med, easing.outSoft) },
};

/* ── Modal (Radix Dialog wrapper, sign-in modal, price-changed dialog) ──── */

export const modal: Variants = {
  closed: { opacity: 0, scale: 0.96, transition: t(duration.fast, easing.inSoft) },
  open:   { opacity: 1, scale: 1,    transition: transitions.modalOpen },
};

/* ── Badge pop (cart count bump, heart toggle, status change) ──────────── */

export const badgePop: Variants = {
  rest:     { scale: 1 },
  popping:  {
    scale: [0.85, 1.18, 1],
    transition: { duration: duration.base, ease: easing.outSpring, times: [0, 0.6, 1] },
  },
};

/* ── ProductCard hover (asymmetric box paint via ::before) ─────────────── */
/*
 * The card hover is implemented as CSS (`:hover` on the article) because
 * the asymmetric expansion needs the pseudo-element technique. The Framer
 * version below is documented for reference; do not adopt it for the card.
 *
 * export const cardHover: Variants = {
 *   rest:  { y: 0, boxShadow: "var(--shadow-1)" },
 *   hover: { y: -0.5, boxShadow: "var(--shadow-2)", transition: transitions.hoverLift },
 * };
 */

/* ── Header pill-on-scroll (slow buttery) ──────────────────────────────── */

export const headerPill = {
  flat:     { width: "100%",  height: 84, borderRadius: 0,    background: "transparent", transition: transitions.headerShrink },
  scrolled: { width: 1080,    height: 60, borderRadius: 9999, background: "var(--bg-elev)", transition: transitions.headerShrink },
} as const;

/* ── Pulse (eyebrow dot) ───────────────────────────────────────────────── */

export const pulse: Variants = {
  rest: {
    boxShadow: [
      "0 0 0 0 color-mix(in oklch, var(--brand) 60%, transparent)",
      "0 0 0 10px color-mix(in oklch, var(--brand) 0%, transparent)",
      "0 0 0 0 color-mix(in oklch, var(--brand) 0%, transparent)",
    ],
    transition: { duration: 1.8, repeat: Infinity, ease: "easeOut" },
  },
};

/* ── Marquee scroller (announcement bar, category strip) ──────────────── */
/*
 * Marquee is implemented in CSS (`@keyframes scroll-x`) since Framer Motion
 * does not pause cleanly on `prefers-reduced-motion`. CSS gives us native
 * `@media (prefers-reduced-motion: reduce)` for free.
 */

/* ── Toast (top-right, slides in, auto-dismisses) ──────────────────────── */

export const toast: Variants = {
  hidden: { opacity: 0, y: -16, scale: 0.96, transition: t(duration.fast, easing.inSoft) },
  shown:  { opacity: 1, y: 0,  scale: 1,    transition: transitions.modalOpen },
};

/* ──────────────────────────────────────────────────────────────────────────
   Reduced-motion adapter
   ──────────────────────────────────────────────────────────────────────────
   Wrap variants with `withReducedMotion(variants)` to neutralise transform
   axes when the user prefers reduced motion. Opacity fades remain.
   Use in components like:
     const v = withReducedMotion(fadeUp);
     <motion.div variants={v} initial="hidden" animate="visible" />
   ────────────────────────────────────────────────────────────────────────── */

import { useReducedMotion } from "framer-motion";

export function useMotionVariants<T extends Variants>(v: T): T {
  const reduce = useReducedMotion();
  if (!reduce) return v;
  const stripped: any = {};
  for (const k in v) {
    const state = v[k];
    if (typeof state !== "object" || state === null) { stripped[k] = state; continue; }
    const s: any = { ...state };
    delete s.x; delete s.y; delete s.scale; delete s.rotate; delete s.rotateX; delete s.rotateY;
    if (s.transition) s.transition = { duration: 0.001 };
    stripped[k] = s;
  }
  return stripped as T;
}

/* ──────────────────────────────────────────────────────────────────────────
   Choreography notes (for the engineer reading this file)
   ──────────────────────────────────────────────────────────────────────────
   Hero on first load:
     - Eyebrow fades up at 0ms
     - Headline span 1 at 100ms
     - Headline span 2 at 220ms
     - Headline span 3 at 340ms
     - Sub at 500ms
     - CTAs at 620ms
     - Trust strip at 760ms
   All use `fadeUp` with explicit `delay` rather than parent stagger so the
   spans inside the h1 don't trigger via parent variants (which would force
   the parent to be a motion.h1, complicating SEO).

   Card grid on /shop scroll-into-view:
     - Use `stagger(0.06)` on the .pgrid container
     - Cards individually use `fadeUp` with no explicit delay
     - First visible card kicks at 50ms after IntersectionObserver fires

   Drawer open (cart + mobile filter):
     - Scrim fades over 380ms in parallel with drawer slide (640ms)
     - Body inside drawer fades up sequentially: line 1 at 100ms, line 2 at
       180ms, totals at 280ms (these are stagger-child fadeUps inside the
       drawer's motion.aside)

   Status badge change (cart bump, heart pop, claim banner):
     - The element wraps in a `<motion.span key={value}>` so a value change
       remounts it and replays `badgePop`. Otherwise the variant key changes
       don't re-trigger.

   Header shrink on scroll:
     - The transition is 700ms with the Material curve. Slow on purpose,
     - buttery feel that you can see happen. Do not speed it up.

   Page transition (View Transitions API):
     - Wrap navigations with `document.startViewTransition()` where supported
     - Fallback: AnimatePresence + pageTransition variants
     - Critical content (headline, h1) gets `view-transition-name: pageTitle`
       so it transitions in place across routes.
   ────────────────────────────────────────────────────────────────────────── */
