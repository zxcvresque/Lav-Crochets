# Desktop input attributes table

One row per form field across the storefront, admin chrome, and account pages. Every field declares the locked attribute set so autofill works, validation is consistent, and the error-state copy matches the design vocabulary.

Columns:
- **route** : path the field lives on
- **field** : `name` attribute
- **type** : `<input type>` attribute
- **autocomplete** : WHATWG token
- **required** : yes / no
- **error-state copy** : what we show on validate failure (no em dashes)

No em dashes in any field copy below.

---

## Auth

| Route | Field | type | autocomplete | required | Error-state copy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/sign-in` | `email` | `email` | `email` | yes | Please enter a valid email address. |

Magic-link auth only. No password field. The hero copy says "We email you a one-tap link."

## Cart and checkout

| Route | Field | type | autocomplete | required | Error-state copy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/cart` | `email` | `email` | `email` | yes (server enforces) | Please enter a valid email address. We send your receipt here. |
| `/cart` | `coupon` | `text` | `off` | no | This coupon is not active. |

`email` on /cart is the receipt destination. `coupon` is `autocomplete="off"` so autofill does not surface the saved email.

## Order recovery

| Route | Field | type | autocomplete | required | Error-state copy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/orders/recover` | `email` | `email` | `email` | yes | Please enter a valid email address. |

The response is anti-enumeration: same shape whether the address has orders or not.

## Account profile

| Route | Field | type | autocomplete | required | Error-state copy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/account/profile` | `display_name` | `text` | `name` | yes | Please give us something to call you. |
| `/account/profile` | `email` | `email` | `email` | yes | Please enter a valid email address. |
| `/account/profile` | `country` | `text` (combobox) | `country-name` | no | We could not find that country. Try the full name. |

The `country` field is a typeahead with the ISO 3166-1 country list. Free-text input is accepted but validated against the list.

## Account settings (controls only; no text fields)

| Route | Field | type | autocomplete | required | Error-state copy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/account/settings` | `delete_confirm` | `text` | `off` | yes (when delete-account modal open) | Type DELETE in capital letters to confirm. |

The "type DELETE" guard for the irreversible delete-account flow.

## Search

| Route | Field | type | autocomplete | required | Error-state copy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/search` (overlay) | `q` | `search` | `off` | no | n/a (no results state has its own panel) |
| `/shop` (header inline) | `q` | `search` | `off` | no | n/a |

`type="search"` so browsers expose the native X-clear affordance.

## Contact

| Route | Field | type | autocomplete | required | Error-state copy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/contact` | `name` | `text` | `name` | yes | Please tell me what to call you. |
| `/contact` | `email` | `email` | `email` | yes | Please enter a valid email address. |
| `/contact` | `subject` | `text` (select) | `off` | yes | Please pick a subject so I can route this correctly. |
| `/contact` | `message` | (textarea) | `off` | yes | Please tell me what is going on. |

Subject is a select with six options (An order issue, A download is broken, Refund request, Licensing or schools, Press / brand collab, Just saying hi).

## Newsletter (`/` home)

| Route | Field | type | autocomplete | required | Error-state copy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` (footer panel) | `email` | `email` | `email` | yes | Please enter a valid email address. |

The newsletter copy promises "One letter a month, one free printable inside."

## Admin

| Route | Field | type | autocomplete | required | Error-state copy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/admin/sign-in` | `email` | `email` | `email` | yes | Please enter a valid admin email. |
| `/admin/products/new` | `title` | `text` | `off` | yes | Product title is required. |
| `/admin/products/new` | `slug` | `text` | `off` | yes (auto-generated from title) | This slug is already in use. Pick another. |
| `/admin/products/new` | `price_usd` | `number` step 0.01 | `off` | yes | Price must be 0 or a positive number. |
| `/admin/products/new` | `was_price_usd` | `number` step 0.01 | `off` | no | If set, was-price must be greater than the price. |
| `/admin/products/new` | `sku` | `text` | `off` | no | SKU must be unique across active products. |
| `/admin/products/new` | `description` | (Tiptap editor) | n/a | no | n/a |
| `/admin/orders/[id]` (refund) | `refund_amount` | `number` step 0.01 | `off` | yes (when refunding) | Amount must be between 0 and the order total. |
| `/admin/orders/[id]` (refund) | `refund_reason` | `text` | `off` | no | n/a |

Admin uses the existing `AdminStickySaveBar` to surface unsaved changes. Validation errors paint inline below the field; the save bar shows "Try again" instead of "Save changes".

## Universal rules

- **`type="email"`** triggers email validation in the browser. Always preferred to a plain text input with a regex pattern.
- **`autocomplete="off"`** on coupon / SKU / search queries. Modern browsers ignore `autocomplete="off"` for username / password / email by design.
- **Required fields** declare the `required` attribute. The browser-native validation kicks in on submit; server-side validation is the source of truth.
- **Error copy** is conversational, specific, actionable. No "Invalid input". No "This field is required."
- **Inline errors** paint below the field in `--color-bad`, with a leading warn icon. `aria-invalid="true"` on the input. `aria-describedby="<field>-error"` linking the input to the error message.
- **Server errors** that affect the whole form (e.g. "Could not save profile") render as a bad-variant banner above the form, NOT inline on a field.

## Auto-focus rules

- Single-input pages: autofocus permitted. `/sign-in`, `/orders/recover`, the search overlay first render.
- Multi-field pages: NEVER autofocus. Let the user pick where to start. Locked.
- Modal open: autofocus the first input on open. The user explicitly invoked the modal.
- Sticky-form pages: never autofocus (the page may have scrolled past the form on link entry).
