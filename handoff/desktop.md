# desktop.md

The desktop companion pass to the existing JoyWaveDigital bundle. Read this alongside `handoff/README.md`, `handoff/globals.css`, `handoff/motion.ts`, `handoff/accessibility.md`, `handoff/responsive.md`, `handoff/do-not-do.md`, `handoff/state-changes.md`, and `handoff/rationale.md`. The brand, palette, type, motion vocabulary, shadow set, radii, copy voice, reduced-motion contract, and the WCAG 2.2 AA promise are LOCKED in those documents. This pass adds depth and verification; it does not redecide any of them.

No em dashes anywhere in this document. The pre-delivery grep enforces it.

---

## What this pass produces

1. `pixel-precision-audit.md` (in `handoff/`) confirms PATTERN A (SectionHead two-tone emphasis) and PATTERN B (Scroll-shrinking pill header) are preserved across every applicable surface, with explicit waivers and rationale for every exception.
2. State-stacked HTML per route in `screens-desktop-states/`, one file per route. Each file shows the route in every applicable state: header flat, header scrolled (pill), default, loading, empty, error, success. Routes that do not scroll past 40px get an explicit "no pill state applicable" notice in lieu of the scrolled card; routes that have no empty / error / success path do not get padded with synthetic states.
3. Multi-width side-by-side per route in `screens-desktop-widths/`, rendered at 1280, 1440, and 1920. A short "what reflows" note documents the differences per width.
4. State-stacked HTML per component in `components-desktop-states/`, one file per component. Each file shows the component in every applicable state: rest, hover, focus-visible, active, disabled, loading, error, dark-mode equivalents where the dark paint differs.
5. `desktop-input-table.md` (this folder) carries one row per form field across the storefront. Mirrors the mobile pass.
6. `desktop-a11y.md` (this folder) finishes the focus-order entries the existing accessibility.md only partially covers, plus keyboard shortcuts per screen, live-region announcements, high-contrast / forced-colors notes, and browser-zoom 200% notes for the five most-trafficked routes.
7. `desktop-motion.ts` (this folder) is ADDITIVE to the existing `handoff/motion.ts`. It formalizes the variants that file did not formalize: the buttery 700ms header-pill collapse, the SectionHead stagger entry, the asymmetric ProductCard hover paint (documented for reference; the implementation stays CSS-only), the badgePop on cart-count and heart-toggle, the focus-within paint timing, and the price-changed banner entry.

---

## What this pass does NOT redecide

If anything in the brief contradicts the existing bundle, the existing bundle wins. Contradictions found and resolved:

| Brief item | Bundle locks | Resolution |
| :--- | :--- | :--- |
| ProductCard image aspect ratio is open to revisit | 1:1 locked (May 2026) | 1:1 |
| Header pill starts wide and shrinks on scroll | Flat at rest, pill on scroll | Flat at rest, pill on scroll |
| Hero auto-rotating carousel | Rejected per do-not-do.md | No carousel |
| Add-to-cart on the ProductCard | Rejected; the card has no buy CTA | No add-to-cart on the card |
| Sale state can use bright red | Rose at oklch hue 6, chroma 0.19 | Rose, not aggressive red |
| Em dashes allowed in marketing copy | Banned hard rule | Banned |
| Italic emphasis via serif italic | Rejected; the two-emphasis system is tangerine color-word + .crayon block-highlight | The two-tone system |
| /admin uses generic Chart.js styling | Editorial chart styling locked | Editorial (mocked separately in admin-insights) |

---

## Per-route notes

Two to four sentences per route. Visual hierarchy, hover affordances, focus-within paint, scroll-state behavior, trade-offs vs the live S09 site.

### `/` (Home)

