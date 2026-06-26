/**
 * handoff/mobile-motion.ts
 * ──────────────────────────────────────────────────────────────────────────
 * JoyWaveDigital mobile motion system. Additive to handoff/motion.ts.
 * Imports the named easings + durations from the desktop file; adds
 * gesture variants (drag, pan, snap), the bottom-sheet primitive, the
 * page-transition map, and the VisualViewport lift wiring for sticky CTAs.
 *
 * Hard rules baked in:
 * - 60fps. Only transform + opacity animated. The sticky-CTA lift uses
 *   `translateY` driven by a CSS custom property the JS sets in response
 *   to VisualViewport resize.
 * - prefers-reduced-motion: all gestures still WORK (drag-to-dismiss,
 *   swipe-to-open) but their entrance/exit animations cross-fade in 1ms.
 *   The rubber-band overshoot collapses to a hard stop at the threshold.
 * - Native iOS edge-swipe-back must keep working. The drawer
 *   edge-swipe-right region is exclusively the LEFT 24px of the
 *   viewport; iOS reserves the leftmost 20px for back-swipe, so we
 *   listen on 20-24 only and require >40px travel before we claim the
 *   gesture.
 * - Every gesture has a button equivalent (see Part 5 of the brief).
 * ──────────────────────────────────────────────────────────────────────────
 */

import type { Variants, Transition, PanInfo } from "framer-motion";
import { easing, duration, transitions } from "./motion";

/* ── Mobile-only easings + durations (composed from base) ──────────────── */

export const mobileDuration = {
  ...duration,
  rubberBand: 0.48,
  sheetSnap:  0.38,
  sheetOut:   0.20,
  drawerSnap: 0.64,
} as const;

const t = (d: number, e = easing.outSoft): Transition => ({ duration: d, ease: e });

export const mobileTransitions = {
  ...transitions,
  sheetOpen:   t(mobileDuration.sheetSnap, easing.inOutSoft),
  sheetClose:  t(mobileDuration.sheetOut,  easing.inSoft),
  drawerOpen:  t(mobileDuration.drawerSnap, easing.inOutSoft),
  drawerClose: t(mobileDuration.sheetSnap,  easing.inSoft),
  rubberBand:  t(mobileDuration.rubberBand, easing.outSpring),
} as const;

/* ── Bottom-sheet primitive ────────────────────────────────────────────── */
/*
 * Three snap points. peek = 56px exposed (handle + one row), half = 50dvh,
 * full = 92dvh (leaves room for the status bar / Dynamic Island).
 *
 * Drag-to-dismiss threshold: 96px past the lowest snap. Velocity-based
 * dismiss kicks in at >450 px/s downward regardless of distance.
 *
 * Entry: spring from `y: 100%` to the requested snap, sheetOpen transition.
 * Exit:  ease to `y: 100%`, sheetClose transition (decisive, 200ms).
 */

export type SheetSnap = "peek" | "half" | "full" | "closed";

export const sheetVariants: Variants = {
  closed: { y: "100%", transition: mobileTransitions.sheetClose },
  peek:   { y: "calc(100% - 56px)",  transition: mobileTransitions.sheetOpen },
  half:   { y: "calc(50dvh)",        transition: mobileTransitions.sheetOpen },
  full:   { y: "calc(8dvh)",         transition: mobileTransitions.sheetOpen },
};

export const sheetScrim: Variants = {
  closed: { opacity: 0, transition: t(mobileDuration.sheetOut, easing.inSoft) },
  peek:   { opacity: 0.10, transition: t(mobileDuration.sheetSnap, easing.outSoft) },
  half:   { opacity: 0.55, transition: t(mobileDuration.sheetSnap, easing.outSoft) },
  full:   { opacity: 0.55, transition: t(mobileDuration.sheetSnap, easing.outSoft) },
};

export const SHEET_DISMISS_DISTANCE = 96;   // px past lowest snap
export const SHEET_DISMISS_VELOCITY = 450;  // px/s, downward

/** Resolve the next snap from a drag end. Pass the current snap, the
 *  release delta, and the release velocity. */
export function nextSnap(
  current: SheetSnap,
  delta: number,
  velocity: number,
): SheetSnap {
  if (velocity > SHEET_DISMISS_VELOCITY) {
    if (current === "full") return "half";
    if (current === "half") return "peek";
    return "closed";
  }
  if (velocity < -SHEET_DISMISS_VELOCITY) {
    if (current === "peek") return "half";
    if (current === "half") return "full";
    return "full";
  }
  if (Math.abs(delta) < 24) return current; // jiggle, stay
  if (delta > 0) {  // dragged down
    if (delta > SHEET_DISMISS_DISTANCE) return "closed";
    return current === "full" ? "half" : current === "half" ? "peek" : "closed";
  }
  // dragged up
  return current === "peek" ? "half" : current === "half" ? "full" : "full";
}

