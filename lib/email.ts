/**
 * lib/email.ts — Transactional email sending via Resend.
 * Falls back gracefully when RESEND_API_KEY is not configured.
 */

import { Resend } from "resend";
import { escapeHtml } from "./api";
import { getCourier, trackingLinks } from "./couriers";
import { absoluteUrl } from "./site";

function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.RESEND_FROM_EMAIL || "Lav Crochets <hello@lav-crochets.art>";

/** ── Order Confirmation ─────────────────────────────────────────────────── */

export interface EmailOrderItem {
  title: string;
  priceINR: number;
  qty: number;
  options?: string | null;
}

export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: EmailOrderItem[];
  subtotalINR: number;
  discountINR: number;
  totalINR: number;
  couponCode?: string;
  stockStatus?: string;
  turnaroundDays?: number;
  estimatedDelivery?: string;
}

export async function sendOrderConfirmation(order: OrderConfirmationData): Promise<void> {
  const resend = getClient();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping order confirmation email");
    return;
  }

  const firstName = order.customerName.split(" ")[0];
  const discountRow =
    order.discountINR > 0
      ? `<tr>
          <td style="padding: 8px 0; color: #16a34a; font-weight: 600;">Discount</td>
          <td style="padding: 8px 0; text-align: right; color: #16a34a;">−₹${order.discountINR.toLocaleString("en-IN")}</td>
        </tr>`
      : "";

  const itemsHtml = order.items
    .map(
      (item) => `<tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0ece6; color: #444;">${escapeHtml(item.title)} × ${item.qty}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0ece6; text-align: right; font-weight: 500;">₹${(item.priceINR * item.qty).toLocaleString("en-IN")}</td>
      </tr>`
    )
    .join("");

  const deliveryNote = order.estimatedDelivery
    ? `<p style="font-size: 13px; color: #888; margin: 0 0 20px;">
        Estimated delivery: <strong>${escapeHtml(order.estimatedDelivery)}</strong>
      </p>`
    : `<p style="font-size: 13px; color: #888; margin: 0 0 20px;">
        Delivered in 4–5 days across India.
      </p>`;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Your order #${order.orderNumber} is confirmed!</title>
</head>
<body style="margin: 0; padding: 0; background: #faf7f2; font-family: Georgia, 'Times New Roman', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #faf7f2; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background: #1a1523; padding: 32px 40px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 32px;">🧶</p>
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #faf7f2; letter-spacing: -0.02em;">
                Your order is confirmed!
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; color: #444; line-height: 1.6;">
                Hi <strong>${escapeHtml(firstName)}</strong>,<br />
                Your order <strong>#${order.orderNumber}</strong> is confirmed and I'm getting ready to hook it for you!
              </p>

              ${deliveryNote}

              <!-- Items -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">
                ${itemsHtml}
                <tr>
                  <td style="padding: 12px 0 4px; font-weight: 600; color: #222;">Total paid</td>
                  <td style="padding: 12px 0 4px; text-align: right; font-weight: 700; font-size: 18px; color: #1a1523;">₹${order.totalINR.toLocaleString("en-IN")}</td>
                </tr>
              </table>

              <p style="font-size: 14px; color: #888; line-height: 1.5;">
                You'll receive a tracking notification once your piece ships. If you have any questions about your order, just reply to this email. It's a small studio and I read every message.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #f0ece6; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #aaa;">
                With warmth,<br />
                <strong style="color: #666;">Lav Crochets</strong><br />
                <a href="mailto:hello@lav-crochets.art" style="color: #888;">hello@lav-crochets.art</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await resend.emails.send({
    from: FROM,
    to: order.customerEmail,
    subject: `Your Lav Crochets order #${order.orderNumber} is confirmed!`,
    html,
  });
}

/** ── Order Delay / Custom Message ──────────────────────────────────────── */

export interface DelayEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customMessage: string;
  newDeliveryDate?: string;
}

export async function sendDelayEmail(data: DelayEmailData): Promise<void> {
  const resend = getClient();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping delay email");
    return;
  }

  const firstName = data.customerName.split(" ")[0];
  const dateNote = data.newDeliveryDate
    ? `<p style="background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 18px; margin: 20px 0; font-size: 15px; color: #92400e;">
        <strong>📅 Updated timeline:</strong> Your piece is now expected to reach you by <strong>${escapeHtml(data.newDeliveryDate)}</strong>.
      </p>`
    : "";

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>An update on your order #${data.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background: #faf7f2; font-family: Georgia, 'Times New Roman', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #faf7f2; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background: #1a1523; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #faf7f2; letter-spacing: -0.02em;">
                An update on your order #${data.orderNumber}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #444; line-height: 1.6;">
                Hi <strong>${escapeHtml(firstName)}</strong>,
              </p>

              <p style="margin: 0 0 24px; font-size: 15px; color: #555; line-height: 1.7; border-left: 4px solid #f59e0b; padding-left: 18px; font-style: italic;">
                ${escapeHtml(data.customMessage).replace(/\n/g, "<br />")}
              </p>

              ${dateNote}

              <p style="font-size: 14px; color: #888; line-height: 1.6;">
                Thank you for your patience and for supporting a small studio. Every stitch is made with care, and your piece will be worth the wait.
              </p>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #f0ece6; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #666; font-style: italic;">
                With warmth,<br />
                <strong style="color: #333;">Lav Crochets</strong>
              </p>
              <p style="margin: 12px 0 0; font-size: 12px; color: #aaa;">
                <a href="mailto:hello@lav-crochets.art" style="color: #aaa;">hello@lav-crochets.art</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await resend.emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `An update on your Lav Crochets order #${data.orderNumber}`,
    html,
  });
}

