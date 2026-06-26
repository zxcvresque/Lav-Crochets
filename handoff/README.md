# JoyWaveDigital · Design Handoff

**Direction**: tangerine focal, warm paper, warm-charcoal ink. Type pair: Bricolage Grotesque + Geist + Geist Mono. Motion: 4 named curves, 4 named durations. Locked rules baked into the system; see `do-not-do.md` for what we explicitly rejected.

---

## What's in here

```
handoff/
  README.md             ← you are here
  globals.css           ← Drop into app/globals.css. Tailwind v4 @theme block.
  rationale.md          ← Per-screen 2–4 sentence writeups (what / why / trade-offs / what was rejected)
  accessibility.md      ← Focus order, ARIA roles, contrast ratios, reduced-motion map, keyboard map
  do-not-do.md          ← Explicit anti-patterns + prior-direction rejections
  motion.ts             ← Framer Motion variants, named per the motion sheet
  state-changes.md      ← What changed between this design pass and the prior shipped direction
```

The live prototype is at the project root (`index.html` + component .jsx files). Open it to feel the system; the static screens live in `screens/`.

---

## Adoption order (for the implementing engineer)

1. **Tokens first.** Replace `app/globals.css` with `handoff/globals.css`. Verify the Tailwind v4 build picks up the `@theme` block; spot-check a few `bg-paper`, `text-joy-700`, `font-display` utilities in the browser.

2. **Type loading.** In `app/layout.tsx`, swap in Bricolage Grotesque, Geist, Geist Mono via `next/font/google`. Bricolage uses the optical-size + weight variable axes; load with `axes: ['opsz', 'wght']`. Geist Mono is a separate family.

3. **ProductCard.** The structural spec is locked (see the May 2026 lock note). Replace only the type/color/spacing tokens in `components/shop/product-card.tsx`. DOM structure stays (article > image+chip, heart as sibling, stretched-link sibling, content cluster, asymmetric hover via `::before`). The new hover paint targets `--bg-elev` for fill, `--line-2` for border, `--shadow-2` for shadow. Half-pixel `translateY(-0.5px)` lift. No image transform.

4. **Header.** Pill-on-scroll behaviour, ~700ms `cubic-bezier(0.4, 0, 0.2, 1)` transition (the "Material" feel, slower-buttery). Full-width flat at rest, ~1080px centered pill when scrolled. Nav stays visible inside the pill.

5. **Components, one slice at a time.** Use `components.html` as the visual spec — it shows every state for every component. Match the markup, copy the styles, ship.

6. **Per-screen mockups.** `screens/*.html` are static visual targets. They share the same `styles.css` and primitives as the live prototype, so the markup is directly liftable.

7. **Emails.** `emails/*.html` are inline-CSS, web-safe-font, Gmail/Apple-Mail-compatible templates. Drop into your `lib/email/templates/` directory and render via react-email.

---

## Hard rules that survive in the system

These are locked at the token level and the component level. Do not regress on them.

- **No em dashes anywhere in copy.** Use periods, commas, parentheses, semicolons, colons, or sentence breaks. Search/replace any `—` or `--` that sneaks in.
- **WCAG 2.2 AA contrast.** Body text ≥ 4.5:1. Large text ≥ 3:1. Non-text UI ≥ 3:1. Ratios for every consumed token pair are documented at the bottom of `globals.css`.
- **Focus-visible everywhere.** The base layer adds a 2px brand outline + 2px offset to every interactive element by default; components override only with stronger affordances (the card's `:focus-within` paint, for example).
- **Reduced motion.** Every animation respects `prefers-reduced-motion: reduce`. Critical-motion components opt back in via the inverted media query.
- **Skip-to-content link** on every page. The `.skip-link` class is in `globals.css`.
- **Touch targets ≥ 44 × 44 pixels.** The heart button on `ProductCard` and the cart icon in the header both pad invisible click area beyond the visible icon to hit 44px.
- **Local-currency display contract.** USD canonical in DB. Cards show local only. Detail / cart / checkout show local + parenthetical USD. Footer carries "Prices charged in USD" disclosure. Currency switcher in footer (native `<select>`).

---

## Token map cheatsheet

```
COLOR ROLES                    TYPE                       SPACE / RADIUS
─────────────────────          ──────────────────         ─────────────────
bg, bg-elev, bg-subtle         font-display              spacing-{1..10}
fg, fg-soft, fg-muted, fg-faint  font-body / font-mono   radius-{1..5}, radius-pill
brand, brand-press, brand-ink  text-{xs..hero}            shadow-{1..4}, shadow-brand
sale, pick, free
ok, warn, bad, info            MOTION
line, line-2                   ──────────────────
                               ease-{out-soft, out-spring, in-soft, in-out-soft}
                               duration-{fast, base, med, slow}
```

Everything that touches the UI consumes role tokens (`bg`, `fg`, `brand`), not the raw scale (`joy-500`). Reserve the scale for tokens themselves, dark-mode overrides, and the occasional component-local override.

---

## What lives outside this folder

- `index.html` + `*.jsx` at project root: the live React prototype. Use it to feel motion and interaction. The Tweaks panel (bottom-right when toggled on) lets you compare palette / density / radius / dark live.
- `screens/`: per-route HTML mockups. Each is self-contained and uses the shared `styles.css`.
- `emails/`: email templates.

---

## Direction summary (for context)

The shop sells educational printables (worksheets, decodable readers, activity packs, flashcards, classroom decor, bundles) for ages 3–12. The **buyer is the adult**, not the child. The design respects the buyer's intelligence and aesthetic taste while staying warm and welcoming.

The prior direction (cream + saffron + Fraunces, "Editorial Bookshop") was rejected as too quiet and too 2018-indie-magazine. This direction goes the other way: saturated tangerine focal, type with character, motion that earns its keep, confident contrast. Not infantilizing. Not cute. A 2026 release, not a craft revival.

The full anti-pattern list (what we explicitly rejected and why) lives in `do-not-do.md`.
