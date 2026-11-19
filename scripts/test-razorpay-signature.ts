/**
 * Unit-style checks for Razorpay signature verification (no network, no keys).
 * Run: npm run test:razorpay
 */
import crypto from "crypto";
import assert from "node:assert/strict";
import { verifyPaymentSignature, verifyWebhookSignature } from "../lib/razorpay-signature";

const secret = "test_secret_" + crypto.randomBytes(8).toString("hex");
const orderId = "order_TEST123";
const paymentId = "pay_TEST456";
const good = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");

let n = 0;
const t = (name: string, fn: () => void) => { fn(); n++; console.log("  ok  " + name); };

t("payment: valid signature passes", () => assert.equal(verifyPaymentSignature(orderId, paymentId, good, secret), true));
t("payment: wrong secret fails", () => assert.equal(verifyPaymentSignature(orderId, paymentId, good, secret + "x"), false));
t("payment: swapped ids fail", () => assert.equal(verifyPaymentSignature(paymentId, orderId, good, secret), false));
t("payment: other payment id fails", () => assert.equal(verifyPaymentSignature(orderId, "pay_OTHER", good, secret), false));
t("payment: tampered signature fails", () => assert.equal(verifyPaymentSignature(orderId, paymentId, good.slice(0, -1) + (good.endsWith("0") ? "1" : "0"), secret), false));
t("payment: truncated signature fails (no throw)", () => assert.equal(verifyPaymentSignature(orderId, paymentId, good.slice(0, 10), secret), false));
t("payment: empty inputs fail", () => assert.equal(verifyPaymentSignature("", "", "", secret), false));

const whSecret = "wh_" + crypto.randomBytes(8).toString("hex");
const body = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: paymentId, order_id: orderId, amount: 40000 } } } });
const whSig = crypto.createHmac("sha256", whSecret).update(body).digest("hex");
t("webhook: valid signature over raw body passes", () => assert.equal(verifyWebhookSignature(body, whSig, whSecret), true));
t("webhook: re-serialised body fails", () => assert.equal(verifyWebhookSignature(JSON.stringify(JSON.parse(body), null, 1), whSig, whSecret), false));
t("webhook: wrong secret fails", () => assert.equal(verifyWebhookSignature(body, whSig, "nope"), false));
t("webhook: missing header fails", () => assert.equal(verifyWebhookSignature(body, "", whSecret), false));
t("webhook: missing secret fails", () => assert.equal(verifyWebhookSignature(body, whSig, ""), false));

console.log(`\n${n} checks passed`);
