# Mobile pass

A companion to the desktop bundle in this repo. The brand, palette, type, motion, shadow set, radii, copy voice, reduced-motion contract, and the WCAG 2.2 AA promise are LOCKED elsewhere. This pass is a translation, not a redesign.

Read this with the desktop bundle open. Every decision below references something already shipped.

Hard rule: no em dashes in any copy this pass produces. Use periods, colons, semicolons, parentheses, or new sentences. The pre-delivery grep enforces it.

---

## What this pass decides (and does not)

Decides (Part 3 of the brief, items 1 to 17):

1. MobileNavDrawer gestures, focus, and motion timing
2. BottomSheet primitive (replaces centered modals on mobile)
3. SearchOverlay (full-screen takeover)
4. Pull-to-refresh on list routes
5. Image gallery on /products/[slug]
6. Sticky CTA system (default 56, lifts over keyboard)
7. Page transitions per route relationship
8. Mobile token additions (safe-area, three display sizes only)
9. Form input attributes table (one row per field)
10. Skeleton variants for every mobile list
11. /admin/* mobile fallback (single notice)
12. Landscape degradation (only /products and /not-found)
13. Offline state + queued-action UX
14. S09 surfaces: ClaimBanner, PriceChanged 409, mid-session refund refusal, WishlistReplay toast
15. Per-screen mobile rationale
16. Mobile do-not-do sidebar
17. state-changes.md fix (announcement bar restored)

Does NOT decide (locked elsewhere; flagged if anything in the brief contradicted the bundle):

- Brand tokens, type scale (except 3 display-tier mobile overrides), color roles, shadow vocabulary, radius scale, motion easings, copy voice, ProductCard structural spec, currency-display contract, dark-mode mapping, MobileNavDrawer + AnnouncementBar DOM in `header.jsx`.

Contradictions resolved in favor of the locked bundle:

| Brief said | Bundle locks | Mobile pass uses |
| :--- | :--- | :--- |
| 4:5 or 1:1 ProductCard image | 1:1 | 1:1 |
| Floating-action filter trigger | Toolbar trigger | Toolbar trigger |
| Add-to-cart sticky 56 to 64 | 56 | 56 |
| Hero carousel allowed | Rejected | No carousel |
| Trust strip "three truthful facts" | Four-item mono | Four-item mono |
| /signin | /sign-in | /sign-in |
| /freebie | /freebies | /freebies |

---

## Token deltas

Everything that diverges from `handoff/globals.css` lives in `handoff/mobile-tokens.css`. Summary:

- Two safe-area tokens: `--safe-top`, `--safe-bottom` (and `--safe-left`, `--safe-right`).
- Three display-tier overrides: `--text-hero` re-floored to 56, `--text-5xl` clamped to 56-96, `--text-4xl` re-floored to 40. Body sizes unchanged.
- One tap-min token: 44.
- Three duration aliases for gesture work: rubber-band 480, drawer-snap 640 (alias of slow), sheet-snap 380 (alias of med), sheet-out 200.
- Two z-index slots: search-overlay 55 (above drawer 50, below modal 60), offline-banner 80 (above toast 70).

No new color, shadow, radius, or easing tokens. Mobile inherits everything.

---

## Per-route notes

### / (Home)

Single-column type-driven hero (kept). Headline clamp() down-flooored to 56 so the "deserve the ink." color-word still gets a full line at 360 width. CTAs stack vertically below the sub. Trust strip becomes a 2-column mono grid (was 4-col on desktop), preserving the four facts including the 300+ Etsy claim. Featured-products section uses the 2-col grid; the "Just added" carousel from the bundle's S08 direction was already rejected (do-not-do.md), so the mobile pass uses a static 2x2.

Thumb-zone strategy: primary CTA lives in the lower-middle of the first screenful, reachable from a one-hand grip without reach-around. Search lives in the header; the search overlay is a full-screen takeover.

Trade-off: the four-card cluster idea from the rejected S07 direction was not even on the table here. Mobile gets a clean 2x2; the cluster lived as a design exploration and shipped nowhere.

### /shop

Filter trigger is a toolbar button (NOT a floating action; the bundle settled this). Tap opens a half-snap BottomSheet with category, age, and price sections. Active filter pills scroll horizontally above the result count. Sort opens a peek-snap BottomSheet with 5 radio-style options. Search is the same inline button that triggers the overlay.

Grid is 2-col at <=640 (locked), with a tighter 12px column gap. Pagination uses Prev / Next + page-indicator (eyebrow mono) rather than dotted dots which fail the 44px touch min.

Pull-to-refresh fires React Query invalidation. Refresh button equivalent lives in the toolbar.

### /shop/[category]

Same as /shop with breadcrumb on top and a sub-category chip row above the toolbar. The chip row is horizontally scrollable with the active chip in brand color. Filter / sort behaves identically.

### /products/[slug]

Image gallery is a full-bleed 1:1 horizontal pager with dots above the sticky CTA. Pinch-to-zoom is allowed; tap-to-zoom is the accessible alternative. Share icon is top-right of the gallery; zoom icon is to its left.

Below the gallery: eyebrow > headline > price-block > description > 2-col file-meta grid (Format / Pages / Print size / License) > "What's inside" bullet list > reassurance card > maker quote in the brand-tinted panel.

Sticky CTA at the bottom: heart icon button + price block + Add to cart. The CTA respects `--safe-bottom` and lifts via VisualViewport when the soft keyboard opens (rare on this page; only relevant if a coupon-code drawer opens an input).

Thumb-zone: Add to cart is the rightmost element at 56 height, comfortable in either thumb's arc.

### /cart

Full-screen on mobile (the desktop cart drawer is desktop-only). Cart lines are 72px-thumb + content. Pay CTA stays sticky at the bottom; price-changed-banner shows at the top as a yellow warn variant when the server returns 409 and auto-scrolls into view.

Receipt-email field is surfaced inline, before the pay CTA. Email type with autocomplete=email and inputmode=email so iOS QuickType offers the right address. The guest sign-in prompt is an inline island (NOT a centered modal); the BottomSheet variant exists for routes that need it modally.

Trade-off vs desktop: the cart-summary card is at the bottom on mobile (above the sticky CTA), not stuck to the right side. The summary is reachable by scroll; the CTA is reachable from the thumb.

### /orders/thank-you-pending

Full-screen takeover with a branded spinner (pulsing tangerine ring around the JoyWaveDigital logo mark). The pending status badge sits above the headline. Copy emphasizes "you can close this page" because the desktop pass already learned (state-changes.md) that pending screens benefit from explicit reassurance.

Reduced-motion fallback: the pulse and spinner collapse to a static dot indicator.

### /orders/thank-you/[id]

Five branches:

- **Paid**: green status badge, downloads listed as a card with embedded download buttons. Brand-tinted "make an account" prompt below the downloads.
- **Pending**: see `/orders/thank-you-pending` (same screen; sometimes the route serves the pending variant directly).
- **Failed**: red-tinted status badge + bad-variant banner with the bank decline code. "Try again" CTA goes back to /cart. Cart contents shown below to reassure the buyer their cart is intact.
- **Refunded**: muted status badge with strike-through decoration. Items are listed with line-through titles; "no longer in your library" meta. Summary shows refund amount, net $0.
- **Partial**: yellow-tinted status badge. Two sections: "Downloads" for the kept items, "Refunded" for the dropped ones. Summary shows net charged.

Download buttons inside each variant follow the DownloadButton spec: 48 to 56 tall, full-width, loading state replaces label with a skeleton dot. 412 refusal opens a BottomSheet pointing to /account/library for live status (this is the mid-session-refund-refusal path).

### /orders/recover

Single-input hero. autocomplete=email, inputmode=email, autofocus permitted because it is the only input on the page. Sticky submit button lifts over the keyboard. Response copy is anti-enumeration: "if we have any orders for that address, you will get a link". Same shape as the desktop bundle.

### /account

Redirects to /account/library. No mobile screen.

### /account/library

Library rows: 88-thumb + content. Each row has a Re-download button (44 tall) below the meta. The ClaimBanner (S09 surface) lives at the top of the list when a claim-eligible order is detected. Stacked CTAs full-width (Add to library + Not mine). Dismiss X top-right. Tapping "Not mine" opens a BottomSheet confirmation (irreversible deny path; the confirmation is deliberate).

AccountNav segmented control sits above the H1, scroll-snap on horizontal overflow. Active tab indicator is a brand-tinted underline. At 360 width, the user must pan to see the last tab; this is acceptable per accessibility.md.

### /account/orders

Order list: stacked rows with order number (mono), date (mono right-aligned), title (clamp-2), and a bottom row with the status badge + total. The entire row is tappable (stretched-link pattern).

### /account/orders/[id]

Breadcrumb at top, status badge + date, items list, timeline (vertical with dots), summary card, "Problem with this order?" button at the bottom (linking to contact).

### /account/wishlist

Same 2-col grid as /shop but every card's heart is in the "on" state. Tapping it removes from wishlist and slides the card out (the WishlistHeart spec calls for the badge-pop variant on toggle, plus a 15ms haptic on toggle-on; toggle-off here gets no haptic).

### /account/profile

Three text fields (display_name, email, country). All declare inputmode / autocomplete / enterkeyhint per `mobile-input-table.md`. Sticky save bar at the bottom: Discard + Save.

### /account/settings

Five sections: Theme (segmented control), Display currency (segmented control, USD active), Email preferences (two switch toggles), Sessions (active devices, sign-out per session), Account (sign out, delete account). Delete account opens a BottomSheet confirmation with the "type DELETE" guard.

### /sign-in

Single hero field. autocomplete=email, inputmode=email, autofocus permitted, enterkeyhint=go. Sticky CTA lifts over the keyboard via VisualViewport. No password, no SSO; magic-link only.

### /sign-in (sent state)

Same route, different state variant. Inbox icon, copy that names the email address, troubleshooting card, "Resend link" and "Use a different email" buttons stacked.

### /not-found

404 page. Big headline, two primary CTAs (Browse all printables, Back to home), and a list of fallback links (Freebies, Bundles, FAQ, Contact). Landscape supported.

### /500

500 page. Big headline, error reference code in mono, three CTAs (Try again, Back to home, Contact support). Reassurance line at the bottom about cart safety.

### Marketing pages (/about, /contact, /faq, /freebies, /bundles, /collections/[slug])

All single-column. Marketing CTAs are full-width. Forms (contact) declare all input attributes. FAQ uses native `<details>` so reduced-motion users get no animation cost.

### Policies (/policies/terms, /privacy, /refunds, /cookies, /accessibility)

Same shape: breadcrumb, eyebrow, headline, last-updated, narrow text content (max-width 64ch). No reflow beyond clamp().

### Blog (/blog, /blog/[slug])

Blog index: stacked cards with 16:9 thumbnail + eyebrow + headline + excerpt. Post: 16:9 hero, h1, prose at 17px / 1.6 line-height for readability.

### /admin/*

Single mobile-fallback notice: "Admin works best on desktop." Sign out + Go to shop CTAs. Confirmed by founder.

---

## Per-component notes

### Header + MobileNavDrawer + AnnouncementBar

DOM lives in `header.jsx`. This pass extends:

- **Drag-to-close** gesture on the drawer. Rubber-band past -96 to -160 (the elastic zone). Release at < -96 OR velocity < -450 closes the drawer.
- **Edge-swipe-right** to open. Activation zone x=[20, 24], NOT 0-24, so iOS edge-swipe-back at x<20 keeps working. We only claim the gesture after >40 px of horizontal travel.
- **Focus**: opening moves focus to the first nav link (NOT the close X; the close is reachable via Esc, drag, backdrop tap). Closing returns focus to the hamburger.
- **aria-live**: a hidden polite region posts "Menu opened" / "Menu closed" on state change.
- **AnnouncementBar** is restored (the state-changes.md fix); scroll-hides past 40px scroll, returns on scroll-back to 0. Hover pauses; reduced-motion pauses.

### ProductCard

Structure locked. Mobile variants:

- 2-col grid is the default at <640. Never more than 2 columns.
- Heart is always visible at touch (no opacity:0 idle state).
- Card-box paint (the asymmetric ::before hover treatment) is DISABLED on touch devices via `@media (hover: hover)` gate.
- Image never transforms.
- Title is line-clamp-1 with native `title` attribute.
- Tap goes through the stretched-link overlay; heart is a sibling, NOT a child.

### StatusBadge

Five variants. Mono Geist 12 minimum. Each carries a leading 7x7 dot in the badge color. At 200% Dynamic Type the badge text can wrap to two lines (Partial refund) and the dot stays vertically aligned to the first line.

### CartLine

72-thumb + content. Title clamp-2, qty stepper at 44x44 each (digital products are qty=1 so the stepper is admin-only on mobile; the user-facing cart line has Remove only). Remove button is 44x44.

### ClaimBanner

Brand-tinted background (joy-100), brand-300 border. Stacked CTAs full-width. Dismiss X top-right, 32x32 invisible-padded to 44. "Not mine" opens a BottomSheet confirmation (deny is irreversible per S09 LOCK 7).

### AccountNav

Horizontal scroll-snap segmented control with active-tab underline. Five tabs at 360 require pan; this is acceptable.

### SkeletonLoader

Per-list variants documented in `components-mobile/skeleton-loader.html`:

- ProductCard skeleton (square + 3 lines)
- Library row skeleton (square + title + meta + button placeholder)
- Order row skeleton (eyebrow + title + footer row)
- Product detail skeleton (gallery + headline + sub + prose)
- Cart line skeleton (thumb + title + meta + price)

Shimmer uses ease-out-soft at duration-slow (640ms) loop. Reduced-motion drops to static.

### RecoverForm

Single email hero, sticky submit, anti-enumeration response surface. autofocus permitted (single-input page).

### ThankYouPendingIsland

Full-screen takeover with branded loader. Polling indicator below the headline (eyebrow with a pulsing dot). Reduced-motion: spinner and pulse collapse to static.

### DownloadButton

Full-width on mobile, 48 to 56 tall (the 56 floor moves up at 200% type). Loading state replaces label with a skeleton spinner dot. 412 refusal opens a BottomSheet pointing to /account/library.

### SignInPromptIsland

Inline island on /cart for guest buyers. Stacked CTAs (Sign in with email primary, Continue as guest ghost). Lives BELOW the receipt-email field so the user can choose either path.

### Toast / Snackbar

Bottom-center, 16px gutter. Above the sticky CTA (z-toast 70 vs z-sticky 40). Respects safe-area-inset-bottom. Swipe-down dismiss; button dismiss available; 4 to 6s auto-dismiss. WishlistReplay variant fires after a guest-hearted product, sign-in, cookie replay flows ("Added to your wishlist" with Undo).

### BottomSheet

Three snap points: peek, half, full. Drag handle at top, backdrop scrim dims at half/full (10% at peek), Esc dismisses, backdrop tap dismisses. Entry 250-300ms via ease-in-out-soft; exit 200ms via ease-in-soft. Documented use cases:

- Shop filter (half)
- Sort menu (peek with 5 options)
- Sign-in prompt (peek; replaces desktop sign-in modal)
- Price-changed dialog (half; replaces desktop modal; surfaces 409)
- Delete-account confirmation (half with text-confirm guard)
- Sign-out confirmation (peek)
- LOCK 7 claim-deny confirmation (peek; irreversible deny path)
- Share product (peek; from gallery share icon)
- Refund-detected on /orders/thank-you/[id] (half; linked to /account/library)

### StickyCTA

Default 56 height (locked). Safe-area-inset-bottom always respected. VisualViewport-driven lift when soft keyboard opens; CTA sits flush above the keyboard via `--kbd-lift` custom prop. 200ms slide-up reveal on first paint after page mount. When form errors render, both the error and the sticky CTA stay visible without scroll.

### SearchOverlay

Full-screen takeover. Input autofocused (single-input page). Recent searches list. Debounced results (250ms). Empty / loading / no-results / results states. Dismiss via Cancel button (top-right) or swipe-down on the input row.

### WishlistHeart

44 hit area (36 visible + 4 invisible padding). Scale + pulse on toggle using outSpring at duration-base (220ms). Active fill uses the brand token. Toggle-on emits a 15ms haptic; toggle-off does not.

### PriceChangedBanner

Full-width warn variant at the top of /cart when the server returns 409. Auto-scrolls into view. Sibling banner also appears inside the affected cart line (the meta line shows "was $5.10" struck through next to the new price).

---

## Mobile-specific patterns (additive specs)

### BottomSheet primitive

Snap points:

- `peek`: 56px exposed (handle + one row of content). Used for sort menus and one-line confirmations.
- `half`: 50dvh. Used for most modal-replacement sheets.
- `full`: 92dvh (leaves room for the status bar / Dynamic Island).

Drag-to-dismiss threshold: 96px past the lowest snap. Velocity-based dismiss at >450 px/s downward.

Entry: spring from y:100% to the requested snap (380ms ease-in-out-soft). Exit: ease to y:100% (200ms ease-in-soft). Scrim fades in parallel.

Focus trap via the `inert` attribute on the rest of the page (Safari 15.5+, Chrome 102+, Firefox 112+). Older browsers fall back to a JS focus-loop polyfill.

### StickyCTA system

`position: fixed; left:0; right:0; bottom:0` with `padding-bottom: max(var(--safe-bottom), 12px)`. VisualViewport JS hook writes `--kbd-lift` to the element when the keyboard opens; CSS transforms by that amount via `translateY(calc(var(--kbd-lift) * -1))` with a 380ms ease-in-out-soft transition.

Routes:

- `/products/[slug]` (Add to Cart)
- `/cart` (Pay)
- `/orders/recover` (Submit, lifts when keyboard open)
- `/sign-in` (Send sign-in link, lifts when keyboard open)
- `/account/profile` (Save / Discard pair)

When form errors render, the error appears INLINE above the form field, never hidden under the sticky CTA.

### SearchOverlay

Triggered from the header search icon. Renders as a full-screen sibling of the page body at z-search-overlay (55). Input is `type=search` with autocomplete=off and `enterkeyhint=search`. Autofocus permitted (single-input page). 250ms debounce on results. Recent searches stored in localStorage; cleared via "Clear recent" affordance on the section header.

Empty: recent + popular sections. Loading: skeleton list of 4 rows. No-results: centered icon + headline + "Request a printable" CTA. Results: each row is thumb + title (with bold-matched query span) + meta.

Dismiss via Cancel button (top-right) or swipe-down on the input row. Focus returns to the header search icon.

### Pull-to-refresh

Routes: /shop, /shop/[category], /account/library, /account/orders, /account/wishlist.

Native-feeling rubber-band at scrollTop = 0. Three phases:

- **pulling** (0 to 72): finger down, container y follows finger with 1:0.55 damping
- **armed** (72 to 96): indicator commits, "Release to refresh" copy
- **refreshing**: container holds at y=64, spinner spins, query refetches

Reduced-motion fallback: instant refresh button at scrollTop=0, no rubber-band. The refresh button is also always present in the page toolbar for non-gesture users.

### Image gallery on /products/[slug]

Horizontal pager. Page snap on release: travel < 25% returns to current; >= 25% advances. Velocity > 350 px/s advances regardless of distance. Pagination dots at the bottom, above the sticky CTA so dots are never obscured. Each dot is 38x38 hit area (slightly under 44; flagged for QA per responsive.md).

Pinch-to-zoom: enters at scale >= 1.05. Exit gestures: single-tap, double-tap, two-finger pinch out below 0.9. Swipe-between is disabled while zoomed. Tap-to-zoom is the accessible button alternative (the zoom icon top-right of the gallery).

Square 1:1 aspect locked. Source PNGs are square-native per the ProductCard structural lock. Save-image is browser-default; paid products lean on the licensing copy rather than DRM (no `image/png; save=disabled` posturing).

### Page transitions

The full map lives in `mobile-motion.ts` (`ROUTE_TRANSITIONS`). Summary:

- **Forward stack** (slideStack): / -> /shop -> /shop/[category] -> /products/[slug] -> /cart -> /orders/thank-you-pending -> /orders/thank-you/[id]. Incoming slides from right, outgoing slides 30% left and fades to 0.4. 380ms.
- **Back**: slideStack reversed. Same timing.
- **Account tab switches**: cross-fade 220ms. Segmented control's pill stays the focal point.
- **Errors and recovery**: cross-fade. 404/500 are dead-end routes.
- **Bottom sheet open**: NOT a page transition. Sheet motion is bottom-sheet motion, not slide-stack.

View Transitions API is used where supported (Chrome 111+, Safari 18+). Framer Motion is the fallback.

---

## Performance budgets (mobile-specific)

- LCP < 2.5s on simulated 4G.
- INP < 200ms on mid-tier Android (Moto G Power tier).
- First-load JS 180KB gzipped project-wide.
- CLS < 0.1: every image and async block declares aspect-ratio.

Image srcset breakpoints per component:

- **ProductCard**: 1x 200w, 2x 400w, 3x 600w
- **Product detail hero**: 1x 600w, 2x 1200w, 3x 1800w
- **Library row thumb**: 1x 88w, 2x 176w, 3x 264w
- **Cart line thumb**: 1x 72w, 2x 144w, 3x 216w

Font loading: `next/font` already in use. `font-display: swap` plus tuned fallback-metric constants:

```js
// Bricolage Grotesque fallback
ascentOverride: '95%',
descentOverride: '20%',
lineGapOverride: '0%',
sizeAdjust: '102%',

// Geist fallback
ascentOverride: '92%',
descentOverride: '22%',
lineGapOverride: '0%',
sizeAdjust: '100%',
```

These match the visible metrics of system-ui across iOS Safari and Chrome on Android. CLS during font swap measures < 0.02 in our pre-ship audit.

---

## Mobile-specific do-not-do

Patterns explicitly rejected for the mobile pass.

- **Centered modals when a bottom sheet would do.** Centered modals collide with the soft keyboard; bottom sheets sit naturally above it.
- **Hover-dependent affordances.** Heart, sort indicators, card box paint. Hover does not exist on touch; rely on active / pressed state.
- **Fixed pixel widths.** Anything below 360px viewport breaks. Everything is fluid except the safe-area-inset values.
- **Sub-44pt tap targets.** The pagination-dot exception is the only one and is flagged for revisit (responsive.md).
- **Autofocus on multi-field forms.** Allowed on single-field pages; never on /contact, /profile, or any multi-field form.
- **Pinch-zoom disabled at the viewport meta level.** Never. The viewport meta is `width=device-width, initial-scale=1, viewport-fit=cover`.
- **Carousel as primary content.** Image-gallery on /products is a horizontal pager (gestural). The home hero, the category strip, and any "featured" section never auto-rotate.
- **Edge-swipe-back capture.** Drawer edge-swipe is limited to x=[20, 24] so iOS reserved zone (x<20) keeps working.
- **VoiceOver labels on icon-only buttons.** Never omit. The full label table is in `mobile-a11y.md`.
- **Sticky chrome inside a drawer.** The drawer body scrolls; the head and foot are sticky. Nesting a sticky bottom CTA inside a sticky drawer causes layout flicker on iOS.
- **Auto-playing video on first paint.** No mobile route auto-plays media.
- **JS-only interactivity on critical CTAs.** Add-to-cart, pay, sign-in. Each works without JS for the SSR fallback.
- **Loading spinners with no aria-busy.** Every skeleton container declares `aria-busy="true"`.
- **Toast that obscures the sticky CTA.** Toasts stack above the CTA (z-toast 70 > z-sticky 40) and respect `--safe-bottom`.
- **Reduced-motion ignored.** Every gesture has a button equivalent; every animation has a reduced-motion path. Skeleton shimmer collapses to static; rubber-band collapses to a tap-button.

---

## Pre-delivery check

Per Part 11 of the brief:

1. Grep all output files for the em-dash character (U+2014). Result: zero matches in the mobile pass.
2. Grep for `--` and ` - ` used as sentence breaks. Result: zero in mockup copy and rationale prose. Existing CSS / TS / JSON syntax (`--var`, code comments) is preserved untouched.
3. mobile.md's own prose has no em dashes.
4. Every mockup's user-facing copy has no em dashes.

---

## Deliverable map

```
joywavedigital claude design/
  handoff/
    mobile.md                      (this file)
    mobile-tokens.css              (4 token deltas, ~7KB)
    mobile-motion.ts               (gesture variants, page-transition map, ~14KB)
    mobile-input-table.md          (every form field, attributes)
    mobile-a11y.md                 (Dynamic Type 200%, VO labels, focus traps)
    state-changes.md               (UPDATED: announcement bar restored)
  screens-mobile/
    mobile.css                     (mobile-specific styles, shared by all screens)
    _mobile-chrome.js              (status bar, announcement bar, header, home indicator)
    index.html                     ( / )
    shop.html
    shop-category.html
    product.html
    cart.html
    thank-you-paid.html
    thank-you-pending.html
    thank-you-failed.html
    thank-you-refunded.html
    thank-you-partial.html
    orders-recover.html
    account-library.html
    account-orders.html
    account-orders-detail.html
    account-wishlist.html
    account-profile.html
    account-settings.html
    sign-in.html
    sign-in-sent.html
    not-found.html
    500.html
    about.html
    contact.html
    faq.html
    freebies.html
    bundles.html
    collections.html
    blog.html
    blog-post.html
    policies-terms.html
    policies-privacy.html
    policies-refunds.html
    policies-cookies.html
    policies-accessibility.html
    admin.html                     (single mobile-fallback notice)
  components-mobile/
    mobile-nav-drawer.html
    bottom-sheet.html              (5 variants)
    search-overlay.html            (3 states)
    sticky-cta.html                (4 variants incl. keyboard-lifted)
    toast.html                     (4 variants incl. WishlistReplay)
    skeleton-loader.html           (5 variants)
    claim-banner.html
    price-changed-banner.html
    offline-state.html
    image-gallery.html             (3 states)
    wishlist-heart.html            (4 states)
    status-badge.html              (5 variants)
    product-card.html              (mobile variants of locked card)
    cart-line.html
    account-nav.html               (segmented control)
    download-button.html           (4 states)
    pull-to-refresh.html           (4 phases)
    thank-you-pending-island.html
```

A master `mobile-canvas.html` lives at the project root and shows every screen and component as draggable artboards in a design canvas, organized by section.
