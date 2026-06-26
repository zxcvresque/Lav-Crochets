# State changes

A list of every structural and visual decision that differs between this design pass and the prior shipped direction (S01-S09).

If the implementing engineer is moving from the old design to the new, this is the diff. If the founder is comparing the two, this is the why-each-thing-changed.

---

## Brand

| Surface | Before | After | Why |
| --- | --- | --- | --- |
| Focal hue | Saffron (oklch ~0.78 0.10 75) | Tangerine (oklch 0.78 0.19 55) | Real focal saturation; not "warm minimal" |
| Foreground neutral | Cream | Warm paper (slightly cooler, very subtle warmth) | Differentiates from the rejected editorial-bookshop palette |
| Display type | Fraunces (banned) | Bricolage Grotesque (variable, opsz + wdth + wght) | Fraunces explicitly rejected by founder |
| Body type | Inter | Geist | Inter is over-owned; Geist has mechanical numerals |
| Mono | Inter Mono | Geist Mono | Tighter family integration with Geist body |
| Italic emphasis | Instrument Serif italic | Two-emphasis system: tangerine color-word + orange highlight block | Founder did not like italic serif |

## Header

| | Before | After |
| --- | --- | --- |
| Rest state | Pill from the start | Flat full-width, no chrome |
| Scrolled state | Centered pill (~720px wide) | Centered pill (~1080px wide), nav stays visible |
| Transition | 380ms ease-out | 700ms Material-curve (slower, buttery) |
| Announcement bar | Persistent, top-fixed | Restored: scroll-hide top scroller. Always present on first paint; hides past 40px scroll, returns on scroll-to-top. Pause on hover + pause on `prefers-reduced-motion`. DOM lives in `header.jsx` |

## Hero