/* ── Drawer (mobile nav) ───────────────────────────────────────────────── */
/*
 * Left-edge drawer. Rubber-band on edge-swipe-right with travel < 96px;
 * snap-open at >=96px or velocity >450 px/s.
 *
 * The edge-swipe activation zone is x=[20, 24]. Inside that 4px band we
 * START tracking; we only CLAIM the gesture (preventDefault + take over
 * scroll) after 40px of horizontal travel, so iOS edge-swipe-back at
 * x < 20 keeps working uninterrupted.
 *
 * Drag-to-close: drag drawer leftward, dismiss at -96 or velocity < -450.
 *
 * Focus: opening moves focus to the first nav link. Closing returns focus
 * to the element that opened it (hamburger button). Body scroll locks
 * while open via document.body.style.overflow = 'hidden'.
 *
 * aria-live="polite": post "Menu opened" / "Menu closed" to a hidden
 * live region.
 */

export const navDrawer: Variants = {
  closed: { x: "-100%", transition: mobileTransitions.drawerClose },
  open:   { x: 0,       transition: mobileTransitions.drawerOpen },
};

export const NAV_DRAWER_EDGE_ZONE  = [20, 24] as const; // px from left
export const NAV_DRAWER_CLAIM      = 40;  // px before we claim the gesture
export const NAV_DRAWER_SNAP_OPEN  = 96;  // px to commit open
export const NAV_DRAWER_SNAP_CLOSE = 96;  // px to commit close
export const NAV_DRAWER_VELOCITY   = 450; // px/s threshold

/* ── Page transition map ───────────────────────────────────────────────── */
/*
 * Three transition kinds:
 *   slideStack  : forward stack: slide in from right, back to right
 *   fadeOnly    : tab switches inside the same shell, fade-cross only
 *   sheet       : bottom-sheet open (NOT a route transition; doc note)
 *
 * View Transitions API used where supported (Chrome 111+, Safari 18+).
 * Framer fallback for older browsers and Firefox <125.
 */

export type RouteTransition = "slideStack" | "fadeOnly" | "none";

export const ROUTE_TRANSITIONS: Record<string, RouteTransition> = {
  // Storefront forward stack
  "/ -> /shop":                            "slideStack",
  "/shop -> /shop/[category]":             "slideStack",
  "/shop -> /products/[slug]":             "slideStack",
  "/shop/[category] -> /products/[slug]":  "slideStack",
  "/products/[slug] -> /cart":             "slideStack",
  "/cart -> /orders/thank-you-pending":    "slideStack",
  "/orders/thank-you-pending -> /orders/thank-you/[id]": "slideStack",

  // Auth
  "/cart -> /sign-in":                     "slideStack",
  "/account/* -> /sign-in":                "slideStack",

  // Account tab switches (the AccountNav segmented control)
  "/account/library -> /account/orders":   "fadeOnly",
  "/account/orders -> /account/wishlist":  "fadeOnly",
  "/account/wishlist -> /account/profile": "fadeOnly",
  "/account/profile -> /account/settings": "fadeOnly",

  // Errors and recovery
  "* -> /not-found":                       "fadeOnly",
  "* -> /500":                             "fadeOnly",
  "/orders/recover -> /sign-in":           "slideStack",
};

export const slideStackForward: Variants = {
  initial: { x: "100%", opacity: 0.6 },
  enter:   { x: 0,      opacity: 1, transition: t(mobileDuration.med, easing.outSoft) },
  exit:    { x: "-30%", opacity: 0.4, transition: t(mobileDuration.fast, easing.inSoft) },
};

export const slideStackBack: Variants = {
  initial: { x: "-30%", opacity: 0.4 },
  enter:   { x: 0,      opacity: 1, transition: t(mobileDuration.med, easing.outSoft) },
  exit:    { x: "100%", opacity: 0.6, transition: t(mobileDuration.fast, easing.inSoft) },
};

export const fadeOnly: Variants = {
  initial: { opacity: 0 },
  enter:   { opacity: 1, transition: t(mobileDuration.base, easing.outSoft) },
  exit:    { opacity: 0, transition: t(mobileDuration.fast,  easing.inSoft) },
};

/* ── Pull-to-refresh ───────────────────────────────────────────────────── */
/*
 * Native-feeling rubber-band on the top edge of a scroll container at
 * scrollTop === 0. Three phases:
 *   pulling     : finger down, container y follows finger, max 96px exposure
 *   armed       : once finger has crossed 72px, the indicator commits;
 *                 release here calls refresh()
 *   refreshing  : spinner spins, container holds at y=64, query refetches
 *
 * Reduced motion: no rubber-band. The pull is collapsed to an instant
 * refresh button that appears at scrollTop === 0 with the indicator
 * area fixed (no transform).
 */

export const PULL_ARM_THRESHOLD = 72;
export const PULL_MAX_TRAVEL    = 96;
export const PULL_REFRESH_HOLD  = 64;