Single-column type-driven hero with the locked headline structure (color-word in tangerine + .crayon block-highlight). The FeaturedRow and FreeRow consume PATTERN A (eyebrow + two-line H2 + ghost-action). CategoryGrid uses 6 colored tiles with the locked tone palette (joy / sun / iris / rose / paper / ink). Hover affordances: card-box paint on every ProductCard, brand-tinted hover glow on the primary CTA, subtle bg on category tiles. The trust strip is the locked 4-item mono variant (300+ Etsy claim, instant download, formats, countries shipped). On scroll past 40, header collapses to the 1080-wide pill in 700ms; AnnouncementBar hides synchronously.

### `/shop`

Two-column layout: 240 filter sidebar + 1140 product grid (at 1440). Sidebar is sticky from the top; grid scrolls. Product grid is 3-col at 1280 to 1440 to keep cards 360 wide, 4-col on the live React prototype where the wrap is narrower; the static mockup is 3-col (locked, see `responsive.md`). Active filters surface as pills above the grid. Sort is a minimal select. Hover and focus-within paint the card box outward via `::before`. Scrolled state shows the pill header; the filter sidebar stays sticky.

### `/shop/[category]`

Same skeleton as `/shop`, plus a sub-category chip row above the toolbar. The chip row is horizontally scrollable on narrow viewports. The PATTERN A SectionHead is WAIVED on the page H1 here per `pixel-precision-audit.md` (single-line declarative heading suffices because the breadcrumb provides the meta context).

### `/products/[slug]`

Two-column: 640 gallery + 520 buy column (at 1440). Buy column is sticky on scroll, locks at the bottom when the in-page content stops. Gallery is a 1:1 image with thumbnail row; pinch zoom is browser-default (not custom). File-meta block is a 2x2 grid (Format / Pages / Print size / License). The maker quote panel uses the brand-tinted card. Sticky CTA at the bottom of the buy column on tall viewports. Hover on the gallery thumbnails paints a 2px brand border. Focus-visible on the buy CTA paints the locked 2px brand outline.

### `/cart`

Two-column: 880 line items + 360 summary (at 1440). Summary is sticky; line items scroll. Cart lines use the 96-thumb + content + price + remove layout. Hover row paints `--bg-elev` background with 8px radius and a 16px horizontal margin pull. The price-changed warn banner auto-scrolls into view at the top of the line list on 409. The receipt-email field sits above the pay CTA in the summary card.

### `/orders/thank-you-pending`

Full-viewport interstitial. Branded pulsing ring around the JoyWaveDigital logo mark. Pending status badge above the headline. Polling indicator pulses below ("Polling, every 2 seconds"). After 30s elapsed, cadence drops to 10s and copy switches to "Still confirming". Reduced-motion fallback collapses the ring to a static circle. This route does NOT scroll past 40px under typical conditions; the pill header is shown in the state file with a "not applicable" notice for completeness.

### `/orders/thank-you/[id]` (paid)

Status badge + H1 + summary card + Downloads list (each row with a Download button). Below the downloads: a brand-tinted "make an account" prompt (the upsell to claim the order into a library). Summary card on the right with subtotal / tax / total. Footer carries the "Prices charged in USD" disclosure.

### `/orders/thank-you/[id]` (failed)

Red-tinted status badge + bad-variant banner with the bank decline code (visible). Try-again CTA returns to /cart. "Your cart still has" section reassures the buyer their cart is intact below the banner. Contact support button at the bottom.

### `/orders/thank-you/[id]` (refunded)

Muted status badge with strikethrough decoration. Items list with line-through titles. "No longer in your library" meta. Summary shows refund amount in ok-color and net total of 0.

### `/orders/thank-you/[id]` (partial)

Yellow-tinted status badge. Two sections: Downloads (kept items) and Refunded (dropped items). Summary shows original total, refunded amount in ok-color, and net charged. Trade-off vs the failed branch: partial keeps the downloads visible because some items survived; failed hides downloads entirely.

### `/orders/recover`

