# Lav Crochets — Full Rebuild Spec

## 1. Concept & Vision

Lav Crochets is a handcrafted crochet accessories brand selling directly to customers across India. The site is a warm, craft-forward storefront — not a generic Shopify store. Every detail should feel like it was made by hand: soft, tactile, slightly imperfect in the best way. The brand voice is warm and personal, the visual language is clean but rich with texture. Customers should feel like they're browsing a cozy studio, not a warehouse.

The rebuild moves from a static HTML/React site to a full-stack Next.js application with real auth, payment processing, and an admin panel. No WhatsApp. Direct checkout with Razorpay.

---

## 2. Design Language

**Same as current site** — evolve, don't replace.

### Colors
| Token | Value | Use |
|---|---|---|
| `--joy-500` | `oklch(.780 .122 306)` | Brand accent (plum default) |
| `--joy-950` | `oklch(.235 .060 300)` | Deep text on brand |
| `--paper` | `#FAF7F2` | Warm cream background |
| `--ink` | `#1A1523` | Primary text |
| `--line` | `oklch(.88 .01 300)` | Borders, dividers |
| `--bg-elev` | `#FFFFFF` | Card/panel backgrounds |
| `--rose-500`, `--iris-500`, `--sun-500` | — | Category tiles, accents |

### Typography
- **Display**: Bricolage Grotesque (opsz 12..96, 300..800) — hero headings, section titles
- **Body**: Geist (300..800) — body text, UI, nav
- **Italic accent**: Cormorant Garamond — quote blocks, special callouts
- **Mono**: Geist Mono — prices, codes

### Spatial System
- Base unit: 4px
- Section padding: 96px desktop / 64px mobile
- Card radius: 18px default, 26px for large panels, 6px for sharp mode
- Max content width: 1200px

### Motion
- Scroll-reveal: opacity 0→1, translateY 20px→0, 400ms ease-out, 80ms stagger
- Hover: 200ms ease transitions on color/shadow/transform
- Cart bump: scale 1→1.15→1, 600ms
- Marquee: continuous horizontal scroll, 30s loop

### Dark Mode
- Toggle in nav (sun/moon icon)
- Persisted in localStorage
- OS preference on first visit
- Full token system — all `--joy-*` roles shift under dark

### Icon Library
Custom inline SVG components — consistent 24px grid, 1.8px stroke, rounded caps.

---

## 3. Layout & Structure

### Public Pages

**`/` — Homepage**
- Hero: tagline + CTA
- Tabbed product section: "Ready to Ship" | "Made to Order" — tab switching shows filtered products
- Instagram carousel: horizontal scroll of latest 6 posts
- Quote + how-it-works section
- FAQ accordion
- Newsletter/contact CTA panel

**`/shop` — Full Shop**
- Filter bar: All / Bag Charms / Hair Accessories / Keychains
- Product grid (4-col desktop, 2-col tablet, 1-col mobile)
- Ready to Ship badge vs Made to Order badge on cards

**`/product/[slug]` — Product Detail**
- Full-width image
- Title, price (with strike-through if discounted)
- Stock status chip: "Ready to Ship" (T+0 days) vs "Made to Order" (T+X days)
- Colour/size options (if applicable)
- Description, materials, care instructions
- Add to Cart button → adds item to cart drawer

**`/checkout` — Checkout**
- Cart summary
- Coupon input field + Apply button
- Shareable coupon link: `/checkout?coupon=CODE` auto-applies
- Contact info form (name, email, phone, address)
- Razorpay payment button

**`/auth/login` & `/auth/signup`**
- Google OAuth button (primary)
- Email + Password fields
- "Continue with Email OTP" option (Better Auth + Resend)

**`/account` — Customer Account**
- Order history
- Track order status

**`/custom`** — Custom order request form (email via `/api/custom/request`)
**`/contact`** — Contact form with email + Instagram (no WhatsApp)
**`/about`** — Brand story, maker intro

