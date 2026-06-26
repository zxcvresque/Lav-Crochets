/**
 * handoff/desktop-motion.ts
 * ──────────────────────────────────────────────────────────────────────────
 * JoyWaveDigital desktop pass motion variants. ADDITIVE to handoff/motion.ts.
 * Imports the named easings + durations from the existing motion.ts; adds
 * variants that file did not formalize.
 *
 * Hard rules baked in (inherited from motion.ts):
 *  - 60fps. Only transform + opacity animated (rare exceptions below).
 *  - prefers-reduced-motion: reduce honors at the variant level.
 *  - View Transitions API used where supported; Framer fallback otherwise.
 *
 * No em dashes anywhere.
 * ──────────────────────────────────────────────────────────────────────────
 */

import type { Variants, Transition } from "framer-motion";
import { easing, duration, transitions } from "./motion";

const t = (d: number, e = easing.outSoft): Transition => ({ duration: d, ease: e });

/* ── 1 · Header pill on scroll (the buttery 700ms move) ──────────────── */
/*
 * Both directions. The flat-to-pill is 700ms with the Material curve.
 * The pill-to-flat (when scroll returns to top) is also 700ms with the same
 * curve so the user does not feel a "snap back".
 *
 * EXCEPTION to the transform-only rule: this animates width, height, padding,
 * border-radius, background, border-color, box-shadow. These are necessary
 * because the pill collapse is a layout change, not a transform.
 *
 * Performance: width / height transitions are GPU-accelerated in modern
 * browsers when the element has `will-change: width, height` (declared in
 * styles.css line 783). On a 60Hz panel the transition stays smooth.
 *
 * Reduced motion: collapse to instant snap. No flicker; the pill simply
 * appears in its scrolled chrome.
 */

export const headerPillScroll = {
  flat: {
    width: "100%",
    height: 84,
    padding: "0 28px",
    borderRadius: 0,
    background: "transparent",
    borderColor: "transparent",
    boxShadow: "none",
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
  },
  scrolled: {
    width: 1080,
    height: 60,
    padding: "6px 8px 6px 22px",
    borderRadius: 9999,
    background: "var(--bg-elev)",
    borderColor: "var(--line)",
    boxShadow: "var(--shadow-3)",
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
  },
} as const;

/*
 * The AnnouncementBar hides synchronously with the pill collapse. Different
 * easing (outSoft, 380ms) because the bar is a smaller visual element and
 * the eye reads its disappearance independently.
 */
export const announceBarHide: Variants = {
  visible: { height: 32, opacity: 1, transition: t(duration.med, easing.outSoft) },
  hidden:  { height: 0,  opacity: 0, transition: t(duration.med, easing.outSoft) },
};

/* ── 2 · SectionHead stagger entry (PATTERN A) ──────────────────────── */
/*
 * Each piece fades up with 60ms stagger:
 *   - Eyebrow at 0ms
 *   - Headline line 1 at 60ms
 *   - Em line 2 at 120ms
 * Triggered by IntersectionObserver on the section root. Each piece uses
 * the existing fadeUp variant from motion.ts; this map exposes the timing.
 */

export const sectionHeadStagger = {
  eyebrow:    { delay: 0,    transition: transitions.reveal },
  headline1:  { delay: 0.06, transition: transitions.reveal },
  headline2:  { delay: 0.12, transition: transitions.reveal },
  action:     { delay: 0.18, transition: transitions.reveal },
} as const;

/* ── 3 · Card hover paint (asymmetric ::before expansion) ───────────── */
/*
 * The ProductCard hover paints `::before` outward 10/10/12/10. The locked
 * implementation is CSS-only (the `transition: inset, background,
 * border-color, box-shadow` block in styles.css). This Variants object is
 * documented for reference but is NOT used; the CSS owns the animation.
 *
 * Timing recorded here so the team has a single source of truth:
 *   - inset:        220ms outSoft
 *   - background:   220ms outSoft
 *   - border-color: 220ms outSoft
 *   - box-shadow:   220ms outSoft
 *
 * Why CSS and not Framer: the `::before` pseudo cannot be a Framer Motion
 * component (no DOM node). We could refactor to a real `<div className="paint">`
 * sibling, but the founder rejected that route in S04 because it adds a
 * layout sibling that affects sibling-card hit testing.
 */

export const cardHoverPaint = {
  rest: {
    inset: "0",
    background: "transparent",
    borderColor: "transparent",
    boxShadow: "none",
  },
  hover: {
    inset: "-10px -10px -12px -10px",
    background: "var(--bg-elev)",
    borderColor: "var(--line-2)",
    boxShadow: "var(--shadow-2)",
  },
};

/* ── 4 · Focus-within paint (card focus indicator) ─────────────────── */
/*
 * Identical to cardHoverPaint but triggered by `:focus-within`. The CSS
 * does this with the same selector, but additionally the stretched-link
 * itself gets the global `.focus-ring` 2px outline + 4px offset.
 *
 * Document the order:
 *   1. Browser paints the stretched-link's focus outline (instant)
 *   2. The card's `::before` paints (220ms outSoft)
 *
 * Reduced motion: collapse to instant. The card box appears in its hovered
 * chrome on focus-within; no transition.
 */

export const focusWithinPaint = {
  rest: cardHoverPaint.rest,
  focused: cardHoverPaint.hover,
} as const;

