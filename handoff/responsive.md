# Responsive (mobile pass)

Breakpoints are locked per the brief. The implementation is already built into every screen via CSS media queries; this document is the spec.

---

## Breakpoint scale

| Token | Min width | Purpose |
| --- | --- | --- |
| `sm` | 640px | Small tablets, large phones in landscape |
| `md` | 768px | Tablets, small laptops |
| `lg` | 1024px | Standard laptops |
| `xl` | 1440px | Desktops, the default design target |

Below `sm` (≤639px) is mobile. Designed around 360, 430, 768, 1024, 1440 per the brief.

---

## Per-screen reflow

### Home (`/`)
- ≤768: hero collapses to single column (already single-column in the live prototype). Decorative wave moves from upper-right to lower-right with reduced opacity. Trust strip wraps; each fact stays on its own line if it must.
- ≤640: CTAs stack vertically. Headline `clamp()` already drops it to 56px floor.

### Shop (`/shop`)
- ≤1023: filter sidebar hides. A "Filters (3)" button appears in the toolbar, opening a right-side drawer (`<dialog>` element with the mobile-filter pattern; sticky bottom-apply button).
- ≤767: product grid drops from 3 to 2 columns. Toolbar wraps; sort dropdown moves below the active-filter pills.
- ≤639: grid stays 2 columns with tighter gap (locked).

### Product detail (`/products/[slug]`)
- ≤900: two-column drops to single column. Image first, sticky buy column flattens below (no longer sticky).
- ≤640: file-meta block wraps to a 2-column key-value grid.

### Cart (`/cart`)
- ≤900: two-column drops to single column. Order summary unsticks; pay CTA stays at the bottom of the summary which sits below the line items.
- ≤640: cart-line columns collapse from 4 to 2; thumb on the left, content on the right; price wraps below content; remove link wraps below content.

### Thank-you screens × 5
- All 5 branches are already single-column. The cart line, status pill, headline, and order summary scale via `clamp()`. The download buttons stay 44px tall for touch.

### /orders/recover, /not-found
- Single-column, narrow text. No reflow needed beyond `clamp()` on the headline.

### Account screens
- ≤640: `.account-nav` overflows horizontally with scroll-snap (already in CSS). The active tab anchors visually via its underline indicator. Library rows collapse from 4 columns to 2 (thumb + content), with actions wrapping below.
- Order detail two-column collapses to single column; summary moves above timeline.

### Admin shell
- ≤1024: sidebar moves to the top of the page as a horizontal scrolling chip row (the same admin-nav-group items, flattened). Page content takes full width.
- ≤768: admin tables get horizontal scroll within their container (preserves all columns); `overflow-x: auto` on `.admin-table`. Bulk-action toolbar wraps actions.
- Forms: `admin-form-grid` collapses to single column at ≤1024. Field rows collapse to single-column at ≤640.
- Insights charts: 4-up KPI grid → 2-up at ≤1024 → 1-up at ≤640. Wide line chart maintains aspect via SVG `preserveAspectRatio`; bar chart keeps bar widths fluid.

### Marketing pages
- All `.mk-twoup` blocks collapse to single column at ≤880.
- About founder-note panel scales the quote via `clamp()`.
- Bundles grid collapses span-2 cells to span-1 at ≤768.
- Blog grid: 3 → 2 → 1 columns at lg/md/sm.

### Policies
- Already narrow single column (max-width 64ch). No reflow.

### Emails
- Email templates use a 600px max-width table with `width:100%`. Most clients render at 320–700px; the template tolerates 280px (Outlook narrow). Inline-block image thumbs collapse cleanly. CTA buttons are table-cell padded so they survive Outlook line-break artifacts.

---

## Touch targets at 430px

Verified per the brief's 44 × 44 minimum:

- Wishlist heart on `.pcard`: visible icon 36, hit area 44 via padding
- Cart icon: 44 × 44
- Heart badge in header: 44 × 44
- Filter checkboxes: label combined hit area 44 vertical
- Add-to-cart: 56 height (xl button)
- Pagination dots: 38 × 38 (slightly under spec; flag for the implementing engineer to bump to 44 if it does not break the visual rhythm)
- Tiptap toolbar buttons (admin only): 30 visible + 6 padding = 36 hit area; admin is desktop-first, accepted trade-off

---

## What changes besides layout

### Header
- Pill-on-scroll collapses to ~1080px on desktop. On mobile (≤768) the header is already nearly full-width at rest, so the collapse is subtle: shrinks from full-width to ~94% with the same backdrop blur. Nav links hide; only logo + actions show.
- Cart count badge stays visible on mobile (no hover state to "reveal").

### Hover-only affordances
- Wishlist heart on product card: always visible on mobile (`(hover: none)` keeps `opacity: 1`).
- Card hover-box paint: never fires on touch devices (`@media (hover: hover)` gates it). Tap goes straight through to the stretched link.

### Animations
- Pulse, marquee, and any decorative motion respect `prefers-reduced-motion` regardless of viewport.
- Hero entrance animations fire on mobile too (with the same delays) since they are part of the first-render experience.

---

## Mobile-specific patterns

### Filter drawer (≤1023)
- Right-side slide-in `<dialog>` with `aria-modal="true"`. Same filter sections as the desktop sidebar. Sticky bottom bar: "Clear all (3)" on left, "Apply" on right. Body locks scroll while open.

### Cart summary on mobile
- The summary card moves to the top of the cart page (above line items) and gets a sticky-bottom Pay CTA. The order-summary lines (subtotal / tax / total) sit in the top card; the CTA is always reachable.

### Admin tables on mobile
- Each row collapses to a card style with the "order number" as the heading, status badge as the meta, and total as the right-aligned strong text. Filter pills remain visible at the top; the bulk-action toolbar stretches full-width when active.

### Account nav scroll
- Horizontal scroll with `scroll-snap-type: x mandatory`. The active tab snaps to the visible left edge on initial load.

---

## What to verify in QA

1. Header pill never overlaps the headline at first paint (the `padding-top: 130px` on `.hero` is the buffer; check at every viewport).
2. Wishlist heart 44px hit area survives at every viewport (no padding collapse under flex constraints).
3. Pay CTA on `/cart` is always visible without scroll past the summary at 360px viewport.
4. Admin table horizontal scroll surfaces a visible scroll bar (don't hide it on mobile).
5. Email templates render in Outlook Web, Gmail Web, Gmail iOS, Apple Mail iOS, Apple Mail macOS, and Hey.com without broken layouts.
