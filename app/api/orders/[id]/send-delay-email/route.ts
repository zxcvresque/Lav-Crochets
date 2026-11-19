import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendDelayEmail } from "@/lib/email";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { role?: string };
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 401 });
  }

  const { id } = await params;
  const { customMessage, newEstimatedDelivery } = await request.json();

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await sendDelayEmail({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customMessage,
    newDeliveryDate: newEstimatedDelivery,
  });

  return NextResponse.json({ success: true });
}