export const pullIndicator: Variants = {
  idle:       { y: 0, opacity: 0, transition: t(mobileDuration.fast, easing.inSoft) },
  pulling:    { opacity: 1, transition: t(mobileDuration.fast, easing.outSoft) },
  armed:      { opacity: 1, scale: 1.05, transition: t(mobileDuration.fast, easing.outSpring) },
  refreshing: { y: PULL_REFRESH_HOLD, opacity: 1, transition: t(mobileDuration.base, easing.outSoft) },
};

/* ── Image-gallery swipe ───────────────────────────────────────────────── */
/*
 * Horizontal pager. Snap on release: travel < 25% of width returns to
 * current; >=25% advances. Velocity > 350 px/s advances regardless of
 * distance.
 *
 * Pinch-to-zoom enters at scale >= 1.05. Exit gestures: tap-to-zoom-out,
 * double-tap, or two-finger pinch out below scale 0.9. Swipe-between is
 * disabled while zoomed.
 */

export const GALLERY_SNAP_RATIO    = 0.25;
export const GALLERY_VELOCITY      = 350;
export const GALLERY_ZOOM_IN_TRIGGER  = 1.05;
export const GALLERY_ZOOM_OUT_TRIGGER = 0.9;

/* ── Sticky-CTA keyboard lift ──────────────────────────────────────────── */
/*
 * Hook into VisualViewport.resize. When the visual viewport height
 * shrinks below the layout viewport height by more than 120px, the
 * keyboard is open; lift the sticky CTA by the delta so it sits flush
 * above the keyboard.
 *
 * On Android the keyboard often only partially shrinks the viewport;
 * the fallback is to listen on `window.innerHeight` change as well.
 */

export function bindStickyCtaLift(node: HTMLElement): () => void {
  const vv = (typeof window !== "undefined") ? window.visualViewport : null;
  if (!vv) return () => {};
  let raf = 0;
  const update = () => {
    const lift = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      node.style.setProperty("--kbd-lift", `${lift}px`);
    });
  };
  vv.addEventListener("resize", update);
  vv.addEventListener("scroll", update);
  update();
  return () => {
    vv.removeEventListener("resize", update);
    vv.removeEventListener("scroll", update);
    cancelAnimationFrame(raf);
    node.style.removeProperty("--kbd-lift");
  };
}

/* ── Skeleton shimmer ──────────────────────────────────────────────────── */
/*
 * The shimmer is a CSS animation on a linear-gradient. Defined here for
 * symmetry with the rest of the motion vocabulary. Reduced motion drops
 * the animation entirely (static placeholder bar).
 */

export const skeletonShimmerCss = `
@keyframes skeleton-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-subtle) 25%,
    var(--bg-elev)   50%,
    var(--bg-subtle) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 0.64s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; background: var(--bg-subtle); }
}
`;

/* ──────────────────────────────────────────────────────────────────────────
   Choreography notes (mobile specifics)
   ──────────────────────────────────────────────────────────────────────────
   MobileNavDrawer open:
     - Scrim fades over 380ms (sheetSnap) in parallel with drawer slide
       (640ms, drawerOpen). Drawer body content fades in sequentially:
       brand at 80ms, nav items stagger 60ms apart starting at 160ms,
       footer at 460ms.
     - Focus moves to the first nav link on open (not the close X; close
       is reachable via Esc or drag).

   BottomSheet open:
     - Sheet slides up 380ms; scrim fades 380ms parallel. If opening to
       'full', the inner body uses stagger(0.06) on its children.
     - On close, focus returns to the trigger. aria-live: closed.

   Page push (slideStack forward):
     - View Transitions API: incoming page slides from right, outgoing
       slides 30% left and fades to 0.4. 380ms.
     - Framer fallback uses the same offsets and timing.

   Page back:
     - Outgoing slides 100% right and fades to 0.6; incoming slides from
       -30% back to 0. 380ms.

   Account tab switch:
     - Cross-fade 220ms. No translate; the segmented control's pill is
       the focal point and any page slide competes with it.

   Pull-to-refresh:
     - Rubber-band 1:0.55 (finger travel 96px maps to indicator travel
       96px but with damping so the curve flattens past 72). Armed state
       triggers a 60ms haptic on iOS via the Vibration API where present.

   Image gallery:
     - Page snap uses outSpring at duration-base (220ms). Dot indicator
       updates onAnimationComplete (not on drag) so dots don't flicker.

   Sticky-CTA lift:
     - Driven entirely by --kbd-lift custom prop, transitioned in CSS at
       380ms ease-in-out-soft. The JS hook only writes the value; the
       transition is owned by the stylesheet so reduced-motion users get
       instant snap via the @media rule in mobile-tokens.css.

   Skeleton shimmer:
     - 640ms (duration-slow) linear loop. Reduced motion drops to static.

   WishlistHeart toggle (mobile delta from desktop):
     - Same badgePop variant. Mobile additionally triggers a 15ms
       haptic pulse (window.navigator.vibrate(15)) on toggle-on. No
       vibration on toggle-off.

   Offline banner:
     - Slides DOWN from top, 220ms outSoft. Slides up 120ms inSoft on
       reconnect. Toast for "Back online" follows.
   ────────────────────────────────────────────────────────────────────────── */