Single-input hero. autofocus permitted (single input on the page). autocomplete=email, inputmode=email, enterkeyhint=send. Anti-enumeration response: "If we have any orders for that address, you will get a link within a minute" regardless of match.

### `/account/library`

AccountNav segmented control at the top. Library rows are 88-thumb + content + actions. ClaimBanner sits above the list when an eligible claim is detected (S09 LOCK 7). Re-download buttons on each row are 44 tall. Hover row paints subtle bg.

### `/account/orders`

Order rows are a 5-col flex: order# (mono) / date (mono) / title (clamp-1) / status badge / total (mono). Entire row is tappable. Hover row paints subtle bg. PATTERN A is WAIVED on the page H1 per `pixel-precision-audit.md`.

### `/account/orders/[id]`

Breadcrumb at top, status badge + date row, items list, timeline (vertical with colored dots), summary card, contact-support button. Trade-off: the timeline could have been a tooltip-only affordance, but the deliberate vertical layout helps customers verify what happened with their order in a glance.

### `/account/wishlist`

Standard 4-col ProductCard grid (or 3-col at 1280) with every heart in the "on" state. Tapping a heart removes from the wishlist and slides the card out with the badgePop variant.

### `/account/profile`

Three text fields (display_name, email, country) in a 2-col label/input layout. Sticky save bar at the bottom. Discard / Save buttons.

### `/account/settings`

Sections: Theme (segmented control with System / Light / Dark), Display currency (segmented USD / INR / EUR / GBP), Email preferences (two toggle switches), Sessions (active devices with sign-out per session), Account (sign out, delete account). Delete-account opens the modal with the text-confirm guard.

### `/sign-in`

Magic-link only. Single hero field. autocomplete=email, inputmode=email, autofocus permitted, enterkeyhint=go.

### `/sign-in` (sent state)

Same route, different state variant. Inbox icon, copy that names the email address, troubleshooting card (check spam, contact list, link expires in 30 minutes), Resend / Use a different email buttons stacked.

### `/not-found`

Big H1 ("We could not find this page.") + two primary CTAs (Browse all printables, Back to home) + a list of fallback links (Freebies, Bundles, FAQ, Contact). Single-column, narrow text.

### `/500`

Big H1 ("Something on our side broke.") + error reference code in mono (visible, copyable) + three CTAs (Try again, Back to home, Contact support). Reassurance line at the bottom about cart safety.

### `/about`

Long-form storytelling page. Founder portrait on the left (480 wide), story prose on the right. Three numbered "how this shop works" rows. Brand-tinted founder-quote panel near the bottom. Uses PATTERN A on the two interior section headers.

### `/contact`

Form (name / email / subject / message) on the left, "Faster channels for these" card on the right. Form fields declare every input attribute per `desktop-input-table.md`. Submit returns the Got-it success panel inline.

### `/faq`

Narrow centered accordion (760 wide). Native `<details>` so reduced-motion users get no animation cost. Each question is a Bricolage 500 17 heading; answer is Geist 14 body with 1.55 line-height.

### `/freebies`

Same product-grid pattern as /shop. Brand-tinted "Sign in to claim them all" banner above the grid. Each card has an inline Download button (40 tall, ink variant).

### `/bundles`

Three-column grid of bundle cards. Each card shows: bundle hero image, name, item count, original total (strike), bundle price (ok-color), Save percent.

### `/collections/[slug]`

Editorial collection landing page. Hero panel with the season name + intro prose + collection art. Then a standard product grid below. Uses PATTERN A on the editorial intro panel (the most marketing-voice surface in the storefront; PATTERN A is essential).

### `/blog`

Three-column post grid. Each card: 16:9 hero image, eyebrow (date + read time), Bricolage 600 22 title, Geist 14 excerpt. Hover paints the card-box.

### `/blog/[slug]`

