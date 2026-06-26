# Pixel-precision audit

PATTERN A (SectionHead two-tone emphasis) and PATTERN B (Scroll-shrinking pill header) are the two flagship brand patterns. This document verifies both are preserved across every applicable surface in the desktop pass, and calls out the explicit exceptions where a pattern does not apply with rationale.

No em dashes anywhere in this document.

---

## PATTERN A · SectionHead two-tone emphasis

**Lock:** mono eyebrow with leading dot, then a two-line Bricolage 500 H2 where the second line uses `<em>` swapped to display-font normal-style at `--color-joy-700` (tangerine). Optional right-aligned action button. Optional `<span class="mark">word.</span>` for the orange block-highlight rectangle (used sparingly, typically once per page).

**Source of truth:**
- Component: `sections.jsx` `SectionHead`
- CSS: `styles.css` `.section-head` and `.section-head h2 em` (line 580 to 592 in the locked stylesheet)
- Tokens: `--font-display`, `--color-fg`, `--color-joy-700`

**Examples in the existing prototype:**
- `eyebrow="This week's shelf"` + `title={<>Worksheets and packs<br/><em>built for the long week.</em></>}` (FeaturedRow)
- `eyebrow="Free downloads"` + `title={<>Try one. <em>Then decide.</em></>}` (FreeRow)
- `eyebrow="By category"` + `title={<>The whole shelf,<br/><em>sorted by what you need.</em></>}` (CategoryGrid)

### Per-route pattern verification

| Route | Section heads in this route | PATTERN A used? | Notes |
| :--- | :--- | :--- | :--- |
| `/` | Hero (special, single H1), FeaturedRow, FreeRow, CategoryGrid, QuoteBlock (no H2, founder quote), Newsletter | YES on Featured / Free / CategoryGrid; Hero is the H1 and uses the headline's own two-tone (joy-700 italic + `.crayon` mark) | Hero is the single H1, not a SectionHead; it uses the same two-tone vocabulary applied to display type |
| `/shop` | "All printables." page heading, then product grid (no section H2 inside the grid) | WAIVED for page H1 (it is a single-line declarative heading) | Page H1 uses display 500 + ink color; no eyebrow + em needed because the eyebrow lives in the breadcrumb / "By category" tag above |
| `/shop/[category]` | Same as `/shop` plus a category-specific eyebrow | WAIVED for page H1, same as `/shop` | The active-filter pill row substitutes for the second-line emphasis |
| `/products/[slug]` | Product H1 (long-form, single line, not a SectionHead), then "From the maker" + "What's inside" sub-sections | YES on the maker quote section ("From the maker · ✦"); "What's inside" is a sub-head and uses a single line on purpose (it precedes an inventory list, not a section) | The product H1 uses display type but does not get the em tangerine treatment because the price block immediately below provides the visual rhythm |
| `/cart` | "Cart." H1 | WAIVED on H1 (declarative single word) | The summary card and the receipt-email field provide the visual rhythm; no section H2 in the route |
| `/orders/thank-you-pending` | "Hang on, we are confirming your payment." H1 | WAIVED on H1 (this is an interstitial; the spinner is the focal element) | No section H2 below; the whole route is one block |
| `/orders/thank-you/[id]` (paid) | "Your printables are ready." H1 | WAIVED on H1 (single-clause declarative) | Downstream sections "Downloads", "Summary" use eyebrow + small heading, not section H2 |
| `/orders/thank-you/[id]` (failed / refunded / partial) | Single H1 each branch | WAIVED on H1 same as paid | |
| `/orders/recover` | "Find a past order." H1 | WAIVED (single-input page; no section H2) | |
| `/sign-in` | "Sign in." H1 | WAIVED (single-input page) | |
| `/account/library` | "Your library" H1 + AccountNav tab heading | WAIVED on H1; section H2s inside the page (e.g. claim banner header) use display 600 + ink | Claim banner is its own component, not a SectionHead pattern |
| `/account/orders` | "Orders" H1 | WAIVED (list page) | |
| `/account/orders/[id]` | "Order #JWD-29481" H1 + sub-sections (Items, Timeline, Summary) | YES on each sub-section's two-line variant: "Items / 2 files in this order", "Timeline / Apr 24 to today" (use the eyebrow above the small heading; second line is the meta) | The full Bricolage 500 + em treatment is RESERVED for storefront and marketing sections to keep account chrome calmer |
| `/account/wishlist` | "Wishlist" H1 | WAIVED (list page) | |
| `/account/profile` | "Profile" H1 | WAIVED (form page) | |
| `/account/settings` | "Settings" H1 plus section headers (Theme, Currency, Email, Sessions, Account) | WAIVED on the small section headers; they use mono eyebrow + 16px label per the form pattern | Forms use mono section headers; SectionHead is reserved for marketing |
| `/about` | "A printables shop, made by one person." H1 + "How this shop works" + "What I make and how" + founder quote panel | YES on the two section H2s | Founder quote uses the panel pattern, not a SectionHead |
| `/contact` | "Email the maker." H1 + form | WAIVED (form page) | "Faster channels for these" card uses small heading |
| `/faq` | "Questions, answered." H1 + accordion | WAIVED (interaction page) | |
| `/freebies` | "Free samples." H1 + grid | WAIVED page H1 only | If the freebies page grows a "Why we publish freebies" section in future, it MUST use PATTERN A |
| `/bundles` | "Bundles." H1 + grid | WAIVED page H1 | |
| `/collections/[slug]` | "Spring collection." H1 + grid + an editorial intro panel | YES on the editorial panel ("From the maker / what's in this season's edit") | This route has the strongest editorial voice in the storefront; PATTERN A is essential here |
| `/blog` | "Notes." H1 + post list | WAIVED page H1 | |
| `/blog/[slug]` | Post title H1 (long form) | WAIVED H1; in-post H2s use Bricolage 600 22px (article hierarchy, not section hierarchy) | Blog posts are prose; section-head pattern is for product surfaces |
| `/policies/*` | Each policy H1 + H2 sub-headings | WAIVED (legal-text routes) | Plain Bricolage 500 H1 + Bricolage 600 22px H2s; eyebrow + em would feel wrong on a Terms page |
| `/not-found`, `/500` | Big H1 + fallback links | WAIVED (error routes) | The H1 takes the visual weight; no section H2s below |

