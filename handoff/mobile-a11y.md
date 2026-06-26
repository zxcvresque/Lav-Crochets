# Mobile accessibility

Additive to `handoff/accessibility.md`. Inherits every rule there (focus order, ARIA roles, contrast ratios, reduced-motion table). This document covers what changes or adds at small viewports: dynamic-type behavior, VoiceOver / TalkBack labels for icon-only controls, gesture alternatives, switch-control nav order, focus-trap rules for drawer + sheet, and the safe-area / pinch-zoom guarantees.

No em dashes in any copy below. The pre-delivery grep enforces this.

---

## Dynamic Type at 200%

Verified per the brief. iOS supports the Large Text accessibility setting up to 320%; Android supports up to 200%. The design target is "no horizontal scroll, no content loss, no truncated CTAs" at 200% on iOS Safari with the default 17px body.

| Surface | Behavior at 200% | Notes |
| :--- | :--- | :--- |
| `/` hero | Headline wraps to 4 lines instead of 3. The "deserve the ink." color-word still fits on its own line. Sub clamp() drops it to 16. CTAs stack vertically. | Hero clamp() is the safety. Manual test at 360x800 + Dynamic Type 200%. |
| `/shop` | Card grid stays 2-col. Title line-clamp-1 keeps card height predictable. Toolbar pills wrap to 2 rows. | The line-clamp is the load-bearer here. |
| `/products/[slug]` | Image stays 1:1. Price block wraps to 2 lines. Sticky CTA bumps to 64 height to accommodate 22px button label. | Sticky CTA height is unlocked at 200%; the 56 floor moves up. |
| `/cart` | Cart-line title clamp-2 expands to 3 lines. Price wraps below content. Pay CTA stays sticky and visible. | No horizontal scroll observed. |
| `/account/library` | Row title wraps. Download button stays 48 tall. Status pill text wraps if 2 words ("Refund pending"). | Pill wrap is acceptable. |
| `/sign-in` | Single hero field. Label and CTA both scale; sticky CTA still lifts over keyboard. | |
| Bottom sheets | Sheet auto-snaps to `full` if content overflows `half`. | The sheet must NEVER trap content past the dismiss handle. |
| Header drawer | Nav links scale; drawer stays 86vw. | |

What we accept at 200%: some marketing pages reflow with extra white space; the desktop layout was tuned for 100% and we don't redesign the page for the +200% case. What we never accept: missing CTAs, clipped text, horizontal scroll on the body.

What to QA when shipping: open every page at 360x800 viewport, set Dynamic Type to its maximum, scroll the full page, verify CTAs are reachable and tap targets remain >= 44pt.

## VoiceOver and TalkBack labels

Every icon-only button declares `aria-label`. Every decorative icon gets `aria-hidden="true"` and is followed by a text label in the same control. Table below lists every icon-only control across the mobile shell.

| Control | aria-label | Notes |
| :--- | :--- | :--- |
| Header logo | "JoyWaveDigital home" | (same as desktop) |
| Header hamburger | "Open menu" / "Close menu" | toggles on open state |
| Header search | "Search printables" | opens search overlay |
| Header account | "Account" / "Sign in" | label flips on auth state |
| Header cart | "Cart, N items" | N is the live count, aria-live polite |
| Product card heart | "Save to wishlist" / "Remove from wishlist" | toggles on state |
| Cart line remove | "Remove [product title]" | per-line, names the product |
| Image gallery prev | "Previous image" | always present; gestures additive |
| Image gallery next | "Next image" | |
| Image gallery dot | "Go to image N of M" | per-dot |
| Image share | "Share product" | |
| Sheet handle | "Drag to resize, swipe down to dismiss" | role="separator" aria-orientation="horizontal" |
| Sheet close X | "Dismiss [sheet name]" | sheet name is the sheet's heading |
| Toast undo | "Undo [action]" | action names the most recent action |
| Toast dismiss | "Dismiss notification" | |
| Pull-to-refresh indicator | "Pull to refresh" / "Release to refresh" | state-dependent |
| Search overlay clear | "Clear search" | iOS handles natively via type=search but we expose the label too |
| Sign-in submit | "Send sign-in link" | not "Submit" |
| Download button | "Download [filename]" | names the file |
| Claim banner add | "Add to library" | |
| Claim banner deny | "Mark not mine" | |
| Claim banner dismiss | "Dismiss claim notice" | |
| Offline banner | role="status" aria-live="polite" | "You are offline. Actions will retry when you reconnect." |
| Skeleton row | role="status" aria-label="Loading" aria-busy="true" | per row, removed on load |

## Switch-control nav order

Switch Control on iOS and the equivalent on Android navigate elements in DOM order. The mobile layout puts EVERY interactive element in a sensible reading order without reliance on `tabindex` overrides. Specifically:

1. Skip-to-content link
2. Offline banner (if present)
3. Header brand
4. Header hamburger
5. Header search
6. Header account
7. Header cart
8. Announcement bar text (if visible)
9. Main page content in source order
10. Sticky CTA (if present; tabindex="0" so switch-control reaches it without scrolling)
11. Footer

