# Desktop accessibility (deep dive)

Additive to `handoff/accessibility.md`. Inherits every rule there (focus order, ARIA roles, contrast ratios, reduced-motion table). This document covers:

1. Focus order per screen (completes the partial table in accessibility.md)
2. Keyboard shortcuts per screen
3. Live-region announcements (cart count, claim confirm, wishlist toggle, status badge flip)
4. High-contrast / forced-colors mode notes for 5 representative screens
5. Browser zoom 200% notes for the most-trafficked routes

No em dashes anywhere.

---

## Focus order per screen (complete set)

The accessibility.md document lists focus order for a few screens. This finishes the set across every storefront route. DOM order matches reading order; no `tabindex` overrides except on the sticky CTA (which is `tabindex="0"` so the keyboard reaches it last in source order).

### `/` (Home)

1. Skip-to-content link
2. AnnouncementBar text (read by screen readers as a region)
3. Hamburger button (mobile only; hidden on desktop)
4. Header brand
5. Header nav links (Shop, Bundles, Freebies, Story, Notes)
6. Header search button
7. Header account button
8. Header cart button (with live-region count)
9. Hero eyebrow (decorative; not focusable)
10. Hero H1 (not focusable)
11. Hero primary CTA (Browse 364 printables)
12. Hero secondary CTA (Try a free sample)
13. CategoryMarquee items (decorative; not focusable)
14. FeaturedRow section action (Browse all)
15. FeaturedRow cards in source order: card 1 link, card 1 heart, card 2 link, card 2 heart, etc.
16. FreeRow section action
17. FreeRow cards (same pattern)
18. CategoryGrid tiles in source order
19. QuoteBlock (no interactive elements except the brand panel CTA if present)
20. Newsletter email input
21. Newsletter Subscribe button
22. Footer nav links
23. Footer currency switcher
24. Footer copyright

### `/shop`

1. Skip-to-content
2. Header (same as Home)
3. Breadcrumb links
4. Shop search input
5. Filter trigger (mobile only)
6. Active filter pills (in source order, with X buttons to remove each)
7. Clear all (visible only if filters are active)
8. Sort select
9. Filter sidebar: each filter section in source order (Category checkboxes, Age, Topic, Price min, Price max, Free toggle)
10. Product grid: card 1 link, card 1 heart, card 2 link, card 2 heart, etc.
11. Pagination: prev, page numbers, next
12. Footer

### `/products/[slug]`

1. Skip-to-content
2. Header
3. Breadcrumb
4. Gallery thumbnails (left arrow, thumbnails 1 through N, right arrow)
5. Save to wishlist button
6. Share button
7. License-tier select (single classroom / multi-classroom / district)
8. Quantity input (digital products: locked at 1, hidden)
9. Add to cart button
10. "What's inside" links (if any inline)
11. Reviews region (if implemented)
12. Footer

### `/cart`

1. Skip-to-content
2. Header
3. Breadcrumb
4. PriceChangedBanner (only when present; `role="alert"` so screen readers announce it immediately)
5. Cart lines in source order: line 1 (title link, quantity input, remove button), line 2, etc.
6. Coupon input
7. Apply coupon button
8. Receipt-email input
9. Sign-in prompt island (if present)
10. Pay button (the sticky CTA in the summary)
11. Footer

### `/orders/thank-you/[id]` (paid)

1. Skip-to-content
2. Header
3. Order H1 (with status badge)
4. Downloads list: row 1 (download button), row 2 (download button), etc.
5. Make-an-account brand banner (Sign in link)
6. Order summary (read-only)
7. Contact-support link
8. Footer

### `/orders/recover`

1. Skip-to-content
2. Header
3. Email input (autofocus)
4. Send my receipts button
5. Footer

### `/account/library`

1. Skip-to-content
2. Header
3. AccountNav tabs (Library current, Orders, Wishlist, Profile, Settings)
4. ClaimBanner (if eligible): Add to library, Not mine, Dismiss
5. Library rows: row 1 (re-download button), row 2 (re-download button), etc.
6. Footer

### `/account/settings`