### Summary of PATTERN A compliance

- **Routes that use PATTERN A inside the route:** `/`, `/products/[slug]`, `/account/orders/[id]`, `/about`, `/collections/[slug]`
- **Routes with explicit waivers (no section H2 below the page H1):** every other route. Waiver rationale recorded above per row.
- **Routes that MUST get PATTERN A in any future "richer" section work:** `/freebies` (when an editorial intro lands), `/blog` (when a featured-essay strip lands), `/cart` (if an upsell strip is added). Flagged for the next direction.

### Block-highlight `<span class="mark">word.</span>` usage

The `.mark` orange block-highlight is the SECONDARY emphasis (PATTERN A is the primary). Use sparingly:

- Hero on `/` ("respect the buyer and the kid.")
- Hero on `/about` (one instance: "made by one person.")
- Promotional landing of `/freebies` if it gets one (future)
- NEVER used on a body paragraph
- NEVER used twice in the same page

---

## PATTERN B · Scroll-shrinking pill header

**Lock:** flat full-width header at rest (scrollY <= 40), centered pill on scroll (scrollY > 40). 700ms `cubic-bezier(0.4, 0, 0.2, 1)` transition. AnnouncementBar visible at rest, hidden when scrolled. The "Postily move."

**Source of truth:**
- Component: `header.jsx` `Header` + `AnnouncementBar`
- CSS: `styles.css` `.header-wrap`, `.header`, `.header-wrap.scrolled .header`
- Motion: `handoff/motion.ts` `headerPill` variant
- Hook: `useScrolled(40)` shared between `Header` and `AnnouncementBar`

### Header state matrix per route

Every desktop mockup in `screens-desktop-states/` must show BOTH the flat-header AND the pill-header state, OR explicitly note "no scroll past 40px on this route".

| Route | Scrolls past 40? | Flat shown? | Pill shown? | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Yes | YES | YES | Hero is taller than the viewport; pill triggers on the first scroll |
| `/shop` | Yes (long product grid) | YES | YES | |
| `/shop/[category]` | Yes | YES | YES | |
| `/products/[slug]` | Yes (gallery + description + reviews stack tall) | YES | YES | |
| `/cart` | Sometimes (depends on item count) | YES | YES (when 5+ items) | |
| `/orders/thank-you-pending` | No (full-viewport interstitial, no scroll content) | YES only | n/a | Interstitial; the user is here for 5 to 30 seconds and the page is < 100vh tall |
| `/orders/thank-you/[id]` (paid / failed / refunded / partial) | Yes | YES | YES | All four branches scroll because of the downloads + summary stack |
| `/orders/recover` | No (single-input hero, < 100vh) | YES only | n/a | |
| `/sign-in` | No | YES only | n/a | |
| `/sign-in` sent state | No | YES only | n/a | |
| `/account/library` | Yes (rows stack) | YES | YES | |
| `/account/orders` | Yes (list stacks) | YES | YES | |
| `/account/orders/[id]` | Yes | YES | YES | |
| `/account/wishlist` | Yes (grid stacks) | YES | YES | |
| `/account/profile` | Maybe (3 fields fit in viewport on 1440; not on 1280) | YES | YES (1280 only) | |
| `/account/settings` | Yes | YES | YES | |
| `/not-found` | No | YES only | n/a | |
| `/500` | No | YES only | n/a | |
| `/about` | Yes | YES | YES | |
| `/contact` | Yes (form + faster-channels card) | YES | YES | |
| `/faq` | Yes (accordion expands tall) | YES | YES | |
| `/freebies` | Yes | YES | YES | |
| `/bundles` | Yes | YES | YES | |
| `/collections/[slug]` | Yes | YES | YES | |
| `/blog` | Yes | YES | YES | |
| `/blog/[slug]` | Yes (prose) | YES | YES | |
| `/policies/*` | Yes (legal text) | YES | YES | All 5 policies |
| `/admin/*` | Admin uses its own sticky chrome, not the storefront header | n/a | n/a | Admin chrome is a separate spec |