The sticky CTA's position is the key trick. Visually it's pinned to the bottom of the viewport; structurally it's the last item before the footer, so switch-control reaches it after the page body but before footer navigation. This lets a switch user complete the primary action without scrolling past every footer link first.

## Focus trap rules

| Surface | Trap | Restore focus to |
| :--- | :--- | :--- |
| MobileNavDrawer (open) | Yes. Tab/shift-Tab cycles drawer-internal only. Esc closes. | Hamburger button |
| BottomSheet (open) | Yes. Tab cycles sheet-internal only. Esc closes. Backdrop tap closes. | Trigger element |
| SearchOverlay (open) | Yes. Tab cycles overlay-internal only. Esc closes. | Header search icon |
| Toast | No trap. Focus passes through. | n/a |
| Offline banner | No trap. role=status, polite. | n/a |
| Sticky CTA | No trap. | n/a |

Focus traps use the `inert` attribute on the rest of the page rather than JS focus loops. `inert` is supported on Safari 15.5+, Chrome 102+, Firefox 112+. Older browsers fall back to a JS focus-loop polyfill.

## Gesture alternatives (locked rule from Part 5)

Every swipe / drag has a visible button equivalent. Listed for QA:

| Gesture | Button equivalent |
| :--- | :--- |
| Drawer drag-to-close | Close X in drawer top-right |
| Sheet drag-to-dismiss | Sheet close X in top-right |
| Sheet drag-up to expand | Snap-point buttons on the handle aren't visible (intentional); tapping the handle area opens the menu |
| Image gallery swipe | Prev / next arrow buttons (rendered, always tabbable) |
| Image gallery pinch-zoom | Single-tap zooms to fit; double-tap zooms 2x; long-press opens share menu |
| Toast swipe-dismiss | Toast dismiss X |
| Pull-to-refresh | Refresh icon in toolbar (also present on every listing page) |
| Edge-swipe-right (open drawer) | Hamburger button |

## Safe-area and pinch-zoom guarantees

- Every sticky bottom element respects `env(safe-area-inset-bottom)` via the `--safe-bottom` token. This includes: sticky CTA, sheet body, toast, offline banner, sheet handle row.
- Every top-fixed element respects `env(safe-area-inset-top)` via `--safe-top`. This includes: header, announcement bar, offline banner top.
- `viewport-fit=cover` on the meta viewport so the page can paint into the safe-area, with explicit padding to keep content out of it.
- Pinch-to-zoom is NEVER disabled. The viewport meta tag is `width=device-width, initial-scale=1, viewport-fit=cover`. No `user-scalable=no` or `maximum-scale=1`.

## Reduced-motion behavior at the gesture layer

Inherits the desktop reduced-motion table. Mobile adds:

| Gesture | Reduced-motion behavior |
| :--- | :--- |
| Sheet snap | Instant snap to target. No rubber-band, no spring. |
| Drawer slide | Cross-fade in/out, no translate. |
| Page slide-stack | Cross-fade in/out, no translate. |
| Pull-to-refresh | Refresh button appears, no rubber-band. Tap to refresh. |
| Image gallery snap | Instant snap. Pagination dots update on snap. |
| Skeleton shimmer | Static placeholder, no animation. |
| Toast slide-in | Fade-in only, no translate. |
| WishlistHeart pop | No scale animation. State swap is instant. Haptic still fires. |

## Color contrast verified on mobile-specific surfaces

| Pair | Ratio | Pass |
| :--- | :--- | :--- |
| `--fg` on `--bg-elev` (sheet body, drawer body) | 15.8 | AAA |
| `--fg-muted` on `--bg-elev` (sheet meta) | 4.5 | AA |
| `--paper` on `--bg-inverse` (offline banner, dark toast) | 16.4 | AAA |
| Sheet scrim overlay tint (decorative) | n/a | decorative |
| Skeleton subtle (decorative) | n/a | decorative |

## Things the mobile pass adds to the QA checklist

1. Open every storefront route at 360x800. Toggle Dynamic Type 200%. Confirm no horizontal scroll, all CTAs reachable.
2. Open every sticky-CTA route in iOS Safari simulator. Tap the input. Confirm the CTA lifts above the keyboard with no gap.
3. Open the drawer via edge-swipe from x=22. Confirm iOS back-swipe at x=10 still fires. (Test in real Safari, not simulator.)
4. Open a bottom sheet. Tab through. Confirm focus is trapped inside.
5. Trigger a pull-to-refresh. Trigger the keyboard refresh-button equivalent. Both must work.
6. Toggle prefers-reduced-motion. Open every animated surface. Confirm animations collapse to instant cross-fades.
7. Run VoiceOver on home. Swipe right through every focusable element. Confirm every icon-only button speaks its label.
8. Switch the system theme to dark. Confirm every mobile surface inherits via `data-theme="dark"`.
