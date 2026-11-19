import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay-signature";
import { markOrderPaid } from "@/lib/order-payment";
import { reportError } from "@/lib/report-error";

/**
 * Called by the checkout after Razorpay's success handler. The signature
 * proves the payment belongs to the Razorpay order we created, so the order
 * is looked up by that id (never a client-supplied order id).
 */
export async function POST(request: NextRequest) {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return NextResponse.json({ error: "Payments not configured" }, { status: 503 });

    const body = await request.json().catch(() => ({}));
    const orderId = String(body?.razorpay_order_id || "");
    const paymentId = String(body?.razorpay_payment_id || "");
    const signature = String(body?.razorpay_signature || "");
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    if (!verifyPaymentSignature(orderId, paymentId, signature, secret)) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const result = await markOrderPaid({ razorpayOrderId: orderId, razorpayPaymentId: paymentId, razorpaySignature: signature });
    if (!result.ok) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    return NextResponse.json({ success: true, orderNumber: result.order.orderNumber, orderId: result.order.id });
  } catch (error) {
    reportError(error, { route: "POST /api/razorpay/verify" });
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
