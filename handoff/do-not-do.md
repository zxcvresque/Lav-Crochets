# Do Not Do

A defense document. Every pattern below was either evaluated and rejected during this design pass, or carried forward from the prior direction that was discarded. When future drift comes (and it will), this is what to point at.

---

## Carried-forward rejections (from the prior shipped direction, S09)

The previous internal direction was nicknamed "Editorial Bookshop". It went through S01–S09 before being rejected as too quiet, too 2018-indie-magazine, too restrained. The founder's words: *"too boring to my eyes."* The patterns below are the specific things that direction shipped that this direction does not.

### Color
- **Muted cream-and-saffron palette.** Cream surface + saffron accents at low chroma. Reads as "warm minimal" rather than "confident saturated 2026 release". The new direction commits to a real focal hue (tangerine, oklch chroma 0.19) instead.
- **No-saturation accents.** Soft pastels for sale, pick, free. Read as "Pinterest mood-board" rather than "live shop". Replaced by saturated rose / iris / sun at oklch chroma 0.16+.

### Type
- **Fraunces as display.** The founder is explicitly done with Fraunces. Do not bring it back even as an italic accent. Bricolage Grotesque is the locked display family.
- **Inter as the only body voice.** The previous BLUEPRINT Part 7 declared this; it produces a Linear-look-alike feel without personality. Geist (Vercel) carries the body in the new direction; Bricolage handles display.
- **Italic serif for emphasis.** Tried with Instrument Serif; founder did not like it. The two-emphasis system is now color-word (tangerine on display) and block-highlight (the orange rectangular "ink." treatment). No italic substitution.

### Layout / composition
- **Marginalian-column hero.** A single editorial column with italic-with-saffron-scribble accent at the top of the page. Reads as 2018 craft magazine. Replaced by a confident type-driven hero.
- **Atlas hard-offset shadow CTA.** Brutalist-style chunky offset shadow on the primary button. Looks like a 2020 portfolio template. Replaced by a soft tangerine glow via `--shadow-brand` on hover only.
- **Three-card-cluster hero with worksheet preview rotations** (the content-adapter direction we explored). The founder decided against it; the hero is single-column type-driven. The cluster lives in the docs as a content-adapter spec but does not ship.
- **Trust strip with "three truthful facts".** The phrase itself signaled corporate template. Replaced by a four-item mono-text strip that includes the real 300+ Etsy claim and three product facts.
- **1:1 square ProductCard with Inter-text-xs title.** The card structure is locked but the title type was anemic. Now Geist 14px / 500 / line-clamp-1 with native title attribute for the truncated full string.

### Copy voice
- **"Editorial Bookshop" copy voice with em-dash-default punctuation.** Em dashes appeared everywhere in the previous direction. They are now a hard rule against. Use periods, commas, parentheses, semicolons, colons, or sentence breaks.
- **Marketing hyperbole.** "Built with love, designed for joy." Replaced by direct, specific copy.

---

## Patterns rejected during this design pass

### Cards / shop surfaces
- **Card box always visible.** The prior version of this design painted a 1px border + background + shadow at rest. The locked spec says: at rest, flush with the grid cell, no visible card boundary. Hover paints the asymmetric box via `::before`.
- **Hover that scales the source image.** A 1.02 scale on hover would crop the bottom descriptor banner of the founder's source PNGs. The image never transforms on hover.
- **Symmetric hover margins.** A 10px-on-all-sides margin extension looks top-heavy. The locked spec extends 10px on top + sides and **12px on the bottom** so the card looks settled rather than top-heavy.
- **Hover that shifts content position.** The hover state expands the visible card box outward but content stays put. The `::before` pseudo-element technique lets us paint outside the layout box without affecting neighbor cards.
- **Heart nested inside the link anchor.** Invalid HTML; breaks SSR/CSR isomorphism. The heart is a sibling of the stretched-link overlay, z-stacked above it.
- **Multi-line title clamp.** Two-line title looks unbalanced when adjacent cards have one-line titles. Locked to `line-clamp-1` with the full title surfaced via the native `title` attribute.
- **Title rendered over the image.** The source PNG has its own typography in the print preview's banner; overlaying site text would compete. The site title lives strictly below the image.
- **Primary-color saturated children's UI treatment.** Bright red/yellow/blue stickers. The buyer is the adult. Stay confident, stay grown-up.

