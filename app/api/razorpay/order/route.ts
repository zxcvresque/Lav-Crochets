import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";
import crypto from "crypto";
import { checkCoupon } from "@/lib/coupons";
import { getSessionUser } from "@/lib/auth";
import { reportError } from "@/lib/report-error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_QTY = 20;

function newOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `LAV-${date}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Online payment isn't set up yet. Please try again later." }, { status: 503 });
    }

    const { items, couponCode, billingInfo } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    const name = String(billingInfo?.name || "").trim();
    const email = String(billingInfo?.email || "").trim().toLowerCase();
    const phone = String(billingInfo?.phone || "").trim();
    if (!name || !EMAIL_RE.test(email) || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Please enter your name, a valid email and a 10-digit phone number" }, { status: 400 });
    }
    if (!billingInfo?.address || !billingInfo?.city || !/^\d{6}$/.test(String(billingInfo?.pincode || ""))) {
      return NextResponse.json({ error: "Please enter your full shipping address and a 6-digit pincode" }, { status: 400 });
    }

    // Price everything from the database, never from the client.
    let subtotal = 0;
    const lines: { productId: string; title: string; priceINR: number; qty: number }[] = [];
    for (const item of items) {
      const qty = Number(item?.qty ?? 1);
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
        return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
      }
      const product = await prisma.product.findUnique({ where: { id: String(item?.id) } });
      if (!product || !product.published) {
        return NextResponse.json({ error: "One of the items in your cart is no longer available" }, { status: 400 });
      }
      subtotal += product.priceINR * qty;
      lines.push({ productId: product.id, title: product.title, priceINR: product.priceINR, qty });
    }

    const user = await getSessionUser(request.headers);

    let discountINR = 0;
    let coupon: { id: string; code: string } | null = null;
    if (couponCode) {
      const result = await checkCoupon(String(couponCode), subtotal, { userId: user?.id, email });
      if (!result.ok) return NextResponse.json({ error: result.message }, { status: 400 });
      discountINR = result.discountINR;
      coupon = result.coupon;
    }

    const total = subtotal - discountINR;
    if (total < 1) {
      return NextResponse.json({ error: "Order total must be at least ₹1" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const orderNumber = newOrderNumber();
    const razorpayOrder = await razorpay.orders.create({
      amount: total * 100, // paisa
      currency: "INR",
      receipt: orderNumber,
      notes: { customerEmail: email, couponCode: coupon?.code || "" },
    });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user?.id ?? null,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: String(billingInfo.address),
        city: String(billingInfo.city),
        state: billingInfo.state ? String(billingInfo.state).trim() : null,
        pincode: String(billingInfo.pincode),
        subtotalINR: subtotal,
        discountINR,
        totalINR: total,
        couponCode: coupon?.code ?? null,
        couponId: coupon?.id ?? null,
        razorpayOrderId: razorpayOrder.id,
        paymentStatus: "pending",
        orderStatus: "pending",
        items: { create: lines },
      },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      razorpayKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      amount: total,
      currency: "INR",
      discountINR,
      subtotal,
    });
  } catch (error) {
    reportError(error, { route: "POST /api/razorpay/order" });
    return NextResponse.json({ error: "I couldn't start the payment just now. Please try again in a moment." }, { status: 500 });
  }
}
