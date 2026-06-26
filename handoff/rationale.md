# Per-screen rationale

Two to four sentences per screen. What it prioritises, what visual hierarchy is doing, what trade-off was made, what this design rejected.

---

## Storefront customer surface

### `/` (home)
Type-driven hero owns the viewport above the fold: the headline IS the LCP. Single tangerine focal hue, warm paper neutrals, no decorative noise besides a single floating wave glyph. Trade-off: rejected the three-card worksheet cluster (founder reviewed three iterations and pulled it out) in favour of the calm one-statement-per-line build. Rejected: italic-serif emphasis on display type; replaced with tangerine color-word + orange highlight block.

### `/shop` (catalog)
Filter sidebar locks left on desktop, drawer-slides on mobile. Product grid breakpoints are LOCKED at 2/3/2/2 to 4/3/2/2 (lg/md/sm/xs). Toolbar with active-filter pills + sort dropdown sits between the page heading and the grid; the pills double as the visible state for "you filtered". Trade-off: dropped the "view density toggle" idea in favour of one canonical grid scale across the site.

### `/shop/[category]`
Same layout as `/shop` with a category-scoped breadcrumb and pre-applied category filter. Page heading becomes the category name; the eyebrow becomes "Category". No structural divergence from `/shop`.

### `/products/[slug]` (product detail)
Two-column on desktop, stacked on mobile. Square image left (matches the 1:1 source PNG lock), sticky buy column right with price + parenthetical USD + file meta block + bulleted features + buy CTA. Trade-off: hid the "secondary wishlist button" as a text link under the buy CTA rather than a second-tier outline button; the wishlist heart on the image header carries the primary affordance.

### `/cart` (full route)
Two-column on desktop (lines left, summary right) collapsing to single column with sticky summary at top on mobile. Email-for-receipt field sits above the pay CTA in the summary card. Price-changed banner is the warn variant (yellow-tinted), surfaced at the top when the server returns 409. Trade-off: rejected a "quantity stepper" since digital files have qty=1; remove instead.

### `/orders/thank-you/[id]` × 5 branches
Same skeleton, status pill switches color/copy per branch (paid green / pending muted / failed red-tinted / refunded muted-strike / partial warn). Items list re-uses the library-row primitive so the engineer has one row component to maintain. Trade-off: kept the help-block on every branch even when the order is paid; reduces support emails.

### `/orders/recover`
Single column, narrow. Form first, neutral anti-enumeration response second. The submitted state's copy never confirms whether the email matched ("if we have any orders for that address..."). Trade-off: rejected showing the matched-order count in the success state; anti-enum > convenience here.

### `/not-found`
Big type, search input, three popular products, three category tiles. The 404 routes forward, never backward. Trade-off: did not add a "report this missing page" link (the analytics will tell us).

---

## Customer account

### `/account/library`
Top-tab account-nav, claim banner at top when unbackfilled orders match the email, then the rows. Every row shows status (paid uses no badge per Etsy convention; the other four use the status-badge primitive). Mint-on-click download buttons reuse the same primary-ink button. Trade-off: rejected a "downloads remaining" counter; the link is mint-on-click with no count, which is simpler to explain.

### `/account/orders`
Order rows with sortable columns on desktop, collapse to a card list on mobile. Status badge sits in its own column so filtering by status is straightforward. Trade-off: rejected the "expand row to see items" pattern; clicking the row goes to detail instead.

### `/account/orders/[id]`
Two-column: items + timeline left, summary sidebar right. Timeline uses a vertical line + dots pattern, with the freshest event at top. Trade-off: did not surface the IP address of the download in the customer view (it lives in admin only).

### `/account/wishlist`
Same `.pcard` grid as `/shop`. Hearts default to active. Trade-off: kept the wishlist on a separate route rather than as a dropdown on the cart icon; the routing matches the customer's mental model.

### `/sign-in`
Magic-link first (primary CTA), Google second below a divider. Sent panel and cookies-disabled banner are hidden by default, surfaced via state. Trade-off: no password field. Customers who want a password can set one in `/account/profile` after signing in.

### `/account/profile` and `/account/settings`
Two simple form-card-stack pages. Profile owns identity and the danger zone (delete-account). Settings owns marketing preferences and display preferences. Trade-off: split into two screens rather than one tabbed screen because the danger zone deserves visual separation.

---

## Admin