1. Skip-to-content
2. Header
3. AccountNav tabs
4. Theme segmented control (System, Light, Dark)
5. Currency segmented control (USD, INR, EUR, GBP)
6. Email toggle: Order updates
7. Email toggle: Marketing
8. Session: This device (always active; no action)
9. Session: each other device (Sign out per session)
10. Sign out button
11. Delete account button
12. Footer

### `/sign-in`

1. Skip-to-content
2. Header
3. Email input (autofocus)
4. Send sign-in link button
5. Footer

### `/admin/*`

Admin desktop-primary focus order is shared:

1. Skip-to-content
2. Admin header (logo, env indicator)
3. Admin nav sections (Catalog, Orders, Customers, Marketing, Content, Insights, System)
4. Page H1
5. Page-level action (e.g. "+ New product")
6. Page body (table / form / chart)
7. AdminStickySaveBar (when dirty): Discard, Save

---

## Keyboard shortcuts per screen

Keyboard shortcuts are progressive enhancement. Without them, every action is reachable via Tab + Enter.

### Global (any storefront route)

| Key | Action |
| :--- | :--- |
| `/` | Focus the header search button (opens the search overlay) |
| `Esc` | Close any open drawer or modal |
| `?` | Open keyboard shortcuts help dialog (lists this table for the current route) |
| `g` then `s` | Go to /shop |
| `g` then `h` | Go to home / |
| `g` then `c` | Go to /cart |
| `g` then `a` | Go to /account/library |

### `/shop` and `/shop/[category]`

| Key | Action |
| :--- | :--- |
| `/` | Focus the inline search input on the page |
| `f` | Open the filter sidebar focus (jumps to the first filter checkbox) |
| `Enter` on a card | Open the product detail |
| `Shift+Enter` on a card | Open in new tab |

### `/products/[slug]`

| Key | Action |
| :--- | :--- |
| `Left arrow` / `Right arrow` | Navigate the image gallery |
| `Enter` on a thumbnail | Set as main image |
| `b` | Focus Add to cart button |
| `w` | Toggle wishlist |

### `/cart`

| Key | Action |
| :--- | :--- |
| `Enter` in a quantity input | Apply the new quantity |
| `Esc` on the price-changed dialog | Dismiss |

### `/admin/orders`

| Key | Action |
| :--- | :--- |
| `g` then `l` | Go to /admin/library (catalogue) |
| `g` then `o` | Go to /admin/orders |
| `g` then `i` | Go to /admin/insights |
| `j` / `k` | Move row focus down / up |
| `Enter` on a row | Open order detail |
| `Shift+S` on a row | Open bulk-action toolbar with this row selected |

---

## Live-region announcements

Specific elements with `aria-live` regions. The brief asked for cart count, claim confirm, wishlist toggle, status badge flip.

| Region | aria-live | aria-atomic | What it announces |
| :--- | :--- | :--- | :--- |
| Header cart count (`.cart-count`) | `polite` | true | "Cart, 3 items" (updates when items added or removed) |
| ClaimBanner add-confirm | `polite` | true | "2 files added to your library" (after Add tap completes) |
| ClaimBanner deny-confirm | `polite` | true | "Order hidden from this account" |
| WishlistHeart toggle | `polite` | true | "Added to wishlist" / "Removed from wishlist" (named with the product title) |
| StatusBadge flip | `polite` | true | "Order status changed to Paid" (only when the page is visible and the user is reading it; the same change without UI mount does not announce) |
| Toast / Snackbar | `polite` | true | Toast content read on appearance |
| PriceChangedBanner | `assertive` | true | "Prices updated. Review the new total before continuing." (assertive because the user is mid-checkout) |
| Pull-to-refresh (mobile only; documented for consistency) | `polite` | true | "Refreshing" / "Refreshed" |
| Offline banner (mobile only) | `polite` | true | "Offline. Actions will retry when you reconnect." / "Back online." |
| `role="status"` on skeleton blocks | implicit polite | n/a | "Loading" (per skeleton block; removed on load) |

Implementation rule: live regions are SEPARATE DOM nodes from the visual content. The visual content updates first; the live-region announcement follows with the descriptive copy. This prevents AT clients from reading "12345" when the count goes 1 to 2 to 3 to 4 to 5.