/* ── 5 · BadgePop · cart count, heart toggle, status flip ──────────── */
/*
 * The motion.ts file declares badgePop for cart count + heart. This entry
 * is here to document its OTHER consumers (status badge flip).
 *
 * Pattern: wrap the animated element in `<motion.span key={value}>` so a
 * value change remounts the element and replays the variant. Status badge
 * key is the status string ("paid", "pending", etc).
 */

export const badgePopExtended = {
  rest: { scale: 1 },
  popping: {
    scale: [0.85, 1.18, 1],
    transition: { duration: duration.base, ease: easing.outSpring, times: [0, 0.6, 1] },
  },
} as const;

/* ── 6 · Price-changed banner entry (slide down + auto-scroll) ──────── */
/*
 * On 409 PRICE_CHANGED response from /cart submit, the banner mounts at the
 * top of the line list and slides down 16px while fading from 0 to 1. After
 * the slide-in completes, the banner element calls scrollIntoView({ behavior:
 * "smooth", block: "start" }) to ensure the user sees it even if they scrolled
 * past the cart-header on a tall cart.
 *
 * Reduced motion: no slide, no smooth scroll. The banner mounts in place
 * (visible immediately) and scrollIntoView uses behavior: "auto" (instant).
 */

export const priceChangedBannerEntry: Variants = {
  hidden:  { opacity: 0, y: -16, transition: t(duration.fast, easing.inSoft) },
  visible: { opacity: 1, y: 0,   transition: t(duration.med,  easing.outSoft) },
};

export function autoScrollIntoView(node: HTMLElement) {
  const prefersReduced = typeof window !== "undefined"
    && window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  node.scrollIntoView({
    behavior: prefersReduced ? "auto" : "smooth",
    block: "start",
    inline: "nearest",
  });
}

/* ── 7 · ToastAppearance (the locked vocabulary) ───────────────────── */
/*
 * The motion.ts file declares `toast`. The desktop pass uses it directly;
 * no extension needed. Documented here for completeness.
 */

export { toast as toastAppearance } from "./motion";

/* ── 8 · DrawerOpen (cart drawer) ──────────────────────────────────── */
/*
 * Same as the motion.ts `drawerRight` variant. The desktop pass uses it
 * directly; no extension. The cart drawer specifically uses scrim variants
 * from motion.ts too.
 */

/* ── 9 · ModalAppearance ───────────────────────────────────────────── */
/*
 * Same as motion.ts `modal` variant. Used for: sign-in modal, price-changed
 * dialog, delete-account confirm, recover-form success panel.
 */

/* ── 10 · AdminStickySaveBar slide up ──────────────────────────────── */
/*
 * The sticky save bar slides up from below the viewport on the first edit.
 * Slides down out of the viewport when the form returns to pristine (after
 * successful save).
 *
 * Reduced motion: cross-fade in / out, no translate.
 */

export const stickySaveBar: Variants = {
  hidden:  { y: 80, opacity: 0, transition: t(duration.fast, easing.inSoft) },
  visible: { y: 0,  opacity: 1, transition: t(duration.base, easing.outSoft) },
};

/* ──────────────────────────────────────────────────────────────────────────
   Choreography notes (the implementing engineer should follow these)
   ──────────────────────────────────────────────────────────────────────────

   Header pill on first scroll past 40:
     - `headerPillScroll.scrolled` fires at scrollY > 40
     - `announceBarHide.hidden` fires at the same scrollY threshold
     - Both share the same useScrolled(40) hook so they trigger on the
       same RAF and feel synchronized
     - Don't speed it up. The 700ms is intentional ("buttery feel that you
       can see happen", per the founder's S06 call)

   SectionHead on scroll-into-view:
     - IntersectionObserver with `threshold: 0.2`
     - On enter, fire the stagger sequence
     - Eyebrow at 0ms, headline line 1 at 60ms, em line 2 at 120ms, action
       at 180ms
     - If the user has already scrolled past (rare on first paint), the
       observer fires immediately on mount; do NOT play the stagger if
       the section is already past the viewport bottom

   Card hover paint:
     - Owned by CSS. The ::before transitions inset/background/border/shadow
       in 220ms outSoft
     - The focus-within variant uses the same paint but is triggered by
       `:focus-within` (and on the same card the stretched-link gets the
       global focus ring outside)

   Cart count bump:
     - `<motion.span key={cartCount}>` wraps the count
     - Plays badgePop on count change
     - Skip the bump if the count goes from 0 to 1 on first paint (the
       hydration initial value is the same as the post-hydration value)

   Status badge flip:
     - `<motion.span key={status}>` wraps the badge
     - Plays badgePop on status change
     - Skip the bump if the page is not visible (use `document.visibilityState`)

   Price-changed banner entry:
     - Server returns 409 PRICE_CHANGED
     - Banner mounts above the cart line list with `priceChangedBannerEntry.visible`
     - After the slide-in completes, call autoScrollIntoView() on the
       banner element
     - Banner persists until the user dismisses it or cart re-validates

   AdminStickySaveBar:
     - Form's `isDirty` state controls visibility
     - On first edit, `stickySaveBar.visible` slides up
     - On save complete, swap to `Saved` state for 1.6s (no slide), then
       `stickySaveBar.hidden` slides down
     - On discard, immediately `stickySaveBar.hidden` slides down

   Toast lifecycle:
     - Mount with `toast.shown`
     - Auto-dismiss after 4 to 6 seconds (longer for toasts with Undo)
     - Manual dismiss via the close button or swipe (mobile)
     - Re-trigger on duplicate: replace the existing toast content rather
       than stacking (toasts at the desktop level stack rarely)
   ────────────────────────────────────────────────────────────────────────── */
