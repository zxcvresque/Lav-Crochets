import crypto from "crypto";

/** Constant-time compare of two hex/utf8 strings. */
export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/**
 * Checkout success signature: HMAC-SHA256 of "order_id|payment_id" keyed with
 * the key secret (https://razorpay.com/docs/payments/server-integration/nodejs/payment-gateway/build-integration/#verify-payment-signature).
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
  keySecret: string,
): boolean {
  if (!razorpayOrderId || !razorpayPaymentId || !signature || !keySecret) return false;
  const expected = crypto.createHmac("sha256", keySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest("hex");
  return safeEqual(expected, signature);
}

/** Webhook signature: HMAC-SHA256 of the raw request body keyed with the webhook secret. */
export function verifyWebhookSignature(rawBody: string, signature: string, webhookSecret: string): boolean {
  if (!signature || !webhookSecret) return false;
  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}