### Pill width per breakpoint

| Width | Header at rest | Header scrolled (pill) | Notes |
| :--- | :--- | :--- | :--- |
| 1280 | full-width inside `.wrap` (max 1360, page padding 28) | centered, `min(1080px, calc(100% - 32px))` | At 1280 viewport the pill is `1080px` exact |
| 1440 | full-width inside `.wrap` | centered, 1080 | The "default design target" |
| 1920 | full-width inside `.wrap` (capped at 1360, sides get warm-paper bleed) | centered, 1080 (with extra breathing room on both sides) | The pill never grows past 1080; the bleed is intentional |

### AnnouncementBar pairing

Per `state-changes.md` (updated in the mobile pass), the AnnouncementBar is RESTORED at the top of the header. It scroll-hides at scrollY > 40 in lockstep with the pill collapse, via the same `useScrolled(40)` hook. Both transitions run on the same RAF and feel synchronized.

| Header state | AnnouncementBar visible? | Transition |
| :--- | :--- | :--- |
| Flat (scrollY <= 40) | YES | n/a (the rest state) |
| Pill (scrollY > 40) | NO | 380ms ease-out-soft slide-up + fade |

The AnnouncementBar marquee respects `prefers-reduced-motion`; the marquee pauses but the bar stays visible / hides on scroll regardless.

---

## Other rigor checks (PATTERN-adjacent)

### Focus-visible on every interactive surface

The `.focus-ring` class in `styles.css` line 202 is global: `outline: 2px solid var(--joy-500); outline-offset: 2px; border-radius: var(--r-2)`. Every interactive component in the components matrix must show its focus-visible mockup. Verified:

- Button (xl/lg/md/sm + ghost/ink/outline) : YES, mocked
- ProductCard (focus-within paints the card box) : YES, mocked
- WishlistHeart : YES, mocked (and tested with `:focus-visible` outline against the blurred-glass background)
- AccountNav tab : YES, mocked (underline + outline both visible)
- Input + Label : YES, mocked
- Filter checkbox : YES, mocked
- Pagination button : YES, mocked
- Tiptap toolbar button : YES, mocked
- AdminTable row (clickable cells) : YES, mocked

### Locked aspect-ratio on every async block

To enforce CLS < 0.1, every block whose content loads async must declare its aspect-ratio. Verified:

- `.pcard-image` : `aspect-ratio: 1 / 1` (locked in styles.css)
- Product detail gallery : `aspect-ratio: 1 / 1`
- Blog post hero image : `aspect-ratio: 16 / 9`
- Category-tile art : `aspect-ratio: 1.05 / 1` (the founder-quote panel mirrors this)
- AccountLibrary row thumb : explicit `width: 88px; height: 88px`
- CartLine thumb : explicit `width: 96px; height: 96px`
- AdminTable row thumb : explicit `width: 56px; height: 56px`

### Currency display contract

Per `state-changes.md`, the locked contract is:

- Product cards: local currency only
- Product detail price block: local + parenthetical USD
- Cart line / summary: local + parenthetical USD
- Footer carries the "Prices charged in USD" disclosure
- Currency switcher in the footer; changing it re-paints client-side

Verified in every applicable mockup.

### Reduced-motion

The `@media (prefers-reduced-motion: reduce)` block in `styles.css` line 220 area kills all transitions globally. Specific components opt-in to motion via `@media (prefers-reduced-motion: no-preference)` only when essential (the hero entrance, the pulse). Verified:

- Marquee in AnnouncementBar : pauses
- Marquee in CategoryMarquee : pauses
- Pulse on eyebrow dot : pauses
- ProductCard `::before` paint : no transition (instant on hover)
- Header pill collapse : no transition (instant on scroll past 40)
- Toast slide-in : becomes fade-in only
- Modal open : becomes fade-only

### Pre-delivery em-dash check (this document)

Grep for the em-dash character (U+2014) in `pixel-precision-audit.md` : zero matches. Grep for `--` used as sentence break : zero. Grep for ` - ` used as sentence break : zero.
