import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin } from "@/lib/api";
import { sendShippedEmail } from "@/lib/email";
import { isCourierId } from "@/lib/couriers";

const STATUSES = ["pending", "confirmed", "making", "ready", "shipped", "delivered"];

/** "" / null clears a date; anything else must parse. Returns undefined for "not sent". */
function parseDate(value: unknown): Date | null | undefined | "invalid" {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? "invalid" : d;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser(request);
  if (error) return error;
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const owns = order.userId === user.id || order.customerEmail.toLowerCase() === user.email.toLowerCase();
  if (user.role !== "admin" && !owns) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  const { id } = await params;

  const data = await request.json();
  if (data.orderStatus !== undefined && !STATUSES.includes(data.orderStatus)) {
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
  }

  if (data.courier !== undefined && data.courier !== null && data.courier !== "" && !isCourierId(data.courier)) {
    return NextResponse.json({ error: "Unknown courier" }, { status: 400 });
  }
  const etaDate = parseDate(data.etaDate);
  const shippedAt = parseDate(data.shippedAt);
  if (etaDate === "invalid" || shippedAt === "invalid") {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  const trackingNumber =
    data.trackingNumber === undefined ? undefined : String(data.trackingNumber ?? "").trim().toUpperCase().slice(0, 64) || null;

  const before = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!before) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const becameShipped = data.orderStatus === "shipped" && before.orderStatus !== "shipped";

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(data.orderStatus !== undefined && { orderStatus: data.orderStatus }),
      ...(data.estimatedDelivery !== undefined && { estimatedDelivery: data.estimatedDelivery || null }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
      ...(data.courier !== undefined && { courier: data.courier || null }),
      ...(trackingNumber !== undefined && { trackingNumber }),
      ...(etaDate !== undefined && { etaDate }),
      ...(shippedAt !== undefined && { shippedAt }),
      // First time it's marked shipped, stamp the date unless one was given.
      ...(becameShipped && shippedAt === undefined && !before.shippedAt && { shippedAt: new Date() }),
    },
  });

  // Spec: email the customer an invoice when the order moves to "shipped".
  if (becameShipped) {
    sendShippedEmail({ ...order, items: before.items }).catch((e) => console.error("Shipped email failed:", e));
  }

  return NextResponse.json(order);
}