Long-form prose, max 720 wide centered. 16:9 hero image at the top. Article H1 + H2s use Bricolage 600 (article hierarchy, NOT SectionHead PATTERN A). Body text is Geist 17 with 1.6 line-height. Sidebar with table of contents on viewports >= 1440 (lazy enhancement; not in the static mockup).

### `/policies/*` (terms, privacy, refunds, cookies, accessibility)

Same shape across all 5. Breadcrumb, eyebrow ("Legal · short version"), declarative H1, last-updated date, plain-text body in max-width 64ch. Each policy gets a single-page form (no expanders). The accessibility policy is the only one that links to `accessibility.md` externally for the technical detail.

### `/admin/*`

Desktop-primary per founder. The desktop pass does NOT redesign admin; the existing admin-products, admin-orders, admin-insights mockups stand. The state-variant + multi-width files do not exist for admin routes intentionally. If admin gets a future pass, it should follow the same depth conventions documented here.

---

## Per-component notes

Two to four sentences per component. Interaction states, motion variants used, accessibility contract, where it ships.

### Header + AnnouncementBar (PATTERN B)

Flat at rest, pill on scroll. AnnouncementBar visible at rest, hides synchronously on scroll past 40. Marquee runs at 38s/loop, paused under `prefers-reduced-motion`. Nav links use `--fg-soft` at rest, `--fg` for the active route. Cart icon shows count with `aria-live="polite"`. Header chrome lives in `header.jsx` and the locked CSS at `styles.css:754-805`.

### ProductCard

Structure LOCKED (May 2026 spec). Rest has NO border, NO background, NO shadow; hover paints `::before` outward 10/10/12/10. Image never transforms. Heart is a SIBLING of the stretched-link overlay (not nested). Title is Geist 14/500/line-clamp-1 with native `title` attribute. Mobile-specific delta: heart always visible at touch, no card-box paint on touch devices.

### StatusBadge

5 variants: Paid (ok green), Pending (muted), Failed (bad red-tint), Refunded (muted + strikethrough), Partial (warn yellow-tint). Geist Mono 11 with a 6 by 6 leading dot. On status change, plays badgePop (scale 0.85 to 1.18 to 1.0, 220ms outSpring). Used in /orders/thank-you/[id], /account/orders, /admin/orders, and order-detail timelines.

### SectionHead (PATTERN A)

The locked two-tone emphasis component. Mono eyebrow (with leading dot) above a two-line Bricolage 500 H2 where the second line is an `<em>` swapped to display-font normal-style at `--color-joy-700`. Optional right-aligned action button (typically a ghost-variant). Optional `<span class="crayon">word.</span>` for the orange block-highlight (the .mark equivalent in mobile). On scroll-into-view, the eyebrow fades up first, then headline line 1, then em line 2, 60ms stagger.

### Button (xl / lg / md, primary / ink / ghost / outline)

xl 64, lg 56, md 44. Primary uses `--brand` fill with ink-on-brand text. Ink uses `--ink` fill with paper text. Ghost is transparent with line-2 border. Outline is the high-conversion 1.5px ink border (inverts on hover). Hover translates -1px and paints `--shadow-brand` on the primary. Active scales to 0.98 over 120ms. Loading replaces the icon with a skeleton dot and switches label to a gerund.

### Input + Label

Mono eyebrow label above a 48-tall input. Border is line-2 at rest, brand at focus (1.5px), bad at error (1.5px + below-field message with `aria-invalid="true"`), ok at success (rare, only on server-verified inputs).

### Chip

5 variants: base (subtle bg + line border), new (joy-500), free (sun-500 with joy-950 ink), pick (iris-500 with white text), sale (rose-500 with white text). 26 tall, mono 11 text.

### Eyebrow + pulse dot

Mono eyebrow chip with optional tangerine pulse dot. Pulse keyframes loop at 1.8s ease-out (paused under reduced-motion). Used in the hero and in section heads as the eyebrow component.

### WishlistHeart