---

## High-contrast / forced-colors mode

5 representative screens verified at Windows High Contrast (forced-colors: active) and macOS Increase Contrast.

### `/` (Home)

- Hero H1: forced-colors paints the H1 in `CanvasText`. The tangerine color-word loses its tangerine paint (forced-colors strips author colors); the visual hierarchy survives because the word is still wrapped in `<em>` and gets `font-style: italic` as a fallback heuristic.
- `.crayon` block-highlight: loses its tangerine fill. Falls back to a 2px solid `Highlight` border (declared in a `@media (forced-colors: active)` block in `styles.css`).
- Eyebrow pulse dot: invisible (decorative). The eyebrow text is announced.
- ProductCard heart: forced-colors strips the rose-500 fill; we declare `forced-color-adjust: none` ONLY on the heart icon's path so the liked / unliked distinction survives.

### `/shop`

- Filter sidebar: each checkbox uses the native checkbox indicator. forced-colors paints them correctly out of the box.
- Active filter pills: lose tangerine paint. The pill border becomes 2px `ButtonText` (declared in forced-colors block).
- ProductCard hover paint: the `::before` outward expansion still works; the background color falls back to `Canvas`, the border becomes `ButtonText`.

### `/products/[slug]`

- Image gallery: thumbnail borders use `ButtonText` instead of `--line`.
- Buy button: forced-colors paints it as `ButtonFace` / `ButtonText`. Hover paints `Highlight` / `HighlightText`.

### `/cart`

- Price-changed banner: loses warn-tinted background. Falls back to a 2px solid `Highlight` border on the banner.
- Total row: bold weight survives (forced-colors keeps font-weight). The exchange-rate parenthetical is muted by `GrayText`.

### `/account/library`

- Library row hover: hover paint falls back to `Highlight` background / `HighlightText` text.
- Download button: ink fill falls back to `ButtonFace` / `ButtonText`.

The single `@media (forced-colors: active)` block in `styles.css` covers the cross-cutting overrides. Per-component overrides only where needed (heart icon, pill border).

---

## Browser zoom 200%

Mocked at 200% browser zoom (typically simulated as 50% viewport width per CSS pixel) for the 4 most-trafficked routes.

### `/` at 200%

- Hero H1 clamps to its floor (72px on desktop, was 152px at 100%). Headline still fits on 2 lines.
- Trust strip wraps from 4 columns to 2 rows of 2.
- FeaturedRow grid drops from 4-col to 2-col.
- No horizontal scroll on the body. Footer wraps cleanly.

### `/shop` at 200%

- Filter sidebar stays 240 wide; product grid drops from 3-col to 2-col.
- Toolbar wraps to 2 rows (filter pills on one row, sort + search on the next).
- No horizontal scroll.

### `/cart` at 200%

- Two-column layout collapses to single column (lines above, summary below).
- Pay button is full-width; receipt-email input is full-width.
- No horizontal scroll.

### `/account/library` at 200%

- AccountNav scrolls horizontally (locked behavior); the underline indicator stays anchored to the active tab.
- Library rows drop from 3-col layout (thumb / content / actions) to 2-col (thumb on the left, content + actions stacked on the right).
- No horizontal scroll on the rows themselves.

---

## Cross-cutting accessibility checks (this pass)

1. Every ProductCard's stretched-link has an aria-label that includes the product title. The visual title uses line-clamp-1 with a native `title` attribute; the link aria-label is the full untruncated string.
2. Every image declares either alt text (decorative or content) or `aria-hidden="true"`. Decorative SVGs in the hero and category tiles are `aria-hidden`.
3. Every form input has a visible label. Labels are never replaced by placeholders.
4. Tab order matches reading order on every screen. No `tabindex` overrides except where source order would skip the sticky CTA on mobile.
5. The locked focus ring (`.focus-ring`) is visible on every interactive surface. Verified at the component-states level and the per-route level.
6. Color is never the sole indicator of state. Status badges combine color + the leading dot + the text label. Sale prices combine ok-color + the strikethrough on the compare price + the "% off" mono label.
7. Live regions wrap dynamic content, not the surrounding chrome.