### Admin Pages (`/admin` — auth-gated)

**`/admin`** — Dashboard
- Quick stats: orders today, revenue, active coupons, low-stock alerts

**`/admin/products`** — Product Management
- CRUD: add, edit, delete products
- Drag-to-reorder product list
- Fields: title, slug, category, price (INR), cost price (optional), stock status, turnaround days, materials, color options, size options, description, images (URL or upload to R2/Cloudinary), chip (bestseller/new/sale)

**`/admin/orders`** — Order Management
- List all orders with status filters
- View order detail
- Update order status: Pending → Confirmed → Making → Ready → Shipped
- "Send Delay Email" button: opens a modal to type a custom message or set a new estimated completion date — sends via Resend

**`/admin/coupons`** — Coupon Management
- Create coupon: code, type (flat/%), value, usage limit (total + per-user), expiry date
- Activate/deactivate
- Copy shareable link: `https://lav-crochets.art/checkout?coupon=CODE`
- See usage stats

**`/admin/customers`** — Customer list (read-only)

---

## 4. Features & Interactions

### Product Tabs (Homepage)
- Two tabs: "Ready to Ship" and "Made to Order"
- Active tab shows filtered product grid
- Switching tabs: fade out current, fade in new (200ms)
- URL updates: `/` + hash or query param so tabs are linkable

### Instagram Feed
- Primary: Instagram Basic Display API (personal account, no business required)
  - Requires: Facebook Developer App, add Instagram Basic Display product, generate long-lived token
  - If token expires or setup fails: fallback to oEmbed RSS feed (no auth needed)
- Displays: 6 most recent posts, horizontal scroll/carousel
- Each tile: square image, links to Instagram post
- Auto-refresh: revalidate every hour (ISR)

### Cart
- Persisted in localStorage (guest) or database (logged in)
- Slide-out drawer (desktop) / bottom sheet (mobile)
- Items: product image, title, qty, price, remove button
- Subtotal calculation
- "Proceed to Checkout" CTA

### Coupon System
- **Admin creates coupon:**
  - Code: uppercase alphanumeric, unique
  - Type: `flat` (₹) or `percent` (%)
  - Value: e.g. `50` flat or `10` for 10%
  - Min order value: optional (e.g. min ₹500 to apply)
  - Total usage limit: optional (e.g. first 100 uses)
  - Per-user limit: optional (e.g. 1 per customer)
  - Expiry: optional date
  - Active: boolean toggle
- **Customer applies:**
  - Manually: enter code at checkout
  - Link: `/checkout?coupon=HAPPY50` — auto-applies
- Discount shown before payment
- Coupon badge on product cards if one is active

### Checkout (Razorpay Standard)
1. User reviews cart
2. Enters billing info (name, email, phone, address)
3. Applies coupon (optional)
4. Clicks "Pay ₹X" → opens Razorpay modal
5. User pays via any method (UPI/Card/Netbanking/Wallet)
6. On success: order created in DB, confirmation email sent via Resend
7. On failure: shown error, can retry
8. On webhook (optional): also handle payment verification server-side

### Order Confirmation Email (Resend)
- Subject: "Your Lav Crochets order is confirmed! 🎉"
- Contents: order number, items, total, estimated delivery
- For Made to Order: "Your piece will be ready by [T+X days]"

### Delay Notification Email (Resend)
- Triggered by admin from order detail
- Custom message field + optional new date
- Subject: "An update on your Lav Crochets order"
- Body: warm, personal tone, explains delay, offers support

### Invoice Email (Resend)
- Triggered on order shipped
- Clean PDF-style HTML email with order details

### Auth
- **Better Auth** + **Resend OTP** for email magic link / OTP
- **Google OAuth** via Better Auth
- Session persisted, JWT in httpOnly cookie
- Middleware protects `/admin` routes
- Public routes: optional login wall (not required for checkout as guest)

---

## 5. Component Inventory