| | Before | After |
| --- | --- | --- |
| Composition | Single-column type-driven | Single-column type-driven (kept) |
| Headline | "Worksheets that respect the buyer and the kid." | Same. (The content-adapter variant — "deserve the ink" with the three-card cluster — was prototyped and then pulled per founder's call) |
| Decorative orb | Multi-peak wave, 60% width, opacity 0.85 | Single gentle curve, 38% width, opacity 0.55 |
| Auto-rotating carousel | Considered | Rejected (a11y review concerns from S07) |

## Product card

The structural spec is LOCKED (May 2026, six+ revisions). The re-skin is at the pixel level.

| | Before | After |
| --- | --- | --- |
| Card border at rest | 1px line border + background fill + shadow always visible | NO border, NO background, NO shadow at rest |
| Hover effect | Symmetric 4px shadow growth | Asymmetric outward expansion (10/10/12/10) via `::before`, painting bg + border + shadow |
| Image transform on hover | 1.02 scale | NONE (image never transforms; the source PNG has its own banner) |
| Title type | Inter 12px (anemic) | Geist 14px / 500 / line-clamp-1 with native `title` attr |
| Sale price color | Brand orange | Success green (`--ok`, oklch 0.66 0.15 145) per Etsy convention |
| Heart visibility (desktop) | Always visible | Hidden at rest, fades in on hover/focus-within |
| Heart visibility (mobile) | Always visible | Always visible (unchanged) |
| Heart DOM position | Nested inside the anchor link (invalid HTML) | Sibling of the stretched link |
| Title clamp | 2 lines | 1 line |

## Cart

| | Before | After |
| --- | --- | --- |
| Drawer (header cart icon) | Drawer-only | Drawer (preserved) + full `/cart` route (added) |
| Add-button on card | "Add to cart" button on every card | Removed; the locked spec puts no buy CTA on the card |
| Price changed banner | Not present | Yellow-tinted warn banner at top of `/cart` when server returns 409 |
| Email-for-receipt | Hidden field in checkout | Surfaced as a prominent form on `/cart`; the buyer sees where their receipt is going before paying |

## Order flow

| | Before | After |
| --- | --- | --- |
| Status badge colors | Brand-only color system | Five distinct branches (paid green / pending muted / failed red-tinted / refunded muted-strike / partial yellow-tinted) |
| Thank-you copy | "Thanks for your order!" | "Your printables are ready" (specific, action-oriented) |
| Pending UX | "Order processing" generic message | Explicit polling indicator + "you can close this page; email will arrive either way" |
| Receipt-recovery form response | Confirmed match/no-match | Anti-enumeration response shape: "if we have any orders for that address..." |

## Sale state

| | Before | After |
| --- | --- | --- |
| Sale chip color | Aggressive red | Rose (oklch 0.66 0.19 6), confident but not aggressive |
| Sale price color | Brand orange (confused with regular price) | Success green (clearly "deal" signal, Etsy convention) |
| % off label | "SALE!" in red | Numeric: "36% off" in mono with success green color |

## Trust strip

| | Before | After |
| --- | --- | --- |
| Pattern | "Three truthful facts" (signaled corporate template) | Four-item mono-text strip including the real 300+ Etsy claim |
| Reviews | "4.9 rating, 217 reviews" (untrue at relaunch) | Removed until reviews actually exist |

## Admin

| | Before | After |
| --- | --- | --- |
| Sidebar | Single flat list | Grouped sections (Catalog / Orders / Customers / Marketing / Content / Insights / System) |
| Save pattern | Scroll to find save button | Sticky save bar at bottom with "Unsaved changes" pulse |
| Quick-edit | Edit price in a modal | Edit-in-place input on the table row |
| Charts | Generic Chart.js look | Editorial chart styling: thin lines, mono numerals, no chart frame, dashed gridlines |

## Email

| | Before | After |
| --- | --- | --- |
| Layout | Single-column simple text | Table layout, 600px max width, Georgia + Helvetica stack, web-safe colors |
| Status indicator | Plain text "Paid" | Visible pill with leading dot and brand-coordinated background |
| Footer | "Unsubscribe" + copyright only | Privacy, refunds, unsubscribe + clarification that transactional emails cannot be opted out |

## Copy

| | Before | After |
| --- | --- | --- |
| Em dashes | Used as default sentence break | BANNED hard rule across all surfaces |
| Voice | "Editorial bookshop" — quiet, restrained | Direct, confident, slightly dry (Linear/Vercel direction) |
| Marketing hyperbole | "Built with love, designed for joy" | Removed; direct factual claims only |

## Motion

| | Before | After |
| --- | --- | --- |
| Easing system | One curve (`ease-out`) | Four named curves: outSoft, outSpring, inSoft, inOutSoft |
| Duration tokens | Implicit per-component | Four named: fast (120ms), base (220ms), med (380ms), slow (640ms) |
| Header transition | 380ms ease-out | 700ms Material curve (`buttery`) |
| Page transitions | Framer Motion only | View Transitions API where supported, Framer fallback |

---

## Migration notes

For the engineer moving the live S09 codebase to this direction:

1. **Tokens first.** Replace `app/globals.css` with `handoff/globals.css`. Verify Tailwind v4 picks up the `@theme` block; check a few utilities in the browser.
2. **Type loading.** Swap `next/font/google` imports to Bricolage Grotesque (opsz + wght axes), Geist (wght), Geist Mono (wght 400–600).
3. **ProductCard.** Replace the component CSS only. DOM structure stays. Lift to the new tokens; the asymmetric hover paint is the biggest visible change.
4. **Sale state.** Update `salePercent` consumers to render in `--color-ok` instead of brand. Compare-at-price uses strikethrough on the `compare` token (`--fg-faint`).
5. **Header.** Replace the pill transition timing in the component's CSS module. The DOM structure is unchanged.
6. **Cart.** Add the new `/cart` full route alongside the drawer. The drawer stays; the route is for direct navigation + email-first buyers.
7. **Email templates.** Replace the four transactional templates with the inline-CSS versions from `emails/`.

The structural lock on ProductCard means everything else can move incrementally without breaking the most-rendered component.
