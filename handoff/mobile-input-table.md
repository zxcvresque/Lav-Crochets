# Mobile input attributes

One row per form field across the storefront. Every input declares these so iOS keyboards select correctly, autofill works, and the 16px font-size floor (declared per-field in CSS, see `mobile-tokens.css`) prevents auto-zoom on focus.

Columns:

- **route** : path the field lives on
- **field** : `name` attribute
- **type** : `<input type>` attribute
- **inputmode** : keyboard variant on iOS / Android
- **autocomplete** : WHATWG token (browsers route to autofill providers)
- **enterkeyhint** : label on the iOS Return key + Android action button

If a field is part of a larger form, the listed `enterkeyhint` is for that field specifically. The last field in a form takes `"go"` or `"send"` to signal submit; earlier fields take `"next"`.

---

## Auth

| Route | Field | type | inputmode | autocomplete | enterkeyhint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/sign-in` | `email` | `email` | `email` | `email` | `go` |

The sign-in flow is magic-link only (no password). Single field, single button, sticky CTA lifts over the keyboard.

## Cart and checkout

| Route | Field | type | inputmode | autocomplete | enterkeyhint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/cart` | `email` | `email` | `email` | `email` | `go` |
| `/cart` | `coupon` | `text` | `text` | `off` | `done` |

The cart's `email` field is the buyer's receipt destination. Marked `autocomplete="email"` so the field surfaces in the iOS QuickType bar (the most-used email on the device). `coupon` is `autocomplete="off"` so iOS doesn't suggest the saved email.

## Order recovery

| Route | Field | type | inputmode | autocomplete | enterkeyhint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/orders/recover` | `email` | `email` | `email` | `email` | `send` |

Single-field hero. `enterkeyhint="send"` because the action is "send the magic-link email" not "go to a new page".

## Account profile

| Route | Field | type | inputmode | autocomplete | enterkeyhint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/account/profile` | `display_name` | `text` | `text` | `name` | `next` |
| `/account/profile` | `email` | `email` | `email` | `email` | `next` |
| `/account/profile` | `country` | `text` | `text` | `country-name` | `done` |

The `country` field is a typeahead, not a `<select>` (the spec for the live admin uses a `<combobox>` pattern). `autocomplete="country-name"` lights up iOS country autofill.

## Account settings (notifications + currency + theme are all controls, not text fields; not listed)

| Route | Field | type | inputmode | autocomplete | enterkeyhint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/account/settings` | `delete_confirm` | `text` | `text` | `off` | `done` |

The "type DELETE to confirm" field. `autocomplete="off"`, no keyboard suggestions.

## Search

| Route | Field | type | inputmode | autocomplete | enterkeyhint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/search` (overlay) | `q` | `search` | `search` | `off` | `search` |
| `/shop` (header inline) | `q` | `search` | `search` | `off` | `search` |

Search inputs are `type="search"` so iOS shows the X-clear affordance natively. `autocomplete="off"` so the keyboard suggests query completions, not saved emails.

## Contact

| Route | Field | type | inputmode | autocomplete | enterkeyhint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/contact` | `name` | `text` | `text` | `name` | `next` |
| `/contact` | `email` | `email` | `email` | `email` | `next` |
| `/contact` | `subject` | `text` | `text` | `off` | `next` |
| `/contact` | `message` | (textarea) | `text` | `off` | `send` |

Note: `<textarea>` doesn't expose `inputmode` consistently across browsers; we set it anyway and rely on the wrap behavior. `enterkeyhint="send"` on a textarea overrides only the inline-keyboard label; Enter still inserts a newline.

## Admin (desktop-primary; listed for completeness only)

| Route | Field | type | inputmode | autocomplete | enterkeyhint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/admin/products/*` | `price_usd` | `text` | `decimal` | `off` | `done` |
| `/admin/products/*` | `sku` | `text` | `text` | `off` | `next` |

Admin gets the mobile-fallback notice (Part 3 item 11). These rows are listed so the engineer doesn't have to reverse-engineer the input attrs if a future admin-on-mobile pass happens.

---

## Universal rules

- **`type="email"`** triggers the email keyboard (@ visible, space removed). Always preferred to `inputmode="email"` because some Android keyboards key off type, not inputmode.
- **`type="search"`** is preferred over `type="text"` for any query input because of the native clear-X.
- **`autocomplete="off"`** is set on coupon, delete-confirm, query inputs. Modern browsers ignore `autocomplete="off"` for username / password / email fields by design (autofill is a feature). Acknowledge and move on.
- **`enterkeyhint`** is supported on Chromium 77+, Safari 13.4+, iOS Safari 13.4+, Firefox 94+. Falls back to default "Return" on older browsers (no visual regression).
- **Font-size 16px minimum.** Set in CSS, not here. Every input element on mobile gets `font-size: 16px` (the iOS auto-zoom threshold). Inputs that are sized larger (the sign-in hero) get 17 or 20 to match the type scale; nothing goes below 16.

## VoiceOver labels (icon-only inputs)

Inputs that have no visible label (the search icon button that opens the overlay, the heart button on a product card, the trash icon on a cart line) need `aria-label`. See `mobile-a11y.md` for the full label table.

## Auto-focus rules

- Single-input pages: AUTOFOCUS PERMITTED. `/sign-in`, `/orders/recover`, the search overlay first render.
- Multi-field pages: NEVER autofocus. The user picks where to start. This is the locked rule.
- Bottom-sheet inputs: autofocus the first input ON open. The user explicitly invoked the sheet, so focus inside it is expected.
