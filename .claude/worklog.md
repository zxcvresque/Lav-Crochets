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