/** ── Shipped / Invoice ─────────────────────────────────────────────────── */

export interface ShippedEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string | null;
  city: string | null;
  pincode: string | null;
  subtotalINR: number;
  discountINR: number;
  totalINR: number;
  couponCode: string | null;
  createdAt: Date;
  items: EmailOrderItem[];
  courier?: string | null;
  trackingNumber?: string | null;
  etaDate?: Date | null;
}

export async function sendShippedEmail(order: ShippedEmailData): Promise<void> {
  const resend = getClient();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping shipped/invoice email");
    return;
  }
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const rows = order.items
    .map((i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #f0ece6;">${escapeHtml(i.title)} × ${i.qty}</td><td style="padding:8px 0;border-bottom:1px solid #f0ece6;text-align:right;">${inr(i.priceINR * i.qty)}</td></tr>`)
    .join("");
  const address = [order.shippingAddress, order.city, order.pincode].filter(Boolean).map(escapeHtml).join(", ");
  const html = `<!doctype html><html><body style="margin:0;background:#faf7f2;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#fff;border-radius:16px;padding:40px;">
      <h1 style="margin:0 0 8px;font-size:22px;color:#1a1523;">Your order is on its way! 📦</h1>
      <p style="color:#444;">Hi <strong>${escapeHtml(order.customerName.split(" ")[0])}</strong>, order <strong>#${escapeHtml(order.orderNumber)}</strong> has shipped.</p>
      ${shippingBlock(order)}
      <h2 style="font-size:16px;margin:28px 0 8px;color:#1a1523;">Invoice</h2>
      <p style="font-size:13px;color:#888;margin:0 0 12px;">Order date: ${order.createdAt.toLocaleDateString("en-IN")}${address ? ` · Ship to: ${address}` : ""}</p>
      <table width="100%" style="border-collapse:collapse;font-size:14px;color:#444;">
        ${rows}
        <tr><td style="padding:8px 0;">Subtotal</td><td style="text-align:right;">${inr(order.subtotalINR)}</td></tr>
        ${order.discountINR > 0 ? `<tr><td style="padding:4px 0;color:#16a34a;">Discount${order.couponCode ? ` (${escapeHtml(order.couponCode)})` : ""}</td><td style="text-align:right;color:#16a34a;">−${inr(order.discountINR)}</td></tr>` : ""}
        <tr><td style="padding:12px 0 0;font-weight:700;">Total paid</td><td style="padding:12px 0 0;text-align:right;font-weight:700;">${inr(order.totalINR)}</td></tr>
      </table>
      <p style="font-size:13px;color:#888;margin-top:28px;">With warmth,<br/><strong style="color:#666;">Lav Crochets</strong></p>
    </div>
  </div></body></html>`;
  await resend.emails.send({
    from: FROM,
    to: order.customerEmail,
    subject: `Your Lav Crochets order #${order.orderNumber} has shipped`,
    html,
  });
}

/** Courier, tracking number (if any) and ETA for the shipped email. */
function shippingBlock(order: ShippedEmailData): string {
  const courier = getCourier(order.courier);
  const links = trackingLinks(order.courier, order.trackingNumber);
  const eta = order.etaDate
    ? order.etaDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
    : null;
  const trackPage = absoluteUrl(`/track?order=${encodeURIComponent(order.orderNumber)}`);
  const lines = [
    courier && courier.id !== "other" ? `Sent with <strong>${escapeHtml(courier.name)}</strong>.` : "Sent by courier.",
    order.trackingNumber ? `Tracking number: <strong style="font-family:monospace;">${escapeHtml(order.trackingNumber)}</strong>` : "",
    eta ? `Expected by <strong>${escapeHtml(eta)}</strong>.` : "",
    links ? `<a href="${escapeHtml(links.alt || links.primary)}" style="color:#7c3aed;">Track on ${escapeHtml(links.courierName)}</a>` : "",
    `<a href="${escapeHtml(trackPage)}" style="color:#7c3aed;">See your order status</a>`,
  ].filter(Boolean);
  return `<p style="color:#444;line-height:1.7;margin:16px 0 0;">${lines.join("<br/>")}</p>`;
}