Standalone version of the ProductCard heart (also used in account/library row optionally). 44 by 44 hit area, 18 visible icon, blurred-glass background, rose-500 fill when liked. Toggle plays the pop animation (0.85 to 1.18 to 1.0, 220ms outSpring).

### CartLine

96 thumb + content + price + remove icon-button. Title is Geist 16/500/line-clamp-1. Meta is mono 11. Price is mono 16/600. Hover paints `--bg-elev` background with 8px radius and a 16px horizontal margin pull. Remove tap dims to 0.65, strikes through, shows a 4s Undo affordance.

### ClaimBanner

Brand-tinted banner at the top of /account/library when an eligible claim is detected (S09 LOCK 7). Inline actions: Add to library (primary) + Not mine (ghost) + Dismiss (icon-button). Not mine opens a confirmation modal because the deny path is irreversible.

### AccountNav

Segmented tab control above /account/* page headings. Five tabs: Library, Orders, Wishlist, Profile, Settings. Current tab uses `--fg` text + 2px brand underline. Hover paints subtle bg with 8px radius. Focus-visible uses the global 2px brand outline.

### SkeletonLoader

List variants per route: product-grid (4-col on desktop), library-row (88 thumb + 2 lines + button placeholder), order-row (5-col flex), product-detail (gallery + headline + sub + prose), cart-line (thumb + title + meta + price). Shimmer uses ease-out-soft at 640ms loop. Reduced-motion drops to static.

### RecoverForm

Single-input hero on /orders/recover. autofocus permitted. autocomplete=email, inputmode=email, enterkeyhint=send. Anti-enumeration response shape is locked.

### ThankYouPendingIsland

Full-screen takeover. Branded pulsing ring around the logo mark. Polling indicator below the headline with a pulse dot. After 30s elapsed, cadence drops from 2s to 10s and the copy softens to "Still confirming".

### DownloadButton

48 to 56 tall (xl ink). Loading replaces the icon with a skeleton dot and switches label to "Preparing". Disabled at "Link expired". 412 refusal opens an inline bad-variant banner pointing to /account/library for live status.

### SignInPromptIsland

Inline (NOT modal) on /cart guest path between the receipt-email field and the pay CTA. Modal variant exists for /freebies "Sign in to claim them all" surface.

### Toast / Snackbar

Bottom-right, ink fill, paper text. WishlistReplay variant after sign-in shows a tangerine heart + Undo affordance. Error toast uses bad-color fill with white text + a Retry affordance.

### PriceChangedBanner

Warn-variant full-width banner at the top of /cart on 409. Auto-scrolls into view. The matching cart line picks up a warm-tinted background and shows the was-price struck through inline.

### Filter sidebar

240 wide sticky sidebar on /shop and /shop/[category]. Mono section headers, checkbox lists with counts, price range inputs, free-only toggle. Active filters surface as pills above the grid.

### Pagination

Numbered button row with edges (prev / next as ghost-variant). Current page = ink fill. Hover = elevated bg + line border. Focus-visible = brand outline. Edges disabled at min/max with 0.55 opacity.

### Tiptap admin toolbar

Admin-only. 30 by 30 hit target (admin is desktop-primary). Active button uses ink fill. Hover uses subtle bg. Focus uses the global brand outline. Marks shipped: H2, H3, B, I, code, list, link.

### AdminTable

Sort column shows the active sort with a tangerine arrow. Hover paints `--bg-elev`. Keyboard focus paints a 2px brand outline inset by 2px so the outline does not push the row. Bulk-selected paints a brand-tinted background. Mobile fallback notice on small screens.

### AdminStickySaveBar

Sticky bar at the viewport bottom with backdrop blur. Pristine = bar removed from DOM. Dirty = bar slides up on first edit (220ms outSoft) with an "Unsaved changes" pulse on the left and Discard + Save on the right. aria-busy="true" during the save action.

### CartDrawer

480 wide right-side drawer. Drawer is dismounted when closed. Opens with a 380ms scrim fade in parallel with a 640ms drawer slide (`drawerOpen` from motion.ts). Sticky footer with Checkout + Open full cart. Esc closes; scrim tap closes.

### Modal (Radix Dialog wrapper)

480 max width, 18 radius, shadow-4. Scrim is 42% ink. Focus auto-traps; default focus on the first input or on Cancel for destructive variants. Three documented use cases: sign-in modal, price-changed dialog, delete-account confirm (with text-confirm guard).

---

## Pixel-precision audit summary

See `pixel-precision-audit.md` for the full per-route verification. Summary:

- PATTERN A (SectionHead two-tone) is used on `/`, `/products/[slug]`, `/account/orders/[id]`, `/about`, and `/collections/[slug]`. Every other route has an explicit waiver with rationale.
- PATTERN B (Scroll-shrinking pill header) is shown in BOTH the flat and pill state for every route that scrolls past 40px. Routes that do not scroll past 40px get a "not applicable" notice (interstitials, single-input hero pages, error pages).
- `.crayon` block-highlight is used sparingly: hero on `/`, hero on `/about`. No other instances in the current pass.

---

## Open questions

Things to weigh in on before another sprint:

1. **PATTERN A on /shop and /shop/[category]**: currently waived because the breadcrumb provides the meta context. Worth experimenting with a "By topic" + "what to shop this week" two-tone heading above the grid on /shop. The trade-off is the page H1 ("All printables.") becomes redundant.
2. **/freebies editorial intro**: if the freebies page adds a "why we publish freebies" prose section in the future, it MUST use PATTERN A (flagged in `pixel-precision-audit.md`).
3. **/blog featured-essay strip**: same situation. If the blog index adds a featured post strip above the grid, it MUST use PATTERN A.
4. **/cart upsell strip**: if a "you might also like" strip is added below the line items, it MUST use PATTERN A.
5. **Page transitions on desktop**: the existing motion.ts documents `pageTransition` with View Transitions API. The desktop pass did not add a per-route map (the mobile pass did, in `mobile-motion.ts`). Consider whether desktop wants the same map; the buttery 700ms header transition makes route changes feel calmer already.