### ProductCard
- States: default, hover (slight shadow lift), loading (skeleton shimmer)
- Chip: Bestseller (gold), New (brand), Sale (red)
- Stock badge: Ready / Made to Order
- Price: regular or strike-through + sale price
- Add to Cart button: default → loading (spinner) → success (check) → reset

### CartDrawer
- Slide in from right, 400px wide
- Overlay backdrop (click to close)
- Item rows with qty +/-, remove button
- Subtotal, coupon input (inline), checkout button

### CouponInput
- Input + "Apply" button
- States: idle, loading, success (green check + discount shown), error (red + message)
- Shows discount amount when applied

### TabSwitcher
- Two tabs with underline indicator
- Smooth slide animation on indicator

### InstagramCarousel
- Horizontal scroll, snap to card
- Prev/Next arrows (desktop)
- Touch swipe (mobile)
- 6 tiles, square aspect ratio
- Lazy load images

### AdminOrderStatus
- Dropdown/buttons: Pending → Confirmed → Making → Ready → Shipped
- Each transition is an action (updates DB + shows confirmation)

### DelayEmailModal
- Triggered from order detail
- Fields: custom message (textarea), new date (optional date picker)
- Preview of email before sending
- "Send" button → Resend API call

---

## 6. Technical Approach

### Stack
- **Framework**: Next.js 15 (App Router, TypeScript)
- **Database**: Prisma + SQLite (zero-cost, easy to migrate to PostgreSQL later)
- **Auth**: Better Auth (Google OAuth + Email/Password + Resend OTP)
- **Email**: Resend (transactional emails)
- **Payments**: Razorpay Standard Checkout (web SDK)
- **Instagram**: Instagram Basic Display API (personal account, generate token manually) → fallback to oEmbed RSS
- **Deployment**: VPS + Docker + Cloudflare Tunnel (no port forwarding needed)
- **File uploads**: Cloudflare R2 (or similar object storage) for product images — or URL-only for MVP

### Key Decisions
- **No WhatsApp** — fully removed from checkout flow
- **No build step for static assets** — all inline CSS/JS as before, but in Next.js components
- **API routes** in `app/api/` for: orders, coupons, auth, email, Razorpay, Instagram
- **Middleware** for auth protection on `/admin/*`
- **ISR** for Instagram feed (revalidate every hour)
- **localStorage → database** cart migration when user logs in

### Data Model (Prisma)
See separate schema. Key entities:
- `User` — id, email, name, googleId, role (customer/admin)
- `Product` — all product fields, sortOrder, images[]
- `Order` — user, items, total, status, coupon applied, razorpayOrderId, etc.
- `Coupon` — code, type, value, limits, expiry, active
- `CouponUsage` — couponId, userId (for per-user limits)
- `InstagramPost` — cached post data (image, url, caption, timestamp)

### API Endpoints
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/[...betterauth]` | Better Auth handlers |
| GET | `/api/products` | List products (public) |
| GET | `/api/products/[id]` | Single product |
| POST | `/api/orders` | Create order (after Razorpay success) |
| GET | `/api/orders` | List orders (admin) |
| PATCH | `/api/orders/[id]` | Update order status |
| POST | `/api/orders/[id]/send-delay-email` | Send delay email |
| GET | `/api/coupons/validate` | Validate + apply coupon |
| POST | `/api/coupons` | Create coupon (admin) |
| GET | `/api/coupons` | List coupons (admin) |
| POST | `/api/razorpay/order` | Create Razorpay order |
| POST | `/api/razorpay/webhook` | Handle Razorpay webhook |
| POST | `/api/email/send` | Generic email send (admin) |
| GET | `/api/instagram` | Fetch cached Instagram posts |

### Deployment
- Docker container on VPS (single container, no Kubernetes)
- `cloudflared` tunnel connects container port 3000 to Cloudflare
- Domain `lav-crochets.art` → Cloudflare Tunnel → container
- Environment variables in `.env` (never committed)
- GitHub Actions: on push to `main` → build Docker image → deploy to VPS
