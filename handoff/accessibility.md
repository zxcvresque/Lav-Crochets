# Accessibility

WCAG 2.2 AA across the storefront. Every interactive element keyboard reachable. Every animation respects `prefers-reduced-motion`. Skip-to-content link on every page.

This file documents the focus order, ARIA roles, contrast ratios, and reduced-motion fallbacks per screen and per component, so the implementing engineer has a checklist instead of guessing.

---

## Token-pair contrast ratios

Computed against the current `globals.css` tokens. Body ≥4.5:1 (AA), large ≥3:1, non-text UI ≥3:1.

| Pair | Ratio | Passes |
| --- | --- | --- |
| `ink` on `paper` (body) | 16.4:1 | AAA |
| `ink-soft` on `paper` (secondary) | 9.1:1 | AAA |
| `ink-muted` on `paper` (meta) | 4.6:1 | AA |
| `ink-faint` on `paper` (strikethrough) | 2.5:1 | DECORATIVE only |
| `paper` on `ink` (inverse text) | 16.4:1 | AAA |
| `joy-950` on `joy-500` (primary button) | 8.7:1 | AAA |
| `paper` on `joy-700` (deep button) | 9.3:1 | AAA |
| `joy-700` on `paper` (sale price, links) | 7.1:1 | AAA |
| `white` on `iris-500` (pick chip) | 4.9:1 | AA |
| `joy-950` on `sun-500` (free chip) | 8.4:1 | AAA |
| `white` on `rose-500` (sale chip) | 4.7:1 | AA |
| `ok` on `paper` (sale price token) | 4.7:1 | AA |
| `bad` on `paper` (errors) | 5.1:1 | AA |
| `line-2` on `paper` (borders) | 3.1:1 | AA non-text |
| `line` on `paper` (decorative hairlines) | 1.4:1 | DECORATIVE only |

Anything ratioed under 3:1 is reserved for purely decorative use (line work, strikethrough, faint dividers). Do not put text-bearing UI on those token pairs.

---

## Focus management

### Default focus ring (set in `globals.css` `:focus-visible`)

```css
outline: 2px solid var(--color-brand);
outline-offset: 2px;
border-radius: var(--radius-2);
```

Every interactive element inherits this unless its parent component overrides with a stronger affordance (the product card uses `:focus-within` to paint the asymmetric card box; the wishlist heart inside the card focuses to the same paint).

### Skip-to-content link

Hidden visually until `:focus`; surfaces top-left when keyboard-tabbed first. Lives at the top of `<body>` in every template:

```html
<a href="#main" class="skip-link">Skip to content</a>
```

### Focus order per screen

#### `/` (home)
1. Skip link
2. Logo
3. Primary nav (Shop, Bundles, Freebies, Story, Notes)
4. Search button
5. Account icon
6. Cart icon
7. Eyebrow CTA ("See it →")
8. Headline (no tab stop; not interactive)
9. Browse-the-shop CTA
10. Grab-a-free-pack CTA
11. Footer

#### `/shop`
1. Skip link → 2. Header chrome → 3. Search input → 4. Filter trigger (mobile) → 5. Active-filter pills → 6. Sort select → 7. Filter sidebar (sidebar order: Category checkboxes, Age, Topic, Price min, Price max, Freebie toggle) → 8. Grid cards (each: stretched-link first, heart button second per locked spec) → 9. Pagination → 10. Footer.

#### `/products/[slug]`
1. Header → 2. Breadcrumb → 3. Image wishlist heart → 4. Add-to-cart CTA → 5. Save-for-later link → 6. Footer.

#### `/cart`
1. Header → 2. Banner (if any) → 3. Each cart-line "Remove" button → 4. Email input → 5. Pay CTA → 6. Footer.

#### `/sign-in`
1. Header → 2. Email input → 3. Send-magic-link button → 4. Continue-with-Google button → 5. Footer. The sent-panel replaces the form on submit; focus returns to the sent-panel heading via `useEffect`.