### Hero
- **Auto-rotating hero carousel.** Inherits a11y review concerns and the prior direction's a11y notes specifically deprioritized mobile carousels.
- **Decorative SVG that bleeds across both sides of the hero.** The wave glyph was reduced to a single gentle curve in the upper-right corner; the original 3-peak wave that extended past the viewBox was too much visual noise.

### Header
- **Pill from the start.** The header is flat full-width at rest; it collapses to a centered pill only when scrolled (the Postily move). Pill-always feels overdesigned at the top of the page.
- **Hide navigation in the scrolled pill state.** Initially the pill collapsed too aggressively (~720px wide) and dropped the nav. New width is ~1080px and the nav stays visible.

### Sale / pricing
- **Aggressive red for sale state.** Bright red shouts "ALERT" not "deal". Sale uses `--color-rose-500` (oklch hue 6, chroma 0.19) — confident but not aggressive.
- **Sale percent calculated client-side from the strikethrough.** Use the existing `salePercent` helper. Server-side truth.

### Admin
- **Generic Chart.js admin charts.** Default styling, default tooltips, default legends. Charts get editorial styling: muted axes, type-system numerals, line/bar/sparkline primitives matching the brand. (Phase 4.)
- **Single-page-form admin.** Long product-edit forms get a sticky save bar pattern instead of "scroll to find the save button".

### Motion
- **Cluster entrance animations.** When the cluster was active, it had no entrance, no parallax, no rotation transition. Static SVG. (Carried forward as a principle: decorative chrome doesn't earn motion.)
- **Linear's slow page transitions cloned wholesale.** The motion vocabulary is named (`drawer-open`, `hover-lift`, `tap`, `badge-pop`) and tuned to JoyWaveDigital's pace, not borrowed from anyone else's library.

### Copy / content
- **Em dashes anywhere.** Hard rule. The lint script in `package.json` should flag any `—` in user-facing strings.
- **Reviews count surfaced before reviews exist.** "4.9 rating, 217 reviews" was removed from the trust strip until the new site actually has reviews. The 300+ Etsy claim is true and stays.
- **Comic-sans, primary-color stickers, infantilizing copy.** The buyer is the adult. The kid still gets to be a kid inside the print product, but the chrome respects the buyer.
- **"Built with love" / "Made with joy" / "Crafted for…"**. Replaced by direct factual claims (instant download, no account on first buy).

---

## Things we considered and rejected for good reasons (with the reasons)

- **Dark mode primary.** Considered. Light is the customer default in commerce (cart abandonment goes up on dark commerce surfaces in unofficial studies). Light is the ship default; dark is opt-in via `data-theme="dark"`.
- **Iconography custom-drawn for every glyph.** Considered. The maintenance cost outweighs the brand uplift for utility icons (cart, search, account). lucide-react is the baseline; hero/marketing moments can get custom SVG glyphs case-by-case.
- **Free-pick color in admin.** Considered. Free color pickers in admin let staff put incompatible colors next to brand. The 3-4 curated swatches per setting (where settings affect color) is the locked pattern.
- **Page transitions via Framer Motion only.** Considered. View Transitions API is now broadly supported; we use it where available and fall back to Framer. Don't pay the bundle cost for an effect a 6-line browser API gives us for free.

---

## When the founder asks "why don't we just…"

Point at this file. The patterns above are not preferences. They are decisions that survived rejection. Re-opening any of them costs design-and-engineering time we should be spending on screens the customer hasn't seen yet.

If the answer is genuinely "we should re-examine this", do the exam in writing, share the trade-off, get explicit founder sign-off, and update this document.
