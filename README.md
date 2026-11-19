# Lav Crochets

The online shop for Lav Crochets, a one-person handmade crochet studio in Chhatrapati Sambhajinagar. Customers browse ready-to-ship and made-to-order pieces, pay with Razorpay, and track their order by courier. The shop owner runs products, orders, coupons and shipping from `/admin`.

## Stack

- **Next.js 15** (App Router) with React 19 and TypeScript
- **Prisma** with SQLite (`prisma/dev.db` locally, a mounted volume in production)
- **better-auth** for sign-in: email magic links and optional Google
- **Razorpay** Checkout for payments: UPI, cards, netbanking
- **Resend** for order emails
- Tailwind v4 plus the hand-written design tokens in `app/globals.css`

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npx prisma db push           # create/update the SQLite schema
npm run db:seed              # sample products + an admin user
npm run dev                  # http://localhost:3000
```

### Environment variables

See `.env.example` for every variable. The main ones:

| Variable | Needed for |
| --- | --- |
| `DATABASE_URL` | SQLite file, e.g. `file:./dev.db` |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` | Sessions and auth callbacks |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Magic links and order emails (skipped with a warning when unset) |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Checkout (use `rzp_test_` keys locally) |
| `RAZORPAY_WEBHOOK_SECRET` | `/api/razorpay/webhook` (returns 503 until set) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional Google sign-in |
| `INSTAGRAM_ACCESS_TOKEN` | Optional homepage Instagram strip |
| `ERROR_WEBHOOK_URL` | Optional: errors POSTed here as JSON |
| `INDIA_POST_LIVE_TRACKING` | Optional `1`: live India Post status on `/track` (unofficial, may break) |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:razorpay` | Signature verification checks (offline) |
| `npm run db:push` / `db:seed` / `db:studio` | Prisma schema, seed data, DB browser |

## How payments work

1. `POST /api/razorpay/order` prices the cart from the database (never from the browser), applies any coupon, creates a Razorpay order and a pending `Order`.
2. The checkout opens Razorpay's modal. On success it calls `POST /api/razorpay/verify`, which checks the HMAC signature and marks the order paid (idempotent).
3. `POST /api/razorpay/webhook` (events `payment.captured`, `order.paid`, `payment.failed`) is the backup for customers who close the tab early. It checks `X-Razorpay-Signature` against `RAZORPAY_WEBHOOK_SECRET`.

## Shipping and tracking

Orders ship by courier. In `/admin/orders/<id>`, set the courier, tracking number (only if the courier gave one), expected delivery date and shipped date. Customers check `/track` with their order number plus the email or phone they used. Add couriers in `lib/couriers.ts`.

## Errors

Server errors (`instrumentation.ts`) and browser render errors (`app/error.tsx`, `app/global-error.tsx`) go to `lib/report-error.ts`. It logs one JSON line per error and, if `ERROR_WEBHOOK_URL` is set, POSTs the same payload there.

## Deploy

See [DEPLOY.md](./DEPLOY.md) for Docker Compose, env and domain setup. CI (`.github/workflows/ci.yml`) runs typecheck, the payment checks and a full build on every PR.