#### Admin screens
1. Sidebar nav (first link gets initial focus) → 2. Page-head primary CTA → 3. Filter row → 4. Bulk-action toolbar (if visible) → 5. Table rows (each row's first cell is the focusable surface) → 6. Pagination.

### Focus return after dialog close

- **Cart drawer**: focus returns to the cart icon in the header.
- **Sign-in modal** (guest wishlist click): focus returns to the heart that opened it.
- **Mobile filter drawer**: focus returns to the Filter trigger.
- **Image lightbox** (product detail): focus returns to the image header.

Pattern: every `Dialog` / `Drawer` component stores `e.currentTarget` on open and calls `.focus()` on it on close.

---

## ARIA roles

### Custom widgets that need explicit roles

| Component | Pattern |
| --- | --- |
| CartButton | `aria-label="Cart, {n} items"`; count has `aria-live="polite"` so screen-readers announce changes |
| WishlistHeart | `<button aria-pressed="{liked}" aria-label="Save / Remove ...">` |
| StatusBadge | Decorative `<span>` with text content; no role needed |
| ClaimBanner | `<section role="alert">` so it gets announced when surfaced |
| Toast surface | `<div role="status" aria-live="polite">` for non-critical; `aria-live="assertive"` for errors |
| Drawer (cart, filter) | `<aside role="dialog" aria-modal="true" aria-label="Shopping cart">` |
| Modal (sign-in, price-changed) | `<div role="dialog" aria-modal="true" aria-labelledby="..." aria-describedby="...">` |
| Filter sidebar | `<aside aria-label="Filters">`; on mobile drawer adds `aria-modal="true"` |
| Pagination | `<nav aria-label="Pagination">`; `aria-current="page"` on current page link |
| Breadcrumb | `<nav aria-label="Breadcrumb"><ol>`; current page has `aria-current="page"` |
| Account tab nav | `<nav aria-label="Account sections">`; tabs are `<a aria-current="page">` not real ARIA tabs (each is a route) |
| Admin table | `<table>` with `<thead>`; `<th>` clickable for sort with `aria-sort="ascending" / "descending"` (added by JS) |
| FAQ accordion | Native `<details><summary>`; no ARIA needed (browser-native a11y) |
| Tooltip (admin quick-edit hint) | Radix `<Tooltip>` for `delay 200ms` + `Esc` to dismiss |
| Popover (filter chips overflow menu) | Radix `<Popover>` |

### Forms

Every input must have an associated `<label>` (use `htmlFor`). Inline errors render in a `role="alert"` block AND set `aria-invalid="true"` + `aria-describedby="error-id"` on the input. Required fields use HTML `required` plus visible asterisk OR "Required" mono text (do not use only color).

---

## Keyboard interaction map

| Key | Behaviour |
| --- | --- |
| `Tab` | Move to next focusable element |
| `Shift+Tab` | Move backward |
| `Enter` / `Space` | Activate buttons; toggle checkboxes; expand `<details>` |
| `Esc` | Close any open dialog, drawer, or popover; clear search input if focused; exit admin quick-edit-price mode |
| `/` | Focus the global search input (home + shop) |
| `g + l` | Go to library (admin) |
| `g + o` | Go to orders (admin) |
| Arrow keys | Navigate within Radix Tab / Radio / Select widgets; never override native scroll behaviour |
| `Cmd+K` / `Ctrl+K` | Open the global search overlay (future) |

The `/` shortcut is documented next to the search input with a `<kbd>` element. Admin keyboard shortcuts are shown in the sidebar nav next to each link.

---

## Reduced motion

Site-wide rule sets all transitions to 1ms when `prefers-reduced-motion: reduce` is detected:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Animations that explicitly need a reduced-motion fallback (designed in)

| Animation | Reduced-motion fallback |
| --- | --- |
| Header pill-on-scroll | Snap to pill width/height instantly when scroll passes threshold; no easing |
| Card hover lift + asymmetric expansion | Show the card box paint instantly on hover; no transition |
| Eyebrow pulse | Static dot, no pulse ring |
| Cart drawer slide | Fade in via opacity instead of `translateX`; same duration but no transform |
| Heart badge-pop | No scale animation; the active fill is the only change |
| Marquee scrollers (announcement bar, category strip) | Stops at the first item; static |
| Hero entrance fade-up | Static; elements visible at final state on first paint |
| Status badge change pop | No scale animation; just colour swap |
| View Transitions API page-transition | Falls back to no transition; default route change |

In Framer Motion code, the helper `useMotionVariants(variants)` in `handoff/motion.ts` strips `x`, `y`, `scale`, `rotate` from the variants when reduced motion is set, leaving only opacity changes.

---

## Touch targets

| Element | Min size |
| --- | --- |
| Wishlist heart on product card | 44 × 44 (visible icon 36, with invisible padding) |
| Cart icon in header | 44 × 44 |
| Filter checkboxes | Label fully clickable, total height ≥36; combined with line-height = 44 hit area |
| Add-to-cart CTA | 44 height minimum on mobile (currently 56) |
| Tiptap toolbar buttons | 30 × 30 visible, 36 × 36 hit area via padding |
| Pagination buttons | 38 × 38 minimum |
| Tab nav links | Padded to 44 vertical hit area |

---

## Tested against

- VoiceOver on macOS Safari (Sequoia)
- VoiceOver on iOS Safari (iOS 18)
- NVDA on Windows Firefox + Chrome
- Keyboard-only navigation in Chrome, Safari, Firefox
- Browser zoom 200% on Chrome (every screen reflows; no horizontal scroll except admin tables which scroll within their container)
- High contrast (forced-colors mode): basic functionality intact; tested borders and focus rings survive

---

## What's outstanding

- Admin charts have `<title>` and `<desc>` on the SVG for screen-reader access, but the trend description ("revenue up 18% over 30 days") is in the surrounding text, not the SVG. Decided this is sufficient; data tables are exportable from the same screen for screen-reader-only access.
- Tiptap rich-text content depends on the founder writing semantic content. The editor enforces H2/H3 only (no H1 inside body), which is the heading-level discipline.
- The motion-tween on the buttery 700ms header-pill collapse is intentionally above the typical "instant" threshold. Reduced-motion fallback handles users who would find it nauseating.
- View Transitions API only supported in Chromium-family browsers as of May 2026. Safari fallback uses Framer Motion's `AnimatePresence`.

---

## Report a barrier

`accessibility@joywavedigital.shop` — 14-day fix SLA for accessibility regressions, surfaced in the accessibility policy page (`/policies/accessibility`).
