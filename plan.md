# Lav Crochets — plan (what & why)

## Context
Transform a no-build React-via-Babel storefront (formerly "JoyWaveDigital", digital
printables) into **Lav Crochets**, a handmade-crochet shop that takes orders over
**WhatsApp** and is paid by **UPI**. India-only audience.

## Guardrails
- **Keep the website design, layout, fonts, animations, glassmorphism, and the current logo.**
  Only recolor + rewrite content + change commerce.
- Recolor to a **soft plum / lavender / pink** palette (token-driven).
- Wordmark = `lav/crochets` (same slashed style as the old `/digital`).
- **INR only.** Prices are crochet-only; **shipping is separate**, confirmed on WhatsApp.
- Everything **delivered in ~4–5 days**; custom-piece making time is agreed over chat.
- **No international / "Indian brand" framing** in copy (audience is India-only).
- Removed pages: blog/Notes, Account/Library/Orders/Wishlist, Bundles/Freebies.
- The static `screens/*.html` (incl. thank-you states) are **kept untouched** for a later
  on-site order-confirmation step.

## Architecture facts
- `index.html` loads React UMD + Babel-standalone, then each `*.jsx` as `text/babel`.
  Babel XHR-fetches scripts → must serve over **HTTP** (not file://).
- Global `CONFIG` lives at the top of `data.jsx` (loads first) → every component reads it.
- Theme = `--joy-*` tokens in `styles.css` + a live palette applied by the kept Tweaks panel
  (default set to `plum` so it can't revert the brand).

## Key data
- 6 products from `CATALOGUE.md`; photos convention `catalogue-images/<slug>.jpg`
  (graceful fallback to placeholder art via `ProductArt`).
- Collections: Bag charms, Hair accessories, Keychains.
- Contact: WhatsApp +91 99608 54712, email hello@lav-crochets.art,
  Instagram @crochetsbylav, city Chhatrapati Sambhajinagar.

## Order flow
Cart → "Send order on WhatsApp" (pre-filled item list + total via `buildWhatsAppHref`) →
UPI panel (id + QR placeholder) → seller confirms total + shipping on WhatsApp.

## Still needed from owner
Real UPI id + QR image; product photos in `catalogue-images/`; optional WhatsApp catalogue URL.

## Verify
Serve over HTTP (`python -m http.server 8000`), open in Chrome, check: plum theme + logo,
nav, ₹ prices, add-to-cart, WhatsApp link + message, UPI panel, no console errors.
