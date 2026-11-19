import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay-signature";
import { markOrderPaid, markOrderPaymentFailed } from "@/lib/order-payment";
import { reportError } from "@/lib/report-error";

/**
 * Razorpay webhook (Dashboard > Settings > Webhooks), pointed at
 * https://<site>/api/razorpay/webhook with the events payment.captured,
 * order.paid and payment.failed. This is the safety net for customers who
 * close the tab before the checkout's verify call lands.
 *
 * The X-Razorpay-Signature header is an HMAC-SHA256 of the raw body with
 * RAZORPAY_WEBHOOK_SECRET, so the body must be read as text before parsing.
 */
export const runtime = "nodejs";

interface PaymentEntity {
  id: string;
  order_id?: string;
  amount?: number;
  status?: string;
}

export async function POST(request: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });

  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  if (!verifyWebhookSignature(raw, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(raw) as {
      event?: string;
      payload?: { payment?: { entity?: PaymentEntity }; order?: { entity?: { id: string } } };
    };
    const payment = event.payload?.payment?.entity;
    const razorpayOrderId = payment?.order_id || event.payload?.order?.entity?.id;

    // Acknowledge events we don't act on so Razorpay stops retrying them.
    if (!razorpayOrderId || !payment?.id) return NextResponse.json({ ok: true, ignored: true });

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const order = await prisma.order.findUnique({ where: { razorpayOrderId } });
      if (!order) return NextResponse.json({ ok: true, ignored: "unknown order" });
      // Guard against a payment for a different amount than the server priced.
      if (typeof payment.amount === "number" && payment.amount !== order.totalINR * 100) {
        reportError(new Error("Webhook amount mismatch"), {
          orderNumber: order.orderNumber,
          expectedPaise: order.totalINR * 100,
          gotPaise: payment.amount,
        });
        return NextResponse.json({ ok: true, ignored: "amount mismatch" });
      }
      await markOrderPaid({ razorpayOrderId, razorpayPaymentId: payment.id });
    } else if (event.event === "payment.failed") {
      await markOrderPaymentFailed(razorpayOrderId);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    reportError(error, { route: "POST /api/razorpay/webhook" });
    // 500 makes Razorpay retry later, which is what we want for transient DB errors.
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}