### `/admin/products`
Sortable table with quick-edit price (the input is editable in place, not a separate edit screen). Bulk-action toolbar appears when rows selected, with the bulk-bar at top. Trade-off: title column uses `Title + meta` two-row pattern so the slug is always visible without needing a tooltip.

### `/admin/products/new`
Two-column form. Tiptap toolbar with H2/H3/B/I/code/lists/link — no kitchen-sink, just the marks the brief specifies. Image dropzone + grid below the description. Sticky save bar at the bottom of the viewport with a "Unsaved changes" pulse when dirty. Trade-off: SEO block is collapsible-style (a separate card) rather than always expanded.

### `/admin/orders` + `/admin/orders/[id]`
Filter pills above the table (All / Paid / Pending / Failed / Refunded / Partial) double as the visible state. Detail page has the customer block in the sidebar with LTV + order count + member-since, plus the payment block. Timeline shows every event with payment-system IDs (charge_8x2L9k) visible. Trade-off: refund action lives in the page header, not in the items list; a refund is order-level, not item-level by default.

### `/admin/insights`
KPI cards top row (4 cards: revenue, orders, AOV, refund rate), each with a sparkline. Below that, a wide line+area chart of revenue by day, then a 2-up of top-products list + revenue-by-category donut. Editorial chart styling: thin lines, mono numerals, no chart frame, dashed gridlines. Trade-off: explicitly avoided Chart.js look-and-feel; if the engineer reaches for a library, recommend Tremor or Visx + the styles in this file.

---

## Marketing

### `/about`
Narrative split with `<h2>` left, paragraph right. Three rules section uses a numbered ordered list with mono index labels. Founder's note in a tangerine panel with the founder's name + place + start year. Trade-off: kept the founder-note short and quotable rather than a long bio.

### `/contact`
Form left, info right. Topic select narrows support load. Direct email surfaced separately so the form is not the only way through.

### `/faq`
12 questions in `<details>` accordion (no JS needed; native `<details>` is keyboard accessible and animatable). Plain-text answers, no marketing. Trade-off: avoided a search bar inside the FAQ; 12 questions fits comfortably in scan range.

### `/freebies`
Hero with a tangerine signup panel + the headline "Try one. Then decide." Below: four standalone free printables in the .pcard grid (no email required for these).

### `/bundles`
Asymmetric featured-large + 4 smaller bundles, each in its own brand-coloured panel (joy / iris / sun / rose). Each bundle shows sale-vs-original price.

### `/collections/[slug]`
Same as `/shop` with a curated headline and a smaller filter sidebar (just sort + price + freebie toggle, no category filter since the collection IS the category).

### `/policies/*`
Five policy pages share the `.mk-prose` layout. Narrow text column, generous spacing, plain language headers. Each closes with a "last updated" line and a version number. Trade-off: kept the legal copy short; founder's lawyer can extend it, but the design respects the buyer's time first.

---

## Blog

### `/blog`
Featured post in an inverted-color hero card (ink bg, paper text). 5–6 regular posts in a 3-column grid below. Tag filter pills above the grid.

### `/blog/[slug]`
Ink-bg hero with the post title at huge display size and a single-line author + date + read-time strip. Body in `.mk-prose` with `<blockquote>` styled (3px brand-color left border, larger type). Related posts at the bottom in a 3-card row.

---

## Email templates

### `receipt-paid`
Status pill + headline + 3-item table + totals + library-CTA panel + help footer. Inline CSS, table layout, web-safe Georgia + Helvetica stack so Outlook + Gmail Web render cleanly.

### `receipt-refund`
Same skeleton, refund summary table replaces items list, "tell us what went wrong" CTA replaces the library CTA.

### `magic-link`
Narrow 540px card with one button and a paste-this-URL fallback. Cookie warning hidden by default in the live page; the email doesn't carry it (the cookie issue is detected on landing).

### `order-recovery`
Multiple orders grouped by order number, each with its own item list. Library CTA at the bottom hints at the upgrade path.

---

## What we deliberately left out

- A `/contact` map embed (the shop is digital; no physical address matters to a customer).
- Live chat widget on every page (one person reads emails; live chat is a lie).
- A loyalty / points system (printables are bought, not subscribed to).
- Social-proof rotators ("Sarah from Portland just bought…"). Buyer is the adult; that copy is for the wrong audience.
- An onboarding tour. The site is one click from any screen back to /shop; tours are for software that hides its own structure.
