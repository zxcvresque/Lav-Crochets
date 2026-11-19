import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCourier, trackingLinks } from "@/lib/couriers";
import { safeEqual } from "@/lib/razorpay-signature";
import { reportError } from "@/lib/report-error";
import { getIndiaPostLiveStatus } from "@/lib/india-post-live";

/**
 * Public order lookup for /track. Needs the order number AND the email or
 * phone used at checkout; any mismatch returns the same "not found" so the
 * endpoint can't be used to discover orders. Returns no address or contact
 * details, only status, items and shipping info.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_TRIES = 12;
const hits = new Map<string, { n: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.reset < now) {
    hits.set(ip, { n: 1, reset: now + WINDOW_MS });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    return false;
  }
  h.n += 1;
  return h.n > MAX_TRIES;
}

const digits = (s: string) => s.replace(/\D/g, "");
/** Last 10 digits, so "+91 98765 43210" matches "9876543210". */
const phoneKey = (s: string) => digits(s).slice(-10);

const NOT_FOUND = "I couldn't find an order with those details. Check the order number (it starts with LAV-) and use the email or phone you checked out with.";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many tries. Please wait a few minutes and try again." }, { status: 429 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const orderNumber = String(body?.order || "").trim().replace(/^#/, "").toUpperCase();
    const contact = String(body?.contact || "").trim();
    if (!orderNumber || !contact) {
      return NextResponse.json({ error: "Please enter your order number and the email or phone you used." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: { select: { title: true, qty: true } } },
    });

    let matches = false;
    if (order) {
      if (contact.includes("@")) {
        matches = safeEqual(contact.toLowerCase(), order.customerEmail.toLowerCase());
      } else {
        const a = phoneKey(contact);
        matches = a.length === 10 && safeEqual(a, phoneKey(order.customerPhone));
      }
    }
    if (!order || !matches) return NextResponse.json({ error: NOT_FOUND }, { status: 404 });

    const courier = getCourier(order.courier);
    // Optional, flag-gated, 5s cap, null on any failure: never blocks the answer.
    const live =
      order.courier === "india-post" && order.trackingNumber && order.paymentStatus === "paid"
        ? await getIndiaPostLiveStatus(order.trackingNumber)
        : null;
    return NextResponse.json({
      live,
      orderNumber: order.orderNumber,
      placedAt: order.createdAt,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      items: order.items,
      totalINR: order.totalINR,
      etaDate: order.etaDate,
      estimatedDelivery: order.estimatedDelivery,
      shippedAt: order.shippedAt,
      courier: courier ? { id: courier.id, name: courier.name } : null,
      trackingNumber: order.trackingNumber,
      tracking: trackingLinks(order.courier, order.trackingNumber),
    });
  } catch (error) {
    reportError(error, { route: "POST /api/track" });
    return NextResponse.json({ error: "Something went wrong on my side. Please try again in a minute." }, { status: 500 });
  }
}
