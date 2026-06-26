# Lav Crochets — worklog (append-only)

## Full crochet transform (JoyWaveDigital → Lav Crochets)
- Files: data.jsx, styles.css, primitives.jsx, header.jsx, hero.jsx, sections.jsx, product-scene.jsx, cart-drawer.jsx, footer.jsx, app.jsx, tokens-sheet.jsx, index.html, favicon.svg, assets/upi-qr.svg
- Decisions:
  - Design/layout/fonts/logo kept intact; only recolor + content + commerce changed (per owner).
  - Palette: soft plum/lavender/pink via `--joy-*` tokens; Tweaks panel default set to `plum` (kept, not removed) so it can't revert the theme; currency control + footer currency switcher removed (INR only).
  - Global `CONFIG` at top of data.jsx holds all brand/contact values. WhatsApp 919960854712, email hello@lav-crochets.art, IG @crochetsbylav, city Chhatrapati Sambhajinagar.
  - Real 6-product catalogue from CATALOGUE.md; photos via `catalogue-images/<slug>.jpg` with `ProductArt` fallback to crochet PrintArt placeholders. All items marked in-stock, "Delivered in 4 to 5 days". No international/India-scope phrasing.
  - Checkout = `buildWhatsAppHref(cart)` (pre-filled message) + UPI panel (id copy + placeholder QR svg). Prices crochet-only; shipping confirmed on WhatsApp.
  - screens/*.html (thank-you etc.) left untouched for a later on-site confirmation step.
  - Adopted superclaude.md protocol: plan.md, todo.md, this worklog as durable state.
- Next: git init + initial commit, then serve over HTTP and verify with headless Chrome (theme, cart→WhatsApp link, UPI panel, console clean).

## Verify + post-verify fixes
- Files: hero.jsx, sections.jsx, todo.md
- Decisions: confirmed catalogue-images/ has all 6 photos (real photos render via ProductArt). Fixed hero sub/eyebrow to match real catalogue (charms/clips/headbands/keychains, not amigurumi/bouquets). Removed fabricated "300+/4.9" hero stats. FreeRow now shows all in-stock items (was slice(0,4), which duplicated Featured and hid the ₹180/₹280 pieces).
- Verified (headless Chrome http://127.0.0.1:8000): plum theme, lav/crochets wordmark + kept logo, nav, ₹ prices, 3 collections, product scene (₹700 + Add to cart + Order on WhatsApp), 8 wa.me links, 13 instagram links, 0 old-brand terms, full render = no fatal errors.
- Next: owner to add real UPI id + QR and (optionally) decide whether to hide the dev Tweaks/Tokens panels for the public site. Cart→WhatsApp→UPI flow is wired (UPI panel renders once cart has items).

## Polish: compact product spec block + local tweaks opener
- Files: styles.css (.pd .file-meta), app.jsx
- Decisions: redesigned .file-meta from wrap-flex (uneven, spacious) into a bordered key/value table — 92px mono label column + value, hairline row dividers; more compact and aligned. Added owner-only `?tweaks=1` URL flag that posts __activate_edit_mode so the (otherwise editor-only, hidden-from-visitors) Tweaks panel can be opened locally bottom-right.
- Verified: full-res preview of the spec block (clean table); ?tweaks=1 opens the panel.

## Mobile header + elegant drawer
- Files: header.jsx, primitives.jsx, styles.css
- Decisions: mobile header was overflowing because the new Instagram/WhatsApp icons weren't hidden on mobile. Added `.header-extra` class to those two and hid them <=768 (cart + hamburger remain, matching the reference). Confirmed (computed-style probe) the hamburger renders at x=359, display:flex — earlier "missing hamburger" was a misread screenshot. Pill-on-scroll / full-width-at-top behavior already matches the reference.
- Redesigned mobile nav drawer to match reference: big nav links, divider, then a smaller icon-led tier (Cart, Instagram, WhatsApp, Share this shop). Added instagram/whatsapp/share icons to the Icon set; desktop header now uses the instagram + whatsapp glyphs. Share uses navigator.share with clipboard fallback. Cart row opens the cart drawer (onOpenCart passed through).
- Studied screens-desktop-*/screens-mobile CSS for sizing; live styles.css already matches (container 1360/28px -> 16px; grid 4/3/2 cols; header 84->60/60 mobile; section 96px). Will apply to new shop/custom pages.
- Next: separate pages (shop.html/custom.html), cart localStorage persistence, remove wishlist hearts, ShopPage + CustomPage(form->WhatsApp).

## Separate pages + persistent cart + wishlist removal
- Files: index.html (data-page=home), shop.html (new), custom.html (new), app.jsx, sections.jsx, header.jsx, hero.jsx, footer.jsx, styles.css
- Decisions:
  - Multi-page via shared script bundle + <body data-page>. app.jsx reads document.body.dataset.page and renders HomePage sections / <ShopPage> / <CustomPage>. No router lib.
  - Cart persists in localStorage key `lav.cart` (init from it, useEffect writes on change). Verified: pre-seeded 3 items -> header badge shows 3 on load, so it survives navigation across the 3 pages.
  - ProductCard: removed wishlist heart + dead #product stretched link; added optional onAdd -> "Add to cart" button. FeaturedRow/FreeRow/ShopPage pass handleAdd. Home no longer renders the inline ProductScene (redundant; cards add directly).
  - ShopPage: collection filter chips (All + 3 categories, prefilled from ?cat=), full grid. CustomPage: form whose submit composes a WhatsApp message (window.open wa.me) — no backend.
  - Cross-page links: header/hero/footer/category-tiles/custom-CTA now point to shop.html, shop.html?cat=, custom.html, index.html#story / #footer.
  - styles.css: .page-top header clearance, .shop-filters/.shop-filter, .pcard-add, .cform/.cfield/.cgrid/.custom-lead/.custom-note.
- Verified via headless Chrome: shop (6 photos, prices, add buttons, filters, 0 hearts), custom (form + Send on WhatsApp), home renders, cart badge persists.