---

## Desktop-specific do-not-do

Patterns rejected during this pass.

- **Header pill always-on**: the pill at rest reads "overdesigned". Flat at rest is the locked behavior.
- **Nav links hidden inside the pill**: tried in S05; collapsed too aggressively. Nav stays visible in the pill at 1080 wide.
- **Carousel as primary content**: the home hero, FeaturedRow, FreeRow, CategoryGrid, and any "featured" section never auto-rotate. Static layouts only.
- **Centered modals where a drawer would do**: the CartDrawer ships as a drawer (480 wide right-side), not a modal. Drawer is the locked choice for cart on header-icon tap.
- **Hover-only affordances on touch**: the card-box paint and the heart-on-hover are gated by `@media (hover: hover)`. Touch devices skip them entirely.
- **Sub-44pt tap targets**: every interactive element is at least 44 tall on touch. Desktop accepts smaller hit areas for mouse precision but the keyboard focus ring is always at least 2px brand + 2px offset.
- **Generic Chart.js admin charts**: editorial chart styling is locked (thin lines, mono numerals, no chart frame, dashed gridlines).
- **Single-page-form admin**: long product-edit forms use the sticky save bar pattern, not "scroll to find the save button".
- **Em dashes anywhere**: hard rule. Lint script in `package.json` already flags them.
- **Italic serif for emphasis**: Fraunces, Instrument Serif, Garamond italic. All rejected. The two-emphasis system is tangerine color-word + .crayon block-highlight.
- **Marketing hyperbole**: "Built with love", "Made with joy", "Crafted for". Replaced by direct factual claims (instant download, no account on first buy).
- **Reviews count before reviews exist**: removed until the new site has real reviews. The 300+ Etsy claim is true and stays.
